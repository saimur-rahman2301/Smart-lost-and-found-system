#include "db/Database.hpp"
#include <iostream>

void seedDB() {
    auto& db = findx::db::Database::getInstance();
    // seed admin, users, buildings, items, claims here.
}

int main() {
    // connect to DB and run seed
    seedDB();
    return 0;
}
