#include "../include/Item.h"
#include "../include/DataManager.h"
#include "../include/HashTable.h"
#include <iostream>
#include <cassert>

int main()
{
    std::cout << "========================================\n";
    std::cout << " STAGE 3 VERIFICATION: Custom Hash Table\n";
    std::cout << "========================================\n\n";

    HashTable ht(101); // 101 prime buckets
    std::vector<Item> samples = DataManager::getInitialSampleData();

    // 1. Insert all 20 items
    std::cout << "[Test 1] Inserting 20 items into Hash Table...\n";
    for (const auto &item : samples)
    {
        ht.insert(item.id, item);
    }
    assert(ht.getSize() == 20);
    std::cout << "         -> Table size: " << ht.getSize() << " (Expected 20)\n";

    // 2. Search for existing items
    std::cout << "\n[Test 2] Searching for 'LOST_1' and 'FOUND_6'...\n";
    Item *item1 = ht.search("LOST_1");
    assert(item1 != nullptr);
    assert(item1->name == "Casio FX-991ES Plus Scientific Calculator");
    std::cout << "         -> Found LOST_1: " << item1->name << " (Brand: " << item1->brand << ")\n";

    Item *item2 = ht.search("FOUND_6");
    assert(item2 != nullptr);
    assert(item2->name == "SanDisk 64GB Red & Black Flash Drive");
    std::cout << "         -> Found FOUND_6: " << item2->name << " (Color: " << item2->color << ")\n";

    // 3. Search non-existent item
    std::cout << "\n[Test 3] Searching for non-existent key 'LOST_999'...\n";
    Item *itemNotFound = ht.search("LOST_999");
    assert(itemNotFound == nullptr);
    std::cout << "         -> Correctly returned nullptr.\n";

    // 4. Update existing item
    std::cout << "\n[Test 4] Updating item 'LOST_1' status to RECOVERED...\n";
    item1->status = ItemStatus::RECOVERED;
    ht.insert("LOST_1", *item1); // Re-insert with updated object
    Item *updatedItem = ht.search("LOST_1");
    assert(updatedItem != nullptr);
    assert(updatedItem->status == ItemStatus::RECOVERED);
    assert(ht.getSize() == 20); // Size shouldn't change
    std::cout << "         -> Status successfully updated to: " << itemStatusToString(updatedItem->status) << "\n";

    // 5. Delete an item
    std::cout << "\n[Test 5] Removing item 'LOST_7'...\n";
    bool removed = ht.remove("LOST_7");
    assert(removed);
    assert(ht.getSize() == 19);
    assert(ht.search("LOST_7") == nullptr);
    std::cout << "         -> Successfully removed 'LOST_7'. New size: " << ht.getSize() << "\n";

    // 6. Test Display Metrics
    std::cout << "\n[Test 6] Printing Hash Table Diagnostics:\n";
    ht.displayMetrics();

    std::cout << "\n========================================\n";
    std::cout << " ALL STAGE 3 TESTS PASSED PERFECTLY!\n";
    std::cout << "========================================\n";

    return 0;
}
