#include "utils/Config.hpp"
#include <stdexcept>

namespace findx {

Config gConfig;

static std::string getEnvVar(const std::string& key, const std::string& defaultVal = "") {
    const char* val = std::getenv(key.c_str());
    if (!val) {
        if (!defaultVal.empty()) {
            return defaultVal;
        }
        throw std::runtime_error("Environment variable missing: " + key);
    }
    return std::string(val);
}

static int getEnvVarInt(const std::string& key, int defaultVal = 0) {
    const char* val = std::getenv(key.c_str());
    if (!val) {
        return defaultVal;
    }
    return std::stoi(val);
}

Config Config::load() {
    Config cfg;
    cfg.dbHost = getEnvVar("DB_HOST", "localhost");
    cfg.dbPort = getEnvVarInt("DB_PORT", 5432);
    cfg.dbName = getEnvVar("DB_NAME", "findx");
    cfg.dbUser = getEnvVar("DB_USER", "postgres");
    cfg.dbPassword = getEnvVar("DB_PASSWORD", "postgres");
    cfg.jwtAccessSecret = getEnvVar("JWT_ACCESS_SECRET", "access_secret_dev");
    cfg.jwtRefreshSecret = getEnvVar("JWT_REFRESH_SECRET", "refresh_secret_dev");
    cfg.jwtAccessExpires = getEnvVarInt("JWT_ACCESS_EXPIRES", 3600);
    cfg.jwtRefreshExpires = getEnvVarInt("JWT_REFRESH_EXPIRES", 86400 * 7);
    cfg.port = getEnvVarInt("PORT", 8080);
    cfg.uploadDir = getEnvVar("UPLOAD_DIR", "./uploads");
    cfg.maxFileSizeMB = getEnvVarInt("MAX_FILE_SIZE_MB", 5);
    cfg.nodeEnv = getEnvVar("NODE_ENV", "development");
    return cfg;
}

} // namespace findx
