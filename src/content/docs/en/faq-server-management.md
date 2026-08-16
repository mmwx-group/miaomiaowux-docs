---
title: "Server Management"
description: "Remote server: adding, tokens, status, connectivity."
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

### What to do if the remote server can't connect?

Check the following: 1) Is the Agent running? 2) Is the firewall allowing the Agent port? 3) Is the Token correct? 4) Is the network reachable? Check connection status and error messages on the server management page.

### How to choose between WebSocket, HTTP, and Pull connection modes?

WebSocket suits most scenarios with good real-time performance. HTTP suits unstable network environments. Pull mode has the Agent actively pull instructions, suitable for Agents behind NAT. Auto mode automatically selects the best method.
