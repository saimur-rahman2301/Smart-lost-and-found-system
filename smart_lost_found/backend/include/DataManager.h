#ifndef DATA_MANAGER_H
#define DATA_MANAGER_H

#include "Item.h"
#include <vector>
#include <fstream>
#include <sstream>
#include <iostream>

/**
 * DataManager: Manages persistent file operations (saving/loading items)
 * and seeds realistic university lost & found records.
 */
class DataManager
{
public:
    /**
     * getInitialSampleData:
     * Seeds 10 realistic Lost items and 10 Found items spanning common
     * campus categories (Calculators, ID cards, Wallets, Backpacks, Books,
     * USB drives, Keys, Phones, Documents, and Earphones).
     */
    static std::vector<Item> getInitialSampleData()
    {
        std::vector<Item> items;

        // ── 10 LOST ITEMS ──────────────────────────────────────────
        items.push_back(Item(
            "LOST_1", ItemType::LOST,
            "Casio FX-991ES Plus Scientific Calculator", "Electronics",
            "Left on desk in 2nd floor quiet area with name sticker on back.",
            "Casio", "Black", "Main Library", "2026-09-20",
            "calculator casio fx991es scientific black math", "ali.raza@uni.edu", ItemStatus::ACTIVE));

        items.push_back(Item(
            "LOST_2", ItemType::LOST,
            "University Student ID Card - Ali Raza", "Documents & Cards",
            "Official CS department student card on a navy blue lanyard with ID 2024-CS-42.",
            "University", "Blue", "Cafeteria & Food Court", "2026-09-21",
            "student id card ali raza computer science lanyard", "ali.raza@uni.edu", ItemStatus::ACTIVE));

        items.push_back(Item(
            "LOST_3", ItemType::LOST,
            "Brown Leather Wallet (Samsonite)", "Keys & Wallets",
            "Dark brown bi-fold leather wallet containing student driving license and cards.",
            "Samsonite", "Brown", "Student Center", "2026-09-19",
            "wallet leather brown samsonite license cards", "sara.k@uni.edu", ItemStatus::ACTIVE));

        items.push_back(Item(
            "LOST_4", ItemType::LOST,
            "Dell Pro 15.6 Laptop Backpack", "Bags & Backpacks",
            "Black Dell backpack with orange zipper accents. Contains charger and spiral notebook.",
            "Dell", "Black", "Computer Science Labs", "2026-09-18",
            "backpack bag dell black laptop lab charger", "omar.s@uni.edu", ItemStatus::ACTIVE));

        items.push_back(Item(
            "LOST_5", ItemType::LOST,
            "Data Structures & Algorithms in C++ Textbook", "Books & Stationery",
            "Hardcover textbook by Mark Allen Weiss. Highlighted chapters on Trees and Graphs.",
            "Pearson", "Blue", "Main Library", "2026-09-22",
            "book textbook dsa data structures c++ algorithms", "ali.raza@uni.edu", ItemStatus::ACTIVE));

        items.push_back(Item(
            "LOST_6", ItemType::LOST,
            "SanDisk Ultra 64GB USB 3.0 Flash Drive", "Electronics",
            "Small red and black retractable USB drive containing semester lab project code.",
            "SanDisk", "Red", "Computer Science Labs", "2026-09-21",
            "usb flash drive sandisk 64gb red black memory stick", "fatima.m@uni.edu", ItemStatus::ACTIVE));

        items.push_back(Item(
            "LOST_7", ItemType::LOST,
            "Dorm Room Keys on Blue Nissan Keychain", "Keys & Wallets",
            "Ring of 3 silver metal keys with a blue rubber Nissan keychain tag.",
            "Yale", "Silver", "Main Parking Area", "2026-09-17",
            "keys dorm room keychain blue nissan metal", "hamza.t@uni.edu", ItemStatus::ACTIVE));

        items.push_back(Item(
            "LOST_8", ItemType::LOST,
            "Apple iPhone 13 (Midnight Black, 128GB)", "Electronics",
            "Black iPhone in clear protective bumper case with a minor scratch on screen guard.",
            "Apple", "Black", "Sports Complex / Gym", "2026-09-22",
            "iphone apple phone black 13 mobile smartphone", "sara.k@uni.edu", ItemStatus::ACTIVE));

        items.push_back(Item(
            "LOST_9", ItemType::LOST,
            "Final Year Engineering Project Report Folder", "Documents & Cards",
            "Thick blue plastic folder containing signed project reports, circuit schematics, and CD.",
            "Generic", "Blue", "Engineering Block A", "2026-09-20",
            "documents folder report engineering fyp drawings", "omar.s@uni.edu", ItemStatus::ACTIVE));

        items.push_back(Item(
            "LOST_10", ItemType::LOST,
            "Apple AirPods Pro (2nd Gen) in Case", "Electronics",
            "White Apple AirPods charging case with a green silicone protective cover.",
            "Apple", "White", "Central Auditorium", "2026-09-21",
            "airpods apple earphones headphones pro wireless white", "fatima.m@uni.edu", ItemStatus::ACTIVE));

        // ── 10 FOUND ITEMS (Designed to trigger high-confidence matches) ──
        items.push_back(Item(
            "FOUND_1", ItemType::FOUND,
            "Casio Scientific Calculator FX-991ES", "Electronics",
            "Found on study table in the 2nd floor library reading room. Calculator works perfectly.",
            "Casio", "Black", "Main Library", "2026-09-20",
            "calculator casio fx991es scientific black desk", "hamza.t@uni.edu", ItemStatus::ACTIVE));

        items.push_back(Item(
            "FOUND_2", ItemType::FOUND,
            "Student ID Card (Ali Raza)", "Documents & Cards",
            "Found on the cashier counter at the main cafeteria. Navy blue strap attached.",
            "University", "Blue", "Cafeteria & Food Court", "2026-09-21",
            "id card student ali raza university cafeteria lanyard", "omar.s@uni.edu", ItemStatus::ACTIVE));

        items.push_back(Item(
            "FOUND_3", ItemType::FOUND,
            "Brown Leather Wallet", "Keys & Wallets",
            "Found on a couch in the student center lounge area. Samsonite logo visible.",
            "Samsonite", "Brown", "Student Center", "2026-09-19",
            "wallet leather brown samsonite cards money lounge", "ali.raza@uni.edu", ItemStatus::ACTIVE));

        items.push_back(Item(
            "FOUND_4", ItemType::FOUND,
            "Black Dell Laptop Bag", "Bags & Backpacks",
            "Found next to workstation in Lab 2. Dell branding on front with charger inside.",
            "Dell", "Black", "Computer Science Labs", "2026-09-18",
            "backpack bag dell black laptop computer lab", "fatima.m@uni.edu", ItemStatus::ACTIVE));

        items.push_back(Item(
            "FOUND_5", ItemType::FOUND,
            "C++ Data Structures Book (Pearson)", "Books & Stationery",
            "Found on a study desk near the bookshelf section. Blue cover.",
            "Pearson", "Blue", "Main Library", "2026-09-22",
            "book textbook dsa data structures c++ pearson library", "sara.k@uni.edu", ItemStatus::ACTIVE));

        items.push_back(Item(
            "FOUND_6", ItemType::FOUND,
            "SanDisk 64GB Red & Black Flash Drive", "Electronics",
            "Found plugged into USB port of PC in CS Lab 3. Contains code folders.",
            "SanDisk", "Red", "Computer Science Labs", "2026-09-21",
            "usb sandisk 64gb red black drive flash memory lab", "ali.raza@uni.edu", ItemStatus::ACTIVE));

        items.push_back(Item(
            "FOUND_7", ItemType::FOUND,
            "Ring of Keys with Blue Tag", "Keys & Wallets",
            "Found near bike stand in main parking lot. Three metal keys on ring.",
            "Yale", "Silver", "Main Parking Area", "2026-09-18",
            "keys ring keychain metal blue parking bike dorm", "omar.s@uni.edu", ItemStatus::ACTIVE));

        items.push_back(Item(
            "FOUND_8", ItemType::FOUND,
            "Black iPhone in Clear Case", "Electronics",
            "Found on gym bench near locker room. Screen locked.",
            "Apple", "Black", "Sports Complex / Gym", "2026-09-22",
            "iphone apple phone black mobile gym bench", "hamza.t@uni.edu", ItemStatus::ACTIVE));

        items.push_back(Item(
            "FOUND_9", ItemType::FOUND,
            "Blue Engineering Project Report File", "Documents & Cards",
            "Found in Lecture Hall 2, Eng Block A. Contains printed technical reports and schematics.",
            "Generic", "Blue", "Engineering Block A", "2026-09-20",
            "documents folder report engineering file papers fyp", "sara.k@uni.edu", ItemStatus::ACTIVE));

        items.push_back(Item(
            "FOUND_10", ItemType::FOUND,
            "Apple AirPods Case (Green Cover)", "Electronics",
            "Found under chair in the auditorium after afternoon seminar.",
            "Apple", "White", "Central Auditorium", "2026-09-21",
            "airpods apple wireless case earphones green cover", "ali.raza@uni.edu", ItemStatus::ACTIVE));

        return items;
    }

