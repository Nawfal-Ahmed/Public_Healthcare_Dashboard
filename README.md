# Health-Hub-Dashboard

A comprehensive healthcare management dashboard featuring user self-reporting, vaccination tracking, health metrics, and a community blog system with admin moderation.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js, TypeScript, Node.js
- **Database**: MongoDB with Mongoose ODM
- **API**: OpenAPI/Swagger specification with Orval code generation
- **Auth**: Session-based authentication with secure cookies
- **Package Manager**: pnpm (monorepo with workspace)

## Project Structure

```
Health-Hub-Dashboard/
├── artifacts/
│   ├── api-server/              # Express backend
│   │   ├── src/
│   │   │   ├── models/          # Mongoose schemas
│   │   │   ├── routes/          # API endpoints
│   │   │   ├── middlewares/     # Auth & session
│   │   │   └── lib/             # Logger, DB config
│   │   └── package.json
│   └── healthcare-dashboard/    # React frontend
│       ├── src/
│       │   ├── pages/           # Route pages
│       │   ├── components/      # UI components
│       │   └── lib/             # API client, auth
│       └── package.json
├── lib/
│   ├── api-spec/                # OpenAPI specification
│   ├── api-client-react/        # Generated API hooks
│   ├── api-zod/                 # Zod validation schemas
│   └── db/                      # Database configuration
└── scripts/                     # Utility scripts
```

## Getting Started

### Prerequisites

- Node.js 16+ 
- MongoDB running on `mongodb://127.0.0.1:27017`
- pnpm (`npm install -g pnpm`)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Running the Application

**Start Backend (Port 3000):**
```bash
cd artifacts/api-server
$env:PORT = "3000"
$env:MONGODB_URI = "mongodb://127.0.0.1:27017"
$env:NODE_ENV = "development"
pnpm run build
pnpm run start
```

**Start Frontend (Port 5176):**
```bash
cd artifacts/healthcare-dashboard
$env:PORT = "5176"
pnpm run dev
```

Access the application at `http://localhost:5176`

## Features

### User Features
- **Dashboard**: View health metrics and personal health data
- **Vaccinations**: Track vaccination records
- **Self-Report**: Create health status reports
- **Community Blog**: Read and comment on community health posts
- **Metrics**: View personal health analytics

### Admin Features
- **User Management**: Manage user accounts and roles
- **Blog Moderation**: Approve, edit, and delete community posts
- **Report Tracking**: Monitor user health reports
- **System Metrics**: View system-wide health data

## API Documentation

API endpoints are documented in [lib/api-spec/openapi.yaml](lib/api-spec/openapi.yaml)

Key endpoints:
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/blogs` - List blog posts
- `POST /api/blogs` - Create blog post
- `POST /api/blogs/:id/like` - Like a blog post
- `POST /api/blogs/:id/comments` - Add comment to blog

## Development

Build all packages:
```bash
pnpm run build
```

Run type checking:
```bash
pnpm run typecheck
```

## Testing

Test credentials are available in `artifacts/api-server/test_login.cjs`

## License

Private project
