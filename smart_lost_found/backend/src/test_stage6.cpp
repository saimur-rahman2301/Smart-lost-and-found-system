#include "../include/StringMatcher.h"
#include <iostream>
#include <cassert>

int main()
{
    std::cout << "========================================\n";
    std::cout << " STAGE 6 VERIFICATION: String Matcher\n";
    std::cout << "========================================\n\n";

    // 1. Test case from prompt specifications
    std::string lostText = "Black Casio FX-991ES scientific calculator";
    std::string foundText = "Casio black calculator FX-991ES";

    std::cout << "[Test 1] Comparing strings from specification:\n";
    std::cout << "  Lost:  \"" << lostText << "\"\n";
    std::cout << "  Found: \"" << foundText << "\"\n";

    std::vector<std::string> tokensA = StringMatcher::tokenize(lostText);
    std::vector<std::string> tokensB = StringMatcher::tokenize(foundText);

    std::cout << "\n  Tokens in Lost:  ";
    for (const auto &t : tokensA)
        std::cout << "[" << t << "] ";
    std::cout << "\n  Tokens in Found: ";
    for (const auto &t : tokensB)
        std::cout << "[" << t << "] ";
    std::cout << "\n";

    int matchingCount = StringMatcher::countMatchingTokens(lostText, foundText);
    double overlapRatio = StringMatcher::calculateTokenOverlap(lostText, foundText);

    std::cout << "\n  Matching Keywords Count: " << matchingCount << "\n";
    std::cout << "  Token Overlap Ratio:     " << (overlapRatio * 100.0) << "%\n";
    assert(matchingCount >= 4);  // "black", "casio", "fx991es", "calculator"
    assert(overlapRatio > 0.80); // Over 80% overlap!

    // 2. Stopword elimination test
    std::string phraseWithStopwords = "The quick brown fox is in the room with a bag";
    std::vector<std::string> filtered = StringMatcher::tokenize(phraseWithStopwords);
    std::cout << "\n[Test 2] Testing Stopword Removal:\n  Input:  \"" << phraseWithStopwords << "\"\n  Tokens: ";
    for (const auto &t : filtered)
        std::cout << "[" << t << "] ";
    std::cout << "\n";
    assert(std::find(filtered.begin(), filtered.end(), "the") == filtered.end());
    assert(std::find(filtered.begin(), filtered.end(), "with") == filtered.end());

    // 3. Substring check
    assert(StringMatcher::containsKeyword("Engineering Block A, Room 102", "Block A"));
    assert(StringMatcher::containsKeyword("Dell Pro 15.6 Backpack", "dell"));
    assert(!StringMatcher::containsKeyword("Dell Pro 15.6 Backpack", "MacBook"));
    std::cout << "\n[Test 3] Substring keyword matching verified!\n";

    std::cout << "\n========================================\n";
    std::cout << " ALL STAGE 6 TESTS PASSED PERFECTLY!\n";
    std::cout << "========================================\n";

    return 0;
}
