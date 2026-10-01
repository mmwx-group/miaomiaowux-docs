---
title: "Master domain"
description: "What the master domain (master server address) is used for, how to enable HTTPS, and the access rules after disabling public access"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

The master domain is the domain you open the panel on, and it is the system's "master server address". When the other two domains are not set, subscription links and Agent communication use it too.

## Where it is used

Set it in System Settings → "System" tab → **Master Server URL**, as scheme + domain (or IP and port), for example `https://panel.example.com`. When left empty, the address you are currently visiting is used.

Once saved, it is used for:

- The Agent install command generated when adding a server, and the address Agents connect back to (when no [report domain](/docs/en/domain-agent) is set).
- Subscription links (when no [subscription domain](/docs/en/domain-subscription) is set).
- The report link of the "Client IP allowlist" in personal settings.
- Places that need to know "who the master is", such as the passkey RP ID and certificate detection.

If the domain you are visiting over HTTPS differs from the one set here, the panel shows a "Master Domain Mismatch" prompt and can switch it to the current domain in one click.

## Enabling HTTPS

Pick one:

| Method | Best for | Notes |
| --- | --- | --- |
| Certificates → "Deploy certificate to master" | Most cases | The master installs and manages Nginx itself. Afterwards the subscription and report domains can be configured from the panel in one click |
| Your own Nginx / Caddy | You already have a reverse proxy, or share the host with other sites | Follow the [deployment tutorial](/docs/en/tutorial#54-recommended-reverse-proxy-the-master-with-nginx); the subscription and report domain configs shown by the panel can be copied as-is |
| [Cloudflare Tunnel](/docs/en/cloudflare-tunnel) | The master has no public entry, or you do not want to open ports | Cloudflare provides HTTPS |

See [Certificates](/docs/en/certificates) for issuing and deploying certificates.

## Disabling public access

After enabling **Disable public access** in the "System" tab and restarting the master, it only accepts requests coming through a reverse proxy:

- The master listens on `127.0.0.1` only, so IP + port access stops working. This is for a reverse proxy **on the same host**; Docker port mappings and cross-server proxies do not work with it.
- When the Master Server URL is `https://`, requests whose Host is not the master domain are redirected (307) to the master domain. Exceptions:
  - subscription paths on the [subscription domain](/docs/en/domain-subscription);
  - Agent communication paths on the [report domain](/docs/en/domain-agent) (WebSocket cannot follow redirects, so they must be let through);
  - requests from the host itself (127.0.0.1).

:::tip[Locked out of the panel?]
If a misconfiguration keeps you out, set the environment variable `MMWX_FORCE_PUBLIC_ACCESS=1` on the master and restart. It temporarily restores public listening and skips the redirect above; fix the setting, then remove the variable.
:::