    /**
     * saveToFile: Serializes an array of Items into a JSON file.
     */
    static bool saveToFile(const std::string &filepath, const std::vector<Item> &items)
    {
        std::ofstream outFile(filepath);
        if (!outFile.is_open())
        {
            std::cerr << "[DataManager] Error opening file for writing: " << filepath << "\n";
            return false;
        }

        outFile << "[\n";
        for (size_t i = 0; i < items.size(); ++i)
        {
            outFile << "  " << items[i].toJson();
            if (i + 1 < items.size())
            {
                outFile << ",";
            }
            outFile << "\n";
        }
        outFile << "]\n";
        outFile.close();
        return true;
    }

    /**
     * loadFromFile: Reads a list of items from JSON file.
     * If file does not exist, populates default sample records and saves it.
     */
    static std::vector<Item> loadFromFile(const std::string &filepath)
    {
        std::ifstream inFile(filepath);
        if (!inFile.is_open())
        {
            std::cout << "[DataManager] File not found: " << filepath
                      << ". Generating initial realistic sample records...\n";
            std::vector<Item> initialItems = getInitialSampleData();
            saveToFile(filepath, initialItems);
            return initialItems;
        }

        // Read entire content
        std::stringstream buffer;
        buffer << inFile.rdbuf();
        std::string content = buffer.str();
        inFile.close();

        std::vector<Item> items;
        // Simple JSON object parser for array of items
        size_t pos = 0;
        while ((pos = content.find('{', pos)) != std::string::npos)
        {
            size_t endPos = content.find('}', pos);
            if (endPos == std::string::npos)
                break;

            std::string objStr = content.substr(pos + 1, endPos - pos - 1);
            Item item;
            item.id = extractValue(objStr, "id");
            item.type = stringToItemType(extractValue(objStr, "type"));
            item.name = extractValue(objStr, "name");
            item.category = extractValue(objStr, "category");
            item.description = extractValue(objStr, "description");
            item.brand = extractValue(objStr, "brand");
            item.color = extractValue(objStr, "color");
            item.location = extractValue(objStr, "location");
            item.date = extractValue(objStr, "date");
            item.keywords = extractValue(objStr, "keywords");
            item.contact = extractValue(objStr, "contact");
            item.status = stringToItemStatus(extractValue(objStr, "status"));

            if (!item.id.empty())
            {
                items.push_back(item);
            }
            pos = endPos + 1;
        }

        if (items.empty())
        {
            items = getInitialSampleData();
            saveToFile(filepath, items);
        }

        return items;
    }

private:
    static std::string extractValue(const std::string &json, const std::string &key)
    {
        std::string pattern = "\"" + key + "\":\"";
        size_t start = json.find(pattern);
        if (start == std::string::npos)
            return "";
        start += pattern.length();
        size_t end = json.find("\"", start);
        if (end == std::string::npos)
            return "";
        return json.substr(start, end - start);
    }
};

#endif // DATA_MANAGER_H
