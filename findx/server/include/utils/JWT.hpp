#pragma once
#include <string>
#include <optional>
#include <cstdint>

namespace findx {
    struct JWTPayload {
        std::string userId;
        std::string email;
        std::string role; // "STUDENT" or "ADMIN"
        int64_t exp;
    };
    
    std::string signJWT(const JWTPayload& payload, const std::string& secret);
    std::optional<JWTPayload> verifyJWT(const std::string& token, const std::string& secret);
}
