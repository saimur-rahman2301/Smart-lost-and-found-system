#include <crow.h>
#include "api/Middleware.hpp"

namespace findx::api {

void registerGraphRoutes(crow::App<crow::CORSHandler>& app) {
    CROW_ROUTE(app, "/api/v1/graph/buildings").methods("GET"_method)([](const crow::request& req) {
        return crow::response(200, R"({"status":"ok"})");
    });
    CROW_ROUTE(app, "/api/v1/graph/buildings").methods("POST"_method)([](const crow::request& req) {
        return crow::response(200, R"({"status":"ok"})");
    });
    CROW_ROUTE(app, "/api/v1/graph/buildings/<string>").methods("DELETE"_method)([](const crow::request& req, std::string id) {
        return crow::response(200, R"({"status":"ok"})");
    });
    CROW_ROUTE(app, "/api/v1/graph/edges").methods("POST"_method)([](const crow::request& req) {
        return crow::response(200, R"({"status":"ok"})");
    });
    CROW_ROUTE(app, "/api/v1/graph/shortest-path").methods("GET"_method)([](const crow::request& req) {
        return crow::response(200, R"({"status":"ok"})");
    });
}

} // namespace findx::api
