#include <crow.h>
#include "api/Middleware.hpp"

namespace findx::api {

void registerAuthRoutes(crow::App<crow::CORSHandler>& app) {
    CROW_ROUTE(app, "/api/v1/auth/register").methods("POST"_method)([](const crow::request& req) {
        return crow::response(200, R"({"status":"ok"})");
    });
    CROW_ROUTE(app, "/api/v1/auth/login").methods("POST"_method)([](const crow::request& req) {
        return crow::response(200, R"({"status":"ok"})");
    });
    CROW_ROUTE(app, "/api/v1/auth/refresh").methods("POST"_method)([](const crow::request& req) {
        return crow::response(200, R"({"status":"ok"})");
    });
    CROW_ROUTE(app, "/api/v1/auth/logout").methods("POST"_method)([](const crow::request& req) {
        return crow::response(200, R"({"status":"ok"})");
    });
    CROW_ROUTE(app, "/api/v1/auth/me").methods("GET"_method)([](const crow::request& req) {
        return crow::response(200, R"({"status":"ok"})");
    });
}

} // namespace findx::api
