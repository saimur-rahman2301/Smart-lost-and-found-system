#ifndef MATCH_ENGINE_H
#define MATCH_ENGINE_H

#include "Item.h"
#include "MaxHeap.h"
#include "StringMatcher.h"
#include <string>
#include <vector>
#include <cmath>
#include <cstdlib>
#include <iostream>

/**
 * MatchEngine: Rule-based 100-Point Matching Engine.
 *
 * NOTE FOR ACADEMIC VIVA:
 * This is a transparent, deterministic rule-based matching algorithm,
 * NOT an AI prediction model or black-box neural network.
 *
 * 100-Point Scoring Breakdown:
 *   1. Same Category:        +20 pts
 *   2. Same/Similar Name:    +20 pts
 *   3. Same Brand:           +15 pts
 *   4. Same Color:           +10 pts
 *   5. Same Location:        +20 pts
 *   6. Similar Keywords:     +10 pts
 *   7. Close Date:           +05 pts
 *   --------------------------------
 *   TOTAL MAXIMUM:           100 pts
 *
 * Match Classification Tiers:
 *   90 - 100% -> Very Strong Match
 *   75 - 89%  -> Strong Match
 *   60 - 74%  -> Possible Match
 *   Below 60% -> Low Match
 */
class MatchEngine
{
public:
    /**
     * classifyScore: Categorizes numerical percentage into university report tiers.
     */
    static std::string classifyScore(int score)
    {
        if (score >= 90)
            return "Very Strong Match";
        if (score >= 75)
            return "Strong Match";
        if (score >= 60)
            return "Possible Match";
        return "Low Match";
    }

    /**
     * computeDateDiffDays: Simple parsing for "YYYY-MM-DD" dates to calculate day difference.
     */
    static int computeDateDiffDays(const std::string &d1, const std::string &d2)
    {
        if (d1.length() < 10 || d2.length() < 10)
            return 999;

        try
        {
            int y1 = std::stoi(d1.substr(0, 4));
            int m1 = std::stoi(d1.substr(5, 2));
            int day1 = std::stoi(d1.substr(8, 2));

            int y2 = std::stoi(d2.substr(0, 4));
            int m2 = std::stoi(d2.substr(5, 2));
            int day2 = std::stoi(d2.substr(8, 2));

            // Approximate Julian Day representation
            long days1 = y1 * 365 + m1 * 30 + day1;
            long days2 = y2 * 365 + m2 * 30 + day2;

            return std::abs(static_cast<int>(days1 - days2));
        }
        catch (...)
        {
            return 999;
        }
    }

