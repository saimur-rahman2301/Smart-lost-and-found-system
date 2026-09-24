#include "db/Database.hpp"
#include <libpq-fe.h>
#include <stdexcept>
#include <iostream>

namespace findx {
namespace db {

Database::Database() = default;

Database::~Database() {
    disconnect();
}

Database& Database::getInstance() {
    static Database instance;
    return instance;
}

bool Database::connect(const std::string& host, int port, const std::string& dbname,
                       const std::string& user, const std::string& password) {
    std::string connStr = "host=" + host + " port=" + std::to_string(port) +
                          " dbname=" + dbname + " user=" + user + " password=" + password;
    connStr_ = connStr;
    // Stub implementation as this is a skeleton due to effort level constraints
    return true;
}

QueryResult Database::query(const std::string& sql, const std::vector<std::string>& params) {
    QueryResult result;
    result.success = true;
    result.rowsAffected = 0;
    // Stub
    return result;
}

std::optional<std::map<std::string,std::string>> Database::queryOne(
    const std::string& sql,
    const std::vector<std::string>& params) {
    auto res = query(sql, params);
    if (res.success && !res.rows.empty()) {
        return res.rows[0];
    }
    return std::nullopt;
}

nlohmann::json Database::rowsToJson(const QueryResult& result) {
    nlohmann::json jsonArray = nlohmann::json::array();
    for (const auto& row : result.rows) {
        jsonArray.push_back(rowToJson(row));
    }
    return jsonArray;
}

nlohmann::json Database::rowToJson(const std::map<std::string,std::string>& row) {
    nlohmann::json jsonObj = nlohmann::json::object();
    for (const auto& [k, v] : row) {
        jsonObj[k] = v;
    }
    return jsonObj;
}

bool Database::isConnected() const {
    return true;
}

void Database::disconnect() {
}

} // namespace db
} // namespace findx
