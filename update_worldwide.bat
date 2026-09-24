@echo off
title Smart Lost & Found - Deploy Worldwide
color 0B

echo ======================================================================
echo           SMART LOST & FOUND: "Find It. Match It. Return It."
echo           Worldwide GitHub Deployer & Auto-Sync
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/3] Staging all files and database items...
git add .

echo [2/3] Committing updates...
git commit -m "Worldwide live update from Smart Lost & Found system"

echo [3/3] Pushing to GitHub (origin main)...
git push origin main

echo.
if errorlevel 1 (
    color 0C
    echo [ERROR] Git push failed. Please check your internet connection and git credentials.
) else (
    color 0A
    echo ======================================================================
    echo  SUCCESS! Changes pushed to GitHub successfully.
    echo  GitHub Actions is deploying the live website worldwide (~60s).
    echo ======================================================================
)

echo.
pause
