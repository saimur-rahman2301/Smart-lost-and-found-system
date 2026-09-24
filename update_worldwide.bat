@echo off
title Smart Lost & Found - Worldwide Deployment Tool
color 0b
echo ================================================================
echo      Smart Lost and Found System - Worldwide Deployment Tool
echo ================================================================
echo.
echo [1/3] Staging changes...
git add .
echo.
echo [2/3] Committing changes...
git commit -m "Worldwide live database update via desktop tool"
echo.
echo [3/3] Pushing to GitHub (origin main)...
git push origin main
echo.
if %ERRORLEVEL% equ 0 (
    color 0a
    echo ================================================================
    echo  SUCCESS! Changes pushed to GitHub successfully.
    echo  GitHub Actions will deploy the live website worldwide in ~60s!
    echo ================================================================
) else (
    color 0c
    echo ================================================================
    echo  Deployment finished or encountered an issue. Please review above.
    echo ================================================================
)
echo.
pause
