#include "../include/Item.h"
#include "../include/DataManager.h"
#include "../include/MatchEngine.h"
#include <iostream>
#include <cassert>

int main()
{
    std::cout << "========================================\n";
    std::cout << " STAGE 8 VERIFICATION: Match Engine\n";
    std::cout << "========================================\n\n";

    std::vector<Item> items = DataManager::getInitialSampleData();

    // 1. Find matches for LOST_1 (Casio FX-991ES Calculator)
    Item lost1 = items[0];
    std::cout << "[Test 1] Matching Lost Item: '" << lost1.name << "'\n";
    std::cout << "         Category: " << lost1.category << " | Brand: " << lost1.brand
              << " | Location: " << lost1.location << "\n\n";

    std::vector<MatchCandidate> matches1 = MatchEngine::findMatches(lost1, items);

    std::cout << "========================================\n";
    std::cout << "          POSSIBLE MATCHES FOUND        \n";
    std::cout << "========================================\n";

    assert(!matches1.empty());
    for (size_t i = 0; i < matches1.size(); ++i)
    {
        const auto &m = matches1[i];
        std::cout << "#" << (i + 1) << "  Match Score: " << m.score << "% [" << m.categoryLabel << "]\n";
        std::cout << "    Found Item: " << m.item.name << " (ID: " << m.item.id << ")\n";
        std::cout << "    Brand: " << m.item.brand << " | Color: " << m.item.color
                  << " | Location: " << m.item.location << " | Date: " << m.item.date << "\n";
        std::cout << "    Audit Breakdown:\n";
        for (const auto &reason : m.breakdown)
        {
            std::cout << "      * " << reason << "\n";
        }
        std::cout << "----------------------------------------\n";
    }

    // Top match must be FOUND_1 with very strong score >= 90%
    assert(matches1[0].item.id == "FOUND_1");
    assert(matches1[0].score >= 90);
    assert(matches1[0].categoryLabel == "Very Strong Match");
    std::cout << "         -> Strictly verified: FOUND_1 ranked #1 with "
              << matches1[0].score << "%!\n";

    // 2. Test LOST_2 (Student ID card)
    Item lost2 = items[1];
    std::cout << "\n[Test 2] Matching Lost ID Card: '" << lost2.name << "'\n";
    std::vector<MatchCandidate> matches2 = MatchEngine::findMatches(lost2, items);
    assert(!matches2.empty());
    assert(matches2[0].item.id == "FOUND_2");
    std::cout << "         -> Top match: " << matches2[0].item.name << " ("
              << matches2[0].score << "% - " << matches2[0].categoryLabel << ")\n";

    // 3. Test LOST_3 (Leather wallet)
    Item lost3 = items[2];
    std::cout << "\n[Test 3] Matching Lost Wallet: '" << lost3.name << "'\n";
    std::vector<MatchCandidate> matches3 = MatchEngine::findMatches(lost3, items);
    assert(!matches3.empty());
    assert(matches3[0].item.id == "FOUND_3");
    std::cout << "         -> Top match: " << matches3[0].item.name << " ("
              << matches3[0].score << "% - " << matches3[0].categoryLabel << ")\n";

    std::cout << "\n========================================\n";
    std::cout << " ALL STAGE 8 TESTS PASSED PERFECTLY!\n";
    std::cout << "========================================\n";

    return 0;
}
