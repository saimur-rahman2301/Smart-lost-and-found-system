#include "utils/Logger.hpp"
#include <iostream>
#include <chrono>

namespace findx {
    void log(LogLevel level, const std::string& message, const std::string& context) {
        std::string levelStr;
        switch(level) {
            case LogLevel::DEBUG: levelStr = "DEBUG"; break;
            case LogLevel::INFO:  levelStr = "INFO"; break;
            case LogLevel::WARN:  levelStr = "WARN"; break;
            case LogLevel::ERROR: levelStr = "ERROR"; break;
        }
        std::cout << "{\"level\":\"" << levelStr << "\",\"msg\":\"" << message 
                  << "\",\"ctx\":\"" << context << "\"}\n";
    }
}
