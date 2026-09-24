#include <catch2/catch_all.hpp>
#include "engine/LinkedList.hpp"

using namespace findx::engine;

TEST_CASE("DoublyLinkedList basic operations", "[linkedlist]") {
    DoublyLinkedList<int> list;
    
    REQUIRE(list.empty());
    REQUIRE(list.size() == 0);
    
    list.append(10);
    list.append(20);
    list.prepend(5);
    
    REQUIRE(list.size() == 3);
    
    auto fwd = list.traverseForward();
    REQUIRE(fwd == std::vector<int>{5, 10, 20});
    
    auto bwd = list.traverseBackward();
    REQUIRE(bwd == std::vector<int>{20, 10, 5});
    
    auto node = list.find([](const int& v) { return v == 10; });
    REQUIRE(node != nullptr);
    REQUIRE(node->value == 10);
    
    list.remove(node);
    REQUIRE(list.size() == 2);
    fwd = list.traverseForward();
    REQUIRE(fwd == std::vector<int>{5, 20});
    
    list.remove(list.getHead());
    list.remove(list.getTail());
    REQUIRE(list.empty());
}
