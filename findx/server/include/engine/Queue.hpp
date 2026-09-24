#pragma once
/**
 * @file Queue.hpp
 * @brief Circular-buffer backed FIFO Queue for claim verification pipeline.
 *
 * WHY THIS STRUCTURE:
 *   Claims are processed in FIFO order — first submitted, first reviewed.
 *   A Queue is the canonical data structure for FIFO.
 *
 *   CIRCULAR BUFFER vs. LINKED LIST:
 *   - Circular buffer: O(1) enqueue AND dequeue — no per-element allocation.
 *     Array is pre-allocated; head/tail pointers wrap around.
 *   - Naive array: O(n) dequeue (shift all elements left) — unacceptable.
 *   - Linked list: O(1) operations but heap allocation per node, poor cache behavior.
 *
 *   AUTO-RESIZE: When tail reaches head (full), capacity doubles.
 *   Elements are copied to new buffer in [head..tail] order.
 *
 *   COMPLEXITY:
 *     enqueue : O(1) amortized
 *     dequeue : O(1)
 *     peek    : O(1)
 *     Space   : O(n)
 */

#include <vector>
#include <optional>
#include <stdexcept>

namespace findx::engine {

template<typename T>
class Queue {
private:
    std::vector<T> buffer_;
    size_t head_  = 0;
    size_t tail_  = 0;
    size_t count_ = 0;

    void resize() {
        size_t newCap = buffer_.size() * 2;
        std::vector<T> newBuf(newCap);
        for (size_t i = 0; i < count_; ++i) {
            newBuf[i] = std::move(buffer_[(head_ + i) % buffer_.size()]);
        }
        buffer_ = std::move(newBuf);
        head_ = 0;
        tail_ = count_;
    }

public:
    explicit Queue(size_t initialCapacity = 16)
        : buffer_(initialCapacity) {}

    /**
     * @brief Add element to back of queue. O(1) amortized.
     */
    void enqueue(T item) {
        if (count_ == buffer_.size()) resize();
        buffer_[tail_] = std::move(item);
        tail_ = (tail_ + 1) % buffer_.size();
        ++count_;
    }

    /**
     * @brief Remove and return front element. O(1).
     */
    [[nodiscard]] std::optional<T> dequeue() {
        if (count_ == 0) return std::nullopt;
        T item = std::move(buffer_[head_]);
        head_ = (head_ + 1) % buffer_.size();
        --count_;
        return item;
    }

    /**
     * @brief View front element without removing. O(1).
     */
    [[nodiscard]] std::optional<T> peek() const {
        if (count_ == 0) return std::nullopt;
        return buffer_[head_];
    }

    [[nodiscard]] bool   isEmpty() const noexcept { return count_ == 0; }
    [[nodiscard]] size_t size()    const noexcept { return count_; }
    [[nodiscard]] size_t capacity()const noexcept { return buffer_.size(); }

    void clear() { head_ = tail_ = count_ = 0; }

    /** @brief Returns all items in FIFO order (head → tail) for visualizer. */
    [[nodiscard]] std::vector<T> toArray() const {
        std::vector<T> result;
        result.reserve(count_);
        for (size_t i = 0; i < count_; ++i) {
            result.push_back(buffer_[(head_ + i) % buffer_.size()]);
        }
        return result;
    }
};

} // namespace findx::engine
