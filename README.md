# BookYourPTO - Community Edition

**Open-source, self-hosted time-off management for small teams (up to 10 users)**

**Developed by [AnHourTec](https://anhourtec.com) - Victoria, BC, Canada**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

---

## Overview

BookYourPTO Community Edition is a free, open-source PTO (Paid Time Off) management platform designed for small teams. Built with modern web technologies, it provides essential leave tracking, approval workflows, and team management capabilities.

### Perfect for:
- Small teams and startups (up to 10 users)
- Self-hosted deployment
- Organizations wanting full control of their data
- Teams needing basic but powerful PTO management

---

## Community Edition Features

✅ **Core Leave Management**
- Leave request, approval, and tracking
- Two-level approval workflows (manager + department head)
- Multiple leave types (Annual, Sick, Maternity, Paternity, etc.)
- Half-day and full-day leave requests
- Leave balance tracking and carry-forward

✅ **Team Management**
- Up to 10 active users
- Department management
- Role-based access control (Employee, Department Head, Administrator, Executive)
- User hierarchy with manager relationships

✅ **Calendar & Scheduling**
- Calendar view of approved leaves
- Public holidays management
- User-specific holiday overrides
- Work schedule configuration

✅ **Core Features**
- Email notifications (configure via environment variables)
- Document uploads with basic file management
- Real-time notifications
- Responsive UI with dark mode
- Multi-timezone support

✅ **Security & Authentication**
- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Role-based permissions
- Server-side token validation

---

## Pro & Enterprise Features 🔒

Upgrade to **BookYourPTO Pro** or **Enterprise** for advanced capabilities:

### Pro Edition ($29/month)
- 🚀 **Up to 100 users**
- 🎨 **White-label branding** - Custom logos, colors, brand name
- 🔒 **Advanced security** - Audit logs, sign-in tracking, security violation monitoring
- 📊 **Advanced reports** - Excel exports, custom reports, analytics
- 🔗 **Calendar integrations** - Google Calendar, Outlook sync
- 💬 **Slack notifications** - Real-time team updates
- ⏰ **Time management** - Project time tracking
- 🔌 **API access** - RESTful API for integrations

### Enterprise Edition ($99/month)
- 🏢 **Unlimited users**
- ✍️ **Document e-signatures** - PDF/Word signing workflows
- 🏆 **Priority support** - Dedicated support channel
- 🛠️ **Custom features** - Tailored to your needs
- 📞 **Onboarding assistance**

**[View Pricing & Upgrade →](https://anhourtec.com/bookyourpto/pricing)**

---

## Technology Stack

### Frontend
- **Nuxt 4** with Vue 3 and TypeScript
- **Tailwind CSS 4** for styling
- **Nuxt UI 4.2.1** - Modern component library
- **Lucide Icons** - Beautiful icon set
- SSR-safe composables

### Backend
- **Nuxt Server** API routes (Node.js)
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Reliable relational database
- **JWT** authentication (jsonwebtoken)
- **bcrypt** for password hashing
- **Nodemailer** for email notifications

### Infrastructure
- Docker & Docker Compose ready
- Self-hosted deployment
- Environment-based configuration

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker (optional, recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/anhourtec/BookYourPTO.git
cd BookYourPTO

# Install dependencies
npm install

# Start PostgreSQL (using Docker)
npm run docker:up

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Initialize database
npm run db:init

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

---

## Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/bookyourpto"

# JWT Secrets (CHANGE THESE!)
JWT_SECRET="your-super-secret-key-change-this-in-production-min-32-characters"
REFRESH_SECRET="your-different-refresh-secret-key-change-this-in-production"

# Email Configuration (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM_EMAIL="noreply@yourdomain.com"
SMTP_FROM_NAME="BookYourPTO"

# Environment
NODE_ENV="development"
```

### Email Setup (Optional)

Community Edition uses environment variables for email configuration:

**Gmail:**
1. Enable 2-factor authentication
2. Generate an [App Password](https://support.google.com/accounts/answer/185833)
3. Use the app password in `SMTP_PASSWORD`

**Other SMTP:**
- Use your SMTP provider's settings for host, port, user, and password

---

## Available Scripts

### Development
```bash
npm run dev              # Start development server
npm run db:studio        # Open Prisma Studio (database GUI)
```

### Database Management
```bash
npm run db:init          # Initialize database
npm run db:generate      # Generate Prisma Client
npm run db:migrate       # Run migrations
npm run db:migrate:dev   # Create new migration
npm run db:reset         # Reset database (⚠️ destructive)
```

### Docker
```bash
npm run docker:up        # Start PostgreSQL container
npm run docker:down      # Stop containers
npm run docker:logs      # View container logs
```

### Production
```bash
npm run build            # Build for production
npm run start            # Start production server
npm run preview          # Preview production build
```

---

## Production Deployment

### Using Docker Compose

```bash
# Build and start
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f app
```

### Manual Deployment

```bash
# Build the application
npm run build

# Set environment variables
export NODE_ENV=production
export DATABASE_URL="postgresql://user:pass@host:5432/db"
export JWT_SECRET="your-production-secret"
export REFRESH_SECRET="your-production-refresh-secret"

# Run migrations
npm run db:migrate

# Start server
npm run start
```

---

## User Limit

**Community Edition is limited to 10 active users.** This ensures the platform remains free and accessible for small teams while supporting continued development.

When you reach 10 users, you'll see:
```
User limit reached (10 users maximum in Community Edition).
Upgrade to Pro for up to 100 users.
```

**Need more users?** [Upgrade to Pro or Enterprise →](https://anhourtec.com/bookyourpto/pricing)

---

## Security

### Implemented Security Features
✅ Short-lived access tokens (15 minutes)
✅ Refresh token rotation
✅ Database-tracked sessions
✅ Password hashing with bcrypt
✅ Server-side API validation
✅ Role-based access control
✅ SSR-safe authentication

### Production Security Checklist
- [ ] Change default JWT secrets
- [ ] Use strong database passwords
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Regular database backups
- [ ] Keep dependencies updated

---

## Project Structure

```
BookYourPTO/
├── server/
│   ├── api/                    # API endpoints
│   │   ├── auth/              # Authentication
│   │   ├── users/             # User management
│   │   ├── departments/       # Departments
│   │   ├── leaves/            # Leave requests
│   │   ├── leave-types/       # Leave type config
│   │   └── settings/          # Organization settings
│   ├── middleware/            # Server middleware
│   │   └── auth.ts           # JWT validation
│   └── utils/                 # Utilities
│       ├── jwt.ts            # Token handling
│       └── db.ts             # Prisma client
├── composables/
│   ├── useApi.ts             # API wrapper with auto-refresh
│   ├── useAuth.ts            # Authentication state
│   └── usePermissions.ts     # Role permissions
├── pages/                    # Application pages
├── components/               # Vue components
├── prisma/
│   └── schema.prisma        # Database schema
└── docker-compose.yml       # Docker configuration
```

---

## API Endpoints

### Authentication (Public)
```
POST   /api/auth/login              # User login
POST   /api/auth/register           # Organization signup
POST   /api/auth/refresh            # Token refresh
POST   /api/auth/forgot-password    # Password reset request
POST   /api/auth/reset-password     # Password reset
```

### Users (Protected)
```
GET    /api/users                   # List all users (max 10)
POST   /api/users                   # Create user
GET    /api/users/:id               # Get user details
PATCH  /api/users/:id               # Update user
DELETE /api/users/:id               # Delete user
```

### Leaves (Protected)
```
GET    /api/leaves                  # List leaves
POST   /api/leaves                  # Create leave request
PATCH  /api/leaves/:id               # Update leave
DELETE /api/leaves/:id               # Cancel leave
```

Protected endpoints require `Authorization: Bearer {access_token}` header.

---

## Frequently Asked Questions

### Can I use this commercially?
Yes! MIT license allows commercial use. You can deploy it for your company or clients.

### How do I upgrade to Pro/Enterprise?
Visit [anhourtec.com/bookyourpto](https://anhourtec.com/bookyourpto) or email sales@anhourtec.com

### Can I contribute to the open-source version?
Absolutely! We welcome contributions. See [Contributing](#contributing) below.

### What's the difference between Community and Pro?
Community Edition has a 10-user limit and basic features. Pro adds white-labeling, advanced security, integrations, and supports up to 100 users.

### Is my data secure?
Yes. All data stays on your server (self-hosted). Passwords are hashed with bcrypt, and we use industry-standard JWT authentication.

### Can I customize the code?
Yes! MIT license allows modification. Fork the repo and customize as needed.

---

## Contributing

We welcome contributions from the community! 🎉

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Contribution Guidelines
- Follow existing code style and TypeScript conventions
- Add tests for new features
- Update documentation as needed
- Keep PRs focused on a single feature/fix
- Add comments for complex logic

### Code of Conduct
Be respectful, inclusive, and constructive. We're all here to build something great together.

---

## Troubleshooting

### "User limit reached"
Community Edition supports 10 users. [Upgrade to Pro](https://anhourtec.com/bookyourpto) for more.

### Database connection fails
```bash
# Check PostgreSQL is running
docker ps

# Restart PostgreSQL
npm run docker:down && npm run docker:up

# Check database logs
npm run docker:logs
```

### "401 Unauthorized" errors
- Verify JWT_SECRET is set in `.env`
- Check token is being sent in Authorization header
- Try logging out and back in

### Prisma errors
```bash
# Regenerate Prisma Client
npm run db:generate

# Reset database (⚠️ loses data)
npm run db:reset
```

### Email not sending
- Verify SMTP credentials in `.env`
- Check SMTP_PORT (usually 587 for TLS, 465 for SSL)
- For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833)

---

## Roadmap

### Upcoming Features
- [ ] Mobile app (iOS/Android)
- [ ] Advanced calendar views
- [ ] Slack integration (Community Edition)
- [ ] Better reporting
- [ ] API documentation
- [ ] Admin dashboard improvements

Want to request a feature? [Open an issue](https://github.com/anhourtec/BookYourPTO/issues)

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

You are free to:
- ✅ Use commercially
- ✅ Modify
- ✅ Distribute
- ✅ Sublicense

---

## Support

### Community Support
- **Documentation:** [GitHub Wiki](https://github.com/anhourtec/BookYourPTO/wiki)
- **Issues:** [GitHub Issues](https://github.com/anhourtec/BookYourPTO/issues)
- **Discussions:** [GitHub Discussions](https://github.com/anhourtec/BookYourPTO/discussions)

### Commercial Support
- **Website:** [anhourtec.com/bookyourpto](https://anhourtec.com/bookyourpto)
- **Email:** support@anhourtec.com
- **Pro/Enterprise:** Dedicated support channel

---

## Acknowledgments

Built with ❤️ by [AnHourTec](https://anhourtec.com) using modern web technologies:
- Nuxt 4 & Vue 3
- Prisma & PostgreSQL
- Tailwind CSS
- TypeScript

Special thanks to all our contributors and the open-source community!

---

**Made in Victoria, BC, Canada 🇨🇦**

**Star ⭐ this repo if you find it useful!**
