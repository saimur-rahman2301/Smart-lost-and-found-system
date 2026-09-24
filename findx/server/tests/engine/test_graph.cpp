#include <catch2/catch_all.hpp>
#include "engine/Graph.hpp"

using namespace findx::engine;

TEST_CASE("Graph functionality", "[graph]") {
    Graph g;
    g.addNode({"A", "Node A", "A", 0, 0});
    g.addNode({"B", "Node B", "B", 0, 0});
    g.addNode({"C", "Node C", "C", 0, 0});
    g.addNode({"D", "Node D", "D", 0, 0});
    
    g.addEdge("A", "B", 10.0);
    g.addEdge("B", "C", 20.0);
    g.addEdge("A", "C", 50.0);
    
    SECTION("BFS") {
        auto hops = g.bfs("A");
        REQUIRE(hops["A"] == 0);
        REQUIRE(hops["B"] == 1);
        REQUIRE(hops["C"] == 1);
        REQUIRE(hops.find("D") == hops.end());
    }
    
    SECTION("DFS") {
        auto order = g.dfs("A");
        REQUIRE(order.size() == 3);
        REQUIRE(order[0] == "A");
    }
    
    SECTION("Dijkstra and Shortest Path") {
        auto sp = g.shortestPath("A", "C");
        REQUIRE(sp.found == true);
        REQUIRE(sp.totalWeight == 30.0);
        REQUIRE(sp.path == std::vector<std::string>{"A", "B", "C"});
        
        auto sp2 = g.shortestPath("A", "A");
        REQUIRE(sp2.found == true);
        REQUIRE(sp2.totalWeight == 0.0);
        
        auto sp3 = g.shortestPath("A", "D");
        REQUIRE(sp3.found == false);
    }
}
