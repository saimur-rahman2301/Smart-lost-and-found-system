#pragma once
#include <string>
#include <vector>
#include <cmath>
#include <algorithm>
#include <unordered_map>
#include <unordered_set>
#include <cctype>

namespace findx::engine {

/**
 * WHY THIS STRUCTURE:
 * FindX needs multiple string matching techniques for different purposes:
 * - LEVENSHTEIN: fuzzy brand/title matching (allows typos)
 * - RABIN-KARP: fast substring search in descriptions (rolling hash)
 * - KMP: deterministic substring search (failure function)
 * - JACCARD: token-set similarity for description comparison
 * - COSINE: TF vector similarity (accounts for term frequency)
 * 
 * The descriptionSimilarity blend (0.5*Jaccard + 0.5*levenshteinNorm_inv)
 * gives credit for both vocabulary overlap AND character-level similarity.
 */

inline int levenshtein(const std::string& a, const std::string& b) {
    std::vector<std::vector<int>> dp(a.size() + 1, std::vector<int>(b.size() + 1));
    for (size_t i = 0; i <= a.size(); i++) dp[i][0] = i;
    for (size_t j = 0; j <= b.size(); j++) dp[0][j] = j;
    
    for (size_t i = 1; i <= a.size(); i++) {
        for (size_t j = 1; j <= b.size(); j++) {
            if (a[i - 1] == b[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + std::min({dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]});
            }
        }
    }
    return dp[a.size()][b.size()];
}

inline double levenshteinNormalized(const std::string& a, const std::string& b) {
    if (a.empty() && b.empty()) return 0.0;
    int dist = levenshtein(a, b);
    return static_cast<double>(dist) / std::max(a.size(), b.size());
}

inline std::vector<int> rabinKarp(const std::string& text, const std::string& pattern) {
    std::vector<int> result;
    if (pattern.empty() || text.size() < pattern.size()) return result;
    
    const int d = 256;
    const int q = 101;
    int M = pattern.size();
    int N = text.size();
    int p = 0, t = 0, h = 1;
    
    for (int i = 0; i < M - 1; i++) h = (h * d) % q;
    for (int i = 0; i < M; i++) {
        p = (d * p + pattern[i]) % q;
        t = (d * t + text[i]) % q;
    }
    
    for (int i = 0; i <= N - M; i++) {
        if (p == t) {
            bool match = true;
            for (int j = 0; j < M; j++) {
                if (text[i + j] != pattern[j]) { match = false; break; }
            }
            if (match) result.push_back(i);
        }
        if (i < N - M) {
            t = (d * (t - text[i] * h) + text[i + M]) % q;
            if (t < 0) t = (t + q);
        }
    }
    return result;
}

inline std::vector<int> kmpSearch(const std::string& text, const std::string& pattern) {
    std::vector<int> result;
    if (pattern.empty() || text.size() < pattern.size()) return result;
    
    int M = pattern.size(), N = text.size();
    std::vector<int> lps(M, 0);
    int len = 0, i = 1;
    
    while (i < M) {
        if (pattern[i] == pattern[len]) lps[i++] = ++len;
        else if (len != 0) len = lps[len - 1];
        else lps[i++] = 0;
    }
    
    i = 0; int j = 0;
    while (i < N) {
        if (pattern[j] == text[i]) { i++; j++; }
        if (j == M) { result.push_back(i - j); j = lps[j - 1]; }
        else if (i < N && pattern[j] != text[i]) {
            if (j != 0) j = lps[j - 1];
            else i++;
        }
    }
    return result;
}

inline std::vector<std::string> tokenize(const std::string& text) {
    std::vector<std::string> tokens;
    std::string current;
    for (char c : text) {
        if (std::isalnum(c)) {
            current += std::tolower(c);
        } else if (!current.empty()) {
            tokens.push_back(current);
            current.clear();
        }
    }
    if (!current.empty()) tokens.push_back(current);
    return tokens;
}

inline double jaccardSimilarity(const std::vector<std::string>& a, const std::vector<std::string>& b) {
    if (a.empty() && b.empty()) return 0.0;
    std::unordered_set<std::string> setA(a.begin(), a.end());
    std::unordered_set<std::string> setB(b.begin(), b.end());
    
    int intersectionCount = 0;
    for (const auto& token : setA) {
        if (setB.count(token)) intersectionCount++;
    }
    
    int unionCount = setA.size() + setB.size() - intersectionCount;
    if (unionCount == 0) return 0.0;
    return static_cast<double>(intersectionCount) / unionCount;
}

inline double cosineSimilarity(const std::string& a, const std::string& b) {
    auto tokensA = tokenize(a), tokensB = tokenize(b);
    if (tokensA.empty() || tokensB.empty()) return 0.0;
    
    std::unordered_map<std::string, int> freqA, freqB;
    std::unordered_set<std::string> allTokens;
    
    for (const auto& t : tokensA) { freqA[t]++; allTokens.insert(t); }
    for (const auto& t : tokensB) { freqB[t]++; allTokens.insert(t); }
    
    double dotProduct = 0, normA = 0, normB = 0;
    for (const auto& t : allTokens) {
        dotProduct += freqA[t] * freqB[t];
        normA += freqA[t] * freqA[t];
        normB += freqB[t] * freqB[t];
    }
    
    if (normA == 0 || normB == 0) return 0.0;
    return dotProduct / (std::sqrt(normA) * std::sqrt(normB));
}

inline double descriptionSimilarity(const std::string& a, const std::string& b) {
    double jaccard = jaccardSimilarity(tokenize(a), tokenize(b));
    double levSim = 1.0 - levenshteinNormalized(a, b);
    return 0.5 * jaccard + 0.5 * levSim;
}

inline double brandSimilarity(const std::string& a, const std::string& b) {
    std::string lowerA = a, lowerB = b;
    std::transform(lowerA.begin(), lowerA.end(), lowerA.begin(), ::tolower);
    std::transform(lowerB.begin(), lowerB.end(), lowerB.begin(), ::tolower);
    
    if (lowerA == lowerB) return 1.0;
    if (levenshtein(lowerA, lowerB) <= 2) return 0.7;
    return 0.0;
}

} // namespace findx::engine
