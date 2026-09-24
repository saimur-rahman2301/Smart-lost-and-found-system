#pragma once
#include <vector>
#include <functional>
#include <algorithm>

namespace findx::engine {

/**
 * WHY THIS STRUCTURE:
 * FindX sorts search results and match scores. No single algorithm is
 * optimal for all dataset sizes:
 * 
 * Algorithm    | Best    | Avg      | Worst    | Stable | Space   | When
 * -------------|---------|----------|----------|--------|---------|---------
 * Insertion    | O(n)    | O(n^2)   | O(n^2)   | YES    | O(1)    | n < 20
 * Merge Sort   | O(nlogn)| O(nlogn) | O(nlogn) | YES    | O(n)    | 20<=n<1000
 * Quick Sort   | O(nlogn)| O(nlogn) | O(n^2)   | NO     | O(logn) | n >= 1000
 * 
 * Thresholds follow Python's Timsort philosophy:
 * - Insertion sort: tiny constant factor, excellent cache behavior, O(n) on nearly-sorted
 * - Merge sort: stable, predictable, used for mid-size where stability matters
 * - Quick sort: lowest constant factor, O(log n) stack space vs merge's O(n)
 */

template<typename T>
std::vector<T> insertionSort(std::vector<T> arr, std::function<bool(const T&, const T&)> less) {
    for (size_t i = 1; i < arr.size(); ++i) {
        T key = std::move(arr[i]);
        int j = static_cast<int>(i) - 1;
        while (j >= 0 && less(key, arr[j])) {
            arr[j + 1] = std::move(arr[j]);
            j--;
        }
        arr[j + 1] = std::move(key);
    }
    return arr;
}

template<typename T>
void mergeSortHelper(std::vector<T>& arr, std::vector<T>& temp, int left, int right, std::function<bool(const T&, const T&)> less) {
    if (left >= right) return;
    int mid = left + (right - left) / 2;
    mergeSortHelper(arr, temp, left, mid, less);
    mergeSortHelper(arr, temp, mid + 1, right, less);
    
    int i = left, j = mid + 1, k = left;
    while (i <= mid && j <= right) {
        if (!less(arr[j], arr[i])) {
            temp[k++] = std::move(arr[i++]);
        } else {
            temp[k++] = std::move(arr[j++]);
        }
    }
    while (i <= mid) temp[k++] = std::move(arr[i++]);
    while (j <= right) temp[k++] = std::move(arr[j++]);
    
    for (int p = left; p <= right; ++p) {
        arr[p] = std::move(temp[p]);
    }
}

template<typename T>
std::vector<T> mergeSort(std::vector<T> arr, std::function<bool(const T&, const T&)> less) {
    if (arr.size() <= 1) return arr;
    std::vector<T> temp(arr.size());
    mergeSortHelper(arr, temp, 0, static_cast<int>(arr.size() - 1), less);
    return arr;
}

template<typename T>
void quickSortHelper(std::vector<T>& arr, int low, int high, std::function<bool(const T&, const T&)> less) {
    if (low < high) {
        T pivot = arr[high];
        int i = low - 1;
        for (int j = low; j < high; ++j) {
            if (less(arr[j], pivot)) {
                i++;
                std::swap(arr[i], arr[j]);
            }
        }
        std::swap(arr[i + 1], arr[high]);
        int pi = i + 1;
        
        quickSortHelper(arr, low, pi - 1, less);
        quickSortHelper(arr, pi + 1, high, less);
    }
}

template<typename T>
std::vector<T> quickSort(std::vector<T> arr, std::function<bool(const T&, const T&)> less) {
    if (arr.size() <= 1) return arr;
    quickSortHelper(arr, 0, static_cast<int>(arr.size() - 1), less);
    return arr;
}

template<typename T>
std::vector<T> hybridSort(std::vector<T> arr, std::function<bool(const T&, const T&)> less) {
    if (arr.size() < 20) {
        return insertionSort(std::move(arr), less);
    } else if (arr.size() < 1000) {
        return mergeSort(std::move(arr), less);
    } else {
        return quickSort(std::move(arr), less);
    }
}

} // namespace findx::engine
