# Database Migrations

## Why Migrations?

GORM's `AutoMigrate()` **cannot** drop or modify columns. This migration system fixes that.

---

## Create New Migration

```powershell
# Windows
.\create-migration.ps1 "your_migration_name"

# Linux/Mac
./create-migration.sh "your_migration_name"
```

This creates two files:

- `000002_your_migration_name.up.sql` - Apply changes
- `000002_your_migration_name.down.sql` - Undo changes

---

## Write Your SQL

Edit the generated files:

**UP** (apply):

```sql
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255);
```

**DOWN** (rollback):

```sql
ALTER TABLE users DROP COLUMN avatar_url;
```

---

## Apply Migrations

Just start your backend:

```bash
air
```

Migrations apply automatically on startup.

---

## Common Examples

### Add Column

```sql
ALTER TABLE users ADD COLUMN bio TEXT;
```

### Drop Column

```sql
ALTER TABLE meetings DROP COLUMN title;
```

### Modify Column

```sql
ALTER TABLE users ALTER COLUMN email TYPE VARCHAR(320);
```

### Add Index

```sql
CREATE INDEX idx_users_email ON users(email);
```

### Add Foreign Key

```sql
ALTER TABLE meetings
  ADD CONSTRAINT fk_meetings_creator
  FOREIGN KEY (creator_id) REFERENCES users(id)
  ON DELETE CASCADE;
```

---

## Best Practices

1. **Never edit applied migrations** - Create a new one instead
2. **One change per migration** - Keep them small
3. **Test both UP and DOWN** - Make sure rollback works
4. **Use transactions** - Wrap changes in `BEGIN;` and `COMMIT;`

---

## Check Migration Status

```sql
SELECT * FROM schema_migrations;
```

Shows which migrations have been applied.
