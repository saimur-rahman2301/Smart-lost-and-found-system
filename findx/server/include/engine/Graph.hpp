#pragma once
#include <string>
#include <vector>
#include <unordered_map>
#include <queue>
#include <algorithm>
#include <limits>

namespace findx::engine {

/**
 * WHY THIS STRUCTURE:
 * Campus buildings are NODES, walking paths between them are WEIGHTED EDGES
 * (weight = distance in meters). The Location Similarity score uses:
 *   locationSim = 1 - (dijkstraDistance / maxCampusDistance)
 * 
 * ADJACENCY LIST vs. ADJACENCY MATRIX:
 *   Campus has ~15 buildings (sparse graph):
 *   - Adjacency list: O(V+E) space - optimal for sparse
 *   - Adjacency matrix: O(V^2) space - wasteful for sparse
 * 
 * BFS: hop-count queries (unweighted shortest path)
 * DFS: connectivity verification
 * DIJKSTRA: weighted shortest path for location similarity
 *   Uses a simple priority queue (sorted vector of {dist, nodeId})
 *   for V=15; a binary heap would be better for large V.
 *   Complexity: O((V+E) log V)
 */

struct GraphNode {
    std::string id;
    std::string name;
    std::string shortCode;
    double latitude;
    double longitude;
};

struct GraphEdge {
    std::string to;
    double weight;
};

struct ShortestPathResult {
    std::vector<std::string> path;
    double totalWeight;
    bool found;
};

struct DijkstraResult {
    std::unordered_map<std::string, double> distances;
    std::unordered_map<std::string, std::string> prev;
};

class Graph {
private:
    std::unordered_map<std::string, GraphNode> nodes_;
    std::unordered_map<std::string, std::vector<GraphEdge>> adjacency_;
    double maxDistance_ = 0.0;

    void updateMaxDistance() {
        maxDistance_ = 0.0;
        for (const auto& pair : nodes_) {
            auto res = dijkstra(pair.first);
            for (const auto& d : res.distances) {
                if (d.second != std::numeric_limits<double>::infinity() && d.second > maxDistance_) {
                    maxDistance_ = d.second;
                }
            }
        }
    }

public:
    void addNode(GraphNode node) {
        nodes_[node.id] = std::move(node);
        if (adjacency_.find(node.id) == adjacency_.end()) {
            adjacency_[node.id] = std::vector<GraphEdge>();
        }
    }

    void addEdge(const std::string& fromId, const std::string& toId, double weight) {
        adjacency_[fromId].push_back({toId, weight});
        adjacency_[toId].push_back({fromId, weight}); // Undirected
        updateMaxDistance();
    }

    void removeNode(const std::string& id) {
        nodes_.erase(id);
        adjacency_.erase(id);
        for (auto& pair : adjacency_) {
            pair.second.erase(std::remove_if(pair.second.begin(), pair.second.end(),
                [&id](const GraphEdge& e) { return e.to == id; }), pair.second.end());
        }
        updateMaxDistance();
    }

    void removeEdge(const std::string& fromId, const std::string& toId) {
        if (adjacency_.count(fromId)) {
            adjacency_[fromId].erase(std::remove_if(adjacency_[fromId].begin(), adjacency_[fromId].end(),
                [&toId](const GraphEdge& e) { return e.to == toId; }), adjacency_[fromId].end());
        }
        if (adjacency_.count(toId)) {
            adjacency_[toId].erase(std::remove_if(adjacency_[toId].begin(), adjacency_[toId].end(),
                [&fromId](const GraphEdge& e) { return e.to == fromId; }), adjacency_[toId].end());
        }
        updateMaxDistance();
    }

    std::unordered_map<std::string, int> bfs(const std::string& startId) const {
        std::unordered_map<std::string, int> hops;
        if (!nodes_.count(startId)) return hops;
        
        std::queue<std::string> q;
        q.push(startId);
        hops[startId] = 0;
        
        while (!q.empty()) {
            std::string curr = q.front();
            q.pop();
            
            if (adjacency_.count(curr)) {
                for (const auto& edge : adjacency_.at(curr)) {
                    if (hops.find(edge.to) == hops.end()) {
                        hops[edge.to] = hops[curr] + 1;
                        q.push(edge.to);
                    }
                }
            }
        }
        return hops;
    }

    std::vector<std::string> dfs(const std::string& startId) const {
        std::vector<std::string> visited;
        if (!nodes_.count(startId)) return visited;
        
        std::unordered_map<std::string, bool> vis;
        std::vector<std::string> stack;
        stack.push_back(startId);
        
        while (!stack.empty()) {
            std::string curr = stack.back();
            stack.pop_back();
            
            if (!vis[curr]) {
                vis[curr] = true;
                visited.push_back(curr);
                
                if (adjacency_.count(curr)) {
                    // to match standard DFS order, process neighbors backwards or ordered
                    for (const auto& edge : adjacency_.at(curr)) {
                        if (!vis[edge.to]) {
                            stack.push_back(edge.to);
                        }
                    }
                }
            }
        }
        return visited;
    }

    DijkstraResult dijkstra(const std::string& startId) const {
        DijkstraResult result;
        for (const auto& pair : nodes_) {
            result.distances[pair.first] = std::numeric_limits<double>::infinity();
        }
        if (!nodes_.count(startId)) return result;
        
        result.distances[startId] = 0.0;
        using P = std::pair<double, std::string>;
        std::priority_queue<P, std::vector<P>, std::greater<P>> pq;
        pq.push({0.0, startId});
        
        while (!pq.empty()) {
            auto [dist, curr] = pq.top();
            pq.pop();
            
            if (dist > result.distances[curr]) continue;
            
            if (adjacency_.count(curr)) {
                for (const auto& edge : adjacency_.at(curr)) {
                    double newDist = dist + edge.weight;
                    if (newDist < result.distances[edge.to]) {
                        result.distances[edge.to] = newDist;
                        result.prev[edge.to] = curr;
                        pq.push({newDist, edge.to});
                    }
                }
            }
        }
        return result;
    }

    ShortestPathResult shortestPath(const std::string& fromId, const std::string& toId) const {
        ShortestPathResult result{{}, 0.0, false};
        if (!nodes_.count(fromId) || !nodes_.count(toId)) return result;
        
        if (fromId == toId) {
            result.path = {fromId};
            result.totalWeight = 0.0;
            result.found = true;
            return result;
        }
        
        auto dijkstraRes = dijkstra(fromId);
        if (dijkstraRes.distances[toId] == std::numeric_limits<double>::infinity()) {
            return result;
        }
        
        result.found = true;
        result.totalWeight = dijkstraRes.distances[toId];
        
        std::string curr = toId;
        while (curr != fromId) {
            result.path.push_back(curr);
            curr = dijkstraRes.prev[curr];
        }
        result.path.push_back(fromId);
        std::reverse(result.path.begin(), result.path.end());
        return result;
    }

    double getMaxDistance() const noexcept { return maxDistance_; }
    
    double getDistanceBetween(const std::string& fromId, const std::string& toId) const {
        auto sp = shortestPath(fromId, toId);
        if (sp.found) return sp.totalWeight;
        return std::numeric_limits<double>::infinity();
    }

    std::vector<GraphNode> getAllNodes() const {
        std::vector<GraphNode> res;
        for (const auto& pair : nodes_) res.push_back(pair.second);
        return res;
    }

    bool hasNode(const std::string& id) const {
        return nodes_.count(id) > 0;
    }

    std::unordered_map<std::string, std::vector<GraphEdge>> getAdjacencyList() const {
        return adjacency_;
    }
};

} // namespace findx::engine
