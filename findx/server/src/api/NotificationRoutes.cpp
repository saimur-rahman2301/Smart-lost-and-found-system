#include <crow.h>
#include "api/Middleware.hpp"

namespace findx::api {

void registerNotificationRoutes(crow::App<crow::CORSHandler>& app) {
    CROW_ROUTE(app, "/api/v1/notifications").methods("GET"_method)([](const crow::request& req) {
        return crow::response(200, R"({"status":"ok"})");
    });
    CROW_ROUTE(app, "/api/v1/notifications/<string>/read").methods("PATCH"_method)([](const crow::request& req, std::string id) {
        return crow::response(200, R"({"status":"ok"})");
    });
    CROW_ROUTE(app, "/api/v1/notifications/read-all").methods("PATCH"_method)([](const crow::request& req) {
        return crow::response(200, R"({"status":"ok"})");
    });
}

} // namespace findx::api
