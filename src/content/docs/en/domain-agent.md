---
title: "Report domain (Agent connection address)"
description: "Give Agents their own address to reach the master: only Agent traffic is allowed, and the whole fleet migrates safely via check → single-server test → switch all"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

The report domain is called **Agent connection address** in the panel. It is the address the Agent on every server uses to reach the master: the WebSocket connection, heartbeats, traffic reports, replies to config pushes and the install script all go through it.

Once set separately:

- The domain **only accepts Agent communication** (`/api/remote/*`, including WebSocket). Opening the panel returns 404 without redirecting (a redirect would reveal the panel domain).
- The panel domain no longer appears on any Agent; changing the panel domain later does not touch the Agents.
- The panel domain still accepts Agent communication, as a fallback for offline Agents, old Agents and failed switches.

When empty, it is the same as the master address.

## Why switching takes three steps

A wrong address here would **disconnect the whole fleet at once**. So the panel does not push on save; it goes through three steps:

### ① Check

In System Settings → "System" → **Agent connection address**, enter the new address (`https://agent.example.com`, or `http://IP:port`) and click **Check**:

- DNS must resolve to this host (or a recognized CDN).
- The panel shows the HTTPS reverse-proxy status of the domain: if the local Nginx is managed by the master it can be **configured in one click**; otherwise copy the Nginx / Caddy config below. The config only allows `/api/remote/` (including WebSocket) and returns 404 for everything else; the Nginx config includes the reject-unknown-domains catch-all.

### ② Single-server test

Pick an online server and click **Test with this server**. The master first has that Agent probe the new address with authentication, then actually switches it and waits — up to 90 seconds — until it reconnects through the new address (the master can see which domain it connected with).

**If it does not come back, it is switched back to the old address automatically**, and the server keeps working. Agents on the master's own host and federated servers do not take part; if there really is no online Agent to test with, you can confirm and skip.

### ③ Switch all Agents

Within 30 minutes of a passed test, click **Switch all agents and save**. The remaining online Agents are handled one by one — probe first, then switch — with these results:

| Result | Meaning |
| --- | --- |
| Switched | Now uses the new address |
| Kept old address | This server cannot reach the new address and stays on the old one (still works) |
| Offline, will switch on reconnect | Currently offline; the new address is pushed when it reconnects |

The setting is saved only after all of them are processed.

## Switching back

Click **Revert to the master address** and the Agents go back to using the master address. The master address is already in use, so no DNS check is needed.

## Notes

- The report domain can be the same domain as the subscription domain: both sets of paths are allowed and the panel still returns 404.
- Behind Cloudflare or another CDN, make sure WebSocket is allowed (Cloudflare allows it by default).
- After enabling [Disable public access](/docs/en/domain-master#disabling-public-access), Agent communication on the report domain is still allowed (WebSocket cannot follow redirects); other paths return 404.
