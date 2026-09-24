#include <crow.h>
#include "api/Middleware.hpp"

namespace findx::api {

void registerAdminRoutes(crow::App<crow::CORSHandler>& app) {
    CROW_ROUTE(app, "/api/v1/admin/analytics").methods("GET"_method)([](const crow::request& req) {
        return crow::response(200, R"({"status":"ok"})");
    });
    CROW_ROUTE(app, "/api/v1/admin/queue").methods("GET"_method)([](const crow::request& req) {
        return crow::response(200, R"({"status":"ok"})");
    });
    CROW_ROUTE(app, "/api/v1/admin/users").methods("GET"_method)([](const crow::request& req) {
        return crow::response(200, R"({"status":"ok"})");
    });
    CROW_ROUTE(app, "/api/v1/admin/users/<string>").methods("PATCH"_method)([](const crow::request& req, std::string id) {
        return crow::response(200, R"({"status":"ok"})");
    });
    CROW_ROUTE(app, "/api/v1/admin/users/<string>").methods("DELETE"_method)([](const crow::request& req, std::string id) {
        return crow::response(200, R"({"status":"ok"})");
    });
    CROW_ROUTE(app, "/api/v1/admin/undo").methods("POST"_method)([](const crow::request& req) {
        return crow::response(200, R"({"status":"ok"})");
    });
    CROW_ROUTE(app, "/api/v1/admin/redo").methods("POST"_method)([](const crow::request& req) {
        return crow::response(200, R"({"status":"ok"})");
    });
}

} // namespace findx::api
