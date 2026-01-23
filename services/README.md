# Who is the Bot - Backend API

NestJS backend for the "Who is the Bot" application.

## Features

- RESTful API for content management
- User profile and statistics
- AI model leaderboard
- PostgreSQL database with TypeORM
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

2. Set up environment variables in `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=who_is_the_bot
```

3. Start PostgreSQL database

4. Run the application:
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
- PostgreSQL database on port 5432
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
- PostgreSQL
- TypeScript
- Docker
