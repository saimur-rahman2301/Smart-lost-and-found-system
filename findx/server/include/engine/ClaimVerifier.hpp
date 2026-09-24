#pragma once
#include <string>
#include <algorithm>
#include <cmath>
#include "StringMatching.hpp"

namespace findx::engine {

struct ClaimAnswers {
    std::string hiddenDetail;
    std::string approximateLocation;
    std::string date;
    std::string category;
    std::string additionalEvidence;
};

struct StoredItemDetails {
    std::string hiddenDetail;
    std::string locationNodeId;
    std::string locationName;
    std::string date;
    std::string category;
    std::string description;
};

struct VerificationFactor {
    int awarded;
    int maxPoints;
    bool matched;
};

struct VerificationBreakdown {
    VerificationFactor hiddenDetail;
    VerificationFactor approximateLocation;
    VerificationFactor date;
    VerificationFactor category;
    struct { int awarded; int maxPoints; double similarityScore; } additionalEvidence;
    int total;
    std::string verdict;
};

class ClaimVerifier {
private:
    static int64_t parseDateToDays(const std::string& date) {
        if (date.size() != 10) return 0;
        int y, m, d;
        if (sscanf(date.c_str(), "%d-%d-%d", &y, &m, &d) != 3) return 0;
        return y * 365 + m * 30 + d;
    }
    
    static std::string trimLower(const std::string& str) {
        std::string res = str;
        res.erase(res.begin(), std::find_if(res.begin(), res.end(), [](unsigned char ch) { return !std::isspace(ch); }));
        res.erase(std::find_if(res.rbegin(), res.rend(), [](unsigned char ch) { return !std::isspace(ch); }).base(), res.end());
        std::transform(res.begin(), res.end(), res.begin(), ::tolower);
        return res;
    }

public:
    VerificationBreakdown verify(const ClaimAnswers& answers, const StoredItemDetails& item) const {
        VerificationBreakdown breakdown;
        breakdown.total = 0;
        
        // Hidden Detail (30)
        std::string h1 = trimLower(answers.hiddenDetail);
        std::string h2 = trimLower(item.hiddenDetail);
        breakdown.hiddenDetail.maxPoints = 30;
        if (!h1.empty() && h1 == h2) {
            breakdown.hiddenDetail.awarded = 30;
            breakdown.hiddenDetail.matched = true;
        } else {
            breakdown.hiddenDetail.awarded = 0;
            breakdown.hiddenDetail.matched = false;
        }
        breakdown.total += breakdown.hiddenDetail.awarded;
        
        // Approximate Location (20)
        breakdown.approximateLocation.maxPoints = 20;
        if (levenshtein(trimLower(answers.approximateLocation), trimLower(item.locationName)) <= 3) {
            breakdown.approximateLocation.awarded = 20;
            breakdown.approximateLocation.matched = true;
        } else {
            breakdown.approximateLocation.awarded = 0;
            breakdown.approximateLocation.matched = false;
        }
        breakdown.total += breakdown.approximateLocation.awarded;
        
        // Date (15)
        breakdown.date.maxPoints = 15;
        int64_t d1 = parseDateToDays(answers.date);
        int64_t d2 = parseDateToDays(item.date);
        if (std::abs(static_cast<double>(d1 - d2)) <= 2) {
            breakdown.date.awarded = 15;
            breakdown.date.matched = true;
        } else {
            breakdown.date.awarded = 0;
            breakdown.date.matched = false;
        }
        breakdown.total += breakdown.date.awarded;
        
        // Category (15)
        breakdown.category.maxPoints = 15;
        if (trimLower(answers.category) == trimLower(item.category)) {
            breakdown.category.awarded = 15;
            breakdown.category.matched = true;
        } else {
            breakdown.category.awarded = 0;
            breakdown.category.matched = false;
        }
        breakdown.total += breakdown.category.awarded;
        
        // Additional Evidence (20)
        breakdown.additionalEvidence.maxPoints = 20;
        double sim = descriptionSimilarity(answers.additionalEvidence, item.description);
        breakdown.additionalEvidence.similarityScore = sim;
        breakdown.additionalEvidence.awarded = static_cast<int>(sim * 20);
        breakdown.total += breakdown.additionalEvidence.awarded;
        
        if (breakdown.total >= 70) {
            breakdown.verdict = "LIKELY_LEGITIMATE";
        } else {
            breakdown.verdict = "INSUFFICIENT";
        }
        
        return breakdown;
    }
};

} // namespace findx::engine
