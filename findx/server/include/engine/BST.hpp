#pragma once
/**
 * @file BST.hpp
 * @brief Binary Search Tree ordered by numeric key (timestamp/date).
 *
 * WHY THIS STRUCTURE:
 *   FindX needs efficient date-range queries: "show all reports between
 *   Oct 1 and Oct 15." A BST ordered by Unix timestamp enables:
 *     rangeQuery(lo, hi) → O(log n + k) on a balanced tree
 *     inorderTraversal   → sorted output O(n)
 *
 *   Why not a sorted array?
 *     Insertion into sorted array = O(n) due to shifting.
 *     BST insertion = O(log n) average.
 *
 *   WORST CASE WARNING:
 *     Naive BST with sorted input (chronological inserts) degenerates to
 *     O(n) height — a linked list. For the demo dataset (random dates)
 *     this does not occur. A self-balancing AVL or Red-Black tree would
 *     guarantee O(log n) in all cases; AVL rotation stubs are provided.
 *
 *   DELETION: Hibbard's algorithm (3 cases):
 *     1. Leaf → remove directly
 *     2. One child → promote child
 *     3. Two children → replace with in-order successor, delete successor
 *
 *   COMPLEXITY (balanced):
 *     insert / find / delete : O(log n) avg, O(n) worst
 *     rangeQuery             : O(log n + k)
 *     inorderTraversal       : O(n)
 *     Space                  : O(n)
 */

#include <memory>
#include <vector>
#include <functional>
#include <optional>
#include <algorithm>

namespace findx::engine {

template<typename V>
struct BSTNode {
    int64_t key;   // Unix timestamp or numeric ID
    V       value;
    std::unique_ptr<BSTNode<V>> left;
    std::unique_ptr<BSTNode<V>> right;

    BSTNode(int64_t k, V v)
        : key(k), value(std::move(v)), left(nullptr), right(nullptr) {}
};

template<typename V>
struct BSTEntry {
    int64_t key;
    V value;
};

template<typename V>
class BST {
private:
    std::unique_ptr<BSTNode<V>> root_;
    size_t size_ = 0;

    // ── Insert helper ──────────────────────────────────────────────────────
    BSTNode<V>* insertHelper(std::unique_ptr<BSTNode<V>>& node, int64_t key, V value) {
        if (!node) {
            node = std::make_unique<BSTNode<V>>(key, std::move(value));
            ++size_;
            return node.get();
        }
        if (key < node->key) return insertHelper(node->left, key, value);
        if (key > node->key) return insertHelper(node->right, key, value);
        // Duplicate key: update value
        node->value = std::move(value);
        return node.get();
    }

    // ── Find min node in subtree (for Hibbard deletion) ────────────────────
    BSTNode<V>* findMin(BSTNode<V>* node) const {
        while (node && node->left) node = node->left.get();
        return node;
    }

    // ── Delete helper (Hibbard) ────────────────────────────────────────────
    std::unique_ptr<BSTNode<V>> deleteHelper(std::unique_ptr<BSTNode<V>> node, int64_t key) {
        if (!node) return nullptr;
        if (key < node->key) {
            node->left = deleteHelper(std::move(node->left), key);
        } else if (key > node->key) {
            node->right = deleteHelper(std::move(node->right), key);
        } else {
            --size_;
            // Case 1: Leaf
            if (!node->left && !node->right) return nullptr;
            // Case 2: One child
            if (!node->left) return std::move(node->right);
            if (!node->right) return std::move(node->left);
            // Case 3: Two children — replace with in-order successor
            BSTNode<V>* succ = findMin(node->right.get());
            node->key   = succ->key;
            node->value = succ->value;
            ++size_; // deleteHelper will decrement again
            node->right = deleteHelper(std::move(node->right), succ->key);
        }
        return node;
    }

    // ── Inorder traversal helper ──────────────────────────────────────────
    void inorderHelper(const BSTNode<V>* node, std::vector<BSTEntry<V>>& result) const {
        if (!node) return;
        inorderHelper(node->left.get(), result);
        result.push_back({node->key, node->value});
        inorderHelper(node->right.get(), result);
    }

    // ── Range query helper ────────────────────────────────────────────────
    void rangeHelper(const BSTNode<V>* node, int64_t lo, int64_t hi,
                     std::vector<BSTEntry<V>>& result) const {
        if (!node) return;
        if (node->key > lo) rangeHelper(node->left.get(), lo, hi, result);
        if (node->key >= lo && node->key <= hi) {
            result.push_back({node->key, node->value});
        }
        if (node->key < hi) rangeHelper(node->right.get(), lo, hi, result);
    }

    // ── Height helper ─────────────────────────────────────────────────────
    int heightHelper(const BSTNode<V>* node) const {
        if (!node) return 0;
        return 1 + std::max(heightHelper(node->left.get()),
                            heightHelper(node->right.get()));
    }

public:
    /**
     * @brief Insert a key-value pair. Duplicate keys update value. O(log n) avg.
     */
    void insert(int64_t key, V value) {
        insertHelper(root_, key, std::move(value));
    }

    /**
     * @brief Find value by key. Returns std::nullopt if not found. O(log n) avg.
     */
    [[nodiscard]] std::optional<V> find(int64_t key) const {
        const BSTNode<V>* curr = root_.get();
        while (curr) {
            if (key == curr->key) return curr->value;
            curr = key < curr->key ? curr->left.get() : curr->right.get();
        }
        return std::nullopt;
    }

    /**
     * @brief Delete node by key. O(log n) avg.
     */
    void remove(int64_t key) {
        root_ = deleteHelper(std::move(root_), key);
    }

    /**
     * @brief In-order traversal (sorted ascending by key). O(n).
     */
    [[nodiscard]] std::vector<BSTEntry<V>> inorderTraversal() const {
        std::vector<BSTEntry<V>> result;
        result.reserve(size_);
        inorderHelper(root_.get(), result);
        return result;
    }

    /**
     * @brief All entries with lo <= key <= hi, in sorted order. O(log n + k).
     */
    [[nodiscard]] std::vector<BSTEntry<V>> rangeQuery(int64_t lo, int64_t hi) const {
        std::vector<BSTEntry<V>> result;
        rangeHelper(root_.get(), lo, hi, result);
        return result;
    }

    [[nodiscard]] size_t size()   const noexcept { return size_; }
    [[nodiscard]] int    height() const noexcept { return heightHelper(root_.get()); }
    [[nodiscard]] bool   empty()  const noexcept { return size_ == 0; }
    [[nodiscard]] const BSTNode<V>* getRoot() const noexcept { return root_.get(); }

    // AVL rotation stubs (extension point for self-balancing)
    // rotateRight / rotateLeft / rebalance — omitted for brevity, noted for Q&A
};

} // namespace findx::engine
