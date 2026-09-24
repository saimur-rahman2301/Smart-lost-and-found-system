#pragma once
/**
 * @file Trie.hpp
 * @brief Prefix Tree (Trie) for autocomplete and keyword inverted index.
 *
 * WHY THIS STRUCTURE:
 *   FindX needs live autocomplete — as the user types, return all items whose
 *   title/description contains words starting with the typed prefix.
 *
 *   Options compared:
 *     Linear scan         O(n×L)      — too slow for 100+ items at keypress
 *     Sorted array + BS   O(log n + k) — no natural prefix grouping
 *     Hash Map (exact)    O(L)        — cannot enumerate all prefix matches
 *     TRIE                O(P + k)    — optimal: P=prefix length, k=results ✅
 *
 *   Each terminal node stores a vector of item IDs, so a single prefix lookup
 *   returns all associated items without a secondary scan.
 *
 *   NODE CHILDREN: std::unordered_map<char,TrieNode*> instead of char[26]
 *   to support digits, spaces, hyphens, and Unicode-safe ASCII beyond a-z.
 *
 *   COMPLEXITY:
 *     insert     : O(L) where L = word length
 *     search     : O(L)
 *     startsWith : O(P)
 *     getAllWordsWithPrefix : O(P + k×L_avg) — DFS from prefix node
 *     Space      : O(A × L × N) where A=alphabet, L=avg word, N=words
 */

#include <string>
#include <vector>
#include <unordered_map>
#include <functional>
#include <memory>
#include <algorithm>
#include <cctype>

namespace findx::engine {

struct TrieNode {
    std::unordered_map<char, std::unique_ptr<TrieNode>> children;
    bool isEndOfWord = false;
    std::vector<std::string> itemIds; // item IDs stored at this terminal
};

struct TrieCompletion {
    std::string word;
    std::vector<std::string> itemIds;
};

class Trie {
private:
    std::unique_ptr<TrieNode> root_;
    size_t wordCount_  = 0;
    size_t nodeCount_  = 1; // root counts

    // Normalize: lowercase, keep alphanumeric and spaces
    static std::string normalize(const std::string& word) {
        std::string out;
        out.reserve(word.size());
        for (char c : word) {
            if (std::isalnum(static_cast<unsigned char>(c)) || c == ' ' || c == '-') {
                out += static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
            }
        }
        return out;
    }

    // DFS collect all completions from a given node
    void dfs(TrieNode* node, const std::string& current,
             std::vector<TrieCompletion>& results, size_t limit) const {
        if (results.size() >= limit) return;
        if (node->isEndOfWord) {
            results.push_back({current, node->itemIds});
        }
        for (const auto& [ch, child] : node->children) {
            if (results.size() >= limit) break;
            dfs(child.get(), current + ch, results, limit);
        }
    }

public:
    Trie() : root_(std::make_unique<TrieNode>()) {}

    /**
     * @brief Insert a word with an associated item ID.
     *   Normalizes to lowercase. Creates nodes as needed. O(L).
     */
    void insert(const std::string& word, const std::string& itemId) {
        std::string norm = normalize(word);
        if (norm.empty()) return;

        TrieNode* curr = root_.get();
        for (char c : norm) {
            if (!curr->children.count(c)) {
                curr->children[c] = std::make_unique<TrieNode>();
                ++nodeCount_;
            }
            curr = curr->children[c].get();
        }
        if (!curr->isEndOfWord) {
            curr->isEndOfWord = true;
            ++wordCount_;
        }
        // Avoid duplicate item IDs at this node
        if (std::find(curr->itemIds.begin(), curr->itemIds.end(), itemId)
            == curr->itemIds.end()) {
            curr->itemIds.push_back(itemId);
        }
    }

    /**
     * @brief Exact word search. O(L).
     * @return true if the exact word was inserted.
     */
    [[nodiscard]] bool search(const std::string& word) const {
        std::string norm = normalize(word);
        const TrieNode* curr = root_.get();
        for (char c : norm) {
            auto it = curr->children.find(c);
            if (it == curr->children.end()) return false;
            curr = it->second.get();
        }
        return curr->isEndOfWord;
    }

    /**
     * @brief Check if any word starts with the given prefix. O(P).
     */
    [[nodiscard]] bool startsWith(const std::string& prefix) const {
        std::string norm = normalize(prefix);
        const TrieNode* curr = root_.get();
        for (char c : norm) {
            auto it = curr->children.find(c);
            if (it == curr->children.end()) return false;
            curr = it->second.get();
        }
        return true;
    }

    /**
     * @brief DFS from prefix node, collect up to `limit` completions. O(P + k×L).
     * @return Vector of {word, itemIds} completions.
     */
    [[nodiscard]] std::vector<TrieCompletion>
    getAllWordsWithPrefix(const std::string& prefix, size_t limit = 10) const {
        std::string norm = normalize(prefix);
        std::vector<TrieCompletion> results;
        const TrieNode* curr = root_.get();
        for (char c : norm) {
            auto it = curr->children.find(c);
            if (it == curr->children.end()) return results;
            curr = it->second.get();
        }
        // DFS from here — but we need non-const for dfs signature; use const cast carefully
        dfs(const_cast<TrieNode*>(curr), norm, results, limit);
        return results;
    }

    /**
     * @brief Remove an item ID from a word's terminal node.
     *   Does NOT prune nodes (keeps structure for future inserts).
     */
    void removeItemId(const std::string& word, const std::string& itemId) {
        std::string norm = normalize(word);
        TrieNode* curr = root_.get();
        for (char c : norm) {
            auto it = curr->children.find(c);
            if (it == curr->children.end()) return;
            curr = it->second.get();
        }
        auto& ids = curr->itemIds;
        ids.erase(std::remove(ids.begin(), ids.end(), itemId), ids.end());
    }

    /** @brief Insert all whitespace-tokenized words from a text. */
    void insertText(const std::string& text, const std::string& itemId) {
        std::string word;
        for (char c : text + ' ') {
            if (c == ' ' || c == '\t' || c == '\n') {
                if (!word.empty()) { insert(word, itemId); word.clear(); }
            } else {
                word += c;
            }
        }
    }

    [[nodiscard]] size_t wordCount() const noexcept { return wordCount_; }
    [[nodiscard]] size_t nodeCount() const noexcept { return nodeCount_; }
    [[nodiscard]] const TrieNode* getRoot() const noexcept { return root_.get(); }
};

} // namespace findx::engine
