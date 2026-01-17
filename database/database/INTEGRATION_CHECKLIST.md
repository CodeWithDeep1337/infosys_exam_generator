# Database Integration Checklist

## Pre-Setup Verification
- [ ] MySQL Server is installed
- [ ] MySQL Server is running
- [ ] MySQL Client tools are available
- [ ] You know your MySQL root password

## Database Setup
- [ ] Located the `database` folder in the project
- [ ] Reviewed `DATABASE_SETUP.md` for detailed instructions
- [ ] Chose your setup method:
  - [ ] Windows: Ran `setup_database.bat`
  - [ ] Linux/macOS: Ran `setup_database.sh`
  - [ ] Manual: Executed `skillforge_schema.sql` via MySQL client
- [ ] Verified database creation: `SHOW DATABASES;` shows `skillforge`
- [ ] Verified tables: `USE skillforge; SHOW TABLES;` shows all 9 tables

## Backend Configuration
- [ ] Updated `backend/src/main/resources/application.properties`
  - [ ] Verified `spring.datasource.password` matches your MySQL password
  - [ ] Verified `spring.datasource.url` is correct for your setup
- [ ] (Optional) Created and configured `.env` file for environment variables
- [ ] Verified no hardcoded credentials in version control

## Testing Database Connection
- [ ] Built the backend: `mvn clean install`
- [ ] Started the backend: `mvn spring-boot:run`
- [ ] Checked for database connection errors in console output
- [ ] Verified API is accessible: `http://localhost:8081/api`

## Sample Data Verification
After successful setup, verify sample data:

```sql
USE skillforge;
SELECT * FROM users;          -- Should show 3 sample users
SELECT * FROM courses;        -- Should show 1 sample course
SELECT * FROM subjects;       -- Should show 1 sample subject
SELECT * FROM topics;         -- Should show 1 sample topic
```

## Frontend Integration (Optional)
- [ ] Frontend is configured to use: `http://localhost:8081/api`
- [ ] Frontend can login with sample user credentials
- [ ] Frontend can view courses and materials

## Troubleshooting Notes
_Add any issues encountered and solutions here_

```
Issue: _______________
Solution: _______________

Issue: _______________
Solution: _______________
```

## Database Files Reference

| File | Purpose |
|------|---------|
| `skillforge_schema.sql` | Complete database schema with tables and sample data |
| `DATABASE_SETUP.md` | Comprehensive setup and troubleshooting guide |
| `README.md` | Quick start guide |
| `setup_database.bat` | Automated setup script for Windows |
| `setup_database.sh` | Automated setup script for Linux/macOS |

## Next Steps

1. ✅ Database is set up and running
2. ✅ Backend application connects to database
3. 🔄 Run and test the application
4. 🔄 Set up frontend (if not done)
5. 🔄 Deploy to production (configure for production database)

## Important Notes

⚠️ **Development vs Production**
- These scripts are for **development** use only
- For production, use:
  - Environment variables for all credentials
  - Database backups and recovery procedures
  - Proper user permissions and roles
  - SSL/TLS for database connections
  - Regular security audits

⚠️ **Sample Data**
- Default password for sample users: `password`
- Change passwords in production
- Remove sample data before deploying

---
**Last Updated**: January 2026
**Project**: SkillForge
**Database**: MySQL 5.7+
