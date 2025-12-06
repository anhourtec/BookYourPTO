# BookYourPTO

Open-source, self-hosted time-off management system for modern teams.

**Developed by [AnHourTec](https://anhourtec.com) - BC, Canada**

## Overview

BookYourPTO is a comprehensive PTO (Paid Time Off) management platform designed to streamline leave requests, approvals, and tracking for organizations of any size. Built with performance, security, and scalability in mind, it offers multi-tenancy support, white-labeling capabilities, and seamless calendar integrations.

## Key Features

### Core Functionality
- Multi-tenant architecture supporting multiple organizations
- White-labeling with custom branding, colors, and domains
- Comprehensive leave tracking and approval workflows
- Department and user management
- Document management with e-signature support
- Real-time notifications and updates
- Advanced filtering and search capabilities
- Role-based access control (Employee, Manager, Department Head, HR, Administrator, Executive)

### Security & Authentication
- JWT-based authentication with refresh token rotation
- Automatic token refresh for seamless user experience
- Server-side token validation on all API routes
- Client-side route protection with role-based access
- SSR-safe implementation for Nuxt 3
- Configurable token expiry (15 min access / 7 days refresh)
- Database-tracked refresh tokens for revocation support

### User Experience
- Modern, responsive UI with dark mode support
- Real-time token expiry countdown (development mode)
- Seamless auto-refresh on token expiry
- Automatic logout on session expiry
- No interruption during active sessions

## Technology Stack

### Frontend
- Nuxt 3 with Vue 3 and TypeScript
- Tailwind CSS for styling
- Nuxt Icon (Lucide icons)
- SSR-safe composables

### Backend
- Nuxt 3 Server API routes
- Prisma ORM
- PostgreSQL database
- JWT for authentication (jsonwebtoken)
- bcrypt for password hashing

### Infrastructure
- Docker for containerization
- Docker Compose for orchestration
- Local filesystem storage with Docker volumes
- Redis (planned for caching)

## Project Structure

```
BookYourPTO/
├── server/
│   ├── api/                    # API endpoints
│   │   ├── auth/              # Authentication endpoints
│   │   │   ├── login.post.ts
│   │   │   ├── register.post.ts
│   │   │   └── refresh.post.ts
│   │   ├── users/             # User management
│   │   ├── departments/       # Department management
│   │   └── settings/          # Organization settings
│   ├── middleware/            # Server middleware
│   │   └── auth.ts           # JWT validation for all /api/* routes
│   └── utils/
│       ├── jwt.ts            # Token generation & verification
│       ├── db.ts             # Prisma client
│       └── auth.ts           # Legacy auth utilities
├── middleware/
│   └── auth.global.ts        # Client-side route protection
├── composables/
│   ├── useApi.ts             # API wrapper with auto-refresh
│   ├── usePermissions.ts     # Role-based permissions
│   └── useUserRoleColors.ts  # UI utilities
├── pages/                    # Application pages
├── components/               # Vue components
├── types/
│   ├── user.ts              # User type definitions
│   └── api.ts               # API response types
├── prisma/
│   └── schema.prisma        # Database schema
└── scripts/                 # Automation scripts
```

## Authentication Flow

### Login Flow
1. User submits email/password to `/api/auth/login`
2. Server validates credentials
3. Server generates:
   - Access token (15 min expiry)
   - Refresh token (7 days expiry)
4. Refresh token stored in database
5. Both tokens returned to client
6. Client stores tokens in localStorage

### Token Refresh Flow
1. Access token expires after 15 minutes
2. Next API call returns 401 error
3. `useApi` composable catches 401
4. Automatically calls `/api/auth/refresh` with refresh token
5. Server validates refresh token from database
6. Server generates new access + refresh tokens (rotation)
7. Old refresh token deleted, new one stored
8. Client retries original request with new token
9. User sees no interruption

### Session Expiry
1. Refresh token expires after 7 days
2. Token refresh attempt fails
3. User automatically logged out
4. Redirected to login page

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Docker (optional, for containerized deployment)

### Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/bookyourpto"

# JWT Secrets (change these in production!)
JWT_SECRET="your-super-secret-key-change-this-in-production-min-32-characters"
REFRESH_SECRET="your-different-refresh-secret-key-change-this-in-production"

# Environment
NODE_ENV="development"
```

### Installation

```bash
# Clone the repository
git clone https://github.com/anhourtec/BookYourPTO.git
cd BookYourPTO

# Install dependencies
npm install

# Start PostgreSQL (using Docker)
npm run docker:up

# Start development server (auto-initializes DB)
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

### Development
```bash
npm run dev              # Start development server (auto-initializes DB)
npm run db:studio        # Open Prisma Studio for database management
```

### Database Management
```bash
npm run db:init          # Initialize database (generate + migrate)
npm run db:generate      # Generate Prisma Client only
npm run db:migrate       # Run migrations (production)
npm run db:migrate:dev   # Create and run new migration (development)
npm run db:push          # Push schema without migrations
npm run db:seed          # Run seed file
npm run db:reset         # Reset database (WARNING: destructive)
```

### Docker
```bash
npm run docker:up        # Start Docker containers
npm run docker:down      # Stop Docker containers
npm run docker:logs      # View container logs
```

### Production
```bash
npm run build            # Build for production (auto-initializes DB)
npm run start            # Start production server (Docker)
npm run preview          # Preview production build locally
```

## Database Schema

### Core Models
- **Organization** - Multi-tenant root entity
- **User** - Employees with roles and permissions
- **Department** - Organizational units
- **RefreshToken** - JWT refresh token tracking
- **LeaveType** - Configurable leave categories
- **Leave** - Time-off requests and approvals
- **LeaveBalance** - Leave allowance tracking
- **PublicHoliday** - Organization and regional holidays
- **Document** - File management with e-signatures
- **Notification** - In-app and email notifications
- **AuditLog** - Compliance and security tracking

## API Endpoints

### Authentication
```
POST   /api/auth/login          # User login
POST   /api/auth/register       # User registration
POST   /api/auth/refresh        # Refresh access token
POST   /api/auth/verify-email   # Email verification
POST   /api/auth/reset-password # Password reset
```

### Users (Protected)
```
GET    /api/users               # List all users
GET    /api/users/:id           # Get user details
PATCH  /api/users/:id           # Update user
DELETE /api/users/:id           # Delete user
```

### Departments (Protected)
```
GET    /api/departments         # List all departments
POST   /api/departments         # Create department
PATCH  /api/departments/:id     # Update department
DELETE /api/departments/:id     # Delete department
```

### Settings (Protected)
```
GET    /api/settings            # Get organization settings
PATCH  /api/settings            # Update organization settings
```

All protected endpoints require `Authorization: Bearer {access_token}` header.

## Security Best Practices

### Implemented Security Features
1. **Short-lived access tokens** (15 minutes) - Minimizes exposure window
2. **Refresh token rotation** - New refresh token on every refresh
3. **Database validation** - Refresh tokens stored and validated in DB
4. **Separate secrets** - Different secrets for access and refresh tokens
5. **Automatic logout** - On refresh token expiry
6. **Server-side validation** - All API routes protected by middleware
7. **Client-side protection** - Route guards with role-based access
8. **SSR-safe** - No localStorage access on server
9. **Password hashing** - bcrypt with salt rounds
10. **Token revocation** - Delete refresh tokens to force logout

### Production Configuration

In production, update `server/utils/jwt.ts`:

```typescript
// Access Token: 15 minutes
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' })
}

// Refresh Token: 7 days
export function generateRefreshToken(userId: string, tokenId: string): string {
  return jwt.sign({ userId, tokenId }, REFRESH_SECRET, { expiresIn: '7d' })
}
```

Remove the token countdown badge from `components/Header.vue` (development feature).

## Deployment

### Docker Deployment

```bash
# Build the application
npm run build

# Start with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Manual Deployment

```bash
# Build the application
npm run build

# Set production environment
export NODE_ENV=production
export DATABASE_URL="your-production-db-url"
export JWT_SECRET="your-production-secret"
export REFRESH_SECRET="your-production-refresh-secret"

# Run migrations
npm run db:migrate

# Start the server
npm run start
```

### Environment Variables (Production)

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="production-secret-min-32-chars-use-strong-random-string"
REFRESH_SECRET="different-production-secret-min-32-chars-use-strong-random-string"
NODE_ENV="production"
```

## Development Guidelines

### Adding New API Endpoints

1. Create endpoint file in `server/api/`
2. Use `event.context.auth` for authenticated routes
3. Don't manually verify tokens (middleware handles this)

Example:
```typescript
// server/api/example.get.ts
export default defineEventHandler(async (event) => {
  // Get authenticated user info from middleware
  const auth = event.context.auth
  
  if (!auth) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  
  // Use auth.userId, auth.organizationId, auth.role, auth.email
  const data = await prisma.example.findMany({
    where: { organizationId: auth.organizationId }
  })
  
  return data
})
```

### Adding New Types

1. Define types in `types/api.ts` or `types/user.ts`
2. Export from `types/api.ts` for convenience
3. Import in components/composables: `import type { YourType } from '~/types/api'`

### Testing Token Expiry

Set short token lifetimes in `server/utils/jwt.ts`:
```typescript
expiresIn: '30s'  // Access token
expiresIn: '2m'   // Refresh token
```

Watch the countdown in the header and observe auto-refresh in action.

## Troubleshooting

### "localStorage is not defined"
- Ensure all localStorage access is wrapped in `typeof window !== 'undefined'` checks
- Check that middleware has `if (process.server) return` at the top

### "401 Unauthorized" errors
- Check server terminal for middleware logs
- Verify `server/middleware/auth.ts` exists and is using `verifyAccessToken()`
- Ensure token is being sent in `Authorization: Bearer {token}` header

### Token not refreshing
- Check that `/api/auth/refresh` is in `publicRoutes` array in server middleware
- Verify refresh token exists in localStorage
- Check server logs for refresh errors

### Database connection fails
```bash
# Check PostgreSQL is running
npm run docker:up
docker ps

# Check database logs
npm run docker:logs
```

### Prisma Client errors
```bash
# Regenerate Prisma Client
npm run db:generate

# Reset database (WARNING: loses data)
npm run db:reset
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for type safety
- Follow existing code structure and naming conventions
- Add comments for complex logic
- Update documentation for new features

## License

This project is licensed under the GNU General Public License v3.0. See the LICENSE file for details.

## Support

- Documentation: [Wiki](https://github.com/anhourtec/BookYourPTO/wiki)
- Issues: [GitHub Issues](https://github.com/anhourtec/BookYourPTO/issues)
- Discussions: [GitHub Discussions](https://github.com/anhourtec/BookYourPTO/discussions)
- Website: [anhourtec.com](https://anhourtec.com)
- Email: support@anhourtec.com

---

**Made with care by AnHourTec in Victoria, BC, Canada**

## Acknowledgments

Built with modern web technologies and best practices for security, performance, and developer experience.
