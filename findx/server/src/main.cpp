#include <crow.h>
#include <crow/middlewares/cors.h>
#include "utils/Config.hpp"
#include "db/Database.hpp"
#include <cstdlib>

namespace findx {
    void initEngineFromDB() {
        // Init data structures here
    }
}

namespace findx::api {
    extern void registerAuthRoutes(crow::App<crow::CORSHandler>& app);
    extern void registerItemRoutes(crow::App<crow::CORSHandler>& app);
    extern void registerClaimRoutes(crow::App<crow::CORSHandler>& app);
    extern void registerAdminRoutes(crow::App<crow::CORSHandler>& app);
    extern void registerSearchRoutes(crow::App<crow::CORSHandler>& app);
    extern void registerGraphRoutes(crow::App<crow::CORSHandler>& app);
    extern void registerDebugRoutes(crow::App<crow::CORSHandler>& app);
    extern void registerNotificationRoutes(crow::App<crow::CORSHandler>& app);
}

int main() {
    try {
        findx::gConfig = findx::Config::load();
    } catch(const std::exception& e) {
        return 1;
    }
    
    auto& db = findx::db::Database::getInstance();
    if (!db.connect(findx::gConfig.dbHost, findx::gConfig.dbPort, findx::gConfig.dbName,
                    findx::gConfig.dbUser, findx::gConfig.dbPassword)) {
        return 1;
    }
    
    findx::initEngineFromDB();
    
    crow::App<crow::CORSHandler> app;
    
    auto& cors = app.get_middleware<crow::CORSHandler>();
    cors.global().headers("Content-Type", "Authorization")
        .methods("GET"_method, "POST"_method, "PATCH"_method, "DELETE"_method, "OPTIONS"_method);
    
    CROW_ROUTE(app, "/api/v1/health").methods("GET"_method)([](){ 
        return crow::response{200, R"({"status":"ok"})"};
    });
    
    CROW_ROUTE(app, "/")([](){ 
        return crow::response{crow::mustache::load("static/index.html").render()}; 
    });
    
    findx::api::registerAuthRoutes(app);
    findx::api::registerItemRoutes(app);
    findx::api::registerClaimRoutes(app);
    findx::api::registerAdminRoutes(app);
    findx::api::registerSearchRoutes(app);
    findx::api::registerGraphRoutes(app);
    findx::api::registerDebugRoutes(app);
    findx::api::registerNotificationRoutes(app);
    
    app.port(findx::gConfig.port).multithreaded().run();
    
    return 0;
}
