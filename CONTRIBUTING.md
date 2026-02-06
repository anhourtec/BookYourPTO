# Contributing to BookYourPTO

Thanks for your interest in contributing to BookYourPTO! We welcome all contributions - whether you wrote every line by hand or paired with AI. AI/vibe-coded PRs are welcome.

## How to Contribute

1. **Fork** the repository
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/BookYourPTO.git
   cd BookYourPTO
   ```
3. **Create a branch** for your change:
   ```bash
   git checkout -b feature/your-feature
   ```
4. **Make your changes** and test them locally
5. **Commit** with a clear message:
   ```bash
   git commit -m "Add your feature description"
   ```
6. **Push** to your fork:
   ```bash
   git push origin feature/your-feature
   ```
7. **Open a Pull Request** against the `main` branch

## Development Setup

```bash
npm install
npm run docker:up        # Start PostgreSQL
cp .env.example .env     # Configure environment
npm run db:init          # Initialize database
npm run dev              # Start dev server at http://localhost:3000
```

See the [README](README.md) for full environment configuration details.

## Guidelines

- **Keep PRs focused.** One feature or fix per PR. Smaller PRs get reviewed faster.
- **Follow existing patterns.** Match the code style, TypeScript conventions, and project structure already in place.
- **Test your changes.** Make sure the app builds and runs without errors.
- **Update docs if needed.** If your change affects setup, configuration, or usage, update the relevant documentation.
- **Write clear commit messages.** Describe what changed and why.

## What to Work On

- Check [open issues](https://github.com/anhourtec/BookYourPTO/issues) for bugs and feature requests
- Look for issues labeled `good first issue` for beginner-friendly tasks
- Join [GitHub Discussions](https://github.com/anhourtec/BookYourPTO/discussions) to propose ideas before starting large changes

## Tech Stack

- **Frontend:** Nuxt 4, Vue 3, TypeScript, Tailwind CSS 4, Nuxt UI
- **Backend:** Nuxt Server (Node.js), Prisma ORM, PostgreSQL
- **Auth:** JWT with refresh token rotation, bcrypt
- **Infrastructure:** Docker, Docker Compose

## Project Structure

```
BookYourPTO/
├── components/        # Vue components
├── composables/       # Vue composables (auth, API, permissions)
├── middleware/         # Route middleware
├── pages/             # Nuxt pages
├── server/
│   ├── api/           # REST API endpoints
│   ├── middleware/     # Server middleware
│   └── utils/         # Helpers (auth, email, database)
├── prisma/            # Database schema and migrations
├── scripts/           # Build and deployment scripts
└── types/             # TypeScript type definitions
```

## Maintainers

| Name | GitHub | Role |
|---|---|---|
| Nishchay Jeet Singh | [@nishchayjeet](https://github.com/nishchayjeet) | Creator & Lead Maintainer |

## Code of Conduct

Be respectful, inclusive, and constructive. We are all here to build something useful together. Harassment, discrimination, and toxic behavior will not be tolerated.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
