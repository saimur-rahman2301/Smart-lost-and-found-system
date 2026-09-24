@echo off
title Smart Lost & Found - C++ DSA Server
color 0A

echo ======================================================================
echo           SMART LOST & FOUND: "Find It. Match It. Return It."
echo           University DSA Lab Project
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking C++ Executable...
if not exist "smart_lost_found_server.exe" (
    echo Compiling smart_lost_found_server.exe with g++...
    g++ -std=c++17 -I"smart_lost_found/backend/include" "smart_lost_found/backend/src/main.cpp" -o "smart_lost_found_server.exe" -lws2_32
    if errorlevel 1 (
        echo [ERROR] Compilation failed. Please ensure g++ is installed.
        pause
        exit /b 1
    )
    echo Compilation successful!
)

echo [2/3] Launching web browser to http://localhost:8080 ...
start http://localhost:8080

echo [3/3] Starting C++ DSA Engine & Web Server on port 8080...
echo.
smart_lost_found_server.exe

pause
