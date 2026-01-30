package database

import (
	"fmt"
	"log"

	"mini-meeting/internal/config"
	"mini-meeting/internal/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect(cfg *config.DatabaseConfig) error {
	dsn := cfg.DSN()

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})

	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Database connection established")
	return nil
}

func Migrate() error {
	log.Println("Running database migrations...")

	err := DB.AutoMigrate(
		&models.User{},
	)

	if err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	log.Println("Database migrations completed")
	return nil
}

func GetDB() *gorm.DB {
	return DB
}

func SeedAdmin(cfg *config.Config) error {
	log.Println("Checking for admin user...")

	// Check if admin already exists
	var adminCount int64
	DB.Model(&models.User{}).Where("role = ?", "admin").Count(&adminCount)

	if adminCount > 0 {
		log.Println("Admin user already exists")
		return nil
	}

	// Hash the admin password from config
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(cfg.Admin.Password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash admin password: %w", err)
	}

	// Create default admin user
	admin := models.User{
		Email:         cfg.Admin.Email,
		Password:      string(hashedPassword),
		Name:          "Administrator",
		Role:          "admin",
		EmailVerified: true,
	}

	if err := DB.Create(&admin).Error; err != nil {
		return fmt.Errorf("failed to create admin user: %w", err)
	}

	log.Println("Admin user created successfully")
	log.Printf("Email: %s", cfg.Admin.Email)

	return nil
}
