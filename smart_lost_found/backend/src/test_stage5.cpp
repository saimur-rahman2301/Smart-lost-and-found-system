#include "../include/Item.h"
#include "../include/MaxHeap.h"
#include <iostream>
#include <cassert>

int main()
{
    std::cout << "========================================\n";
    std::cout << " STAGE 5 VERIFICATION: Custom Max Heap\n";
    std::cout << "========================================\n\n";

    MaxHeap heap;

    Item dummyItem;
    dummyItem.name = "Test Item";

    // 1. Insert candidates with test scores
    std::cout << "[Test 1] Inserting match candidates with scores: 95, 82, 91, 67, 100, 45...\n";
    heap.insert(MatchCandidate(dummyItem, 95, "Very Strong Match"));
    heap.insert(MatchCandidate(dummyItem, 82, "Strong Match"));
    heap.insert(MatchCandidate(dummyItem, 91, "Very Strong Match"));
    heap.insert(MatchCandidate(dummyItem, 67, "Possible Match"));
    heap.insert(MatchCandidate(dummyItem, 100, "Very Strong Match"));
    heap.insert(MatchCandidate(dummyItem, 45, "Low Match"));

    assert(heap.size() == 6);
    std::cout << "         -> Heap size: " << heap.size() << " (Expected 6)\n";

    // 2. Peek Max
    std::cout << "\n[Test 2] Peeking at top candidate...\n";
    MatchCandidate top = heap.peekMax();
    std::cout << "         -> Top candidate score: " << top.score << " (Expected 100)\n";
    assert(top.score == 100);

    // 3. Extract in descending order (Heap Sort ranking)
    std::cout << "\n[Test 3] Extracting all candidates via getRankedMatches():\n";
    std::vector<MatchCandidate> ranked = heap.getRankedMatches();
    assert(ranked.size() == 6);
    assert(heap.empty());

    int expectedScores[] = {100, 95, 91, 82, 67, 45};
    for (size_t i = 0; i < ranked.size(); ++i)
    {
        std::cout << "  #" << (i + 1) << " Score: " << ranked[i].score << "% [" << ranked[i].categoryLabel << "]\n";
        assert(ranked[i].score == expectedScores[i]);
    }
    std::cout << "         -> Strictly verified: All candidates extracted in descending order!\n";

    std::cout << "\n========================================\n";
    std::cout << " ALL STAGE 5 TESTS PASSED PERFECTLY!\n";
    std::cout << "========================================\n";

    return 0;
}
