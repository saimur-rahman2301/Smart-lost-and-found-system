#include "api/Middleware.hpp"
#include "utils/Config.hpp"
#include <stdexcept>

namespace findx::api {

findx::JWTPayload requireAuth(const crow::request& req) {
    auto authHeader = req.get_header_value("Authorization");
    if (authHeader.empty() || authHeader.substr(0, 7) != "Bearer ") {
        throw std::runtime_error("Unauthorized");
    }
    std::string token = authHeader.substr(7);
    auto payload = findx::verifyJWT(token, findx::gConfig.jwtAccessSecret);
    if (!payload) {
        throw std::runtime_error("Invalid token");
    }
    return *payload;
}

findx::JWTPayload requireAdmin(const crow::request& req) {
    auto payload = requireAuth(req);
    if (payload.role != "ADMIN") {
        throw std::runtime_error("Forbidden");
    }
    return payload;
}

Pagination parsePagination(const crow::request& req, int defaultLimit) {
    Pagination p;
    char* pageStr = req.url_params.get("page");
    char* limitStr = req.url_params.get("limit");
    p.page = pageStr ? std::stoi(pageStr) : 1;
    p.limit = limitStr ? std::stoi(limitStr) : defaultLimit;
    p.offset = (p.page - 1) * p.limit;
    return p;
}

void addCorsHeaders(crow::response& res) {
    res.add_header("Access-Control-Allow-Origin", "*");
    res.add_header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    res.add_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

} // namespace findx::api
