#pragma once
#include <vector>
#include <memory>
#include <functional>

namespace findx::engine {

/**
 * WHY THIS STRUCTURE:
 * Each item's status history is a sequence of transitions traversable
 * in BOTH directions: forward (oldest->newest for timeline) and backward
 * (newest->oldest for admin review). A doubly linked list provides:
 *   - O(1) append (newest status at tail)
 *   - O(n) forward + backward traversal
 *   - Bidirectional iteration for the status timeline component
 * Alternative: array also traverses both ways, but linked list correctly
 * models the chain-of-transitions concept and is required for the DSA demo.
 */

template<typename T>
struct DLLNode {
    T value;
    DLLNode<T>* prev;
    DLLNode<T>* next;
    explicit DLLNode(T v) : value(std::move(v)), prev(nullptr), next(nullptr) {}
};

template<typename T>
class DoublyLinkedList {
private:
    DLLNode<T>* head_ = nullptr;
    DLLNode<T>* tail_ = nullptr;
    size_t size_ = 0;
    std::vector<std::unique_ptr<DLLNode<T>>> nodes_;

public:
    ~DoublyLinkedList() = default;
    
    DLLNode<T>* append(T value) {
        auto node = std::make_unique<DLLNode<T>>(std::move(value));
        DLLNode<T>* ptr = node.get();
        nodes_.push_back(std::move(node));
        if (!tail_) {
            head_ = tail_ = ptr;
        } else {
            tail_->next = ptr;
            ptr->prev = tail_;
            tail_ = ptr;
        }
        size_++;
        return ptr;
    }

    DLLNode<T>* prepend(T value) {
        auto node = std::make_unique<DLLNode<T>>(std::move(value));
        DLLNode<T>* ptr = node.get();
        nodes_.push_back(std::move(node));
        if (!head_) {
            head_ = tail_ = ptr;
        } else {
            head_->prev = ptr;
            ptr->next = head_;
            head_ = ptr;
        }
        size_++;
        return ptr;
    }

    DLLNode<T>* insertAfter(DLLNode<T>* node, T value) {
        if (!node) return nullptr;
        auto new_node = std::make_unique<DLLNode<T>>(std::move(value));
        DLLNode<T>* ptr = new_node.get();
        nodes_.push_back(std::move(new_node));
        
        ptr->prev = node;
        ptr->next = node->next;
        if (node->next) node->next->prev = ptr;
        else tail_ = ptr;
        node->next = ptr;
        
        size_++;
        return ptr;
    }

    void remove(DLLNode<T>* node) {
        if (!node) return;
        if (node->prev) node->prev->next = node->next;
        else head_ = node->next;
        if (node->next) node->next->prev = node->prev;
        else tail_ = node->prev;
        size_--;
    }

    DLLNode<T>* find(std::function<bool(const T&)> predicate) {
        DLLNode<T>* curr = head_;
        while (curr) {
            if (predicate(curr->value)) return curr;
            curr = curr->next;
        }
        return nullptr;
    }

    std::vector<T> traverseForward() const {
        std::vector<T> res;
        res.reserve(size_);
        DLLNode<T>* curr = head_;
        while (curr) {
            res.push_back(curr->value);
            curr = curr->next;
        }
        return res;
    }

    std::vector<T> traverseBackward() const {
        std::vector<T> res;
        res.reserve(size_);
        DLLNode<T>* curr = tail_;
        while (curr) {
            res.push_back(curr->value);
            curr = curr->prev;
        }
        return res;
    }

    std::vector<T> toArray() const { return traverseForward(); }
    
    size_t size() const noexcept { return size_; }
    bool empty() const noexcept { return size_ == 0; }
    DLLNode<T>* getHead() const noexcept { return head_; }
    DLLNode<T>* getTail() const noexcept { return tail_; }
};

} // namespace findx::engine
