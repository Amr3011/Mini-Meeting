# Create New Migration Script
# Usage: .\create-migration.ps1 "migration_name"
# Example: .\create-migration.ps1 "add_user_avatar"

param(
    [Parameter(Mandatory=$true)]
    [string]$MigrationName
)

# Get the current timestamp
$timestamp = Get-Date -Format "yyyyMMddHHmmss"

# Create the migration directory if it doesn't exist
$migrationsDir = "migrations"
if (-not (Test-Path $migrationsDir)) {
    New-Item -ItemType Directory -Path $migrationsDir | Out-Null
}

# Get the next migration number
$existingMigrations = Get-ChildItem -Path $migrationsDir -Filter "*.up.sql" | Sort-Object Name
if ($existingMigrations.Count -eq 0) {
    $nextNumber = 1
} else {
    $lastMigration = $existingMigrations[-1].Name
    $lastNumber = [int]($lastMigration.Substring(0, 6))
    $nextNumber = $lastNumber + 1
}

$migrationNumber = $nextNumber.ToString("000000")

# Format the migration name (replace spaces with underscores, lowercase)
$formattedName = $MigrationName.ToLower().Replace(" ", "_").Replace("-", "_")

# Create file names
$upFile = Join-Path $migrationsDir "${migrationNumber}_${formattedName}.up.sql"
$downFile = Join-Path $migrationsDir "${migrationNumber}_${formattedName}.down.sql"

# Create the up migration file
@"
-- Migration: $MigrationName
-- Created: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

-- Write your UP migration here
-- Example: ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255);

"@ | Out-File -FilePath $upFile -Encoding UTF8

# Create the down migration file
@"
-- Migration Rollback: $MigrationName
-- Created: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

-- Write your DOWN migration here (to undo the UP migration)
-- Example: ALTER TABLE users DROP COLUMN avatar_url;

"@ | Out-File -FilePath $downFile -Encoding UTF8

Write-Host "✅ Migration files created:" -ForegroundColor Green
Write-Host "   UP:   $upFile" -ForegroundColor Cyan
Write-Host "   DOWN: $downFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit the migration files with your SQL"
Write-Host "2. Run your backend to apply migrations automatically"
Write-Host "   Or manually: cd backend && go run cmd/server/main.go"
