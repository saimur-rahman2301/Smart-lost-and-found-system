#ifndef STRING_MATCHER_H
#define STRING_MATCHER_H

#include <string>
#include <vector>
#include <sstream>
#include <algorithm>
#include <cctype>
#include <unordered_set>

/**
 * StringMatcher: Rule-based keyword extraction and string similarity algorithm.
 * Designed specifically for academic vivas: simple, transparent, and deterministic.
 * Does NOT use AI/ML. Uses token normalization and word-overlap intersection.
 */
class StringMatcher
{
public:
    /**
     * toLower: Converts a string to lowercase.
     * Time: O(n)
     */
    static std::string toLower(const std::string &str)
    {
        std::string lower = str;
        std::transform(lower.begin(), lower.end(), lower.begin(),
                       [](unsigned char c)
                       { return std::tolower(c); });
        return lower;
    }

    /**
     * cleanString: Strips punctuation and returns alphanumeric words separated by single spaces.
     * Time: O(n)
     */
    static std::string cleanString(const std::string &str)
    {
        std::string cleaned;
        cleaned.reserve(str.size());
        for (char c : str)
        {
            if (std::isalnum(static_cast<unsigned char>(c)) || c == ' ')
            {
                cleaned += std::tolower(static_cast<unsigned char>(c));
            }
            else
            {
                cleaned += ' '; // Replace punctuation with space
            }
        }
        return cleaned;
    }

    /**
     * tokenize: Breaks a sentence into a vector of unique keywords,
     * filtering out short trivial words and common stopwords.
     */
    static std::vector<std::string> tokenize(const std::string &text)
    {
        static const std::unordered_set<std::string> stopwords = {
            "the", "a", "an", "in", "on", "at", "to", "for", "of", "and", "or",
            "is", "was", "with", "my", "by", "from", "it", "this", "that"};

        std::string cleaned = cleanString(text);
        std::stringstream ss(cleaned);
        std::string word;
        std::vector<std::string> tokens;

        while (ss >> word)
        {
            if (word.length() >= 2 && stopwords.find(word) == stopwords.end())
            {
                // Keep only unique tokens
                if (std::find(tokens.begin(), tokens.end(), word) == tokens.end())
                {
                    tokens.push_back(word);
                }
            }
        }
        return tokens;
    }

    /**
     * calculateTokenOverlap:
     * Compares two strings by tokenizing both and calculating the percentage
     * of common keywords.
     * Formula: overlapRatio = (2 * commonTokens) / (tokensA.size() + tokensB.size())
     * Returns: Float in range [0.0, 1.0]
     */
    static double calculateTokenOverlap(const std::string &textA, const std::string &textB)
    {
        std::vector<std::string> tokensA = tokenize(textA);
        std::vector<std::string> tokensB = tokenize(textB);

        if (tokensA.empty() || tokensB.empty())
        {
            return 0.0;
        }

        int commonCount = 0;
        for (const auto &a : tokensA)
        {
            for (const auto &b : tokensB)
            {
                if (a == b)
                {
                    commonCount++;
                    break;
                }
            }
        }

        double totalTokens = static_cast<double>(tokensA.size() + tokensB.size());
        return (2.0 * commonCount) / totalTokens;
    }

    /**
     * countMatchingTokens:
     * Returns the exact number of matching keyword tokens between two strings.
     */
    static int countMatchingTokens(const std::string &textA, const std::string &textB)
    {
        std::vector<std::string> tokensA = tokenize(textA);
        std::vector<std::string> tokensB = tokenize(textB);

        int count = 0;
        for (const auto &a : tokensA)
        {
            for (const auto &b : tokensB)
            {
                if (a == b)
                {
                    count++;
                    break;
                }
            }
        }
        return count;
    }

    /**
     * containsKeyword:
     * Checks if target text contains the query keyword as a substring (case-insensitive).
     */
    static bool containsKeyword(const std::string &text, const std::string &keyword)
    {
        std::string lowerText = toLower(text);
        std::string lowerKw = toLower(keyword);
        return lowerText.find(lowerKw) != std::string::npos;
    }
};

#endif // STRING_MATCHER_H
