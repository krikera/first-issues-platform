# Project Governance

This document describes the project governance model, roles and responsibilities, and access to sensitive resources for the **First Issues** platform. <!-- osps_gv_01_01, osps_gv_01_02 -->

---

## 1. Governance Model

First Issues is an open-source project maintained under a benevolent maintainer governance model. The primary maintainer sets technical direction, oversees security posture, and retains final authority over merges and releases. Community contributions and discussions are welcomed and conducted transparently.

---

## 2. Roles & Responsibilities

| Role | Members | Responsibilities | Permissions |
| :--- | :--- | :--- | :--- |
| **Project Lead & Security Officer** | [@krikera](https://github.com/krikera) | • Architectural decisions<br>• Vulnerability disclosure & CVE response<br>• Release management & artifact signing<br>• Infrastructure & database administration | Admin / Owner on GitHub, Vercel, Supabase, and DNS |
| **Core Maintainers / Reviewers** | Maintainer Team | • Reviewing community Pull Requests<br>• Issue triage and bug verification<br>• Maintaining test suites and documentation | Write access to feature branches and triage rights |
| **Contributors** | Community | • Submitting bug reports and feature proposals<br>• Submitting code changes with DCO sign-offs<br>• Improving test coverage and documentation | Fork and Pull Request access |

---

## 3. Sensitive Resource Access Matrix

Access to sensitive project resources is restricted strictly to designated personnel: <!-- osps_gv_01_01 -->

| Resource Type | Resource Description | Access Level | Authorized Personnel | Authentication Method |
| :--- | :--- | :--- | :--- | :--- |
| **Source Control** | GitHub Repository (`krikera/first-issues-platform`) | Owner / Admin | @krikera | Hardware 2FA / WebAuthn |
| **Branch Protection** | Primary branch (`main`) rule configuration | Admin | @krikera | Hardware 2FA / WebAuthn |
| **Cloud Hosting** | Vercel Deployment Platform & Edge Functions | Owner | @krikera | Multi-Factor Authentication |
| **Database** | Supabase / Neon PostgreSQL instances | Admin | @krikera | Encrypted credentials, MFA |
| **Production Secrets** | `JWT_SECRET_KEY`, `GITHUB_API_KEY`, `DATABASE_URL` | Admin | @krikera | Vercel Encrypted Environment Store |
| **Release Signing** | GitHub Actions Provenance & Attestations | Automated CI | GitHub Actions Token (least privilege) | OIDC / GitHub Actions |
| **Domain & DNS** | Production Domain Registration & DNS Records | Owner | @krikera | Registrar 2FA |

Access reviews are conducted semi-annually. In the event of offboarding or compromise, credentials and tokens are rotated immediately.

---

## 4. Decision Making & Dispute Resolution

1. **RFCs & Significant Changes**: Major architectural decisions, dependency removals, or security policy updates must be proposed via [GitHub Discussions](https://github.com/krikera/first-issues-platform/discussions) or RFC issues.
2. **Consensus**: Maintainers seek consensus among active participants.
3. **Escalation**: If consensus cannot be reached, the Project Lead (@krikera) holds deciding authority.

---

## 5. Branch Protection & Release Authority

- No user (including administrators) may push directly to `main`. <!-- osps_ac_03_01 -->
- All changes must pass automated CI checks (`Test, Lint & Build`) and have a passing review before merge. <!-- osps_qa_03_01 -->
- Only the Project Lead may publish official release tags and release assets. <!-- osps_br_02_01 -->
