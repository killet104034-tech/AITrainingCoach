# Overview

This is a modern full-stack web application called "Sinabro Strength" that generates personalized training programs using AI. The application uses a survey-based approach where users fill out a questionnaire about their fitness goals, experience level, and available equipment, then receive a customized workout program via email. The architecture follows a monorepo pattern with shared packages and a clean separation between frontend and backend concerns.

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
- **Middleware**: Custom operational guard middleware for idempotency, rate limiting, and audit logging
- **Email Service**: Nodemailer with Gmail SMTP integration
- **AI Integration**: OpenAI API for training program generation

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
- **Email Service**: Gmail SMTP for sending training programs
- **AI Service**: OpenAI GPT-5 for generating personalized workout programs
- **Google Services**: Google Sheets API and Google Drive API for creating downloadable workout spreadsheets
- **Authentication**: Google Service Account for API access
- **Fonts**: Google Fonts (Inter, Font Awesome icons)
- **Package Management**: npm with workspace support for monorepo structure
- **Development Tools**: Replit-specific plugins for development environment
- **UI Framework**: Radix UI primitives with shadcn/ui styling system
- **Build Tools**: Vite for frontend bundling, esbuild for backend compilation
- **Type Safety**: TypeScript throughout with Zod for runtime validation
- **Code Quality**: ESLint configuration and TypeScript strict mode