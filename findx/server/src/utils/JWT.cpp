#include "utils/JWT.hpp"

namespace findx {
    std::string signJWT(const JWTPayload& payload, const std::string& secret) {
        // Stub implementation
        return "header.payload.signature";
    }
    
    std::optional<JWTPayload> verifyJWT(const std::string& token, const std::string& secret) {
        // Stub implementation
        JWTPayload p;
        p.userId = "1";
        p.email = "test@test.com";
        p.role = "ADMIN";
        p.exp = 9999999999;
        return p;
    }
}
