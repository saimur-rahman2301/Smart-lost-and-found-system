#include <crow.h>
#include "api/Middleware.hpp"

namespace findx::api {

void registerItemRoutes(crow::App<crow::CORSHandler>& app) {
    CROW_ROUTE(app, "/api/v1/items").methods("GET"_method)([](const crow::request& req) {
        return crow::response(200, R"({"status":"ok"})");
    });
    CROW_ROUTE(app, "/api/v1/items/lost").methods("POST"_method)([](const crow::request& req) {
        return crow::response(200, R"({"status":"ok"})");
    });
    CROW_ROUTE(app, "/api/v1/items/found").methods("POST"_method)([](const crow::request& req) {
        return crow::response(200, R"({"status":"ok"})");
    });
    CROW_ROUTE(app, "/api/v1/items/<string>").methods("GET"_method)([](const crow::request& req, std::string id) {
        return crow::response(200, R"({"status":"ok"})");
    });
    CROW_ROUTE(app, "/api/v1/items/<string>").methods("PATCH"_method)([](const crow::request& req, std::string id) {
        return crow::response(200, R"({"status":"ok"})");
    });
    CROW_ROUTE(app, "/api/v1/items/<string>").methods("DELETE"_method)([](const crow::request& req, std::string id) {
        return crow::response(200, R"({"status":"ok"})");
    });
    CROW_ROUTE(app, "/api/v1/items/<string>/matches").methods("GET"_method)([](const crow::request& req, std::string id) {
        return crow::response(200, R"({"status":"ok"})");
    });
}

} // namespace findx::api
