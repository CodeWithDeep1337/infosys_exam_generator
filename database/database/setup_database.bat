@echo off
REM ===============================
REM SkillForge Database Setup Script for Windows
REM ===============================

SETLOCAL EnableDelayedExpansion

REM Set variables
SET MYSQL_USER=root
SET MYSQL_HOST=localhost
SET DB_NAME=skillforge
SET SCRIPT_PATH=%~dp0skillforge_schema.sql

echo.
echo ======================================
echo   SkillForge Database Setup Script
echo ======================================
echo.

REM Check if MySQL is installed
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] MySQL is not installed or not in PATH
    echo Please install MySQL and add it to your system PATH
    pause
    exit /b 1
)

echo [INFO] MySQL found in system PATH

REM Prompt for password
set /p MYSQL_PASSWORD="Enter MySQL root password: "

REM Check if database file exists
if not exist "%SCRIPT_PATH%" (
    echo [ERROR] Database script not found: %SCRIPT_PATH%
    pause
    exit /b 1
)

echo [INFO] Running database setup script...
echo.

REM Execute the SQL script
mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% -h %MYSQL_HOST% < "%SCRIPT_PATH%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Database setup completed successfully!
    echo.
    echo Database: %DB_NAME%
    echo User: %MYSQL_USER%
    echo Host: %MYSQL_HOST%
    echo.
    echo Next steps:
    echo 1. Update the database password in backend/src/main/resources/application.properties
    echo 2. Run: cd backend
    echo 3. Run: mvn spring-boot:run
) else (
    echo.
    echo [ERROR] Database setup failed!
    echo Check your MySQL connection settings
)

echo.
pause
