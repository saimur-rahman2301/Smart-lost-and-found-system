#include <catch2/catch_all.hpp>
#include "engine/MatchEngine.hpp"
#include "engine/Graph.hpp"

using namespace findx::engine;

TEST_CASE("MatchEngine scoring formula", "[matchengine]") {
    Graph g;
    g.addNode({"L1", "", "", 0, 0});
    MatchEngine engine(g);
    
    ItemForMatching lost{"1", "LOST", "Electronics", "Apple", "L1", "2023-10-10", "Black iPhone"};
    ItemForMatching found1{"2", "FOUND", "Electronics", "Apple", "L1", "2023-10-10", "Black iPhone"};
    ItemForMatching found2{"3", "FOUND", "Clothing", "Nike", "L1", "2023-11-10", "Red jacket"};
    
    auto b1 = engine.computeScore(lost, found1);
    REQUIRE(b1.total > 99.0); // Perfect match -> 100
    
    auto b2 = engine.computeScore(lost, found2);
    REQUIRE(b2.total < 30.0); // Poor match
    
    std::vector<ItemForMatching> f_items = {found2, found1};
    auto top = engine.findTopMatches(lost, f_items, 2);
    REQUIRE(top.size() == 2);
    REQUIRE(top[0].foundItemId == "2"); // found1 is better match
}
