#ifndef MAX_HEAP_H
#define MAX_HEAP_H

#include "Item.h"
#include <vector>
#include <string>
#include <iostream>
#include <iomanip>
#include <stdexcept>

/**
 * MatchCandidate: Represents a match result between a lost item and a found item.
 * Includes the candidate found item, computed match score (0-100),
 * qualitative category, and point breakdown explanations.
 */
struct MatchCandidate
{
    Item item;                          // The candidate found item
    int score;                          // 0 - 100
    std::string categoryLabel;          // "Very Strong Match", "Strong Match", etc.
    std::vector<std::string> breakdown; // Audit trail of points awarded

    MatchCandidate() : score(0) {}

    MatchCandidate(const Item &it, int sc, const std::string &label, const std::vector<std::string> &bd = {})
        : item(it), score(sc), categoryLabel(label), breakdown(bd) {}

    // Comparison operator for heap prioritization
    bool operator<(const MatchCandidate &other) const
    {
        return score < other.score;
    }

    bool operator>(const MatchCandidate &other) const
    {
        return score > other.score;
    }
};

/**
 * MaxHeap: Custom Priority Queue implemented as a complete binary tree over a dynamic array.
 * Guarantees that the highest match score is always at the root (index 0).
 */
class MaxHeap
{
private:
    std::vector<MatchCandidate> heap;

    // Helper: Index formulas for zero-indexed array heap
    int parent(int i) const { return (i - 1) / 2; }
    int leftChild(int i) const { return (2 * i) + 1; }
    int rightChild(int i) const { return (2 * i) + 2; }

    /**
     * heapifyUp (Bubble Up):
     * Restores max-heap invariant after insertion by swapping candidate with its parent
     * while candidate's score > parent's score.
     * Time Complexity: O(log n)
     */
    void heapifyUp(int index)
    {
        while (index > 0 && heap[index].score > heap[parent(index)].score)
        {
            std::swap(heap[index], heap[parent(index)]);
            index = parent(index);
        }
    }

    /**
     * heapifyDown (Bubble Down / Sift Down):
     * Restores max-heap invariant after root extraction by swapping parent
     * with the larger of its two children until invariant is satisfied.
     * Time Complexity: O(log n)
     */
    void heapifyDown(int index)
    {
        int maxIndex = index;
        int size = static_cast<int>(heap.size());

        while (true)
        {
            int left = leftChild(index);
            int right = rightChild(index);

            if (left < size && heap[left].score > heap[maxIndex].score)
            {
                maxIndex = left;
            }
            if (right < size && heap[right].score > heap[maxIndex].score)
            {
                maxIndex = right;
            }

            if (index != maxIndex)
            {
                std::swap(heap[index], heap[maxIndex]);
                index = maxIndex;
            }
            else
            {
                break;
            }
        }
    }

public:
    MaxHeap() = default;

    /**
     * insert: Inserts a match candidate into the heap.
     * Time Complexity: O(log n)
     * Space: O(1) auxiliary
     */
    void insert(const MatchCandidate &candidate)
    {
        heap.push_back(candidate);
        heapifyUp(static_cast<int>(heap.size()) - 1);
    }

    /**
     * peekMax: Returns the highest-scoring candidate without removal.
     * Time Complexity: O(1)
     */
    MatchCandidate peekMax() const
    {
        if (heap.empty())
        {
            throw std::runtime_error("Heap is empty!");
        }
        return heap[0];
    }

    /**
     * extractMax: Removes and returns the highest-scoring match candidate.
     * Time Complexity: O(log n)
     */
    MatchCandidate extractMax()
    {
        if (heap.empty())
        {
            throw std::runtime_error("Heap is empty!");
        }

        MatchCandidate maxItem = heap[0];
        heap[0] = heap.back();
        heap.pop_back();

        if (!heap.empty())
        {
            heapifyDown(0);
        }

        return maxItem;
    }

    /**
     * getRankedMatches: Extracts all candidates in strictly descending order of score.
     * Time Complexity: O(n log n)
     */
    std::vector<MatchCandidate> getRankedMatches()
    {
        std::vector<MatchCandidate> ranked;
        ranked.reserve(heap.size());

        while (!empty())
        {
            ranked.push_back(extractMax());
        }

        return ranked;
    }

    size_t size() const { return heap.size(); }
    bool empty() const { return heap.empty(); }

    void clear() { heap.clear(); }
};

#endif // MAX_HEAP_H
