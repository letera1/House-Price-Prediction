# Security Policy

## 1. Supported Versions

We actively maintain and provide security patches for the following versions:

| Version | Supported | Description |
| :--- | :---: | :--- |
| **2.x.x** | :white_check_mark: | Current production release (Next.js 16 + Flask Gunicorn API) |
| **1.x.x** | :x: | Legacy release (Deprecated; no longer supported) |

---

## 2. Reporting a Vulnerability

We prioritize the security and privacy of our software and community. If you identify a potential security vulnerability within **PropVal AI**, please report it responsibly:

1. **Do NOT open a public GitHub issue** or post details on social media.
2. Email your vulnerability report to: **letera.dev@gmail.com** with the subject line:  
   `[SECURITY VULNERABILITY] PropVal AI - <Brief Description>`
3. Include the following details:
   - A clear description of the vulnerability and attack vector
   - Step-by-step reproduction instructions or a minimal Proof of Concept (PoC)
   - Affected component(s) (Frontend, REST API, Machine Learning Pipeline, Docker container, or CI/CD)
   - Estimated severity and potential business/system impact
   - Proposed remediation (if available)

### Response Commitments
- **Initial Acknowledgment**: Within 24–48 hours of receipt.
- **Triage & Assessment**: Within 5 business days.
- **Remediation & Patch**: Security advisories will be published alongside patch releases, with credit given to the reporter (unless anonymity is requested).

---

## 3. Defense-in-Depth Security Architecture

PropVal AI implements rigorous security controls across application, network, and container layers:

### Container & Infrastructure Hardening
- **Non-Root Execution**: Containers run under dedicated unprivileged system users (`UID 10001:10001` - `appuser` for backend, `nextjs` for frontend). Root execution is strictly disabled.
- **Immutable Filesystem (`read_only: true`)**: The backend container root filesystem is mounted as read-only, preventing attackers from persisting binaries or modifying runtime code.
- **Temporary Memory Storage (`tmpfs`)**: Ephemeral runtime files are stored exclusively in RAM (`/tmp`, 64MB) with `noexec,nosuid` mount flags.
- **Linux Capability Stripping (`cap_drop: [ALL]`)**: All 38 standard Linux kernel capabilities are revoked.
- **Privilege Escalation Blocked (`no-new-privileges:true`)**: Prevents setuid binaries from escalating privileges.
- **Resource Constraints**: Capped at 2.0 CPUs and 1024MB RAM to prevent denial-of-service (DoS) or memory runaway attacks.

### Network & CIDR Isolation
- **Custom Bridge IPAM Subnet (`172.28.0.0/16`)**: Dedicated RFC 1918 CIDR subnet isolates PropVal containers from Docker's default bridge and prevents IP collisions with LANs and cloud VPCs.
- **Loopback Port Binding**: Host ports are bound exclusively to `127.0.0.1` (`127.0.0.1:8080` and `127.0.0.1:3000`), preventing unintentional exposure to WANs or local networks.

### Application Layer
- **Input Schema Validation**: Strict input boundary validation enforced at runtime using **Pydantic v2** (`HouseFeatures` model) with automatic rejection of malformed or out-of-range payloads.
- **HTTP Security Headers**: Native headers injected on all responses:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
- **Request Payload Capping**: Maximum content length limited to 16MB (`MAX_CONTENT_LENGTH = 16 * 1024 * 1024`).
- **Secret Sanitization**: `.dockerignore` and `.gitignore` enforce strict exclusion of `.env`, `.env.local`, `.git`, `.venv`, and authentication tokens.

---

## 4. Security Checklist for Contributors

Before submitting Pull Requests, ensure:
- [ ] No secrets, credentials, API keys, or `.env` files are tracked in git.
- [ ] All API inputs are rigorously validated through Pydantic schemas.
- [ ] Dependencies have zero known High/Critical CVEs (`npm audit` and `pip-audit`).
- [ ] Docker images build and execute under unprivileged non-root users.
