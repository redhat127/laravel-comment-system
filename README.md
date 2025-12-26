# Laravel Comment System

A modern comment system built with Laravel 12, Inertia.js, and React 19. This application provides a complete commenting platform with user authentication, real-time interactions, and a clean, responsive interface.

## Features

- **User Authentication**: Secure login system with email-based authentication and verification codes (login emails are logged to `storage/logs/laravel.log`)
- **Comment Management**: Create, read, update, and delete comments with nested replies
- **Like System**: Like/unlike comments with real-time counts
- **User Profiles**: Manage account details and profile information
- **Responsive Design**: Mobile-first design with Tailwind CSS v4
- **Real-time Updates**: React Query for efficient data fetching and caching
- **Type Safety**: Full TypeScript support on frontend with proper type definitions

## Tech Stack

### Backend

- **Laravel 12**: Modern PHP framework
- **PostgreSQL**: Robust database system
- **Laravel Telescope**: Debug assistant for development
- **Laravel Pint**: Code style formatter
- **Pest PHP**: Testing framework

### Frontend

- **React 19**: Modern JavaScript library with concurrent features
- **Inertia.js 2**: SPA-like experience without building an API
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS v4**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **React Query**: Data fetching and state management
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation

### Development Tools

- **Vite**: Fast build tool and dev server
- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **Laravel Wayfinder**: Type-safe route generation

## Installation

### Prerequisites

- PHP 8.2+
- Node.js 18+
- PostgreSQL
- Composer
- Bun (recommended for frontend package management)

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd laravel-comment-system
   ```

2. **Install dependencies**

   ```bash
   composer install
   bun install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Configure database**
   - Set up your PostgreSQL database
   - Update `.env` with your database credentials
   - Set queue connection to sync: `QUEUE_CONNECTION=sync`
5. **Run migrations**

   ```bash
   php artisan migrate
   ```

6. **Seed the database**

   ```bash
   php artisan db:seed
   ```

   This will populate your database with:
   - Sample users for testing authentication
   - Example comments with nested replies
   - Sample likes to demonstrate the like system

7. **Build frontend assets**
   ```bash
   bun run build
   ```

## Development

### Starting Development Server

Run these commands in separate terminals:

```bash
php artisan serve
bun run dev
php artisan queue:listen
```

This starts:

- Laravel development server
- Vite development server
- Queue worker

## License

This project is open-sourced software licensed under the MIT license.
