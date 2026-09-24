# Contributing to First Issues

First off, thank you for considering contributing to First Issues! It's people like you that make First Issues such a great tool for helping developers find their first open-source issues to work on.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [What we're looking for](#what-were-looking-for)
3. [How to contribute](#how-to-contribute)
4. [Style guide](#style-guide)
5. [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by the [First Issues Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to prafulrai522@gmail.com.

## What we're looking for

We love contributions from the community! Here are some areas where we're looking for help:

- Bug fixes
- Performance improvements
- New features (please discuss in an issue before implementing)
- Documentation improvements
- UI/UX enhancements
- Accessibility improvements
- Internationalization and localization

## How to contribute

1. **Branch Protection**: Direct commits or pushes to the primary branch (`main`) are strictly prohibited. <!-- osps_ac_03_01 --> All contributions must be submitted via Pull Requests.
2. Fork the repository and create a descriptive feature branch from `main` (e.g., `git checkout -b feature/issue-filters`).
3. **Legal Authorization / DCO**: All commits must assert that the contributor is legally authorized to submit the code under the project's MIT license. <!-- osps_le_01_01 --> Use `git commit -s` to include a Developer Certificate of Origin `Signed-off-by:` trailer on every commit.
4. If you've added new code, add automated tests covering the functionality. <!-- osps_qa_06_01 -->
5. If you've changed APIs, update the corresponding documentation in `docs/` and `README.md`.
6. Ensure the project builds cleanly, tests pass, and all checks pass (`npm test`, `npm run lint`, `npm run build`).
7. Make sure your code passes TypeScript type checks (`npx tsc --noEmit`).
8. Never commit private credentials, API keys, or `.env` files. <!-- osps_br_07_01 -->
9. Submit your Pull Request using the repository pull request template for review.

### Reporting Bugs & Defects

We welcome bug and defect reports to maintain high project quality: <!-- osps_do_02_01 -->

1. **Search Existing Reports**: Ensure the bug was not already reported by searching under [GitHub Issues](https://github.com/krikera/first-issues-platform/issues).
2. **Submit Structured Defect Report**: Open a new issue using our [Bug Report Template](https://github.com/krikera/first-issues-platform/issues/new?template=bug_report.yml).
3. **Information Required**:
   - Clear title and concise summary of the problem.
   - Exact step-by-step reproduction instructions.
   - Expected behavior vs. actual behavior.
   - Relevant error logs, console output, or screenshots.
   - Environment details (Node.js version, browser, OS, package versions).
4. **Triage & Resolution**: The maintainer triages incoming issues within 7 business days. Security-sensitive defects must be reported according to [SECURITY.md](SECURITY.md) instead of public issues.

### Suggesting Enhancements

1. Open a new issue with a clear title and description using the [Feature Request Template](https://github.com/krikera/first-issues-platform/issues/new?template=feature_request.yml).
2. Describe the problem your enhancement solves and propose an implementation approach.
3. Discuss the proposed design with maintainers before submitting large pull requests.

## Style guide

### Git Commit Messages & DCO Sign-off <!-- osps_le_01_01 -->

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- **Mandatory DCO Sign-off**: Every commit must be signed off using `-s` (`git commit -s -m "feat: description"`), which adds:
  ```
  Signed-off-by: Your Name <your.email@example.com>
  ```
  By adding this trailer, you certify to the [Developer Certificate of Origin (DCO) 1.1](https://developercertificate.org/). CI will block any PRs with unsigned commits.

### CSS Style Guide

We use Tailwind CSS for styling. Please refer to the [Tailwind CSS documentation](https://tailwindcss.com/docs) for guidelines on writing efficient and maintainable CSS.

## Community & Public Discussions

We provide multiple mechanisms for public discussions about proposed changes, architectural decisions, and usage obstacles: <!-- osps_gv_02_01 -->

- **GitHub Discussions**: Use [GitHub Discussions](https://github.com/krikera/first-issues-platform/discussions) for general questions, feature brainstorming, and architectural proposals.
- **GitHub Issues**: Use [GitHub Issues](https://github.com/krikera/first-issues-platform/issues) for specific defect reports and tracked tasks.
- **Pull Request Reviews**: All code contributions are reviewed openly in public pull request discussions.

Remember, contributions to this project should be fun and engaging. If you're ever unsure about anything, just ask! We're here to help and to make contributing to this project as easy and transparent as possible.

Thank you for your interest in improving First Issues!

## Developer setup

### Prerequisites

- Node.js >= 20
- PostgreSQL database
- Git

### Install & run

```bash
npm install
npx prisma db push
npm run dev
```

See `README.md` for required environment variables.

### Quality Checks

```bash
npm test             # Run automated Vitest test suite
npm run lint         # Run ESLint validation
npx tsc --noEmit     # Execute TypeScript type checking
npm run build        # Validate Next.js production build
```

### Commit & PR

- Create a feature branch off `main`
- Ensure linting and TypeScript checks pass
- Submit PR using the template; include screenshots for UI changes
