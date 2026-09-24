#pragma once
#include <crow.h>
#include "utils/JWT.hpp"

namespace findx::api {

findx::JWTPayload requireAuth(const crow::request& req);
findx::JWTPayload requireAdmin(const crow::request& req);

struct Pagination { int page; int limit; int offset; };
Pagination parsePagination(const crow::request& req, int defaultLimit = 20);

void addCorsHeaders(crow::response& res);

} // namespace findx::api
