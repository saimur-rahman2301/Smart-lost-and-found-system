#pragma once
/**
 * @file Stack.hpp
 * @brief Linked-list Stack + ActionHistoryManager for undo/redo.
 *
 * WHY THIS STRUCTURE:
 *   The undo/redo system requires LIFO access — the most recent admin action
 *   must be undoable first. A Stack is the canonical LIFO data structure.
 *
 *   LINKED LIST vs. ARRAY:
 *   - Linked list: O(1) push/pop guaranteed; no resize needed; no wasted capacity.
 *   - Array stack: O(1) amortized but occasional O(n) resize; wastes capacity.
 *   For undo stacks (typically < 100 items), linked list is cleaner.
 *
 *   ACTIONHISTORYMANAGER: Dual-stack undo/redo pattern (standard in text editors):
 *   - execute(action) → push to undoStack, clear redoStack (new branch)
 *   - undo()          → pop undoStack → push to redoStack
 *   - redo()          → pop redoStack → push to undoStack
 *
 *   COMPLEXITY:
 *     push / pop / peek : O(1)
 *     Space             : O(n)
 */

#include <memory>
#include <optional>
#include <string>
#include <vector>
#include <chrono>

namespace findx::engine {

// ─── Generic Stack (linked-list backed) ──────────────────────────────────────
template<typename T>
struct StackNode {
    T value;
    std::unique_ptr<StackNode<T>> next;
    explicit StackNode(T v) : value(std::move(v)), next(nullptr) {}
};

template<typename T>
class Stack {
private:
    std::unique_ptr<StackNode<T>> top_;
    size_t size_ = 0;

public:
    /**
     * @brief Push item onto top. O(1).
     */
    void push(T item) {
        auto node = std::make_unique<StackNode<T>>(std::move(item));
        node->next = std::move(top_);
        top_ = std::move(node);
        ++size_;
    }

    /**
     * @brief Pop and return top item. O(1).
     */
    [[nodiscard]] std::optional<T> pop() {
        if (!top_) return std::nullopt;
        T val = std::move(top_->value);
        top_ = std::move(top_->next);
        --size_;
        return val;
    }

    /**
     * @brief View top item without removing. O(1).
     */
    [[nodiscard]] std::optional<T> peek() const {
        if (!top_) return std::nullopt;
        return top_->value;
    }

    [[nodiscard]] bool   isEmpty() const noexcept { return size_ == 0; }
    [[nodiscard]] size_t size()    const noexcept { return size_; }

    void clear() { while (top_) top_ = std::move(top_->next); size_ = 0; }

    /** @brief All items from top to bottom for visualizer. */
    [[nodiscard]] std::vector<T> toArray() const {
        std::vector<T> result;
        result.reserve(size_);
        const StackNode<T>* curr = top_.get();
        while (curr) { result.push_back(curr->value); curr = curr->next.get(); }
        return result;
    }
};

// ─── Action record for undo/redo ─────────────────────────────────────────────
struct Action {
    std::string type;             // e.g., "APPROVE_CLAIM", "REJECT_CLAIM"
    std::string description;      // Human-readable
    std::string targetId;         // ID of affected entity
    std::string targetType;       // e.g., "claim", "item"
    std::string payload;          // JSON string of action data
    std::string inversePayload;   // JSON string for reversal
    std::string timestamp;        // ISO 8601
    std::string actorId;          // User who performed it
};

/**
 * @brief Dual-stack undo/redo manager for admin actions.
 */
class ActionHistoryManager {
private:
    Stack<Action> undoStack_;
    Stack<Action> redoStack_;

public:
    /**
     * @brief Record a new action. Clears redo history (new branch). O(1).
     */
    void execute(Action action) {
        undoStack_.push(std::move(action));
        redoStack_.clear(); // new action invalidates redo history
    }

    /**
     * @brief Undo last action. Moves to redo stack. O(1).
     */
    [[nodiscard]] std::optional<Action> undo() {
        auto action = undoStack_.pop();
        if (action) redoStack_.push(*action);
        return action;
    }

    /**
     * @brief Redo last undone action. Moves back to undo stack. O(1).
     */
    [[nodiscard]] std::optional<Action> redo() {
        auto action = redoStack_.pop();
        if (action) undoStack_.push(*action);
        return action;
    }

    [[nodiscard]] bool canUndo() const noexcept { return !undoStack_.isEmpty(); }
    [[nodiscard]] bool canRedo() const noexcept { return !redoStack_.isEmpty(); }
    [[nodiscard]] size_t undoSize() const noexcept { return undoStack_.size(); }
    [[nodiscard]] size_t redoSize() const noexcept { return redoStack_.size(); }

    [[nodiscard]] std::vector<Action> getUndoStack() const { return undoStack_.toArray(); }
    [[nodiscard]] std::vector<Action> getRedoStack() const { return redoStack_.toArray(); }
};

} // namespace findx::engine
