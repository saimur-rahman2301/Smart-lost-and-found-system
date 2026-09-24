#pragma once
/**
 * @file MaxHeap.hpp
 * @brief Array-backed Max-Heap for top-K match ranking.
 *
 * WHY THIS STRUCTURE:
 *   The Smart Match Engine scores N found items against a lost item. We need
 *   only the TOP-K (default 5) highest-scoring matches. Options:
 *
 *     Sort all scores : O(N log N) — does unnecessary work for K << N
 *     Max-Heap top-K  : Build O(N) + K×extractMax O(K log N) = O(N + K log N) ✅
 *
 *   Additionally:
 *   - peek() in O(1) — instantly see the best match
 *   - buildHeap(array) in O(N) using Floyd's method (vs O(N log N) for N inserts)
 *   - Claims with high verification scores are priority-inserted for admin review
 *
 *   IMPLEMENTATION: 1-based indexing on a std::vector.
 *     parent(i) = i/2
 *     leftChild(i) = 2i
 *     rightChild(i) = 2i+1
 *   Index 0 is left as a sentinel null (exposed to visualizer).
 *
 *   COMPLEXITY:
 *     insert     : O(log n) — sift up
 *     extractMax : O(log n) — sift down
 *     peek       : O(1)
 *     buildHeap  : O(n) — Floyd's algorithm
 *     Space      : O(n)
 */

#include <vector>
#include <stdexcept>
#include <optional>
#include <functional>
#include <algorithm>

namespace findx::engine {

template<typename T>
struct HeapEntry {
    double score;
    T data;

    HeapEntry(double s, T d) : score(s), data(std::move(d)) {}
    bool operator<(const HeapEntry& o) const { return score < o.score; }
    bool operator>(const HeapEntry& o) const { return score > o.score; }
};

template<typename T>
class MaxHeap {
private:
    // heap_[0] = unused sentinel; heap_[1..size_] = valid entries (1-based)
    std::vector<HeapEntry<T>> heap_;
    size_t size_ = 0;

    [[nodiscard]] size_t parent(size_t i) const noexcept { return i / 2; }
    [[nodiscard]] size_t left(size_t i)   const noexcept { return 2 * i; }
    [[nodiscard]] size_t right(size_t i)  const noexcept { return 2 * i + 1; }

    void siftUp(size_t i) {
        while (i > 1 && heap_[parent(i)].score < heap_[i].score) {
            std::swap(heap_[i], heap_[parent(i)]);
            i = parent(i);
        }
    }

    void siftDown(size_t i) {
        size_t largest = i;
        if (left(i) <= size_ && heap_[left(i)].score > heap_[largest].score)
            largest = left(i);
        if (right(i) <= size_ && heap_[right(i)].score > heap_[largest].score)
            largest = right(i);
        if (largest != i) {
            std::swap(heap_[i], heap_[largest]);
            siftDown(largest);
        }
    }

public:
    MaxHeap() {
        // heap_[0] = dummy placeholder (never used in calculations)
        heap_.emplace_back(0.0, T{});
    }

    /**
     * @brief Insert element with score. O(log n).
     */
    void insert(double score, T data) {
        heap_.emplace_back(score, std::move(data));
        ++size_;
        siftUp(size_);
    }

    /**
     * @brief Remove and return the maximum element. O(log n).
     */
    [[nodiscard]] std::optional<HeapEntry<T>> extractMax() {
        if (size_ == 0) return std::nullopt;
        HeapEntry<T> maxEntry = std::move(heap_[1]);
        heap_[1] = std::move(heap_[size_]);
        heap_.pop_back();
        --size_;
        if (size_ > 0) siftDown(1);
        return maxEntry;
    }

    /**
     * @brief View max element without removing. O(1).
     */
    [[nodiscard]] std::optional<HeapEntry<T>> peek() const {
        if (size_ == 0) return std::nullopt;
        return heap_[1];
    }

    /**
     * @brief Build heap from existing array in O(n) using Floyd's method.
     *   More efficient than inserting n items one-by-one (O(n log n)).
     */
    void buildHeap(std::vector<std::pair<double,T>> items) {
        heap_.clear();
        heap_.emplace_back(0.0, T{}); // sentinel
        for (auto& [score, data] : items) {
            heap_.emplace_back(score, std::move(data));
        }
        size_ = heap_.size() - 1;
        // Floyd's algorithm: sift down from last non-leaf to root
        for (int i = static_cast<int>(size_) / 2; i >= 1; --i) {
            siftDown(static_cast<size_t>(i));
        }
    }

    /**
     * @brief Extract all elements in descending order (non-destructive copy).
     *   Creates a copy of the heap to sort without modifying original.
     */
    [[nodiscard]] std::vector<HeapEntry<T>> toSortedArray() const {
        MaxHeap<T> copy = *this; // copy constructor
        std::vector<HeapEntry<T>> sorted;
        sorted.reserve(size_);
        while (auto entry = copy.extractMax()) {
            sorted.push_back(std::move(*entry));
        }
        return sorted;
    }

    [[nodiscard]] size_t size()  const noexcept { return size_; }
    [[nodiscard]] bool isEmpty() const noexcept { return size_ == 0; }

    /**
     * @brief Returns heap array for visualizer (index 0 = null sentinel).
     *   Visualizer shows heap_[1..n] as the real heap.
     */
    [[nodiscard]] const std::vector<HeapEntry<T>>& getHeapArray() const noexcept {
        return heap_;
    }
};

} // namespace findx::engine
