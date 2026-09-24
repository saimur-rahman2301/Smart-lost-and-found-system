#include <catch2/catch_all.hpp>
#include "engine/HashTable.hpp"
#include <string>

using namespace findx::engine;

TEST_CASE("HashTable operations", "[hashtable]") {
    HashTable<std::string, std::string> ht;
    
    REQUIRE(ht.size() == 0);
    
    std::string val;
    REQUIRE(ht.get("key1", val) == false);
    
    ht.set("key1", "value1");
    REQUIRE(ht.size() == 1);
    REQUIRE(ht.get("key1", val) == true);
    REQUIRE(val == "value1");
    
    ht.set("key1", "value2");
    REQUIRE(ht.get("key1", val) == true);
    REQUIRE(val == "value2");
    
    ht.set("key2", "value3");
    REQUIRE(ht.size() == 2);
    
    ht.remove("key1");
    REQUIRE(ht.size() == 1);
    REQUIRE(ht.get("key1", val) == false);
    
    auto entries = ht.entries();
    REQUIRE(entries.size() == 1);
}