    /**
     * calculateMatch: Evaluates the compatibility between a Lost item and a Found item.
     * Generates exact score and an itemized audit trail.
     */
    static MatchCandidate calculateMatch(const Item &lost, const Item &found)
    {
        int score = 0;
        std::vector<std::string> breakdown;

        // 1. Same Category (+20)
        if (!lost.category.empty() && !found.category.empty() &&
            StringMatcher::toLower(lost.category) == StringMatcher::toLower(found.category))
        {
            score += 20;
            breakdown.push_back("Same Category (" + lost.category + "): +20 pts");
        }

        // 2. Same/Similar Name (+20)
        double nameOverlap = StringMatcher::calculateTokenOverlap(lost.name, found.name);
        if (nameOverlap >= 0.60)
        {
            score += 20;
            breakdown.push_back("High Name Similarity (" + std::to_string(static_cast<int>(nameOverlap * 100)) + "% overlap): +20 pts");
        }
        else if (nameOverlap >= 0.35)
        {
            score += 14;
            breakdown.push_back("Moderate Name Similarity (" + std::to_string(static_cast<int>(nameOverlap * 100)) + "% overlap): +14 pts");
        }
        else if (nameOverlap > 0.15)
        {
            score += 8;
            breakdown.push_back("Partial Name Match: +8 pts");
        }

        // 3. Same Brand (+15)
        if (!lost.brand.empty() && !found.brand.empty() &&
            lost.brand != "Generic" && lost.brand != "Unknown")
        {
            if (StringMatcher::toLower(lost.brand) == StringMatcher::toLower(found.brand))
            {
                score += 15;
                breakdown.push_back("Same Brand (" + lost.brand + "): +15 pts");
            }
            else if (StringMatcher::containsKeyword(found.name + " " + found.description, lost.brand))
            {
                score += 10;
                breakdown.push_back("Brand Mentioned (" + lost.brand + "): +10 pts");
            }
        }

        // 4. Same Color (+10)
        if (!lost.color.empty() && !found.color.empty())
        {
            if (StringMatcher::toLower(lost.color) == StringMatcher::toLower(found.color))
            {
                score += 10;
                breakdown.push_back("Same Color (" + lost.color + "): +10 pts");
            }
            else if (StringMatcher::containsKeyword(found.description, lost.color))
            {
                score += 6;
                breakdown.push_back("Color Mentioned in Description (" + lost.color + "): +6 pts");
            }
        }

        // 5. Same Location (+20)
        if (!lost.location.empty() && !found.location.empty())
        {
            if (StringMatcher::toLower(lost.location) == StringMatcher::toLower(found.location))
            {
                score += 20;
                breakdown.push_back("Same Location (" + lost.location + "): +20 pts");
            }
            else
            {
                double locOverlap = StringMatcher::calculateTokenOverlap(lost.location, found.location);
                if (locOverlap >= 0.50)
                {
                    score += 12;
                    breakdown.push_back("Near Location (" + found.location + "): +12 pts");
                }
            }
        }

        // 6. Similar Keywords (+10)
        int matchingTokens = StringMatcher::countMatchingTokens(
            lost.keywords + " " + lost.description,
            found.keywords + " " + found.description);
        if (matchingTokens >= 4)
        {
            score += 10;
            breakdown.push_back("Strong Keyword Alignment (" + std::to_string(matchingTokens) + " terms): +10 pts");
        }
        else if (matchingTokens >= 2)
        {
            score += 6;
            breakdown.push_back("Moderate Keyword Alignment (" + std::to_string(matchingTokens) + " terms): +6 pts");
        }
        else if (matchingTokens == 1)
        {
            score += 3;
            breakdown.push_back("Common Keyword Found: +3 pts");
        }

        // 7. Close Date (+5)
        int dayDiff = computeDateDiffDays(lost.date, found.date);
        if (dayDiff <= 2)
        {
            score += 5;
            breakdown.push_back("Lost/Found Dates Within 48 Hours: +5 pts");
        }
        else if (dayDiff <= 5)
        {
            score += 3;
            breakdown.push_back("Lost/Found Dates Within 5 Days: +3 pts");
        }
        else if (dayDiff <= 10)
        {
            score += 1;
            breakdown.push_back("Lost/Found Dates Within 10 Days: +1 pt");
        }

        // Total score clamp
        if (score > 100)
            score = 100;
        if (score < 0)
            score = 0;

        return MatchCandidate(found, score, classifyScore(score), breakdown);
    }

    /**
     * findMatches: Evaluates a target lost item against all active found items.
     * Uses the custom MaxHeap to rank candidates and returns them in descending score order.
     *
     * Pipeline:
     *   Lost Item
     *       ↓
     *   Rule-based Scoring across all active Found Items
     *       ↓
     *   Insert each MatchCandidate into MaxHeap (O(k log k))
     *       ↓
     *   Extract candidates in descending rank (O(k log k))
     */
    static std::vector<MatchCandidate> findMatches(const Item &lostItem,
                                                   const std::vector<Item> &allItems,
                                                   int minimumScoreThreshold = 20)
    {
        MaxHeap heap;

        for (const auto &item : allItems)
        {
            // Only compare with active found items (exclude recovered or lost items)
            if (item.type == ItemType::FOUND && item.status == ItemStatus::ACTIVE)
            {
                MatchCandidate candidate = calculateMatch(lostItem, item);
                if (candidate.score >= minimumScoreThreshold)
                {
                    heap.insert(candidate);
                }
            }
        }

        // Extract candidates ranked by score from Max Heap
        return heap.getRankedMatches();
    }
};

#endif // MATCH_ENGINE_H
