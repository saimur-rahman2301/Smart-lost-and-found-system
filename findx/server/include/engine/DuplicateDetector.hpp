#pragma once
#include <string>
#include <vector>
#include "HashTable.hpp"
#include "StringMatching.hpp"

namespace findx::engine {

/**
 * WHY THIS STRUCTURE:
 * Combines HashTable (O(1) bucket lookup) + StringMatching (fuzzy comparison):
 * 1. Bucket by {type:category:locationNodeId:date} — O(1) hash lookup
 * 2. Within bucket: run descriptionSimilarity against each candidate
 * 3. Threshold 0.85 -> flag as potential duplicate
 * 
 * This two-level approach avoids O(n×m) full-corpus comparison.
 * Bucket sizes stay small (typically 0-5 items), making this effectively O(k×mn)
 * where k is a small constant.
 */

struct ItemSnapshot {
    std::string id;
    std::string type;
    std::string category;
    std::string locationNodeId;
    std::string date;
    std::string description;
    std::string brand;
};

struct DuplicateCheckResult {
    bool isDuplicate;
    double maxSimilarity;
    std::vector<std::string> candidateIds;
};

class DuplicateDetector {
private:
    HashTable<std::string, std::vector<ItemSnapshot>> buckets_;
    
    std::string bucketKey(const ItemSnapshot& item) const {
        return item.type + ":" + item.category + ":" + item.locationNodeId + ":" + item.date;
    }
    
public:
    void addItem(const ItemSnapshot& item) {
        std::string key = bucketKey(item);
        std::vector<ItemSnapshot> bucket;
        buckets_.get(key, bucket); // returns true if exists
        bucket.push_back(item);
        buckets_.set(key, bucket);
    }
    
    void removeItem(const std::string& itemId, const ItemSnapshot& item) {
        std::string key = bucketKey(item);
        std::vector<ItemSnapshot> bucket;
        if (buckets_.get(key, bucket)) {
            bucket.erase(std::remove_if(bucket.begin(), bucket.end(), 
                [&itemId](const ItemSnapshot& i) { return i.id == itemId; }), bucket.end());
            if (bucket.empty()) {
                buckets_.remove(key);
            } else {
                buckets_.set(key, bucket);
            }
        }
    }
    
    DuplicateCheckResult check(const ItemSnapshot& candidate) const {
        DuplicateCheckResult result{false, 0.0, {}};
        std::string key = bucketKey(candidate);
        std::vector<ItemSnapshot> bucket;
        
        if (buckets_.get(key, bucket)) {
            for (const auto& item : bucket) {
                if (item.id == candidate.id) continue;
                double sim = descriptionSimilarity(candidate.description, item.description);
                if (sim > result.maxSimilarity) {
                    result.maxSimilarity = sim;
                }
                if (sim >= 0.85) {
                    result.isDuplicate = true;
                    result.candidateIds.push_back(item.id);
                }
            }
        }
        return result;
    }
    
    size_t totalBuckets() const {
        return buckets_.size();
    }
    
    size_t totalItems() const {
        size_t count = 0;
        auto entries = buckets_.entries();
        for (const auto& pair : entries) {
            count += pair.second.size();
        }
        return count;
    }
};

} // namespace findx::engine
