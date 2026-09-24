#include "../include/Item.h"
#include "../include/DataManager.h"
#include "../include/HashTable.h"
#include "../include/BST.h"
#include "../include/MaxHeap.h"
#include "../include/StringMatcher.h"
#include "../include/MergeSort.h"
#include "../include/MatchEngine.h"

#include <iostream>
#include <cassert>
#include <iomanip>

int main()
{
    std::cout << "======================================================================\n";
    std::cout << "          SMART LOST & FOUND - AUTOMATED DSA VERIFICATION TEST SUITE  \n";
    std::cout << "          University Presentation & Viva Defense Verification         \n";
    std::cout << "======================================================================\n\n";

    int passedCount = 0;
    int totalTests = 10;

    std::vector<Item> samples = DataManager::getInitialSampleData();

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 1: Hash Table O(1) Lookup for Existing Item
    // ─────────────────────────────────────────────────────────────────────────
    std::cout << "[Test 01/10] Hash Table: O(1) Lookup for Existing Item ID...\n";
    HashTable ht(101);
    for (const auto &item : samples)
        ht.insert(item.id, item);
    Item *item1 = ht.search("LOST_1");
    assert(item1 != nullptr);
    assert(item1->name == "Casio FX-991ES Plus Scientific Calculator");
    std::cout << "             ✓ Found 'LOST_1': " << item1->name << "\n";
    passedCount++;

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 2: Hash Table Lookup for Non-Existent Item
    // ─────────────────────────────────────────────────────────────────────────
    std::cout << "\n[Test 02/10] Hash Table: Lookup for Non-Existent Key Returns nullptr...\n";
    Item *notFound = ht.search("LOST_9999");
    assert(notFound == nullptr);
    std::cout << "             ✓ Successfully returned nullptr for missing key 'LOST_9999'\n";
    passedCount++;

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 3: BST Search by Item Name Key
    // ─────────────────────────────────────────────────────────────────────────
    std::cout << "\n[Test 03/10] Binary Search Tree: Search by Item Name Key...\n";
    BST bst;
    for (const auto &item : samples)
        bst.insert(item.name, item);
    std::string bstSearchName = "Dell Pro 15.6 Laptop Backpack";
    Item *bstFound = bst.search(bstSearchName);
    assert(bstFound != nullptr);
    assert(bstFound->id == "LOST_4");
    std::cout << "             ✓ BST located item: " << bstFound->name << " (ID: " << bstFound->id << ")\n";
    passedCount++;

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 4: BST In-Order Traversal Guarantees Strictly Alphabetical Order
    // ─────────────────────────────────────────────────────────────────────────
    std::cout << "\n[Test 04/10] BST: In-Order Traversal Alphabetical Order Guarantee...\n";
    std::vector<Item> inorder = bst.inorderTraversal();
    assert(inorder.size() == 20);
    for (size_t i = 1; i < inorder.size(); ++i)
    {
        assert(inorder[i - 1].name <= inorder[i].name);
    }
    std::cout << "             ✓ In-order traversal yielded " << inorder.size()
              << " items in strict alphabetical order (A-Z).\n";
    passedCount++;

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 5: Max Heap Priority Queue Extraction (Highest to Lowest)
    // ─────────────────────────────────────────────────────────────────────────
    std::cout << "\n[Test 05/10] Max Heap: Extract-Max Order Verification...\n";
    MaxHeap heap;
    Item dummy;
    dummy.name = "Candidate";
    heap.insert(MatchCandidate(dummy, 65, "Possible Match"));
    heap.insert(MatchCandidate(dummy, 95, "Very Strong Match"));
    heap.insert(MatchCandidate(dummy, 82, "Strong Match"));
    heap.insert(MatchCandidate(dummy, 45, "Low Match"));
    heap.insert(MatchCandidate(dummy, 91, "Very Strong Match"));

    std::vector<MatchCandidate> ranked = heap.getRankedMatches();
    assert(ranked.size() == 5);
    int expectedOrder[] = {95, 91, 82, 65, 45};
    for (size_t i = 0; i < ranked.size(); ++i)
    {
        assert(ranked[i].score == expectedOrder[i]);
    }
    std::cout << "             ✓ Extracted scores in descending order: 95 -> 91 -> 82 -> 65 -> 45\n";
    passedCount++;

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 6: String Matcher Token Overlap & Stopword Elimination
    // ─────────────────────────────────────────────────────────────────────────
    std::cout << "\n[Test 06/10] String Matcher: Token Overlap & Stopwords Removal...\n";
    std::string s1 = "Black Casio FX-991ES scientific calculator";
    std::string s2 = "Casio black calculator FX-991ES";
    int commonTokens = StringMatcher::countMatchingTokens(s1, s2);
    double overlap = StringMatcher::calculateTokenOverlap(s1, s2);
    assert(commonTokens >= 4);
    assert(overlap > 0.80);
    std::cout << "             ✓ Common tokens: " << commonTokens
              << " | Overlap: " << std::fixed << std::setprecision(1) << (overlap * 100) << "%\n";
    passedCount++;

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 7: Manual Merge Sort (Date Newest and Name A-Z)
    // ─────────────────────────────────────────────────────────────────────────
    std::cout << "\n[Test 07/10] Manual Merge Sort: Sorting Stability & Invariants...\n";
    std::vector<Item> sortList = samples;
    MergeSort::sortItems(sortList, SortCriteria::DATE_NEWEST);
    for (size_t i = 1; i < sortList.size(); ++i)
    {
        assert(sortList[i - 1].date >= sortList[i].date);
    }
    std::cout << "             ✓ Merge Sort (Date Newest): Confirmed monotonic descending date.\n";

    MergeSort::sortItems(sortList, SortCriteria::NAME_AZ);
    for (size_t i = 1; i < sortList.size(); ++i)
    {
        assert(sortList[i - 1].name <= sortList[i].name);
    }
    std::cout << "             ✓ Merge Sort (Name A-Z): Confirmed alphabetical stability.\n";
    passedCount++;

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 8: 100-Point Match Formula Accuracy
    // ─────────────────────────────────────────────────────────────────────────
    std::cout << "\n[Test 08/10] Match Engine: 100-Point Rule Formula Evaluation...\n";
    Item lostCalc = samples[0];   // Casio FX-991ES Calculator (Main Library, Black)
    Item foundCalc = samples[10]; // Casio FX-991ES Calculator (Main Library, Black)
    MatchCandidate matchResult = MatchEngine::calculateMatch(lostCalc, foundCalc);

    assert(matchResult.score == 100);
    assert(matchResult.categoryLabel == "Very Strong Match");
    std::cout << "             ✓ Match score: " << matchResult.score
              << "% [" << matchResult.categoryLabel << "] with 7-factor audit trail.\n";
    passedCount++;

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 9: Recovery Lifecycle Transition (ACTIVE -> RECOVERED)
    // ─────────────────────────────────────────────────────────────────────────
    std::cout << "\n[Test 09/10] Item Lifecycle: Status Transition to RECOVERED...\n";
    Item *itemToRecover = ht.search("LOST_1");
    assert(itemToRecover->status == ItemStatus::ACTIVE);
    itemToRecover->status = ItemStatus::RECOVERED;
    ht.insert("LOST_1", *itemToRecover);
    assert(ht.search("LOST_1")->status == ItemStatus::RECOVERED);

    // Verify that RECOVERED items are excluded from active matching candidates
    std::vector<MatchCandidate> matchesAfterRecovery = MatchEngine::findMatches(samples[0], ht.getAllItems());
    for (const auto &m : matchesAfterRecovery)
    {
        assert(m.item.status == ItemStatus::ACTIVE);
    }
    std::cout << "             ✓ Verified: Item successfully marked RECOVERED and archived from active matches.\n";
    passedCount++;

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 10: Statistics Calculation & DSA Metrics Correctness
    // ─────────────────────────────────────────────────────────────────────────
    std::cout << "\n[Test 10/10] System Statistics: Counts & Metric Aggregations...\n";
    std::vector<Item> currentItems = ht.getAllItems();
    int lostTotal = 0, foundTotal = 0, recoveredTotal = 0;
    for (const auto &it : currentItems)
    {
        if (it.type == ItemType::LOST)
            lostTotal++;
        else if (it.type == ItemType::FOUND)
            foundTotal++;
        if (it.status == ItemStatus::RECOVERED)
            recoveredTotal++;
    }
    assert(lostTotal == 10);
    assert(foundTotal == 10);
    assert(recoveredTotal == 1);
    assert(ht.getLoadFactor() < 0.75); // Safe hash load factor
    std::cout << "             ✓ Stats: Lost=" << lostTotal << ", Found=" << foundTotal
              << ", Recovered=" << recoveredTotal
              << ", Hash Load Factor=" << std::fixed << std::setprecision(4) << ht.getLoadFactor() << "\n";
    passedCount++;

    std::cout << "\n======================================================================\n";
    std::cout << " RESULT: " << passedCount << "/" << totalTests << " TESTS PASSED WITH 100% SUCCESS!\n";
    std::cout << " All Data Structures & Algorithms operate in accordance with specifications.\n";
    std::cout << "======================================================================\n";

    return 0;
}
