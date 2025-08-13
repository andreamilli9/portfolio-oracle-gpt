# Financial Stock Portfolio Tracker

## Overview

A modern financial dashboard application for tracking stock portfolios with real-time market data, AI-powered recommendations, and forecasting capabilities. The application provides a comprehensive view of personal investments with currency conversion (USD to EUR), stock recommendations, and advanced analytics features for informed investment decisions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type-safe development
- **Styling**: Tailwind CSS with custom financial dashboard design system featuring dark theme and modern fintech aesthetics
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and data fetching
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Development Server**: Hot module replacement and runtime error overlay via Vite integration
- **Storage Interface**: Abstracted storage layer with in-memory implementation (MemStorage) for development

### Database Architecture
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless driver for scalable cloud deployment
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Connection pooling via Neon serverless pool

### Authentication & Session Management
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **User Schema**: Basic user model with username/password authentication structure

### API Integration & External Services
- **Stock Data**: Alpha Vantage API for real-time stock prices and market data
- **News Integration**: NewsAPI for financial news sentiment analysis
- **AI Services**: Hugging Face API for sentiment analysis and investment insights
- **Currency Conversion**: ExchangeRate-API for USD to EUR conversion with caching
- **Error Handling**: Comprehensive error handling with user-friendly error messages

### Key Features Architecture
- **Portfolio Management**: Real-time portfolio value calculation and performance tracking
- **Stock Search**: Company name and symbol search with autocomplete functionality
- **Price Forecasting**: AI-powered price predictions with confidence intervals
- **Investment Recommendations**: Filtered stock recommendations based on user preferences
- **Multi-Currency Support**: Automatic USD to EUR conversion with cached exchange rates
- **Responsive Design**: Mobile-first design with adaptive layouts

### Development Tooling
- **Package Management**: npm with lockfile for dependency consistency
- **Code Quality**: TypeScript strict mode for enhanced type safety
- **CSS Processing**: PostCSS with Tailwind CSS and Autoprefixer
- **Development Environment**: Replit-optimized with cartographer plugin for enhanced debugging

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: Serverless PostgreSQL driver for cloud database connections
- **drizzle-orm & drizzle-kit**: Type-safe ORM and migration toolkit
- **express**: Web application framework for Node.js backend
- **react & react-dom**: Core React library for UI development
- **@tanstack/react-query**: Data fetching and caching library

### UI & Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for creating variant-based component APIs
- **lucide-react**: Modern icon library

### Form Handling & Validation
- **react-hook-form**: Performant forms library
- **@hookform/resolvers**: Validation resolvers for form handling
- **zod**: Schema validation library

### Utilities & Helpers
- **date-fns**: Modern date utility library
- **clsx & tailwind-merge**: CSS class utilities
- **nanoid**: Secure URL-friendly unique ID generator

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production builds

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Enhanced error reporting
- **@replit/vite-plugin-cartographer**: Development debugging tools