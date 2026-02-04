#!/bin/bash
# Create New Migration Script for Linux/Mac
# Usage: ./create-migration.sh "migration_name"
# Example: ./create-migration.sh "add_user_avatar"

if [ -z "$1" ]; then
    echo "❌ Error: Migration name is required"
    echo "Usage: ./create-migration.sh \"migration_name\""
    exit 1
fi

MIGRATION_NAME="$1"

# Create the migration directory if it doesn't exist
MIGRATIONS_DIR="migrations"
mkdir -p "$MIGRATIONS_DIR"

# Get the next migration number
LAST_MIGRATION=$(ls -1 "$MIGRATIONS_DIR"/*.up.sql 2>/dev/null | sort | tail -n 1)
if [ -z "$LAST_MIGRATION" ]; then
    NEXT_NUMBER=1
else
    LAST_NUMBER=$(basename "$LAST_MIGRATION" | cut -d'_' -f1)
    NEXT_NUMBER=$((10#$LAST_NUMBER + 1))
fi

MIGRATION_NUMBER=$(printf "%06d" $NEXT_NUMBER)

# Format the migration name (replace spaces with underscores, lowercase)
FORMATTED_NAME=$(echo "$MIGRATION_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '_' | tr '-' '_')

# Create file names
UP_FILE="$MIGRATIONS_DIR/${MIGRATION_NUMBER}_${FORMATTED_NAME}.up.sql"
DOWN_FILE="$MIGRATIONS_DIR/${MIGRATION_NUMBER}_${FORMATTED_NAME}.down.sql"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Create the up migration file
cat > "$UP_FILE" << EOF
-- Migration: $MIGRATION_NAME
-- Created: $TIMESTAMP

-- Write your UP migration here
-- Example: ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255);

EOF

# Create the down migration file
cat > "$DOWN_FILE" << EOF
-- Migration Rollback: $MIGRATION_NAME
-- Created: $TIMESTAMP

-- Write your DOWN migration here (to undo the UP migration)
-- Example: ALTER TABLE users DROP COLUMN avatar_url;

EOF

echo "✅ Migration files created:"
echo "   UP:   $UP_FILE"
echo "   DOWN: $DOWN_FILE"
echo ""
echo "Next steps:"
echo "1. Edit the migration files with your SQL"
echo "2. Run your backend to apply migrations automatically"
echo "   Or manually: cd backend && go run cmd/server/main.go"
