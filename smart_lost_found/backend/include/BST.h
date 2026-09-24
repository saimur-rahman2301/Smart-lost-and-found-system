#ifndef BST_H
#define BST_H

#include "Item.h"
#include <string>
#include <vector>
#include <iostream>
#include <algorithm>

/**
 * BSTNode: A node within the custom Binary Search Tree.
 * Stores the sorting key (Item Name), the associated Item object,
 * and pointers to the left and right subtrees.
 */
struct BSTNode
{
    std::string key; // Item Name (e.g., "Casio FX-991ES Plus...")
    Item item;       // Complete Item record
    BSTNode *left;   // Left child (keys < key)
    BSTNode *right;  // Right child (keys >= key)

    BSTNode(const std::string &k, const Item &val)
        : key(k), item(val), left(nullptr), right(nullptr) {}
};

/**
 * BST: Custom Binary Search Tree.
 * Maintains items in alphabetical order by name without using std::map or std::set.
 * Allows O(log n) average-time lookups and in-order alphabetical retrieval.
 */
class BST
{
private:
    BSTNode *root;
    size_t nodeCount;

    // Helper: Recursive insertion
    BSTNode *insertHelper(BSTNode *node, const std::string &key, const Item &item)
    {
        if (node == nullptr)
        {
            nodeCount++;
            return new BSTNode(key, item);
        }

        // Compare keys lexicographically
        if (key < node->key)
        {
            node->left = insertHelper(node->left, key, item);
        }
        else if (key > node->key)
        {
            node->right = insertHelper(node->right, key, item);
        }
        else
        {
            // Key already exists: update existing item
            node->item = item;
        }
        return node;
    }

    // Helper: Recursive search
    BSTNode *searchHelper(BSTNode *node, const std::string &key) const
    {
        if (node == nullptr || node->key == key)
        {
            return node;
        }

        if (key < node->key)
        {
            return searchHelper(node->left, key);
        }
        return searchHelper(node->right, key);
    }

    // Helper: Find the node with the minimum value (in-order successor)
    BSTNode *findMin(BSTNode *node) const
    {
        while (node && node->left != nullptr)
        {
            node = node->left;
        }
        return node;
    }

    // Helper: Recursive deletion
    BSTNode *deleteHelper(BSTNode *node, const std::string &key, bool &deleted)
    {
        if (node == nullptr)
            return nullptr;

        if (key < node->key)
        {
            node->left = deleteHelper(node->left, key, deleted);
        }
        else if (key > node->key)
        {
            node->right = deleteHelper(node->right, key, deleted);
        }
        else
        {
            // Found target node to delete
            deleted = true;

            // Case 1: Leaf node (0 children)
            if (node->left == nullptr && node->right == nullptr)
            {
                delete node;
                nodeCount--;
                return nullptr;
            }
            // Case 2: One child (right only)
            else if (node->left == nullptr)
            {
                BSTNode *temp = node->right;
                delete node;
                nodeCount--;
                return temp;
            }
            // Case 2: One child (left only)
            else if (node->right == nullptr)
            {
                BSTNode *temp = node->left;
                delete node;
                nodeCount--;
                return temp;
            }
            // Case 3: Two children
            // Find in-order successor (smallest node in the right subtree)
            BSTNode *successor = findMin(node->right);
            node->key = successor->key;
            node->item = successor->item;
            // Delete the in-order successor from the right subtree
            node->right = deleteHelper(node->right, successor->key, deleted);
        }
        return node;
    }

    // Helper: In-order traversal (Left, Root, Right) -> Yields sorted sequence
    void inorderHelper(BSTNode *node, std::vector<Item> &result) const
    {
        if (node == nullptr)
            return;
        inorderHelper(node->left, result);
        result.push_back(node->item);
        inorderHelper(node->right, result);
    }

    // Helper: Calculate tree height
    int heightHelper(BSTNode *node) const
    {
        if (node == nullptr)
            return 0;
        int leftH = heightHelper(node->left);
        int rightH = heightHelper(node->right);
        return 1 + std::max(leftH, rightH);
    }

    // Helper: Clear tree memory
    void destroyTree(BSTNode *node)
    {
        if (node == nullptr)
            return;
        destroyTree(node->left);
        destroyTree(node->right);
        delete node;
    }

public:
    BST() : root(nullptr), nodeCount(0) {}

    ~BST()
    {
        destroyTree(root);
        root = nullptr;
        nodeCount = 0;
    }

    // Prevent inadvertent shallow copies
    BST(const BST &) = delete;
    BST &operator=(const BST &) = delete;

    void clear()
    {
        destroyTree(root);
        root = nullptr;
        nodeCount = 0;
    }

    /**
     * insert: Inserts an Item ordered by its name key.
     * Average Time: O(log n)
     * Worst Time:   O(n) if tree is completely skewed
     * Space:        O(log n) recursive stack depth
     */
    void insert(const std::string &key, const Item &item)
    {
        root = insertHelper(root, key, item);
    }

    /**
     * search: Searches for an Item with exact matching name key.
     * Average Time: O(log n)
     * Worst Time:   O(n)
     */
    Item *search(const std::string &key)
    {
        BSTNode *res = searchHelper(root, key);
        return (res != nullptr) ? &(res->item) : nullptr;
    }

    const Item *search(const std::string &key) const
    {
        BSTNode *res = searchHelper(root, key);
        return (res != nullptr) ? &(res->item) : nullptr;
    }

    /**
     * remove: Deletes an Item by key.
     * Average Time: O(log n)
     * Worst Time:   O(n)
     */
    bool remove(const std::string &key)
    {
        bool deleted = false;
        root = deleteHelper(root, key, deleted);
        return deleted;
    }

    /**
     * inorderTraversal: Retrieves all items in strictly alphabetical order.
     * Demonstrates ordered data management in O(n) time.
     */
    std::vector<Item> inorderTraversal() const
    {
        std::vector<Item> result;
        result.reserve(nodeCount);
        inorderHelper(root, result);
        return result;
    }

    size_t size() const { return nodeCount; }
    bool empty() const { return root == nullptr; }
    int getHeight() const { return heightHelper(root); }
};

#endif // BST_H
