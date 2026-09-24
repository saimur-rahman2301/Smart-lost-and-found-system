#include <catch2/catch_all.hpp>
#include "engine/SortAlgorithms.hpp"
#include <string>

using namespace findx::engine;

TEST_CASE("Sorting algorithms", "[sort]") {
    std::vector<int> data = {5, 2, 9, 1, 5, 6};
    auto less_int = [](const int& a, const int& b) { return a < b; };
    
    std::vector<int> expected = {1, 2, 5, 5, 6, 9};
    
    REQUIRE(insertionSort(data, less_int) == expected);
    REQUIRE(mergeSort(data, less_int) == expected);
    REQUIRE(quickSort(data, less_int) == expected);
    REQUIRE(hybridSort(data, less_int) == expected);
    
    std::vector<int> empty;
    REQUIRE(hybridSort(empty, less_int).empty());
    
    std::vector<int> single = {1};
    REQUIRE(hybridSort(single, less_int) == std::vector<int>{1});
    
    std::vector<std::string> str_data = {"banana", "apple", "cherry"};
    auto less_str = [](const std::string& a, const std::string& b) { return a < b; };
    std::vector<std::string> expected_str = {"apple", "banana", "cherry"};
    REQUIRE(hybridSort(str_data, less_str) == expected_str);
}
