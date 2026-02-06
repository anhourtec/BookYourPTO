# BookYourPTO v1.0.0 - Community Edition

**The first open-source release of BookYourPTO.**

A free, self-hosted time-off management system for modern teams. Deploy on your own infrastructure, keep full ownership of your data, and manage leave requests, approvals, and schedules -- all in one place.

Website: https://www.bookyourpto.com
Docs: https://docs.bookyourpto.com

---

## Highlights

- **100% free and open source** under the MIT license for teams of up to 3 users (Free tier). Paid plans available for larger teams.
- **Self-hosted** with Docker support -- deploy in under 5 minutes.
- **Full leave management** with multi-level approval workflows, 24+ leave types, and carry-forward policies.
- **Team calendar** with automatic public holiday detection for 100+ countries.
- **Built with modern tooling**: Nuxt 4, Vue 3, TypeScript, Tailwind CSS 4, Prisma, and PostgreSQL.

---

## What's Included

### Leave Management
- Submit, approve, and track time-off requests
- Two-level approval workflow (Manager then Department Head)
- 24+ configurable leave types (Annual, Sick, Maternity, Paternity, Bereavement, Compassionate, Jury Duty, Sabbatical, Study, WFH, and more)
- Half-day and full-day leave requests
- Leave balance tracking per type per fiscal year
- Carry-forward settings with expiration windows and per-user overrides
- Carry-forward eligibility by year of employment
- Sick leave bucket with separate allowance tracking
- Leave request cancellation and withdrawal
- Attachment support for documentation (medical certificates, etc.)
- Visual distinction between pending and approved leave on the calendar

### Team & Organization
- Role-based access control: Employee, Department Head, Administrator, Executive
- Department management with department heads, color coding, and cost centers
- Manager-employee hierarchy with direct reports
- Employment types: Full-time, Part-time, Contract, Intern, Temporary, Seasonal
- User profile management with employment details
- "Reports To" field linking employees to managers with email notification support

### Calendar & Scheduling
- Personal calendar with leave history
- Team dashboard with aggregate view of all members
- Month/year navigation with keyboard shortcuts
- Color-coded leave types for visual clarity
- Public holiday management:
  - Auto-fetch from Nager.Date API for 100+ countries
  - Manual holiday entry
  - Half-day holiday support
- User-specific holiday overrides (exclude org holidays or add custom ones per user)
- Holiday country/region override per user
- Work schedule configuration:
  - Weekly repeating schedules
  - Custom hours per day with break time settings
  - Schedule history tracking with effective date ranges
  - Full-time and part-time support

### Approvals
- Dedicated approvals page for managers and department heads
- Filter by employee name, status, and date range
- Approve with optional comments or reject with reason
- Pending count and processed-today statistics
- Email notifications sent to approvers on new requests

### Reports
- Excel export via ExcelJS
- Filter by date range, department, user, leave type, and status
- Leave summaries and balance information

### Notifications & Email
- SMTP-based email system via Nodemailer
- Configurable via environment variables
- Email templates for: welcome, password reset, leave submitted, leave approved, leave rejected, leave cancelled, approval required, balance updates
- In-app notification system with read/unread tracking
- Priority levels: Low, Medium, High, Urgent

### Document Management
- File uploads with category organization (Contract, Offer Letter, Medical, Certificate, and 10+ categories)
- File metadata tracking (size, MIME type, checksum)
- Access control (private, shared with specific users/roles)
- Soft delete support

### Security
- JWT authentication with short-lived access tokens and refresh token rotation
- bcrypt password hashing
- Forgot password / reset password flow with token expiry
- Server-side token validation on all protected routes
- Token integrity validation to detect client-side tampering
- Security validator plugin that detects localStorage tampering and forces logout
- Role-based permissions enforced at route and component level
- Settings page restricted to authorized roles only

### UI/UX
- Dark mode with system preference detection
- Responsive design for mobile, tablet, and desktop
- Redesigned header and footer
- Mobile-friendly profile menu and navigation
- Loading states and skeleton loaders
- Smooth animations and transitions

### Deployment
- Docker and Docker Compose support (PostgreSQL 16 + Node.js 22 Alpine)
- Multi-stage Dockerfile optimized for production
- Database initialization script with automatic schema application
- Build script for clean rebuilds
- Runs on port 3010 (mapped from container port 3000)
- Environment-based configuration

---

## What's Not Included (Pro / Business / Enterprise)

The following features are available in paid plans and are not part of the Community Edition:

- White-label branding (custom logos, colors, brand name)
- Audit logs and sign-in tracking
- Google Calendar and Outlook sync
- Slack notifications
- Project time tracking and billable hours
- RESTful API access
- Receipt scanning with OCR
- Document e-signatures
- Auth0 / OIDC integration
- Custom domains
- Advanced approval workflows
- Custom reports

Visit [bookyourpto.com/pricing](https://www.bookyourpto.com/pricing) for plan details.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Nuxt 4.2.1 with Vue 3.5 |
| Language | TypeScript |
| Styling | Tailwind CSS 4.1 |
| Components | Nuxt UI 4.2.1 |
| ORM | Prisma 7.1 |
| Database | PostgreSQL 16 |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Email | Nodemailer |
| Reports | ExcelJS |
| Validation | Zod |
| Icons | Lucide |
| Runtime | Node.js 22 (Alpine) |
| Container | Docker + Docker Compose |

---

## Getting Started

### Docker (Recommended)

```bash
git clone https://github.com/anhourtec/BookYourPTO.git
cd BookYourPTO
cp .env.example .env
# Edit .env with your secrets
docker-compose up -d
```

Open http://localhost:3010

### Local Development

```bash
git clone https://github.com/anhourtec/BookYourPTO.git
cd BookYourPTO
npm install
npm run docker:up       # Start PostgreSQL
cp .env.example .env
npm run db:init
npm run dev
```

Open http://localhost:3000

### Required Environment Variables

```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/bookyourpto"
JWT_SECRET="your-secret-min-32-characters"
REFRESH_SECRET="your-different-secret-min-32-characters"
NODE_ENV="development"
```

See the [README](README.md) for full configuration details including SMTP email setup.

---

## License

MIT License. Free for personal and commercial use.

---

## Links

- **Website:** https://www.bookyourpto.com
- **Docs:** https://docs.bookyourpto.com
- **Source:** https://github.com/anhourtec/BookYourPTO
- **Issues:** https://github.com/anhourtec/BookYourPTO/issues
- **Status:** https://status.bookyourpto.com
- **Support:** support@anhourtec.com

---

Built by [AnHourTec](https://anhourtec.com) in Victoria, BC, Canada.
