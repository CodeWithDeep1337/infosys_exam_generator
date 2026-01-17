# SkillForge Database Setup Guide

## Database Integration Steps

### Prerequisites
- MySQL Server (version 5.7 or later)
- MySQL Client or any database management tool (MySQL Workbench, phpMyAdmin, DBeaver)

### Option 1: Using MySQL Command Line

1. **Open MySQL Command Prompt:**
   ```bash
   mysql -u root -p
   ```

2. **Run the SQL Script:**
   ```bash
   source skillforge_schema.sql
   ```
   Or if using Windows:
   ```bash
   mysql -u root -p < skillforge_schema.sql
   ```

3. **Verify Database Creation:**
   ```sql
   USE skillforge;
   SHOW TABLES;
   ```

### Option 2: Using MySQL Workbench

1. Open MySQL Workbench
2. Click on "File" → "Open SQL Script"
3. Select `skillforge_schema.sql`
4. Click the Execute button or press `Ctrl+Shift+Enter`
5. Verify the database and tables are created

### Option 3: Using phpMyAdmin

1. Open phpMyAdmin in your browser
2. Click on the "Import" tab
3. Choose the `skillforge_schema.sql` file
4. Click "Go" to execute

### Option 4: Using DBeaver

1. Connect to your MySQL database
2. Right-click on the database connection
3. Select "SQL Editor" → "New SQL Script"
4. Copy contents from `skillforge_schema.sql` and paste
5. Execute the script

## Database Configuration

### Update Backend Application Properties

Edit `backend/src/main/resources/application.properties`:

```properties
# Database Configuration (MySQL)
spring.datasource.url=jdbc:mysql://localhost:3306/skillforge?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata&createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

**Change `YOUR_PASSWORD` to your MySQL root password.**

### Alternative: Using Environment Variables

Set environment variables instead of hardcoding credentials:

```properties
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/skillforge}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:123456789}
```

Set environment variables before running:
```bash
set DB_URL=jdbc:mysql://localhost:3306/skillforge
set DB_USERNAME=root
set DB_PASSWORD=your_password
```

## Database Schema Overview

### Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts (Admin, Instructor, Student) |
| `courses` | Courses created by instructors |
| `subjects` | Subjects within courses |
| `topics` | Topics within subjects |
| `materials` | Learning materials (videos, PDFs, links) |
| `quizzes` | Quiz assessments |
| `questions` | Quiz questions |
| `options` | Multiple choice options for questions |
| `quiz_attempts` | User quiz attempt records |

### User Roles

- **ADMIN**: Full system access
- **INSTRUCTOR**: Can create courses, subjects, topics, materials, and quizzes
- **STUDENT**: Can view courses and attempt quizzes

## Troubleshooting

### Issue: "Access denied for user 'root'@'localhost'"
**Solution**: Verify your MySQL root password matches the one in application.properties

### Issue: "Unknown database 'skillforge'"
**Solution**: Run the SQL schema script first to create the database

### Issue: "Table doesn't exist"
**Solution**: Ensure `spring.jpa.hibernate.ddl-auto=update` is set in application.properties

### Issue: "Connection refused"
**Solution**: 
1. Check if MySQL service is running: `mysql --version`
2. Start MySQL service:
   - **Windows**: `net start MySQL80` (or your MySQL version)
   - **Linux**: `sudo service mysql start`
   - **macOS**: `brew services start mysql`

## Sample User Credentials

After running the schema, the following sample users are created:

| Username | Password | Role |
|----------|----------|------|
| admin | password | ADMIN |
| instructor1 | password | INSTRUCTOR |
| student1 | password | STUDENT |

**Note**: Update passwords in production using proper password hashing.

## Running the Application

1. **Build the Backend:**
   ```bash
   cd backend
   mvn clean install
   ```

2. **Run the Backend:**
   ```bash
   mvn spring-boot:run
   ```
   Or using Java:
   ```bash
   java -jar target/backend-*.jar
   ```

3. **Backend URL**: `http://localhost:8081/api`

## Backup and Restore

### Backup Database
```bash
mysqldump -u root -p skillforge > skillforge_backup.sql
```

### Restore Database
```bash
mysql -u root -p skillforge < skillforge_backup.sql
```

## Additional Resources

- [Spring Boot Database Documentation](https://spring.io/projects/spring-boot)
- [Hibernate JPA Documentation](https://hibernate.org/orm/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

---
**Last Updated**: January 2026
