#pragma once
#include <string>
#include <nlohmann/json.hpp>
#include "HashTable.hpp"
#include "Trie.hpp"
#include "BST.hpp"
#include "MaxHeap.hpp"
#include "Queue.hpp"
#include "Stack.hpp"
#include "Graph.hpp"
#include "DuplicateDetector.hpp"
#include "MatchEngine.hpp"
#include "ClaimVerifier.hpp"

/**
 * @file EngineRegistry.hpp
 * @brief Singleton registry holding all live DSA engine instances.
 *
 * WHY SINGLETON:
 *   All modules (auth, items, claims, admin) must share the SAME trie,
 *   the SAME graph, the SAME hash tables. A singleton ensures one instance
 *   per process lifetime. Thread safety is acceptable since Crow runs on
 *   a single-threaded coroutine model by default.
 */

namespace findx::engine {

class ActionHistoryManager {
public:
    Stack<std::string> undoStack;
    Stack<std::string> redoStack;
    
    void pushAction(const std::string& act) {
        undoStack.push(act);
        while(!redoStack.isEmpty()) redoStack.pop();
    }
};

class EngineRegistry {
private:
    EngineRegistry() = default;
    ~EngineRegistry() {
        if (matchEngine) delete matchEngine;
    }
    EngineRegistry(const EngineRegistry&) = delete;
    EngineRegistry& operator=(const EngineRegistry&) = delete;

public:
    static EngineRegistry& getInstance() {
        static EngineRegistry instance;
        return instance;
    }

    HashTable<std::string, std::string>      itemCache;
    HashTable<std::string, std::string>      userCache;
    Trie                                      searchTrie;
    BST<std::string>                          reportBST;
    MaxHeap<std::string>                      matchHeap;
    Queue<std::string>                        claimQueue;
    ActionHistoryManager                      actionHistory;
    Graph                                     graph;
    DuplicateDetector                         duplicateDetector;
    MatchEngine*                              matchEngine = nullptr;
    ClaimVerifier                             claimVerifier;

    void initMatchEngine() {
        if (matchEngine) delete matchEngine;
        matchEngine = new MatchEngine(graph);
    }
    
    std::string getStateJson() const {
        nlohmann::json state;
        
        state["hashTable"]["itemCache"] = {
            {"size", itemCache.size()}
        };
        state["trie"] = {
            {"wordCount", searchTrie.wordCount()},
            {"nodeCount", searchTrie.nodeCount()}
        };
        state["bst"] = {
            {"size", reportBST.size()}
        };
        state["heap"] = {
            {"size", matchHeap.size()}
        };
        state["queue"] = {
            {"size", claimQueue.size()}
        };
        state["stack"] = {
            {"undoSize", actionHistory.undoStack.size()},
            {"redoSize", actionHistory.redoStack.size()}
        };
        state["graph"] = {
            {"nodeCount", graph.getAllNodes().size()}
        };
        
        return state.dump();
    }
};

} // namespace findx::engine
