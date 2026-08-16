---
title: "Installation & Deployment"
description: "Common questions about installing, deploying the Agent, and upgrading."
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

### What's the difference between MiaoMiaoWu X and MiaoMiaoWu?

MiaoMiaoWu X is an extended version of MiaoMiaoWu with added remote server management, Xray inbound/outbound management, and protocol connectivity testing. MiaoMiaoWu focuses on subscription management and traffic monitoring, while MiaoMiaoWu X provides complete server management capabilities.

### What system requirements are needed?

Master: Linux x86_64, 1 CPU core and 512MB RAM minimum. Agent: Linux x86_64, requires Xray-core. Supports both Docker and binary deployment.

### Can the master and Agent run on the same machine?

Yes, but they need different ports. The master uses port 12889 by default, and the Agent needs a different port.
