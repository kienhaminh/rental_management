# Rental Management Platform

A modern, full-stack rental room management platform built with Next.js, Prisma, and Neon Postgres.

## Features

- **Room Management**: Add, edit, delete, and view rental rooms with detailed information
- **Real-time Statistics**: Track total rooms, availability, occupancy, and monthly revenue
- **Status Filtering**: Filter rooms by status (Available, Occupied, Maintenance, Reserved)
- **Modern UI**: Built with shadcn/ui components and Supabase theme
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Database Integration**: Prisma ORM with Neon Postgres for reliable data storage
- **API Routes**: RESTful API endpoints for all CRUD operations

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: shadcn/ui with Supabase theme
- **Styling**: Tailwind CSS
- **Database**: Neon Postgres (PostgreSQL)
- **ORM**: Prisma
- **Icons**: Lucide React

## Database Schema

The platform includes three main entities:

- **Room**: Properties for rent (name, address, rent, bedrooms, bathrooms, amenities, etc.)
- **Tenant**: Renters occupying rooms
- **Payment**: Payment records for rent

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Neon Postgres database account (free tier available at [neon.tech](https://neon.tech))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd rental_management
```

2. Install dependencies:
```bash
npm install
```

3. Set up your database:

   a. Create a free Neon Postgres database at [neon.tech](https://neon.tech)

   b. Copy your database connection string

   c. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

   d. Edit `.env` and add your database URL:
   ```
   DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
   ```

4. Run database migrations:
```bash
npx prisma migrate dev --name init
```

5. Generate Prisma Client:
```bash
npx prisma generate
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Management

### View Database
```bash
npx prisma studio
```

### Create Migration
```bash
npx prisma migrate dev --name <migration-name>
```

### Reset Database
```bash
npx prisma migrate reset
```

## API Endpoints

### Rooms
- `GET /api/rooms` - Get all rooms (optional query: ?status=AVAILABLE)
- `POST /api/rooms` - Create a new room
- `GET /api/rooms/:id` - Get a specific room
- `PUT /api/rooms/:id` - Update a room
- `DELETE /api/rooms/:id` - Delete a room

### Tenants
- `GET /api/tenants` - Get all tenants (optional queries: ?status=ACTIVE, ?roomId=xxx)
- `POST /api/tenants` - Create a new tenant
- `GET /api/tenants/:id` - Get a specific tenant
- `PUT /api/tenants/:id` - Update a tenant
- `DELETE /api/tenants/:id` - Delete a tenant

### Payments
- `GET /api/payments` - Get all payments (optional queries: ?status=PAID, ?tenantId=xxx)
- `POST /api/payments` - Create a new payment
- `PUT /api/payments/:id` - Update a payment
- `DELETE /api/payments/:id` - Delete a payment

## Project Structure

```
rental_management/
├── app/
│   ├── api/              # API routes
│   │   ├── rooms/        # Room endpoints
│   │   ├── tenants/      # Tenant endpoints
│   │   └── payments/     # Payment endpoints
│   ├── globals.css       # Global styles with Supabase theme
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   ├── ui/               # shadcn/ui components
│   └── rooms/            # Room-specific components
├── lib/
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Utility functions
├── prisma/
│   └── schema.prisma     # Database schema
└── package.json
```

## Development

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Run Linter
```bash
npm run lint
```

## Customization

### Theme
The platform uses the Supabase theme from tweakcn.com. You can customize colors in `app/globals.css`.

### Add More Features
The codebase is structured to easily add:
- Tenant management pages
- Payment tracking and reminders
- Maintenance request system
- Document storage
- Analytics and reporting

## Environment Variables

```bash
DATABASE_URL="postgresql://..."  # Required: Neon Postgres connection string
```

## License

MIT

## Support

For issues and questions, please create an issue in the repository.
