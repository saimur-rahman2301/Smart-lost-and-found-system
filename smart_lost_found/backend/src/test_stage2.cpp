#include "../include/Item.h"
#include "../include/DataManager.h"
#include <iostream>
#include <cassert>

int main()
{
    std::cout << "========================================\n";
    std::cout << " STAGE 2 VERIFICATION: Item & DataManager\n";
    std::cout << "========================================\n\n";

    // 1. Test getInitialSampleData
    std::vector<Item> samples = DataManager::getInitialSampleData();
    std::cout << "[Test 1] Generated " << samples.size() << " initial sample items.\n";
    assert(samples.size() == 20); // 10 LOST + 10 FOUND

    int lostCount = 0;
    int foundCount = 0;
    for (const auto &item : samples)
    {
        if (item.type == ItemType::LOST)
            lostCount++;
        else if (item.type == ItemType::FOUND)
            foundCount++;
    }
    std::cout << "         -> Lost items:  " << lostCount << " (Expected 10)\n";
    std::cout << "         -> Found items: " << foundCount << " (Expected 10)\n";
    assert(lostCount == 10);
    assert(foundCount == 10);

    // 2. Test Item display & JSON serialization
    std::cout << "\n[Test 2] Displaying sample item:\n";
    samples[0].display();

    std::string json = samples[0].toJson();
    std::cout << "\n[Test 3] Serialized to JSON:\n"
              << json << "\n";
    assert(json.find("\"id\":\"LOST_1\"") != std::string::npos);

    // 3. Test File persistence (Save & Load)
    std::string testFile = "test_items.json";
    std::cout << "\n[Test 4] Testing saveToFile -> " << testFile << "...\n";
    bool saved = DataManager::saveToFile(testFile, samples);
    assert(saved);
    std::cout << "         -> Save successful.\n";

    std::cout << "\n[Test 5] Testing loadFromFile <- " << testFile << "...\n";
    std::vector<Item> loaded = DataManager::loadFromFile(testFile);
    assert(loaded.size() == 20);
    assert(loaded[0].id == "LOST_1");
    assert(loaded[10].id == "FOUND_1");
    std::cout << "         -> Loaded " << loaded.size() << " items successfully!\n";

    std::cout << "\n========================================\n";
    std::cout << " ALL STAGE 2 TESTS PASSED PERFECTLY!\n";
    std::cout << "========================================\n";

    return 0;
}
