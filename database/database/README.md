# SkillForge Backend Database Configuration Guide

## Quick Start

### For Windows Users:
1. Open Command Prompt as Administrator
2. Navigate to the `database` folder:
   ```bash
   cd database
   ```
3. Run the setup script:
   ```bash
   setup_database.bat
   ```
4. Enter your MySQL root password when prompted

### For Linux/macOS Users:
1. Open Terminal
2. Navigate to the `database` folder:
   ```bash
   cd database
   ```
3. Make the script executable:
   ```bash
   chmod +x setup_database.sh
   ```
4. Run the setup script:
   ```bash
   ./setup_database.sh
   ```
5. Enter your MySQL root password when prompted

## Manual Setup (All Platforms)

1. **Open MySQL Command Line:**
   ```bash
   mysql -u root -p
   ```
   Enter your password when prompted.

2. **Execute the SQL Script:**
   ```bash
   source skillforge_schema.sql;
   ```
   Or from Windows Command Prompt:
   ```bash
   mysql -u root -p < skillforge_schema.sql
   ```

3. **Verify Database Creation:**
   ```sql
   USE skillforge;
   SHOW TABLES;
   ```

## Update Application Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
# Update the password to match your MySQL password
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

## Environment Variables (Optional)

Instead of hardcoding credentials, you can use environment variables:

1. Create a `.env` file in the project root (copy from `.env.example`)
2. Update the values with your actual credentials
3. The application will read these automatically

## Database Connection Settings

Default configuration:
- **Host**: localhost
- **Port**: 3306
- **Database**: skillforge
- **Username**: root
- **Password**: [Enter during setup]

## What Gets Created?

The schema creates:
- ✅ `skillforge` database
- ✅ 9 tables with proper relationships
- ✅ Indexes for performance optimization
- ✅ Sample users and data
- ✅ Foreign key constraints

## Running the Application After Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Or:
```bash
mvn clean install
java -jar target/backend-*.jar
```

## Troubleshooting

**Issue**: "Access denied for user 'root'@'localhost'"
- Check if you entered the correct MySQL password
- Verify MySQL is running: `mysql -u root -p`

**Issue**: "Unknown database 'skillforge'"
- Ensure the SQL script ran successfully
- Check MySQL user permissions
- Run: `mysql -u root -p < skillforge_schema.sql` manually

**Issue**: MySQL not found
- Install MySQL Server from: https://dev.mysql.com/downloads/mysql/
- Add MySQL bin folder to system PATH

## Support

For more details, see:
- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Comprehensive setup guide
- [skillforge_schema.sql](skillforge_schema.sql) - SQL schema file

---
**Backend API**: http://localhost:8081/api
**Database**: MySQL running on localhost:3306
