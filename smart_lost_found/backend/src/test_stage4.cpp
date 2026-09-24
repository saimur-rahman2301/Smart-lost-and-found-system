#include "../include/Item.h"
#include "../include/DataManager.h"
#include "../include/BST.h"
#include <iostream>
#include <cassert>

int main()
{
    std::cout << "========================================\n";
    std::cout << " STAGE 4 VERIFICATION: Custom BST\n";
    std::cout << "========================================\n\n";

    BST bst;
    std::vector<Item> samples = DataManager::getInitialSampleData();

    // 1. Insert items into BST
    std::cout << "[Test 1] Inserting 20 items into BST (keyed by Item Name)...\n";
    for (const auto &item : samples)
    {
        bst.insert(item.name, item);
    }
    assert(bst.size() == 20);
    std::cout << "         -> BST size: " << bst.size() << " nodes. Tree Height: " << bst.getHeight() << "\n";

    // 2. Search for existing items
    std::string searchKey = "Casio FX-991ES Plus Scientific Calculator";
    std::cout << "\n[Test 2] Searching for '" << searchKey << "'...\n";
    Item *found = bst.search(searchKey);
    assert(found != nullptr);
    assert(found->id == "LOST_1");
    std::cout << "         -> Found: " << found->name << " [ID: " << found->id << "]\n";

    // 3. Search for non-existent item
    std::cout << "\n[Test 3] Searching for non-existent name 'Non-Existent Item'...\n";
    Item *notFound = bst.search("Non-Existent Item");
    assert(notFound == nullptr);
    std::cout << "         -> Correctly returned nullptr.\n";

    // 4. In-order Traversal (Alphabetical ordering verification)
    std::cout << "\n[Test 4] Verifying In-order Traversal (Alphabetical Sort):\n";
    std::vector<Item> sortedItems = bst.inorderTraversal();
    assert(sortedItems.size() == 20);

    for (size_t i = 0; i < sortedItems.size(); ++i)
    {
        std::cout << "  " << (i + 1) << ". " << sortedItems[i].name << "\n";
        if (i > 0)
        {
            // Verify alphabetical invariant
            assert(sortedItems[i - 1].name <= sortedItems[i].name);
        }
    }
    std::cout << "         -> Strictly verified: All items sorted alphabetically!\n";

    // 5. Test Node Deletion (Node with children)
    std::cout << "\n[Test 5] Deleting '" << searchKey << "'...\n";
    bool removed = bst.remove(searchKey);
    assert(removed);
    assert(bst.size() == 19);
    assert(bst.search(searchKey) == nullptr);
    std::cout << "         -> Successfully deleted. New size: " << bst.size() << "\n";

    std::cout << "\n========================================\n";
    std::cout << " ALL STAGE 4 TESTS PASSED PERFECTLY!\n";
    std::cout << "========================================\n";

    return 0;
}
