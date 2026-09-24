#include <catch2/catch_all.hpp>
#include "engine/Stack.hpp"
#include <string>

using namespace findx::engine;

TEST_CASE("Stack operations", "[stack]") {
    Stack<std::string> stack;
    
    REQUIRE(stack.isEmpty() == true);
    
    stack.push("action1");
    stack.push("action2");
    
    REQUIRE(stack.size() == 2);
    REQUIRE(stack.peek() == "action2");
    
    REQUIRE(stack.pop() == "action2");
    REQUIRE(stack.size() == 1);
    REQUIRE(stack.pop() == "action1");
    
    REQUIRE(stack.isEmpty() == true);
}
