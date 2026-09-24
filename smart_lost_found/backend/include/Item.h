#ifndef ITEM_H
#define ITEM_H

#include <string>
#include <vector>
#include <sstream>
#include <iostream>
#include <iomanip>

/**
 * ItemType: Categorizes whether an item is being searched for (LOST)
 * or was turned in after being found (FOUND).
 */
enum class ItemType
{
    LOST,
    FOUND
};

/**
 * ItemStatus: Represents the lifecycle state of an item.
 * ACTIVE    -> Available for matching.
 * MATCHED   -> High-probability match identified (score >= 60%).
 * RECOVERED -> Reunited with rightful owner (archived from active matching).
 */
enum class ItemStatus
{
    ACTIVE,
    MATCHED,
    RECOVERED
};

// ── Helper functions for enum to string conversion ──────────────────

inline std::string itemTypeToString(ItemType type)
{
    switch (type)
    {
    case ItemType::LOST:
        return "LOST";
    case ItemType::FOUND:
        return "FOUND";
    default:
        return "UNKNOWN";
    }
}

inline ItemType stringToItemType(const std::string &str)
{
    if (str == "LOST" || str == "lost")
        return ItemType::LOST;
    return ItemType::FOUND;
}

inline std::string itemStatusToString(ItemStatus status)
{
    switch (status)
    {
    case ItemStatus::ACTIVE:
        return "ACTIVE";
    case ItemStatus::MATCHED:
        return "MATCHED";
    case ItemStatus::RECOVERED:
        return "RECOVERED";
    default:
        return "ACTIVE";
    }
}

inline ItemStatus stringToItemStatus(const std::string &str)
{
    if (str == "RECOVERED" || str == "recovered")
        return ItemStatus::RECOVERED;
    if (str == "MATCHED" || str == "matched")
        return ItemStatus::MATCHED;
    return ItemStatus::ACTIVE;
}

/**
 * Item: The fundamental data entity of the Smart Lost & Found system.
 * Contains all descriptive, contextual, and ownership verification attributes.
 */
struct Item
{
    std::string id;          // Unique identifier (e.g., "LOST_1", "FOUND_1")
    ItemType type;           // LOST or FOUND
    std::string name;        // Descriptive title (e.g., "Casio FX-991ES Plus Calculator")
    std::string category;    // "Electronics", "Keys & Wallets", "Books & Stationery", etc.
    std::string description; // Detailed text describing condition, marks, etc.
    std::string brand;       // Manufacturer/brand (e.g., "Casio", "Apple", "Dell")
    std::string color;       // Primary visual color (e.g., "Black", "Silver", "Blue")
    std::string location;    // Campus location (e.g., "Main Library", "Cafeteria")
    std::string date;        // ISO Date format: "YYYY-MM-DD"
    std::string keywords;    // Space-separated search tokens for NLP string matching
    std::string contact;     // Email or phone number of reporter/finder
    ItemStatus status;       // ACTIVE, MATCHED, or RECOVERED

    // Default Constructor
    Item()
        : type(ItemType::LOST), status(ItemStatus::ACTIVE) {}

    // Parameterized Constructor
    Item(std::string id, ItemType type, std::string name, std::string category,
         std::string description, std::string brand, std::string color,
         std::string location, std::string date, std::string keywords,
         std::string contact, ItemStatus status = ItemStatus::ACTIVE)
        : id(id), type(type), name(name), category(category),
          description(description), brand(brand), color(color),
          location(location), date(date), keywords(keywords),
          contact(contact), status(status) {}

    // Formatted terminal display for tests & demonstrations
    void display() const
    {
        std::cout << "┌────────────────────────────────────────────────────────┐\n";
        std::cout << "│ ID: " << std::left << std::setw(15) << id
                  << " Type: " << std::setw(10) << itemTypeToString(type)
                  << " Status: " << std::setw(12) << itemStatusToString(status) << "│\n";
        std::cout << "│ Name:     " << std::setw(44) << name << "│\n";
        std::cout << "│ Category: " << std::setw(20) << category
                  << " Brand: " << std::setw(18) << brand << "│\n";
        std::cout << "│ Location: " << std::setw(20) << location
                  << " Color: " << std::setw(18) << color << "│\n";
        std::cout << "│ Date:     " << std::setw(20) << date
                  << " Contact: " << std::setw(16) << contact << "│\n";
        std::cout << "└────────────────────────────────────────────────────────┘\n";
    }

    // Convert Item object to a JSON-formatted string
    std::string toJson() const
    {
        std::ostringstream ss;
        ss << "{"
           << "\"id\":\"" << escapeJson(id) << "\","
           << "\"type\":\"" << itemTypeToString(type) << "\","
           << "\"name\":\"" << escapeJson(name) << "\","
           << "\"category\":\"" << escapeJson(category) << "\","
           << "\"description\":\"" << escapeJson(description) << "\","
           << "\"brand\":\"" << escapeJson(brand) << "\","
           << "\"color\":\"" << escapeJson(color) << "\","
           << "\"location\":\"" << escapeJson(location) << "\","
           << "\"date\":\"" << escapeJson(date) << "\","
           << "\"keywords\":\"" << escapeJson(keywords) << "\","
           << "\"contact\":\"" << escapeJson(contact) << "\","
           << "\"status\":\"" << itemStatusToString(status) << "\""
           << "}";
        return ss.str();
    }

private:
    static std::string escapeJson(const std::string &s)
    {
        std::ostringstream o;
        for (char c : s)
        {
            if (c == '"')
                o << "\\\"";
            else if (c == '\\')
                o << "\\\\";
            else if (c == '\b')
                o << "\\b";
            else if (c == '\f')
                o << "\\f";
            else if (c == '\n')
                o << "\\n";
            else if (c == '\r')
                o << "\\r";
            else if (c == '\t')
                o << "\\t";
            else
                o << c;
        }
        return o.str();
    }
};

#endif // ITEM_H
