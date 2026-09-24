#include <catch2/catch_all.hpp>
#include "engine/StringMatching.hpp"

using namespace findx::engine;

TEST_CASE("String matching", "[stringmatching]") {
    REQUIRE(levenshtein("kitten", "sitting") == 3);
    REQUIRE(levenshtein("", "") == 0);
    REQUIRE(levenshtein("a", "") == 1);
    
    auto kmp_res = kmpSearch("ababcababaad", "ababa");
    REQUIRE(kmp_res.size() == 1);
    REQUIRE(kmp_res[0] == 5);
    
    auto rk_res = rabinKarp("hello world", "world");
    REQUIRE(rk_res.size() == 1);
    REQUIRE(rk_res[0] == 6);
    
    std::vector<std::string> a = {"hello", "world"};
    std::vector<std::string> b = {"world", "test"};
    REQUIRE(jaccardSimilarity(a, b) == Catch::Approx(0.3333333).margin(1e-5));
    
    REQUIRE(brandSimilarity("Apple", "apple") == 1.0);
    REQUIRE(brandSimilarity("Apple", "Appl") == 0.7);
    REQUIRE(brandSimilarity("Apple", "Microsoft") == 0.0);
    
    double desc_sim = descriptionSimilarity("black iphone 12", "black iphone 12 pro");
    REQUIRE(desc_sim > 0.0);
    REQUIRE(desc_sim <= 1.0);
}
