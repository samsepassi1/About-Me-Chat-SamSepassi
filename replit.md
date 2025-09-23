# Overview

This is a professional portfolio website for Sam Sepassi, a cybersecurity professional and AI interaction engineer. The application serves as an interactive resume platform featuring an AI-powered chatbot that can answer questions about Sam's background, experience, and qualifications. The site includes contact functionality and is designed to showcase Sam's expertise in cybersecurity and AI.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: React Query (TanStack Query) for server state management and API caching
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with CSS custom properties for theming

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for chat functionality and contact submissions
- **Development Setup**: Hot reload with Vite middleware integration for development
- **Error Handling**: Centralized error middleware with structured error responses

## Database & Storage
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Storage Strategy**: In-memory storage implementation with interface for future database integration

## AI Integration
- **AI Provider**: OpenAI GPT models for conversational AI
- **Functionality**: Custom AI service that processes chat messages and handles tool calls
- **Tool System**: Function calling for recording user contact details and unknown questions
- **Context Management**: Maintains conversation history and Sam's professional context

## Data Models
- **Users**: Basic user authentication structure (prepared but not fully implemented)
- **Chat Messages**: Session-based conversation storage with sender identification
- **Contact Submissions**: Lead capture with name, email, message, and notification tracking
- **Unknown Questions**: Analytics for questions the AI couldn't answer

## Security & Configuration
- **Environment Variables**: Secure configuration for database URLs and API keys
- **Session Management**: UUID-based session tracking for chat conversations
- **CORS**: Configured for cross-origin requests in development

## Development Tools
- **Build System**: Vite for fast development and optimized production builds
- **Type Safety**: Full TypeScript coverage with strict configuration
- **Code Quality**: ESLint integration through Vite plugins
- **Development Experience**: Replit-specific plugins for enhanced development workflow

# External Dependencies

## Core Infrastructure
- **Database**: Neon Database (PostgreSQL provider) via `@neondatabase/serverless`
- **AI Services**: OpenAI API for chat functionality and natural language processing

## UI and Styling
- **Component Library**: Radix UI primitives for accessible, unstyled components
- **Styling Framework**: Tailwind CSS for utility-first styling approach
- **Icons**: Font Awesome for iconography (via CDN)
- **Fonts**: Google Fonts (Inter, Architects Daughter, DM Sans, Fira Code, Geist Mono)

## Development and Build Tools
- **Build Tool**: Vite with React plugin for fast development and optimized builds
- **Replit Integration**: Custom Vite plugins for error overlay, cartographer, and dev banner
- **PostCSS**: Autoprefixer for CSS vendor prefixing

## Planned Integrations
- **Email Service**: SendGrid for transactional emails (dependency included but not implemented)
- **Push Notifications**: References to Pushover API for real-time notifications (not yet integrated)
- **Session Storage**: PostgreSQL session store via `connect-pg-simple` (configured but using in-memory storage)

## Notable Technical Decisions
- **Database Abstraction**: IStorage interface allows switching between in-memory and database storage
- **Type Safety**: Zod schemas for runtime validation and type generation from database schema
- **API Design**: Clean separation between API layer and business logic through service classes
- **Component Architecture**: Atomic design principles with reusable UI components