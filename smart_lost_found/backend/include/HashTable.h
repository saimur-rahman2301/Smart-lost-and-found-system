#ifndef HASH_TABLE_H
#define HASH_TABLE_H

#include "Item.h"
#include <string>
#include <vector>
#include <iostream>
#include <iomanip>

/**
 * HashNode: Represents a single node in a bucket's linked list.
 * Used for Separate Chaining collision resolution.
 */
struct HashNode
{
    std::string key; // Typically Item ID (e.g., "LOST_1", "FOUND_5")
    Item value;      // Item data object
    HashNode *next;  // Pointer to next node in case of collision

    HashNode(const std::string &k, const Item &v)
        : key(k), value(v), next(nullptr) {}
};

/**
 * HashTable: Custom implementation of a Hash Table using Separate Chaining.
 * Provides O(1) average time complexity for insertions, lookups, and deletions.
 */
class HashTable
{
private:
    std::vector<HashNode *> table;
    size_t capacity;       // Number of buckets (prime number preferred)
    size_t size;           // Number of elements currently stored
    size_t collisionCount; // Metrics tracking for academic presentation

    /**
     * hashFunction (DJB2 Algorithm):
     * A classic, highly-efficient string hashing algorithm by Dan Bernstein.
     * Computes: hash = ((hash << 5) + hash) + c = hash * 33 + c
     * Minimizes clustering and produces uniform distribution across buckets.
     */
    size_t hashFunction(const std::string &key) const
    {
        unsigned long hash = 5381;
        for (char c : key)
        {
            hash = ((hash << 5) + hash) + static_cast<unsigned char>(c); // hash * 33 + c
        }
        return hash % capacity;
    }

public:
    // Default constructor initialized with prime bucket capacity
    explicit HashTable(size_t initialCapacity = 101)
        : capacity(initialCapacity), size(0), collisionCount(0)
    {
        table.resize(capacity, nullptr);
    }

    // Destructor to deallocate all linked list nodes across all buckets
    ~HashTable()
    {
        clear();
    }

    // Prevent inadvertent shallow copies
    HashTable(const HashTable &) = delete;
    HashTable &operator=(const HashTable &) = delete;

    /**
     * insert: Inserts or updates an Item with the specified key.
     * Average Time: O(1)
     * Worst Time:   O(n) if excessive collisions occur
     */
    void insert(const std::string &key, const Item &item)
    {
        size_t index = hashFunction(key);
        HashNode *current = table[index];

        // Case 1: Bucket is empty (Direct insertion)
        if (current == nullptr)
        {
            table[index] = new HashNode(key, item);
            size++;
            return;
        }

        // Case 2: Bucket is occupied (Separate Chaining traversal)
        HashNode *prev = nullptr;
        while (current != nullptr)
        {
            if (current->key == key)
            {
                // Key already exists -> Update value
                current->value = item;
                return;
            }
            prev = current;
            current = current->next;
        }

        // Collision occurred! Append to the end of the chain
        prev->next = new HashNode(key, item);
        size++;
        collisionCount++;
    }

    /**
     * search: Looks up an Item by key.
     * Returns pointer to Item if found, nullptr otherwise.
     * Average Time: O(1)
     * Worst Time:   O(n)
     */
    Item *search(const std::string &key)
    {
        size_t index = hashFunction(key);
        HashNode *current = table[index];

        while (current != nullptr)
        {
            if (current->key == key)
            {
                return &(current->value);
            }
            current = current->next;
        }
        return nullptr;
    }

    const Item *search(const std::string &key) const
    {
        size_t index = hashFunction(key);
        HashNode *current = table[index];

        while (current != nullptr)
        {
            if (current->key == key)
            {
                return &(current->value);
            }
            current = current->next;
        }
        return nullptr;
    }

    /**
     * remove: Deletes an Item by key from the hash table.
     * Returns true if deleted, false if not found.
     * Average Time: O(1)
     */
    bool remove(const std::string &key)
    {
        size_t index = hashFunction(key);
        HashNode *current = table[index];
        HashNode *prev = nullptr;

        while (current != nullptr)
        {
            if (current->key == key)
            {
                if (prev == nullptr)
                {
                    table[index] = current->next;
                }
                else
                {
                    prev->next = current->next;
                }
                delete current;
                size--;
                return true;
            }
            prev = current;
            current = current->next;
        }
        return false;
    }

    /**
     * getAllItems: Extracts all stored Items into a linear vector.
     * Time Complexity: O(capacity + size)
     */
    std::vector<Item> getAllItems() const
    {
        std::vector<Item> items;
        items.reserve(size);
        for (size_t i = 0; i < capacity; ++i)
        {
            HashNode *curr = table[i];
            while (curr != nullptr)
            {
                items.push_back(curr->value);
                curr = curr->next;
            }
        }
        return items;
    }

    /**
     * clear: Frees all allocated memory in the table.
     */
    void clear()
    {
        for (size_t i = 0; i < capacity; ++i)
        {
            HashNode *curr = table[i];
            while (curr != nullptr)
            {
                HashNode *toDelete = curr;
                curr = curr->next;
                delete toDelete;
            }
            table[i] = nullptr;
        }
        size = 0;
        collisionCount = 0;
    }

    // Diagnostic & Metric Accessors
    size_t getSize() const { return size; }
    size_t getCapacity() const { return capacity; }
    size_t getCollisionCount() const { return collisionCount; }
    double getLoadFactor() const { return static_cast<double>(size) / capacity; }

    /**
     * displayMetrics: Prints table distribution statistics for viva explanation.
     */
    void displayMetrics() const
    {
        std::cout << "┌────────────────────────────────────────┐\n";
        std::cout << "│        HASH TABLE DIAGNOSTICS          │\n";
        std::cout << "├────────────────────────────────────────┤\n";
        std::cout << "│ Capacity:       " << std::left << std::setw(23) << capacity << "│\n";
        std::cout << "│ Total Items:    " << std::left << std::setw(23) << size << "│\n";
        std::cout << "│ Collisions:     " << std::left << std::setw(23) << collisionCount << "│\n";
        std::cout << "│ Load Factor:    " << std::left << std::setw(23) << std::fixed << std::setprecision(4) << getLoadFactor() << "│\n";
        std::cout << "└────────────────────────────────────────┘\n";
    }
};

#endif // HASH_TABLE_H
