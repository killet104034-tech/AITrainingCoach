# Universal Rule Engine Application

This is a modern full-stack web application built around a universal rule engine architecture. The application uses a survey-based approach where users fill out questionnaires with domain-neutral fields, then receive customized responses based on configurable rules. The architecture follows a monorepo pattern with shared packages and a clean separation between frontend and backend concerns.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library
- **UI Components**: Comprehensive set of Radix UI primitives wrapped with custom styling

## Backend Architecture
- **Server Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful APIs with both v1 and v2 endpoints
- **Rule Engine**: Universal rule evaluation system with configurable conditions and actions
- **Middleware**: Custom operational guard middleware for idempotency, rate limiting, and audit logging
- **Email Service**: Nodemailer with Gmail SMTP integration
- **AI Integration**: OpenAI API for content generation

## Rule Engine Components
- **Schemas**: Define rule structure, conditions, and actions
- **Evaluator**: Process rules against input data and execute actions
- **Sources**: Manage data sources and field mappings
- **API Routes**: `/api/evaluate` endpoint for rule processing

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle migrations with PostgreSQL dialect
- **Storage Adapters**: Pluggable storage system supporting PostgreSQL, memory, and Upstash Redis
- **Session Management**: PostgreSQL-based session storage with connect-pg-simple

## Authentication and Authorization
- **User Management**: Basic username/password authentication system
- **Session Storage**: Database-backed sessions
- **Operational Security**: Idempotency keys, rate limiting, and audit logging for API protection

## External Dependencies

- **Database**: Neon PostgreSQL serverless database
- **Email Service**: Gmail SMTP for sending responses
- **AI Service**: OpenAI GPT-5 for generating personalized content
- **Google Services**: Google Sheets API and Google Drive API for creating downloadable reports
- **Authentication**: Google Service Account for API access
- **Fonts**: Google Fonts (Inter, Font Awesome icons)
- **Package Management**: npm with workspace support for monorepo structure
- **Development Tools**: Replit-specific plugins for development environment
- **UI Framework**: Radix UI primitives with shadcn/ui styling system
- **Build Tools**: Vite for frontend bundling, esbuild for backend compilation
- **Type Safety**: TypeScript throughout with Zod for runtime validation
- **Code Quality**: ESLint configuration and TypeScript strict mode