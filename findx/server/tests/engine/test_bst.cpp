#include <catch2/catch_all.hpp>
#include "engine/BST.hpp"
#include <string>

using namespace findx::engine;

TEST_CASE("BST operations", "[bst]") {
    BST<std::string> bst;
    
    REQUIRE(bst.size() == 0);
    
    bst.insert(100, "item1");
    bst.insert(50, "item2");
    bst.insert(150, "item3");
    
    REQUIRE(bst.size() == 3);
    
    std::string val;
    REQUIRE(bst.find(100, val) == true);
    REQUIRE(val == "item1");
    
    REQUIRE(bst.find(999, val) == false);
    
    bst.remove(50);
    REQUIRE(bst.size() == 2);
    REQUIRE(bst.find(50, val) == false);
    
    bst.insert(25, "item4");
    bst.insert(75, "item5");
    
    auto range = bst.rangeQuery(70, 110);
    REQUIRE(range.size() == 2);
    
    auto ordered = bst.inorder();
    REQUIRE(ordered.size() == bst.size());
}
