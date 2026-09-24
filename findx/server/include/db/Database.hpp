#pragma once
#include <string>
#include <nlohmann/json.hpp>

namespace findx {
namespace db {

struct QueryResult {
    std::vector<std::map<std::string, std::string>> rows;
    bool success;
    std::string error;
    int rowsAffected;
};

class Database {
public:
    Database();
    ~Database();
    
    bool connect(const std::string& host, int port, const std::string& dbname,
                 const std::string& user, const std::string& password);
    
    QueryResult query(const std::string& sql, const std::vector<std::string>& params = {});
    
    std::optional<std::map<std::string,std::string>> queryOne(
        const std::string& sql,
        const std::vector<std::string>& params = {});
        
    static nlohmann::json rowsToJson(const QueryResult& result);
    static nlohmann::json rowToJson(const std::map<std::string,std::string>& row);
    
    bool isConnected() const;
    void disconnect();
    
    static Database& getInstance();
};

} // namespace db
} // namespace findx
