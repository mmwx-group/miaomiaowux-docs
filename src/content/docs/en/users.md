---
title: "User Management"
description: "User account and permission management"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## Try it: user management

6 mock users — create, bind a package, toggle on/off, copy subscription, delete. Usage bar shifts color with consumption.

Mock demo6 users · create / bind / copy sub / toggle · all local

User list6

**Create user**

| User | Package | Usage | Expires | Enabled | Actions |
| ---- | ------- | ----- | ------- | ------- | ------- |

|
alice

alice@example.com

| 进阶版 |

87.4 / 300 GB

|

2026-09-20

| |

|
|

bob

bob@example.com

| 基础版 |

62.1 / 100 GB

|

2026-08-05

| |

|
|

charlie

charlie@example.com

| 尊享版 |

412.6 / 1024 GB

|

2027-01-15

| |

|
|

diana

diana@example.com

| 体验版(7天) |

18.9 / 20 GB

|

2026-06-10

| |

|
|

jimlee

jim@example.com

| 进阶版 |

156.0 / 300 GB

|

2026-12-31

| |

|
|

kate

kate@example.com

| unbound |

0.0 / 0 GB

|

\-

| |

|

## Overview

The user management module handles subscription user accounts, permissions, and subscription tokens. Supports admin and regular user roles.

## User Roles

| Role         | Permissions  | Description                                           |
| ------------ | ------------ | ----------------------------------------------------- |
| Admin        | All          | System management, server management, user management |
| Regular User | Subscription | View subscription links, personal info                |

## Create User

1\. Go to User Management page

2\. Click Add User

3\. Enter username and password

4\. Select role (Admin/Regular User)

5\. Bind package (optional)

6\. System automatically generates subscription token after saving

## Subscription Token

Each user has a unique subscription Token for subscription link authentication. Tokens can be regenerated; old tokens are immediately invalidated.

## Authentication

System uses JWT for API authentication:

- \- Obtain JWT Token after login
- \- Send Token in MM-Authorization header
- \- Re-login required when Token expires
