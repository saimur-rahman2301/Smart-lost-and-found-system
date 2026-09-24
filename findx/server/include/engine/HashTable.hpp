#pragma once
/**
 * @file HashTable.hpp
 * @brief Custom Hash Table with separate chaining and dynamic resizing.
 *
 * WHY THIS STRUCTURE:
 *   FindX requires O(1) average-case lookup for items and users by UUID key.
 *   A hash table achieves this by mapping keys to bucket indices via a hash
 *   function, storing collisions as a chain (vector) within each bucket.
 *
 *   We chose SEPARATE CHAINING over open addressing because:
 *   - Deletion is simple (erase from chain vector)
 *   - Performance degrades gracefully near the resize threshold
 *   - Chain inspection is useful for the visualizer panel
 *
 *   HASH FUNCTION: FNV-1a (Fowler–Noll–Vo) on string keys.
 *     hash = OFFSET_BASIS
 *     for each byte b: hash ^= b; hash *= FNV_PRIME
 *   FNV-1a distributes UUIDs well (low clustering).
 *
 *   RESIZE POLICY:
 *     Load factor > 0.75 → double capacity (amortized O(1) per insert)
 *     Load factor < 0.20 → halve capacity (minimum capacity = 8)
 *
 *   COMPLEXITY:
 *     get / set / delete : O(1) average, O(n) worst (all keys collide)
 *     resize             : O(n) — amortized O(1) per insert
 *     Space              : O(n + capacity)
 */

#include <vector>
#include <string>
#include <stdexcept>
#include <functional>
#include <optional>
#include <cstdint>

namespace findx::engine {

// ─── Internal bucket entry ────────────────────────────────────────────────────
template<typename K, typename V>
struct HashEntry {
    K key;
    V value;
    HashEntry(K k, V v) : key(std::move(k)), value(std::move(v)) {}
};

// ─── Visualizer state snapshot ───────────────────────────────────────────────
template<typename K, typename V>
struct HashTableState {
    std::vector<std::vector<std::pair<K,V>>> buckets;
    double loadFactor;
    size_t size;
    size_t capacity;
    size_t collisionCount; // buckets with chain length > 1
};

/**
 * @brief Thread-unsafe (single-threaded), generic hash table.
 * @tparam K Key type (must be convertible to std::string via std::to_string or be std::string)
 * @tparam V Value type (must be copyable/movable)
 */
template<typename K, typename V>
class HashTable {
public:
    static constexpr size_t INITIAL_CAPACITY = 16;
    static constexpr double LOAD_UPPER       = 0.75;
    static constexpr double LOAD_LOWER       = 0.20;
    static constexpr size_t MIN_CAPACITY     = 8;

private:
    std::vector<std::vector<HashEntry<K,V>>> buckets_;
    size_t size_     = 0;
    size_t capacity_ = INITIAL_CAPACITY;

    // ── FNV-1a hash ──────────────────────────────────────────────────────────
    [[nodiscard]] size_t fnv1a(const std::string& s) const noexcept {
        constexpr uint64_t FNV_OFFSET = 14695981039346656037ULL;
        constexpr uint64_t FNV_PRIME  = 1099511628211ULL;
        uint64_t hash = FNV_OFFSET;
        for (unsigned char c : s) {
            hash ^= static_cast<uint64_t>(c);
            hash *= FNV_PRIME;
        }
        return static_cast<size_t>(hash);
    }

    [[nodiscard]] size_t hashKey(const K& key) const noexcept {
        if constexpr (std::is_same_v<K, std::string>) {
            return fnv1a(key) % capacity_;
        } else {
            return fnv1a(std::to_string(key)) % capacity_;
        }
    }

    void resize(size_t newCapacity) {
        if (newCapacity < MIN_CAPACITY) newCapacity = MIN_CAPACITY;
        std::vector<std::vector<HashEntry<K,V>>> old = std::move(buckets_);
        capacity_ = newCapacity;
        buckets_.assign(capacity_, {});
        size_ = 0;
        for (auto& chain : old) {
            for (auto& entry : chain) {
                set(std::move(entry.key), std::move(entry.value));
            }
        }
    }

public:
    explicit HashTable(size_t initialCapacity = INITIAL_CAPACITY)
        : capacity_(initialCapacity)
    {
        buckets_.resize(capacity_);
    }

    /**
     * @brief Insert or update key-value pair. O(1) amortized.
     */
    void set(K key, V value) {
        size_t idx = hashKey(key);
        for (auto& entry : buckets_[idx]) {
            if (entry.key == key) {
                entry.value = std::move(value);
                return;
            }
        }
        buckets_[idx].emplace_back(std::move(key), std::move(value));
        ++size_;
        if (loadFactor() > LOAD_UPPER) {
            resize(capacity_ * 2);
        }
    }

    /**
     * @brief Retrieve value by key. Returns std::nullopt if not found. O(1) avg.
     */
    [[nodiscard]] std::optional<V> get(const K& key) const {
        size_t idx = hashKey(key);
        for (const auto& entry : buckets_[idx]) {
            if (entry.key == key) return entry.value;
        }
        return std::nullopt;
    }

    /**
     * @brief Check if key exists. O(1) avg.
     */
    [[nodiscard]] bool has(const K& key) const {
        size_t idx = hashKey(key);
        for (const auto& entry : buckets_[idx]) {
            if (entry.key == key) return true;
        }
        return false;
    }

    /**
     * @brief Remove key. Returns true if found and removed. O(1) avg.
     */
    bool remove(const K& key) {
        size_t idx = hashKey(key);
        auto& chain = buckets_[idx];
        for (auto it = chain.begin(); it != chain.end(); ++it) {
            if (it->key == key) {
                chain.erase(it);
                --size_;
                if (size_ > 0 && loadFactor() < LOAD_LOWER) {
                    resize(capacity_ / 2);
                }
                return true;
            }
        }
        return false;
    }

    void clear() {
        for (auto& b : buckets_) b.clear();
        size_ = 0;
    }

    [[nodiscard]] size_t size()     const noexcept { return size_; }
    [[nodiscard]] size_t capacity() const noexcept { return capacity_; }
    [[nodiscard]] double loadFactor() const noexcept {
        return capacity_ > 0 ? static_cast<double>(size_) / capacity_ : 0.0;
    }

    /** @brief All key-value pairs (unordered). */
    [[nodiscard]] std::vector<std::pair<K,V>> entries() const {
        std::vector<std::pair<K,V>> result;
        result.reserve(size_);
        for (const auto& chain : buckets_) {
            for (const auto& entry : chain) {
                result.emplace_back(entry.key, entry.value);
            }
        }
        return result;
    }

    /** @brief Snapshot for DSA Visualizer panel. */
    [[nodiscard]] HashTableState<K,V> getState() const {
        HashTableState<K,V> state;
        state.size     = size_;
        state.capacity = capacity_;
        state.loadFactor = loadFactor();
        state.collisionCount = 0;
        state.buckets.resize(capacity_);
        for (size_t i = 0; i < capacity_; ++i) {
            for (const auto& e : buckets_[i]) {
                state.buckets[i].emplace_back(e.key, e.value);
            }
            if (buckets_[i].size() > 1) ++state.collisionCount;
        }
        return state;
    }
};

} // namespace findx::engine
