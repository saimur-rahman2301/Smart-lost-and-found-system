#include <catch2/catch_all.hpp>
#include "engine/Queue.hpp"
#include <string>

using namespace findx::engine;

TEST_CASE("Queue operations", "[queue]") {
    Queue<std::string> q;
    
    REQUIRE(q.isEmpty() == true);
    
    q.enqueue("claim1");
    q.enqueue("claim2");
    q.enqueue("claim3");
    
    REQUIRE(q.size() == 3);
    REQUIRE(q.peek() == "claim1");
    
    REQUIRE(q.dequeue() == "claim1");
    REQUIRE(q.size() == 2);
    REQUIRE(q.dequeue() == "claim2");
    REQUIRE(q.dequeue() == "claim3");
    
    REQUIRE(q.isEmpty() == true);
}
