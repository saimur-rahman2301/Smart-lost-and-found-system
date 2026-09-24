#include <catch2/catch_all.hpp>
#include "engine/ClaimVerifier.hpp"

using namespace findx::engine;

TEST_CASE("ClaimVerifier verification rules", "[claimverifier]") {
    ClaimVerifier verifier;
    
    StoredItemDetails item{"scratched back", "L1", "Library", "2023-10-10", "Electronics", "black phone"};
    
    ClaimAnswers perfect{"scratched back", "Library", "2023-10-11", "Electronics", "black phone"};
    auto b1 = verifier.verify(perfect, item);
    REQUIRE(b1.hiddenDetail.awarded == 30);
    REQUIRE(b1.approximateLocation.awarded == 20);
    REQUIRE(b1.date.awarded == 15);
    REQUIRE(b1.category.awarded == 15);
    REQUIRE(b1.total >= 70);
    REQUIRE(b1.verdict == "LIKELY_LEGITIMATE");
    
    ClaimAnswers poor{"broken screen", "Gym", "2023-01-01", "Clothing", "red jacket"};
    auto b2 = verifier.verify(poor, item);
    REQUIRE(b2.total < 70);
    REQUIRE(b2.verdict == "INSUFFICIENT");
}
