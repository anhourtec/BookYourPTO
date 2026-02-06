<p align="center">
  <a href="https://www.bookyourpto.com">
    <h1 align="center">BookYourPTO - Community Edition</h1>
  </a>
  <p align="center">
    Open-source, self-hosted time-off management for modern teams. Track leave requests, manage approvals, and keep your team in sync - all on your own infrastructure.
    <br />
    <a href="https://www.bookyourpto.com">Website</a>
    ·
    <a href="https://docs.bookyourpto.com">Docs</a>
    ·
    <a href="https://github.com/anhourtec/BookYourPTO/issues">Issues</a>
    ·
    <a href="https://app.bookyourpto.com">Live Demo</a>
  </p>
</p>

<div align="center">

[![License: MIT](https://img.shields.io/github/license/anhourtec/BookYourPTO?labelColor=black&style=for-the-badge&color=2563EB)](https://opensource.org/licenses/MIT)
![Stars](https://img.shields.io/github/stars/anhourtec/BookYourPTO?labelColor=black&style=for-the-badge&color=2563EB)
![Forks](https://img.shields.io/github/forks/anhourtec/BookYourPTO?labelColor=black&style=for-the-badge&color=2563EB)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?labelColor=black&style=for-the-badge&color=2563EB)](http://makeapullrequest.com)

</div>

## Mission

To give every team full ownership of their leave management - no vendor lock-in, no per-seat pricing surprises, no data leaving your servers.

## Features

- **Leave Management:** Submit, approve, and track time-off requests with multi-level approval workflows. Supports 24+ leave types including annual, sick, maternity, paternity, bereavement, and more.
- **Half-Day & Flexible Requests:** Book full days or half days. Configure carry-forward policies with expiration windows and per-user allowance overrides.
- **Team Calendar:** Visualize who's in and who's out with a color-coded calendar. Navigate by month and year with keyboard shortcuts.
- **Public Holidays:** Automatic holiday detection for 100+ countries via the Nager.Date API, with manual entry and per-user overrides.
- **Work Schedules:** Configure weekly repeating schedules, custom hours per day, break times, and schedule history tracking for both full-time and part-time arrangements.
- **Department Management:** Organize teams by department with dedicated department heads, color coding, and cost center tracking.
- **Role-Based Access Control:** Four roles - Employee, Department Head, Administrator, and Executive - each with granular permissions across the platform.
- **Reports & Exports:** Generate Excel reports filtered by date range, department, user, leave type, and status.
- **Email Notifications:** Configurable SMTP-based notifications for leave submissions, approvals, rejections, reminders, and password resets.
- **Document Uploads:** Attach files to leave requests with category organization (medical certificates, contracts, and 10+ categories).
- **Dark Mode:** Full dark mode support with automatic system preference detection.
- **Self-Hosted:** Deploy on your own infrastructure. Your data never leaves your servers.

## Pricing

Start free with the Community Edition. Upgrade when your team grows.

| | Free | Pro ($29/mo) | Business ($49/mo) | Enterprise (Custom) |
|---|:---:|:---:|:---:|:---:|
| **Users** | Up to 3 | Up to 10 | Up to 30 | Unlimited |
| Leave management | x | x | x | x |
| Leave approvals & policies | x | x | x | x |
| Time tracking (with timer) | x | x | x | x |
| Billable hours | - | x | x | x |
| Receipt scanning | 50/mo | 500/mo | Unlimited | Unlimited |
| Document storage | 50 docs | 1,000 docs | Unlimited | Unlimited |
| Searchable documents (OCR) | - | x | x | x |
| E-signature | - | x | x | x |
| Approval workflows | Basic | Basic | Advanced | Advanced |
| Reports & exports | x | x | Custom | Custom |
| Role-based access control | x | x | x | x |
| Calendar integrations | - | x | x | x |
| White-labeling | - | - | x | x |
| Auth0 integration (OIDC) | - | - | x | x |
| Audit logs | - | - | x | x |
| Custom domains | - | - | x | x |
| Support | Community | Email | Priority | Dedicated |

Need more flexibility? Add-ons are available for extra receipt scans, additional users, API access, custom branding, and advanced integrations.

[View Full Pricing](https://www.bookyourpto.com/pricing)

## Built with

- [Nuxt 4](https://nuxt.com/) & [Vue 3](https://vuejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Nuxt UI](https://ui.nuxt.com/)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/)

## Getting Started

BookYourPTO is fully self-hosted. There is also a managed cloud version at [app.bookyourpto.com](https://app.bookyourpto.com).

### Self-Hosting with Docker (Recommended)

> **Prerequisites**: [Docker Desktop](https://www.docker.com/products/docker-desktop/), [Node.js](https://nodejs.org/) v18+, and [Git](https://git-scm.com/downloads)

```bash
git clone https://github.com/anhourtec/BookYourPTO.git
cd BookYourPTO

# Configure environment
cp .env.example .env
# Edit .env with your secrets (see Environment Configuration below)

# Build and start everything
docker-compose up -d

# Verify startup
docker-compose logs -f app
```

Open http://localhost:3010

### Local Development Setup

```bash
git clone https://github.com/anhourtec/BookYourPTO.git
cd BookYourPTO

# Install dependencies
npm install

# Start PostgreSQL via Docker
npm run docker:up

# Configure environment
cp .env.example .env

# Initialize the database
npm run db:init

# Start development server
npm run dev
```

Open http://localhost:3000

## Environment Configuration

Create a `.env` file in the project root:

```env
# Database (required)
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/bookyourpto"

# JWT Secrets (required - change these in production)
JWT_SECRET="your-super-secret-key-minimum-32-characters"
REFRESH_SECRET="your-different-refresh-secret-minimum-32-characters"

# Environment
NODE_ENV="development"

# Email (optional - enables notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-specific-password"
SMTP_FROM_EMAIL="noreply@yourdomain.com"
SMTP_FROM_NAME="BookYourPTO"
```

### Email Setup

Community Edition uses environment variables for email configuration.

**Gmail:** Enable 2-factor authentication, then generate an [App Password](https://support.google.com/accounts/answer/185833) and use it as `SMTP_PASSWORD`.

**Other providers:** Use your SMTP provider's host, port, user, and password.

## Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run db:studio        # Open Prisma Studio (database GUI)

# Database
npm run db:init          # Initialize database schema
npm run db:generate      # Regenerate Prisma client
npm run db:migrate       # Apply pending migrations
npm run db:migrate:dev   # Create a new migration
npm run db:push          # Push schema changes directly
npm run db:reset         # Reset database (destructive)

# Docker
npm run docker:up        # Start PostgreSQL container
npm run docker:down      # Stop containers
npm run docker:logs      # View container logs

# Production
npm run build            # Build for production
npm run start            # Start production server
```

## Production Deployment

### Docker Compose

```bash
docker-compose up -d
docker-compose ps        # Check status
docker-compose logs -f   # View logs
```

The app runs on port 3010 by default (mapped from container port 3000).

### Manual Deployment

```bash
npm run build

export NODE_ENV=production
export DATABASE_URL="postgresql://user:pass@host:5432/bookyourpto"
export JWT_SECRET="your-production-secret-min-32-chars"
export REFRESH_SECRET="your-production-refresh-secret-min-32-chars"

npm run db:migrate
npm run start
```

### Production Checklist

- [ ] Set strong, unique values for `JWT_SECRET` and `REFRESH_SECRET`
- [ ] Set `NODE_ENV=production`
- [ ] Configure a production PostgreSQL instance
- [ ] Set up SMTP for email notifications
- [ ] Enable HTTPS via a reverse proxy (nginx, Caddy, etc.)
- [ ] Configure database backups
- [ ] Set resource limits in Docker

## Security

BookYourPTO implements industry-standard security practices:

- **JWT authentication** with short-lived access tokens and refresh token rotation
- **bcrypt password hashing** - passwords are never stored in plaintext
- **Server-side validation** on all API endpoints
- **Role-based access control** enforced at both route and component level
- **Database-tracked sessions** with revocable refresh tokens
- **Token integrity validation** to detect client-side tampering

## Project Structure

```
BookYourPTO/
├── components/            # Vue components (calendar, dashboard, settings, etc.)
├── composables/           # Vue composables (auth, API, permissions)
├── middleware/             # Route middleware (auth guards, redirects)
├── pages/                 # Nuxt pages (dashboard, calendar, approvals, etc.)
├── server/
│   ├── api/               # REST API endpoints
│   ├── middleware/         # Server middleware (JWT validation)
│   └── utils/             # Helpers (auth, email, database)
├── prisma/
│   └── schema.prisma      # Database schema
├── scripts/               # Build and deployment scripts
├── types/                 # TypeScript type definitions
├── Dockerfile             # Container definition
└── docker-compose.yml     # Docker Compose configuration
```

## API Endpoints

All protected endpoints require an `Authorization: Bearer {access_token}` header.

```
# Authentication (public)
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

# Users
GET    /api/users
POST   /api/users
GET    /api/users/:id
PATCH  /api/users/:id
DELETE /api/users/:id

# Leaves
GET    /api/leaves
POST   /api/leaves
PATCH  /api/leaves/:id
DELETE /api/leaves/:id

# Departments, Leave Types, Settings, Reports, Public Holidays, etc.
```

## Troubleshooting

**Database connection fails:**
```bash
docker ps                                    # Verify PostgreSQL is running
npm run docker:down && npm run docker:up     # Restart
npm run docker:logs                          # Check logs
```

**"401 Unauthorized" errors:** Verify `JWT_SECRET` is set in `.env`. Try logging out and back in.

**Prisma errors:**
```bash
npm run db:generate    # Regenerate Prisma client
npm run db:reset       # Reset database (destructive - loses all data)
```

**Email not sending:** Verify SMTP credentials. For Gmail, ensure you're using an [App Password](https://support.google.com/accounts/answer/185833), not your account password.

## Feature Requests

To request a feature, open a [GitHub issue](https://github.com/anhourtec/BookYourPTO/issues).

## Contributing

We welcome contributions from the community.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to your fork: `git push origin feature/your-feature`
5. Open a Pull Request

**Guidelines:** Follow existing code style and TypeScript conventions. Keep PRs focused on a single feature or fix. Update documentation as needed.

## License

This project is licensed under the [MIT License](LICENSE). You are free to use, modify, distribute, and sublicense for both personal and commercial use.

## Support

- **Documentation:** [docs.bookyourpto.com](https://docs.bookyourpto.com)
- **Issues:** [GitHub Issues](https://github.com/anhourtec/BookYourPTO/issues)
- **Discussions:** [GitHub Discussions](https://github.com/anhourtec/BookYourPTO/discussions)
- **Email:** support@anhourtec.com
- **Status:** [status.bookyourpto.com](https://status.bookyourpto.com)

---

<p align="center">
  Built by <a href="https://anhourtec.com">AnHourTec</a> in Victoria, BC, Canada
</p>
