#pragma once
#include <string>
#include <vector>
#include <cmath>
#include <algorithm>
#include "Graph.hpp"
#include "StringMatching.hpp"
#include "MaxHeap.hpp"

namespace findx::engine {

struct MatchFactor {
    double score;
    int weight;
    double contribution;
};

struct MatchBreakdown {
    MatchFactor category;
    MatchFactor brand;
    MatchFactor location;
    MatchFactor date;
    MatchFactor description;
    double total;
};

struct ItemForMatching {
    std::string id;
    std::string type;
    std::string category;
    std::string brand;
    std::string locationNodeId;
    std::string date;
    std::string description;
};

struct MatchCandidate {
    std::string lostItemId;
    std::string foundItemId;
    double score;
    MatchBreakdown breakdown;
    
    bool operator<(const MatchCandidate& other) const {
        return score < other.score;
    }
};

class MatchEngine {
private:
    const Graph* graph_;
    double maxDistance_;
    
    static int64_t parseDateToDays(const std::string& date) {
        if (date.size() != 10) return 0;
        int y, m, d;
        if (sscanf(date.c_str(), "%d-%d-%d", &y, &m, &d) != 3) return 0;
        // Approximation for differences
        return y * 365 + m * 30 + d;
    }
    
public:
    explicit MatchEngine(const Graph& graph) : graph_(&graph) {
        maxDistance_ = graph.getMaxDistance();
        if (maxDistance_ == 0) maxDistance_ = 1000.0;
    }
    
    MatchBreakdown computeScore(const ItemForMatching& lost, const ItemForMatching& found) const {
        MatchBreakdown breakdown;
        
        // Category
        std::string c1 = lost.category, c2 = found.category;
        std::transform(c1.begin(), c1.end(), c1.begin(), ::tolower);
        std::transform(c2.begin(), c2.end(), c2.begin(), ::tolower);
        breakdown.category.score = (c1 == c2) ? 1.0 : 0.0;
        breakdown.category.weight = 25;
        breakdown.category.contribution = breakdown.category.score * 25;
        
        // Brand
        breakdown.brand.score = brandSimilarity(lost.brand, found.brand);
        breakdown.brand.weight = 20;
        breakdown.brand.contribution = breakdown.brand.score * 20;
        
        // Location
        if (lost.locationNodeId == found.locationNodeId) {
            breakdown.location.score = 1.0;
        } else {
            double dist = graph_->getDistanceBetween(lost.locationNodeId, found.locationNodeId);
            if (dist == std::numeric_limits<double>::infinity()) {
                breakdown.location.score = 0.0;
            } else {
                breakdown.location.score = std::max(0.0, 1.0 - (dist / maxDistance_));
            }
        }
        breakdown.location.weight = 20;
        breakdown.location.contribution = breakdown.location.score * 20;
        
        // Date
        int64_t d1 = parseDateToDays(lost.date);
        int64_t d2 = parseDateToDays(found.date);
        double diff = std::abs(static_cast<double>(d1 - d2));
        breakdown.date.score = std::max(0.0, 1.0 - (diff / 7.0));
        breakdown.date.weight = 15;
        breakdown.date.contribution = breakdown.date.score * 15;
        
        // Description
        breakdown.description.score = descriptionSimilarity(lost.description, found.description);
        breakdown.description.weight = 20;
        breakdown.description.contribution = breakdown.description.score * 20;
        
        breakdown.total = breakdown.category.contribution + breakdown.brand.contribution + 
                          breakdown.location.contribution + breakdown.date.contribution + 
                          breakdown.description.contribution;
        
        return breakdown;
    }
    
    std::vector<MatchCandidate> findTopMatches(const ItemForMatching& lostItem, const std::vector<ItemForMatching>& foundItems, size_t topK = 5) const {
        MaxHeap<MatchCandidate> heap;
        for (const auto& found : foundItems) {
            auto breakdown = computeScore(lostItem, found);
            MatchCandidate mc{lostItem.id, found.id, breakdown.total, breakdown};
            heap.insert(mc);
        }
        
        std::vector<MatchCandidate> result;
        while (!heap.isEmpty() && result.size() < topK) {
            result.push_back(heap.extractMax());
        }
        return result;
    }
    
    std::vector<MatchCandidate> findTopMatchesForFound(const ItemForMatching& foundItem, const std::vector<ItemForMatching>& lostItems, size_t topK = 5) const {
        MaxHeap<MatchCandidate> heap;
        for (const auto& lost : lostItems) {
            auto breakdown = computeScore(lost, foundItem);
            MatchCandidate mc{lost.id, foundItem.id, breakdown.total, breakdown};
            heap.insert(mc);
        }
        
        std::vector<MatchCandidate> result;
        while (!heap.isEmpty() && result.size() < topK) {
            result.push_back(heap.extractMax());
        }
        return result;
    }
};

} // namespace findx::engine
