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

## 4. Collaborator Review & Escalated Permissions Policy <!-- osps_gv_04_01 -->

Prior to granting any collaborator escalated access to sensitive resources (write access to feature branches, issue triage rights, or administrative roles), the project mandates a formal review process:

1. **Demonstrated Contribution Track Record**:
   - The candidate must have authored and successfully merged at least **3 substantial pull requests** within the preceding 6 months.
   - All contributions must have passed automated test suites, typechecks, and DCO sign-off requirements.
2. **Security & Authentication Verification**:
   - The candidate must have enabled hardware-backed or application-based Multi-Factor Authentication (MFA / 2FA) on their GitHub account.
   - The candidate must acknowledge and adhere to the project's [Security Policy](SECURITY.md) and secrets handling rules.
3. **Community & Governance Alignment**:
   - The candidate must demonstrate positive adherence to the [Code of Conduct](CODE_OF_CONDUCT.md).
   - Escalation requires formal proposal and unanimous approval by the primary Project Lead (@krikera).
4. **Access Reviews & Offboarding**:
   - Permissions are audited semi-annually. Collaborators who have been inactive for more than 6 months have write access revoked. In the event of offboarding or suspected compromise, access is revoked immediately within 12 hours.

---

## 5. Decision Making & Dispute Resolution

1. **RFCs & Significant Changes**: Major architectural decisions, dependency removals, or security policy updates must be proposed via [GitHub Discussions](https://github.com/krikera/first-issues-platform/discussions) or RFC issues.
2. **Consensus**: Maintainers seek consensus among active participants.
3. **Escalation**: If consensus cannot be reached, the Project Lead (@krikera) holds deciding authority.

---

## 6. Branch Protection & Non-Author Approval Policy <!-- osps_ac_03_01, osps_qa_03_01, osps_qa_07_01 -->

The repository's version control system enforces strict branch protection on `main`:

1. **No Direct Pushes**: No user (including repository administrators) may push or commit directly to the primary branch (`main`). <!-- osps_ac_03_01 -->
2. **Mandatory Non-Author Human Review**: Every pull request targeting the primary branch MUST require at least **one non-author human review approval** before merging is permitted by the version control system. <!-- osps_qa_07_01 -->
3. **Automated Status Check Gates**: All pull requests must pass required automated status checks (`Test, Lint & Build`, DCO Verification, Dependency SCA Audit, CodeQL SAST Analysis) before the merge button is unlocked. <!-- osps_qa_03_01 -->
4. **Release Exclusivity**: Only the Project Lead may publish official release tags and release assets. <!-- osps_br_02_01 -->

