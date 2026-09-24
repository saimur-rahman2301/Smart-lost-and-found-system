#include "utils/Bcrypt.hpp"

namespace findx {
    std::string hashPassword(const std::string& password) {
        // Stub implementation
        return password + "_hashed";
    }
    bool verifyPassword(const std::string& password, const std::string& hash) {
        // Stub implementation
        return hash == password + "_hashed";
    }
}
