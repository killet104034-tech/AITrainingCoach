# AI Powerlifting Training Program Generator

## Overview

This is a Korean-language AI-powered powerlifting training program generator that creates personalized workout routines based on user surveys. The application collects detailed fitness information through a multi-step survey and uses OpenAI's API to generate customized powerlifting programs that are automatically delivered via email. The system focuses on the three main powerlifting movements: squat, bench press, and deadlift, while considering user experience levels, available equipment, injury history, and training goals.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives for accessible, customizable interface components
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and data fetching
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation
- **Component Structure**: Modular component architecture with reusable UI components in `/client/src/components/ui/`

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with a single survey submission endpoint (`POST /api/survey`)
- **Middleware**: Custom logging middleware for API request tracking and error handling
- **Development Setup**: Vite integration for hot module replacement in development mode

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for database migrations and schema management
- **Fallback Storage**: In-memory storage implementation for development/testing environments
- **Connection**: Neon Database serverless PostgreSQL for production deployment

### Authentication and Authorization
- **Current State**: No authentication system implemented - the application is designed as a public survey tool
- **Session Management**: Basic session infrastructure present but not actively used
- **Security**: Input validation through Zod schemas and request sanitization

### External Service Integrations
- **AI Service**: OpenAI GPT-5 API for generating personalized training programs based on survey responses
- **Email Service**: Nodemailer with SMTP configuration for automated program delivery
- **Hosting**: Designed for Replit deployment with specific Replit integration plugins

### Data Flow and Processing
1. **Survey Collection**: Multi-step form collects user fitness data, experience level, equipment access, and goals
2. **Data Validation**: Zod schemas ensure type safety and data integrity throughout the application
3. **AI Processing**: Survey data is transformed into structured prompts for OpenAI API to generate Korean-language training programs
4. **Email Delivery**: Generated programs are formatted as HTML emails and sent via Nodemailer
5. **Storage**: Survey responses and generated programs are persisted in PostgreSQL for potential future analytics

### Internationalization
- **Language**: Entire application is Korean-language focused, including UI text, AI prompts, and generated content
- **Content**: Specialized for Korean powerlifting community with culturally appropriate terminology and formatting

## External Dependencies

### Core Runtime Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database driver for Neon Database
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **drizzle-zod**: Integration between Drizzle schemas and Zod validation
- **express**: Web application framework for Node.js
- **openai**: Official OpenAI API client for AI-powered program generation
- **nodemailer**: Email sending library for automated program delivery

### Frontend Dependencies
- **react**: Core React library for component-based UI
- **@tanstack/react-query**: Server state management and data fetching
- **react-hook-form**: Form state management and validation
- **@hookform/resolvers**: Validation resolvers for React Hook Form
- **zod**: Runtime type validation and schema definition
- **wouter**: Lightweight routing library for React

### UI and Styling Dependencies
- **@radix-ui/***: Comprehensive set of accessible UI primitives (accordion, dialog, dropdown-menu, etc.)
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe utility for managing component variants
- **clsx**: Utility for conditional CSS class names
- **lucide-react**: Icon library for consistent iconography

### Development and Build Dependencies
- **vite**: Fast build tool and development server
- **typescript**: Static type checking for JavaScript
- **tsx**: TypeScript execution environment for Node.js
- **esbuild**: Fast JavaScript/TypeScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Replit-specific development error handling
- **@replit/vite-plugin-cartographer**: Replit integration for code mapping

### Email and Utilities
- **date-fns**: Modern JavaScript date utility library
- **nanoid**: URL-safe unique ID generator
- **connect-pg-simple**: PostgreSQL session store for Express sessions (infrastructure ready)