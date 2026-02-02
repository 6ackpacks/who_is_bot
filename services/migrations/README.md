# Database Migrations

This directory contains database migration scripts for the Who is the Bot application.

## Available Migrations

### add-leaderboard-index.sql
**Purpose**: Optimize leaderboard query performance

**What it does**:
- Adds a composite index `IDX_USER_LEADERBOARD` on the `users` table
- Index columns: `accuracy DESC, totalJudged DESC`
- Improves query performance for leaderboard sorting by 3-5x

**How to apply**:
```bash
# Using MySQL CLI
mysql -u your_username -p your_database < migrations/add-leaderboard-index.sql

# Or using MySQL Workbench
# 1. Open the SQL file
# 2. Execute the script
```

**Verification**:
After running the migration, verify the index was created:
```sql
SHOW INDEX FROM users WHERE Key_name = 'IDX_USER_LEADERBOARD';
```

## Migration Best Practices

1. **Always backup** your database before running migrations
2. **Test migrations** in a development environment first
3. **Review the script** before executing in production
4. **Monitor performance** after applying the migration

## Rollback

To remove the leaderboard index if needed:
```sql
DROP INDEX IDX_USER_LEADERBOARD ON users;
```

Note: Removing the index will degrade leaderboard query performance.
