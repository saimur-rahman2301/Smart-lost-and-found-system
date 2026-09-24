#pragma once
#include <string>
#include <vector>
#include <map>
#include <nlohmann/json.hpp>

namespace findx::models {

struct User {
    std::string id, name, email, passwordHash, role;
    bool isVerified;
    std::string createdAt;
    nlohmann::json toJson() const;
    static User fromRow(const std::map<std::string,std::string>& row);
};

struct Item {
    std::string id, reporterId, type, category, brand, color;
    std::string locationNodeId, locationName;
    std::string date, description, hiddenDetail, photoUrl, status;
    std::string createdAt, updatedAt;
    nlohmann::json toJson(bool includeHidden = false) const;
    static Item fromRow(const std::map<std::string,std::string>& row);
};

struct Claim {
    std::string id, itemId, claimantId, status, adminNote;
    double verificationScore;
    std::string verificationBreakdown;
    std::string createdAt, updatedAt;
    nlohmann::json toJson() const;
    static Claim fromRow(const std::map<std::string,std::string>& row);
};

struct Building {
    std::string id, name, shortCode;
    double latitude, longitude;
    nlohmann::json toJson() const;
    static Building fromRow(const std::map<std::string,std::string>& row);
};

struct ApiResponse {
    static nlohmann::json ok(const nlohmann::json& data, const std::string& msg = "Success");
    static nlohmann::json error(const std::string& msg, const std::string& code, int status = 400);
    static nlohmann::json paginated(const nlohmann::json& data, int page, int limit, int total);
};

} // namespace findx::models
