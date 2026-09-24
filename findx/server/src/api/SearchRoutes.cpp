#include <crow.h>
#include "api/Middleware.hpp"

namespace findx::api {

void registerSearchRoutes(crow::App<crow::CORSHandler>& app) {
    CROW_ROUTE(app, "/api/v1/search/autocomplete").methods("GET"_method)([](const crow::request& req) {
        return crow::response(200, R"({"status":"ok"})");
    });
}

} // namespace findx::api
