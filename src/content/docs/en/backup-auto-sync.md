---
title: "Scheduled Backup Sync"
description: "Upload full backups to WebDAV, S3-compatible storage or Google Drive on a schedule, with automatic cleanup"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## Overview

The backup in [Backup & Restore](/en/backup-restore/) requires an admin to click Download. Scheduled sync makes the master **package and upload automatically on an interval**, then prune old copies — if the machine itself dies, the local backup dies with it. An off-site copy is the one that actually saves you.

The artifact is **identical** to the manual download: both use the same packaging code, so an automatic backup can never restore into something different from what you'd get by hand.

## Where to configure it

**System Settings → System → Automatic backup**

| Setting | Notes |
| --- | --- |
| Enable scheduled backup | When off, nothing runs automatically, but "Back up now" still works |
| Destination | WebDAV / S3-compatible / Google Drive |
| Interval (hours) | 1 – 720 (30 days); out-of-range values are clamped |
| Copies to keep | Deletes the oldest beyond this count; `0` = never clean up |
| Include database | Only needed on PostgreSQL. On SQLite the database lives in `data/` and is always included |

Save when done. Recommended order: **Test connection**, then **Back up now** to prove the whole chain works, and only then enable the schedule.

## WebDAV

Works with Nextcloud, Synology Drive, InfiniCloud, Jianguoyun and similar.

1. **Create the target folder first** — this feature does not create directories.
2. Enter the full URL of that folder, not the root of the drive:

   ```
   Nextcloud   https://cloud.example.com/remote.php/dav/files/<user>/mmwx-backup
   Synology    https://nas.example.com:5006/mmwx-backup
   ```

3. Use an **app-specific password** rather than your main account password — Nextcloud and most providers can issue one, and it can be revoked on its own if leaked.

## S3-compatible storage

Covers Cloudflare R2, Backblaze B2, MinIO, Alibaba OSS, AWS S3 — anything speaking SigV4.

| Field | What to enter |
| --- | --- |
| Endpoint | Provider's endpoint. Leave empty for official AWS (derived from Region) |
| Region | `auto` for R2; the real region for AWS; per provider docs otherwise |
| Bucket | Bucket name |
| Prefix | Sub-directory inside the bucket, optional |
| Access Key / Secret Key | Credentials |
| Path style | Usually required for MinIO and self-hosted; **do not** enable for R2 or AWS |

Typical settings:

```
Cloudflare R2   Endpoint: https://<account-id>.r2.cloudflarestorage.com
                Region: auto        Path style: off

MinIO           Endpoint: https://minio.example.com:9000
                Region: us-east-1   Path style: on
```

> **Key permissions**: the key needs write, list and delete. Read-only means backups never upload at all; without delete they upload fine but old copies are never pruned.

## Google Drive

Google Drive needs an OAuth credential set. For now you supply it yourself:

1. Open the [Google Cloud Console](https://console.cloud.google.com/) and create a project.
2. Enable the **Google Drive API**.
3. Configure the OAuth consent screen and add your own account as a test user.
4. Create an **OAuth client ID** of type "Desktop app". Note the client ID and client secret.
5. Run one authorization with them to obtain a **refresh token** (the OAuth Playground or any OAuth tool works).
6. Enter client ID, client secret and refresh token in the panel. Folder ID may be left empty (uploads to the drive root); to target a folder, use the segment after `folders/` in its URL.

> **Use a personal account's refresh token, not a service account.** A service account has essentially zero storage quota of its own, so large backups always fail — and the error will not say plainly that quota is the cause.

## Interval and retention

- The scheduler wakes every 10 minutes and checks whether the interval has elapsed since the last success. So **configuration changes take effect without a restart**, and a restart never forces you to wait out a whole cycle.
- Nothing runs in the first 5 minutes after startup — the database and certificates are still initializing, which makes packaging both slow and more likely to collide.
- Retention **only deletes files named `miaomiaowux-backup-*.zip`**. Anything else you keep in the same folder or bucket is left alone.
- A cleanup failure is not a backup failure: the backup itself already landed safely; cleanup only affects space, and is logged separately.

## What "Test connection" does

It uploads a small probe file, lists the directory, then deletes it.

**Testing only "can I connect" is not enough** — the most common misconfiguration is *connects fine but has no write permission* (read-only WebDAV folder, an S3 key with only read access, a Drive folder owned by another account). Left to surface inside the scheduled job, that usually means discovering days later that not a single backup exists.

The probe filename deliberately lacks the `miaomiaowux-backup-` prefix, so it is never counted as a real backup by the retention policy.

## Restoring

A remote backup is the same ZIP as the manual download. Fetch it and follow the steps in [Backup & Restore](/en/backup-restore/).

> **Actually restore one periodically** into a test environment. An unverified backup is not a backup — the classic discovery is a PostgreSQL deployment that never ticked "Include database", leaving backups with files but no data.

## How credentials are stored

Passwords and keys are encrypted with a key derived from the master identity key before being written to the database. The read API only ever returns `********`; submitting the placeholder back means "leave this one unchanged".

To be clear about the boundary: **this protects against database-only exposure** — a PostgreSQL dump shared for troubleshooting, a read-only database account. It does **not** protect against someone taking the whole `data/` directory, because the key lives in `data/mmwx_master.key`. Treat the remote backups themselves as sensitive data.

## Troubleshooting

### Upload fails with 403 / SignatureDoesNotMatch

Usually the S3 **path style** toggle is wrong, or the Region is. R2 wants `auto` with path style off; MinIO usually needs it on.

### WebDAV returns 411 or 501

The server rejects chunked uploads. This feature already sends an explicit `Content-Length`; if it still fails, check whether a reverse proxy in front is rewriting the request.

### Google Drive: "no access token returned"

The refresh token expired. Under the consent screen's "Testing" status, Google expires refresh tokens after about 7 days; switching the app to "Production" avoids the repeated expiry.

### Backups upload but old ones never disappear

Check that the key has delete permission, and that "Copies to keep" is not `0`. Running Test connection also verifies delete permission.

### How do I know it ran?

The last successful run is shown in the card's description. Failures are recorded in the scheduled-task run history; search logs for `[自动备份]`.
