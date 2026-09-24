#include <crow.h>
#include "api/Middleware.hpp"

namespace findx::api {

void registerClaimRoutes(crow::App<crow::CORSHandler>& app) {
    CROW_ROUTE(app, "/api/v1/claims").methods("POST"_method)([](const crow::request& req) {
        return crow::response(200, R"({"status":"ok"})");
    });
    CROW_ROUTE(app, "/api/v1/claims/me").methods("GET"_method)([](const crow::request& req) {
        return crow::response(200, R"({"status":"ok"})");
    });
    CROW_ROUTE(app, "/api/v1/claims/<string>").methods("GET"_method)([](const crow::request& req, std::string id) {
        return crow::response(200, R"({"status":"ok"})");
    });
    CROW_ROUTE(app, "/api/v1/claims/<string>/verify").methods("POST"_method)([](const crow::request& req, std::string id) {
        return crow::response(200, R"({"status":"ok"})");
    });
    CROW_ROUTE(app, "/api/v1/claims/<string>/status").methods("PATCH"_method)([](const crow::request& req, std::string id) {
        return crow::response(200, R"({"status":"ok"})");
    });
}

} // namespace findx::api
