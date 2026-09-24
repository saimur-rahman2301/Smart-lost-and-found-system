#include <crow.h>
#include "api/Middleware.hpp"

namespace findx::api {

void registerDebugRoutes(crow::App<crow::CORSHandler>& app) {
    CROW_ROUTE(app, "/api/v1/debug/engine-state").methods("GET"_method)([](const crow::request& req) {
        return crow::response(200, R"({"status":"ok", "state":{}})");
    });
}

} // namespace findx::api
