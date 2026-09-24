#include "../include/Item.h"
#include "../include/DataManager.h"
#include "../include/MergeSort.h"
#include <iostream>
#include <cassert>

int main()
{
    std::cout << "========================================\n";
    std::cout << " STAGE 7 VERIFICATION: Manual Merge Sort\n";
    std::cout << "========================================\n\n";

    std::vector<Item> items = DataManager::getInitialSampleData();

    // 1. Sort by Date Newest
    std::cout << "[Test 1] Sorting items by Date (Newest First)...\n";
    MergeSort::sortItems(items, SortCriteria::DATE_NEWEST);
    for (size_t i = 1; i < items.size(); ++i)
    {
        assert(items[i - 1].date >= items[i].date);
    }
    std::cout << "  Newest item: " << items.front().name << " (" << items.front().date << ")\n";
    std::cout << "  Oldest item: " << items.back().name << " (" << items.back().date << ")\n";
    std::cout << "         -> Strictly verified: Sorted by newest date!\n";

    // 2. Sort by Date Oldest
    std::cout << "\n[Test 2] Sorting items by Date (Oldest First)...\n";
    MergeSort::sortItems(items, SortCriteria::DATE_OLDEST);
    for (size_t i = 1; i < items.size(); ++i)
    {
        assert(items[i - 1].date <= items[i].date);
    }
    std::cout << "  First item: " << items.front().name << " (" << items.front().date << ")\n";
    std::cout << "  Last item:  " << items.back().name << " (" << items.back().date << ")\n";
    std::cout << "         -> Strictly verified: Sorted by oldest date!\n";

    // 3. Sort by Name A-Z
    std::cout << "\n[Test 3] Sorting items by Name (Alphabetical A-Z)...\n";
    MergeSort::sortItems(items, SortCriteria::NAME_AZ);
    for (size_t i = 1; i < items.size(); ++i)
    {
        assert(items[i - 1].name <= items[i].name);
    }
    std::cout << "  First A-Z: " << items.front().name << "\n";
    std::cout << "  Last A-Z:  " << items.back().name << "\n";
    std::cout << "         -> Strictly verified: Alphabetical order confirmed!\n";

    // 4. Sort Match Candidates by Score
    std::cout << "\n[Test 4] Sorting Match Candidates by Score (Highest First)...\n";
    std::vector<MatchCandidate> testMatches = {
        MatchCandidate(items[0], 65, "Possible Match"),
        MatchCandidate(items[1], 95, "Very Strong Match"),
        MatchCandidate(items[2], 82, "Strong Match"),
        MatchCandidate(items[3], 90, "Very Strong Match"),
        MatchCandidate(items[4], 45, "Low Match")};

    MergeSort::sortMatches(testMatches);
    for (size_t i = 1; i < testMatches.size(); ++i)
    {
        assert(testMatches[i - 1].score >= testMatches[i].score);
    }
    for (const auto &m : testMatches)
    {
        std::cout << "  Candidate Score: " << m.score << "% [" << m.categoryLabel << "]\n";
    }
    std::cout << "         -> Strictly verified: Scores sorted descending!\n";

    std::cout << "\n========================================\n";
    std::cout << " ALL STAGE 7 TESTS PASSED PERFECTLY!\n";
    std::cout << "========================================\n";

    return 0;
}
