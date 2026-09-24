#ifndef MERGE_SORT_H
#define MERGE_SORT_H

#include "Item.h"
#include "MaxHeap.h" // For MatchCandidate
#include <vector>
#include <string>
#include <functional>

/**
 * SortCriteria: Enumerates sorting modes for items.
 */
enum class SortCriteria
{
    DATE_NEWEST, // Newest items first (Date descending)
    DATE_OLDEST, // Oldest items first (Date ascending)
    NAME_AZ,     // Alphabetical A-Z
    NAME_ZA,     // Reverse Alphabetical Z-A
    CATEGORY_AZ  // By category
};

/**
 * MergeSort: Manual implementation of the classic Divide-and-Conquer Merge Sort algorithm.
 * Guarantees O(n log n) time complexity across best, average, and worst cases.
 * Space Complexity: O(n) auxiliary space during the merge phase.
 * Stable: preserves the relative order of elements with equal keys.
 */
class MergeSort
{
private:
    /**
     * merge: Merges two sorted subarrays arr[left..mid] and arr[mid+1..right].
     * Time: O(n)
     * Space: O(n)
     */
    template <typename T, typename Comparator>
    static void merge(std::vector<T> &arr, int left, int mid, int right, Comparator comp)
    {
        int n1 = mid - left + 1;
        int n2 = right - mid;

        // Create temporary auxiliary vectors
        std::vector<T> L(n1);
        std::vector<T> R(n2);

        for (int i = 0; i < n1; ++i)
            L[i] = arr[left + i];
        for (int j = 0; j < n2; ++j)
            R[j] = arr[mid + 1 + j];

        int i = 0;    // Initial index of first subarray
        int j = 0;    // Initial index of second subarray
        int k = left; // Initial index of merged subarray

        while (i < n1 && j < n2)
        {
            // comp(a, b) should return true if a should precede b
            if (comp(L[i], R[j]))
            {
                arr[k++] = L[i++];
            }
            else
            {
                arr[k++] = R[j++];
            }
        }

        // Copy remaining elements of L[] if any
        while (i < n1)
        {
            arr[k++] = L[i++];
        }

        // Copy remaining elements of R[] if any
        while (j < n2)
        {
            arr[k++] = R[j++];
        }
    }

    /**
     * sortInternal: Recursive divide-and-conquer function.
     * Recursion depth: log2(n)
     */
    template <typename T, typename Comparator>
    static void sortInternal(std::vector<T> &arr, int left, int right, Comparator comp)
    {
        if (left < right)
        {
            // Avoid overflow: mid = left + (right - left) / 2
            int mid = left + (right - left) / 2;

            sortInternal(arr, left, mid, comp);
            sortInternal(arr, mid + 1, right, comp);
            merge(arr, left, mid, right, comp);
        }
    }

public:
    /**
     * Generic mergeSort entry point accepting any comparator.
     */
    template <typename T, typename Comparator>
    static void sort(std::vector<T> &arr, Comparator comp)
    {
        if (arr.size() <= 1)
            return;
        sortInternal(arr, 0, static_cast<int>(arr.size()) - 1, comp);
    }

    /**
     * sortItems: Sorts a list of Items based on user-selected criteria.
     */
    static void sortItems(std::vector<Item> &items, SortCriteria criteria)
    {
        switch (criteria)
        {
        case SortCriteria::DATE_NEWEST:
            sort(items, [](const Item &a, const Item &b)
                 {
                     return a.date > b.date; // Descending date
                 });
            break;
        case SortCriteria::DATE_OLDEST:
            sort(items, [](const Item &a, const Item &b)
                 {
                     return a.date < b.date; // Ascending date
                 });
            break;
        case SortCriteria::NAME_AZ:
            sort(items, [](const Item &a, const Item &b)
                 {
                     return a.name < b.name; // Alphabetical
                 });
            break;
        case SortCriteria::NAME_ZA:
            sort(items, [](const Item &a, const Item &b)
                 {
                     return a.name > b.name; // Reverse alphabetical
                 });
            break;
        case SortCriteria::CATEGORY_AZ:
            sort(items, [](const Item &a, const Item &b)
                 { return a.category < b.category; });
            break;
        }
    }

    /**
     * sortMatches: Sorts MatchCandidate items by match score (highest score first).
     */
    static void sortMatches(std::vector<MatchCandidate> &matches)
    {
        sort(matches, [](const MatchCandidate &a, const MatchCandidate &b)
             {
                 return a.score > b.score; // Descending score
             });
    }
};

#endif // MERGE_SORT_H
