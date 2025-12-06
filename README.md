# BookYourPTO

Open-source, self-hosted time-off management system for modern teams.

## Overview

BookYourPTO is a comprehensive PTO (Paid Time Off) management platform designed to streamline leave requests, approvals, and tracking for organizations of any size. Built with performance and scalability in mind, it offers multi-tenancy support, white-labeling capabilities, and seamless calendar integrations.

## Key Features

- Multi-tenant architecture supporting multiple organizations
- White-labeling with custom branding and domains
- Calendar integration with Google Calendar and Outlook
- Document management with e-signature support
- Self-hosted deployment with Docker
- Real-time notifications and updates
- Comprehensive leave tracking and reporting
- Role-based access control

## Technology Stack

- Frontend: Nuxt.js with Tailwind CSS
- Database: PostgreSQL
- Cache: Redis
- Storage: Local filesystem with Docker volumes
- Container: Docker

## Getting Started

Detailed setup instructions will be added as the project develops.

## License

This project is licensed under the GNU General Public License v3.0.

## Contributing

Contributions are welcome. Please read the contributing guidelines before submitting pull requests.

# BookYourPTO Scripts

This directory contains automation scripts for database management and deployment.

## Scripts Overview

### `db-init.mjs`
Initializes the database by:
- Generating Prisma Client
- Running migrations (or db push if no migrations exist)
- Checking for seed files

**Usage:**
```bash
npm run db:init
```

### `dev-start.mjs`
Development workflow that:
- Initializes the database
- Starts the Nuxt dev server

**Usage:**
```bash
npm run dev
```

### `docker-deploy.mjs`
Production deployment that:
- Waits for database to be ready
- Runs database initialization
- Starts the production server

**Usage:**
```bash
npm run start
```
## Available npm Scripts

### Development
- `npm run dev` - Start development server (auto-initializes DB)
- `npm run db:studio` - Open Prisma Studio

### Database Management
- `npm run db:init` - Initialize database (generate + migrate)
- `npm run db:generate` - Generate Prisma Client only
- `npm run db:migrate` - Run migrations (production)
- `npm run db:migrate:dev` - Create and run new migration (dev)
- `npm run db:push` - Push schema without migrations
- `npm run db:seed` - Run seed file
- `npm run db:reset` - Reset database (⚠️ destructive)

### Docker
- `npm run docker:up` - Start Docker containers
- `npm run docker:down` - Stop Docker containers
- `npm run docker:logs` - View container logs

### Production
- `npm run build` - Build for production (auto-initializes DB)
- `npm run start` - Start production server (Docker)
- `npm run preview` - Preview production build locally

## Deployment Flow
- `npm run preview` - Preview production build locally

## Initialize Prisma
- `npm prisma init` - To initialize Prisma

### Local Development
```bash
# Start database
npm run docker:up

# Start dev server (auto-initializes DB)
npm run dev
```

### Production Deployment
```bash
# Build the application
npm run build

# Run with Docker Compose
docker-compose up -d

# Or use Docker image
docker build -t bookyourpto .
docker run -p 3000:3000 --env-file .env bookyourpto
```

## How It Works

1. **On first run**: Scripts detect no tables exist and create them automatically
2. **On subsequent runs**: Scripts apply any new migrations
3. **Database wait**: Production script waits for PostgreSQL to be ready
4. **No manual steps**: Everything is automated

## Environment Variables

Ensure these are set in your `.env` file:

```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/bookyourpto"
JWT_SECRET="your-super-secret-key-change-this-in-production-min-32-characters"
NODE_ENV="development"
```

## Troubleshooting

### Database connection fails
```bash
# Check if PostgreSQL is running
npm run docker:up
docker ps

# Check database logs
npm run docker:logs
```

### Migrations out of sync
```bash
# Reset and regenerate (⚠️ loses data)
npm run db:reset

# Or manually sync
npx prisma migrate resolve --applied <migration_name>
```

### Prisma Client not generated
```bash
npm run db:generate
```