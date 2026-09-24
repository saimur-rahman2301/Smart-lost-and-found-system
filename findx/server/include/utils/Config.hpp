#pragma once
#include <string>
#include <stdexcept>
#include <cstdlib>

namespace findx {

struct Config {
    std::string dbHost;
    int         dbPort;
    std::string dbName;
    std::string dbUser;
    std::string dbPassword;
    std::string jwtAccessSecret;
    std::string jwtRefreshSecret;
    int         jwtAccessExpires;
    int         jwtRefreshExpires;
    int         port;
    std::string uploadDir;
    int         maxFileSizeMB;
    std::string nodeEnv;
    
    static Config load();
};

extern Config gConfig;

} // namespace findx
