#!/bin/bash
# ===============================
# SkillForge Database Setup Script for Linux/macOS
# ===============================

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Set variables
MYSQL_USER="root"
MYSQL_HOST="localhost"
DB_NAME="skillforge"
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/skillforge_schema.sql"

echo ""
echo "======================================"
echo "  SkillForge Database Setup Script"
echo "======================================"
echo ""

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}[ERROR] MySQL is not installed${NC}"
    echo "Please install MySQL using:"
    echo "  Ubuntu/Debian: sudo apt-get install mysql-server"
    echo "  macOS: brew install mysql"
    exit 1
fi

echo -e "${GREEN}[INFO] MySQL found in system${NC}"

# Check if database script exists
if [ ! -f "$SCRIPT_PATH" ]; then
    echo -e "${RED}[ERROR] Database script not found: $SCRIPT_PATH${NC}"
    exit 1
fi

# Prompt for password
echo -n "Enter MySQL root password: "
read -s MYSQL_PASSWORD
echo ""

echo -e "${YELLOW}[INFO] Running database setup script...${NC}"
echo ""

# Execute the SQL script
if mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -h "$MYSQL_HOST" < "$SCRIPT_PATH"; then
    echo ""
    echo -e "${GREEN}[SUCCESS] Database setup completed successfully!${NC}"
    echo ""
    echo "Database: $DB_NAME"
    echo "User: $MYSQL_USER"
    echo "Host: $MYSQL_HOST"
    echo ""
    echo "Next steps:"
    echo "1. Update the database password in backend/src/main/resources/application.properties"
    echo "2. Run: cd ../backend"
    echo "3. Run: mvn spring-boot:run"
else
    echo ""
    echo -e "${RED}[ERROR] Database setup failed!${NC}"
    echo "Check your MySQL connection settings"
    exit 1
fi

echo ""
