# Acmedix Admin Panel

A standalone React application for managing Acmedix Pharma website content, including blog posts and career positions.

## Features

- **Admin Authentication**: Secure login system for authorized personnel
- **Blog Management**: Create, edit, and delete blog posts
- **Career Management**: Manage career positions and view job applications
- **Application Tracking**: View and manage job applications with resume downloads
- **Dashboard Analytics**: Overview of applications and content statistics

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite 5.x
- **Styling**: Tailwind CSS with shadcn-ui components
- **Routing**: React Router DOM v6
- **State Management**: TanStack Query for server state
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- Supabase account and project setup

### Installation

1. Clone or copy this admin panel project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Development

Start the development server:
```bash
npm run dev
```

The admin panel will be available at `http://localhost:3002`

### Building for Production

```bash
npm run build
```

## Admin Routes

- `/admin/login` - Admin login page
- `/admin/dashboard` - Main dashboard with application overview
- `/admin/blog` - Blog post management
- `/admin/blog/create` - Create new blog post
- `/admin/blog/edit/:id` - Edit existing blog post
- `/admin/career` - Career position management
- `/admin/career/create` - Create new career position
- `/admin/career/edit/:id` - Edit existing career position

## Admin Features

### Dashboard
- View all job applications
- Filter by status and search applicants
- Download and view resumes
- Update application status

### Blog Management
- Create and edit blog posts with rich text editor
- Upload and manage featured images
- SEO optimization fields (meta description, keywords)
- Publish/draft status management

### Career Management
- Create and manage job positions
- View and manage job applications
- Resume viewing and downloading
- Application status tracking

## Database Schema

The admin panel uses the following Supabase tables:
- `admin_users` - Admin authentication
- `blogs` - Blog posts
- `career_positions` - Job positions
- `career_applications` - Job applications

## Security Features

- JWT-based authentication
- Admin session verification
- Role-based access control
- Secure file uploads for resumes and images

## Default Admin Credentials

For initial setup, create an admin user in your Supabase `admin_users` table with:
- Username: `admin`
- Password: (hash using bcrypt)
- Role: `admin`

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Development build
npm run build:dev

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Environment Variables

Required environment variables:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Port Configuration

The admin panel runs on port 3001 by default (or 3002 if 3001 is busy) to avoid conflicts with the main website.

## Notes

- This is a completely separate application from the main Acmedix website
- All admin functionality is self-contained
- Uses the same Supabase database as the main website
- Mobile-responsive design for admin tasks on-the-go
