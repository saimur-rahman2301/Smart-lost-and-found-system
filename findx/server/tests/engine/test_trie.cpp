#include <catch2/catch_all.hpp>
#include "engine/Trie.hpp"

using namespace findx::engine;

TEST_CASE("Trie operations", "[trie]") {
    Trie trie;
    
    trie.insert("apple", "item1");
    trie.insert("app", "item2");
    trie.insert("banana", "item3");
    
    REQUIRE(trie.search("apple") == true);
    REQUIRE(trie.search("app") == true);
    REQUIRE(trie.search("ban") == false);
    REQUIRE(trie.startsWith("ban") == true);
    
    auto words = trie.getAllWordsWithPrefix("app", 10);
    REQUIRE(words.size() == 2);
    
    trie.insertText("black iphone 12", "item4");
    REQUIRE(trie.search("iphone") == true);
    REQUIRE(trie.search("black") == true);
    
    trie.removeItemId("item4");
    // Depending on implementation, words might still be there or removed
}
