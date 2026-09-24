#include <catch2/catch_all.hpp>
#include "engine/MaxHeap.hpp"
#include <string>

using namespace findx::engine;

TEST_CASE("MaxHeap operations", "[maxheap]") {
    MaxHeap<std::string> heap;
    
    REQUIRE(heap.isEmpty() == true);
    
    heap.insert(10, "item1");
    heap.insert(30, "item2");
    heap.insert(20, "item3");
    
    REQUIRE(heap.size() == 3);
    REQUIRE(heap.peek() == "item2"); // score 30
    
    REQUIRE(heap.extractMax() == "item2");
    REQUIRE(heap.size() == 2);
    REQUIRE(heap.extractMax() == "item3");
    REQUIRE(heap.extractMax() == "item1");
    REQUIRE(heap.isEmpty() == true);
}
