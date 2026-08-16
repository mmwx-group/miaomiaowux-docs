---
title: "Certificate Management"
description: "TLS certificate issuance and auto-renewal"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## Try it: certificate management

4 mock domains — request, renew, download, delete. All local.

Mock demo4 certificates · request / renew / delete · multiple DNS providers

2active1expiring1expired

**Request new certificate**

| Domain | DNS provider | Linked servers | Expires | Status | Actions |
| ------ | ------------ | -------------- | ------- | ------ | ------- |

|
hk.example.com

| Cloudflare |

hk1.example.com

|

2026-09-12(97 days left)

| Active |

|
|

us.example.com

| Cloudflare |

us1.example.com

|

2026-07-03(26 days left)

| Expiring |

|
|

jp.example.com

| Aliyun |

jp1.example.comjp2.example.com

|

2026-11-28(174 days left)

| Active |

|
|

old.example.com

| Tencent | no servers linked |

2026-05-15(23 days overdue)

| Expired |

|

## Overview

The certificate management module automatically issues and renews TLS certificates via the ACME protocol. It supports multiple DNS providers and automatically syncs certificates to remote servers.

## Supported DNS Providers

| Provider             | Required Credentials  |
| -------------------- | --------------------- |
| Cloudflare           | API Token             |
| Alibaba Cloud DNS    | AccessKey ID + Secret |
| Tencent Cloud DNSPod | SecretId + SecretKey  |
| Namesilo             | API Key               |

## Apply for Certificate

1\. Go to the "Certificate Management" page

2\. Click "Apply for Certificate"

3\. Select a DNS provider and enter credentials

4\. Enter the domain (wildcards supported, e.g. \*.example.com)

5\. For a wildcard request, optionally include the apex domain so example.com and \*.example.com become SANs on one certificate

6\. The system completes DNS validation and stores the issued certificate in both the database and certificate directory

## Download and automatic deployment

Download creates an archive containing fullchain.pem and privkey.pem. After renewal, re-issuance, or webhook updates, the system replaces the certificate in every referenced Nginx and Xray directory. Restoring a historical Xray config from an Agent also deploys its referenced certificates first.

## Auto Renewal

The system automatically renews certificates before expiration. After successful renewal, certificate files are automatically updated on all remote servers using the certificate.

## Certificate Storage

```
证书文件路径（远程服务器）：
  证书: /root/cert/{domain}/fullchain.pem
  私钥: /root/cert/{domain}/privkey.pem
```

## Use Cases

- \- VLESS/VMess/Trojan + TLS inbounds require a TLS certificate
- \- Hysteria2 / AnyTLS inbounds require a TLS certificate
- \- REALITY inbounds do not need certificates (uses target site's certificate)

## Webhook certificate upload (Certimate integration)

MiaomiaowuX exposes an HTTP endpoint that accepts certificates pushed from external issuance systems (e.g. Certimate) via webhook. Once stored, it auto-deploys to all remote servers tagged with that domain.

### Endpoint

Method: POST

URL: https://your-mmwx-host/api/admin/certificates/upload

Auth: Authorization: Bearer <token> or MM-Authorization: <token> (Global API Token from System Settings, or a personal admin token issued in the API Token page)

Content-Type: application/json

### Request fields

- \- domain — main domain bound to the certificate (e.g. \*.example.com or a.example.com)
- \- cert_pem — certificate PEM text; accepts raw PEM (starts with -----BEGIN) or base64 (legacy UI format)
- \- key_pem — private key PEM text; same dual format support

### Behavior

- \- Existing same-domain cert → update the record (cert_path / key_path / expiry) and trigger auto-deploy
- \- First-time upload → create a manual / no-deploy record; deploy target can be switched in the UI later
- \- Success returns {success: true, certificate_id: N}; failure returns {success: false, message: "..."}

### Certimate config example

Certimate's webhook deployer substitutes ${CERTIMATE_DEPLOYER\_\*} template variables with the actual cert content (raw PEM, no base64). MiaomiaowuX auto-detects the -----BEGIN prefix and accepts both raw PEM and the legacy base64 upload paths.

```
URL:    https://your-mmwx-host/api/admin/certificates/upload
Method: POST
Headers:
  Authorization: Bearer <your-api-token>
  Content-Type:  application/json
Body:
  {
    "domain":   "${CERTIMATE_DEPLOYER_COMMONNAME}",
    "cert_pem": "${CERTIMATE_DEPLOYER_CERTIFICATE}",
    "key_pem":  "${CERTIMATE_DEPLOYER_PRIVATEKEY}"
  }
```

### curl verification (raw PEM)

POST the file contents directly without base64 transcoding. Replace the paths with your actual cert locations.

```
curl -X POST https://your-mmwx-host/api/admin/certificates/upload \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --rawfile cert /path/to/fullchain.pem \
                --rawfile key  /path/to/privkey.pem \
                '{domain:"*.example.com", cert_pem:$cert, key_pem:$key}')"
```
