#pragma once
#include <string>

namespace findx {
    enum class LogLevel { DEBUG, INFO, WARN, ERROR };
    void log(LogLevel level, const std::string& message, const std::string& context = "");
}
