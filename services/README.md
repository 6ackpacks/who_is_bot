# Who is the Bot - Backend API

NestJS backend for the "Who is the Bot" application.

## Features

- RESTful API for content management
- User profile and statistics
- AI model leaderboard
- MySQL database with TypeORM
- Docker support

## API Endpoints

### Content
- `GET /content` - Get all content
- `GET /content/feed?limit=10` - Get feed with limit
- `GET /content/:id` - Get content by ID
- `POST /content` - Create new content

### User
- `GET /user` - Get all users
- `GET /user/:id` - Get user by ID
- `GET /user/uid/:uid` - Get user by UID
- `POST /user` - Create new user
- `PATCH /user/:id/stats` - Update user statistics

### Leaderboard
- `GET /leaderboard` - Get all leaderboard entries
- `GET /leaderboard?type=image` - Filter by type (text/image/video)
- `POST /leaderboard` - Create leaderboard entry

## Setup

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Then edit `.env` with your configuration:
```
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_password_here
DB_NAME=who_is_bot

# JWT Configuration
JWT_SECRET=your_jwt_secret_here_change_in_production
JWT_EXPIRES_IN=7d

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Application Configuration
NODE_ENV=development
PORT=80
```

**Important Security Notes:**
- Never commit `.env` files to version control
- Change `JWT_SECRET` to a strong, random value in production
- Use strong database passwords
- Configure `ALLOWED_ORIGINS` with your actual frontend domain(s)

3. Create the database:
```sql
CREATE DATABASE who_is_bot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. Start MySQL database

5. Run the application:
```bash
npm run start:dev
```

The API will be available at `http://localhost:80`

### Docker Deployment

1. Build and run with Docker Compose (from project root):
```bash
docker-compose up -d
```

This will start:
- MySQL database on port 3306
- NestJS backend on port 80

2. Stop the services:
```bash
docker-compose down
```

## Project Structure

```
services/
├── src/
│   ├── content/          # Content module (posts, comments)
│   ├── user/             # User module
│   ├── leaderboard/      # Leaderboard module
│   ├── app.module.ts     # Main application module
│   └── main.ts           # Application entry point
├── Dockerfile            # Docker configuration
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript configuration
```

## Technologies

- NestJS 10
- TypeORM
- MySQL 8.0
- TypeScript
- Docker
- JWT Authentication
- Class Validator for input validation

## Security Features

- JWT-based authentication and authorization
- CORS whitelist configuration
- Input validation with class-validator
- SQL injection prevention with TypeORM
- Resource ownership verification (IDOR protection)
- Global exception handling
- Secure password handling

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Change `JWT_SECRET` to a strong, random value (use a password generator)
3. Configure `ALLOWED_ORIGINS` with your production domain(s)
4. Use a secure database password
5. Enable HTTPS
6. Set `synchronize: false` in TypeORM configuration (already configured)
7. Implement rate limiting for public endpoints
8. Monitor logs for suspicious activity
9. Keep dependencies up to date
