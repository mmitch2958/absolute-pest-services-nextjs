# Pest Control Service Website

## Overview

This is a full-stack web application for a pest control service company built with React on the frontend and Express.js on the backend. The application features a modern, responsive design with a contact form system and service showcase. The project uses PostgreSQL for data storage, Drizzle ORM for database operations, and ShadCN UI components for a polished user interface.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Framework**: ShadCN UI components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom color scheme and CSS variables
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod schemas shared between frontend and backend
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: Hot reload with Vite integration

### Data Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Migrations**: Drizzle Kit for schema management
- **Shared Schema**: Common TypeScript types between client and server

## Key Components

### Database Schema
- **Users Table**: Basic user management (id, username, password)
- **Contact Submissions Table**: Stores customer inquiries with contact details and service requests
- **Shared Types**: TypeScript interfaces generated from Drizzle schema

### API Endpoints
- `POST /api/contact` - Submit contact form with validation
- `GET /api/contact` - Retrieve all contact submissions (admin endpoint)

### Frontend Components
- **HeroSlider**: Rotating background images with smooth transitions
- **ContactForm**: Comprehensive form with service type selection and validation
- **Service Cards**: Showcase of pest control services with custom styling
- **Responsive Design**: Mobile-first approach with breakpoint-specific layouts

### Storage Implementation
- **Interface-based Design**: `IStorage` interface for flexible data access
- **Database Storage**: PostgreSQL with Drizzle ORM for data persistence
- **Production Ready**: Configured for PostgreSQL with connection pooling

## Data Flow

1. **User Interaction**: Users interact with the React frontend
2. **Form Submission**: Contact forms are validated client-side with Zod
3. **API Communication**: TanStack Query handles HTTP requests to Express backend
4. **Server Processing**: Express routes validate data and interact with database
5. **Database Operations**: Drizzle ORM performs type-safe database operations
6. **Response Handling**: Success/error states are managed with toast notifications

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **zod**: Schema validation and type safety

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the entire stack
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production

### UI and Styling
- **ShadCN UI**: Pre-built component library
- **Lucide React**: Icon library
- **Class Variance Authority**: Component variant management
- **Tailwind Merge**: Utility class merging

## Deployment Strategy

### Development
- **Hot Reload**: Vite development server with Express integration
- **Environment Variables**: DATABASE_URL for PostgreSQL connection
- **Script Commands**: `npm run dev` for development mode

### Production Build
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: ESBuild bundles Express server to `dist/index.js`
- **Database**: Drizzle migrations applied with `npm run db:push`
- **Deployment**: Single command `npm start` runs production server

### Configuration
- **Database**: PostgreSQL connection via environment variable
- **Static Files**: Express serves built React app in production
- **Error Handling**: Comprehensive error boundaries and API error responses

## Changelog

Changelog:
- July 07, 2025. Initial setup
- July 07, 2025. Added comprehensive inspection scheduling system with modal form, date/time selection, and backend integration
- July 07, 2025. Implemented complete customer portal with authentication system including user registration, login, and session management using express-session and bcrypt for password hashing
- July 07, 2025. Built customer dashboard with service request management, inspection tracking, payment history, and profile management features
- July 07, 2025. Added service request creation system allowing authenticated users to submit detailed pest control requests with priority levels and status tracking
- July 07, 2025. Created dedicated service pages for all professional services including Wildlife Control (with humane non-kill extraction methods), Bed Bug Treatment, Termite Treatment, and Bat Removal with detailed information, processes, and call-to-action sections
- July 08, 2025. Implemented comprehensive email notification system using SendGrid for all forms (contact, inspection scheduling, and service requests) sending to info@absolutepestservices.com
- July 08, 2025. Updated company logo to show "A P S" in circular design with full "Absolute Pest Services" text on the right, made logo clickable to return to homepage across all pages

## User Preferences

Preferred communication style: Simple, everyday language.