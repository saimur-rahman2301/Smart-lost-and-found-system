#define _WIN32_WINNT 0x0600
#include <winsock2.h>
#include <ws2tcpip.h>
#include <iostream>
#include <string>
#include <vector>
#include <sstream>
#include <fstream>
#include <algorithm>
#include <map>
#include <chrono>
#include <thread>

#include "../include/Item.h"
#include "../include/DataManager.h"
#include "../include/HashTable.h"
#include "../include/BST.h"
#include "../include/MaxHeap.h"
#include "../include/StringMatcher.h"
#include "../include/MergeSort.h"
#include "../include/MatchEngine.h"

#pragma comment(lib, "ws2_32.lib")

// ── Global System State ────────────────────────────────────────────────────
const int PORT = 8080;
std::string DATA_FILE = "items.json";
std::string FRONTEND_DIR = "smart_lost_found/frontend";

HashTable g_hashTable(101); // 101 prime buckets
BST g_bst;

// Helper: Reload global DSA structures from vector
void reloadDSAStructures(const std::vector<Item> &items)
{
    g_hashTable.clear();
    g_bst.clear();

    for (const auto &item : items)
    {
        g_hashTable.insert(item.id, item);
        g_bst.insert(item.name, item);
    }
}

// Helper: Save items to DATA_FILE and all project directory locations
void saveAllItemsToAllLocations(const std::vector<Item> &items)
{
    DataManager::saveToFile(DATA_FILE, items);
    {
        std::ifstream check("items.json");
        if (check.is_open()) DataManager::saveToFile("items.json", items);
    }
    {
        std::ifstream check("../items.json");
        if (check.is_open()) DataManager::saveToFile("../items.json", items);
    }
    {
        std::ifstream check("smart_lost_found/items.json");
        if (check.is_open()) DataManager::saveToFile("smart_lost_found/items.json", items);
    }
}

// Helper: Read entire file content into string
std::string readFileContent(const std::string &filepath)
{
    std::ifstream inFile(filepath, std::ios::in | std::ios::binary);
    if (!inFile.is_open())
        return "";
    std::ostringstream ss;
    ss << inFile.rdbuf();
    return ss.str();
}

// Helper: Extract URL parameter
std::string getQueryParam(const std::string &query, const std::string &key)
{
    std::string pattern = key + "=";
    size_t start = query.find(pattern);
    if (start == std::string::npos)
        return "";
    start += pattern.length();
    size_t end = query.find('&', start);
    if (end == std::string::npos)
        return query.substr(start);
    return query.substr(start, end - start);
}

// Helper: URL decode
std::string urlDecode(const std::string &src)
{
    std::string ret;
    char ch;
    int i, ii;
    for (i = 0; i < (int)src.length(); i++)
    {
        if (src[i] == '%')
        {
            sscanf(src.substr(i + 1, 2).c_str(), "%x", &ii);
            ch = static_cast<char>(ii);
            ret += ch;
            i = i + 2;
        }
        else if (src[i] == '+')
        {
            ret += ' ';
        }
        else
        {
            ret += src[i];
        }
    }
    return ret;
}

// Helper: Robust JSON field extractor (handles arbitrary whitespace and strings)
std::string extractJsonField(const std::string &json, const std::string &key)
{
    std::string searchKey = "\"" + key + "\"";
    size_t keyPos = json.find(searchKey);
    if (keyPos == std::string::npos)
        return "";

    size_t colonPos = json.find(':', keyPos + searchKey.length());
    if (colonPos == std::string::npos)
        return "";

    size_t valStart = colonPos + 1;
    while (valStart < json.length() && (json[valStart] == ' ' || json[valStart] == '\t' || json[valStart] == '\r' || json[valStart] == '\n'))
    {
        valStart++;
    }
    if (valStart >= json.length())
        return "";

    if (json[valStart] == '\"')
    {
        valStart++; // skip opening quote
        size_t valEnd = valStart;
        while (valEnd < json.length())
        {
            if (json[valEnd] == '\"' && json[valEnd - 1] != '\\')
            {
                break;
            }
            valEnd++;
        }
        return json.substr(valStart, valEnd - valStart);
    }
    else
    {
        size_t valEnd = json.find_first_of(",}\r\n", valStart);
        if (valEnd == std::string::npos)
            valEnd = json.length();
        std::string raw = json.substr(valStart, valEnd - valStart);
        while (!raw.empty() && (raw.back() == ' ' || raw.back() == '\t'))
            raw.pop_back();
        return raw;
    }
}

// Helper: Construct HTTP Response
std::string makeHttpResponse(int statusCode, const std::string &statusText,
                             const std::string &contentType, const std::string &body)
{
    std::ostringstream response;
    response << "HTTP/1.1 " << statusCode << " " << statusText << "\r\n"
             << "Content-Type: " << contentType << "; charset=UTF-8\r\n"
             << "Content-Length: " << body.length() << "\r\n"
             << "Access-Control-Allow-Origin: *\r\n"
             << "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
             << "Access-Control-Allow-Headers: Content-Type\r\n"
             << "Connection: close\r\n\r\n"
             << body;
    return response.str();
}

// ── Client Request Handler ─────────────────────────────────────────────────
void handleClient(SOCKET clientSocket)
{
    DWORD timeout = 2500;
    setsockopt(clientSocket, SOL_SOCKET, SO_RCVTIMEO, (const char *)&timeout, sizeof(timeout));
    setsockopt(clientSocket, SOL_SOCKET, SO_SNDTIMEO, (const char *)&timeout, sizeof(timeout));

    std::string rawRequest = "";
    char buffer[4096];
    size_t headerEndPos = std::string::npos;
    size_t contentLength = 0;

    while (true)
    {
        int bytes = recv(clientSocket, buffer, sizeof(buffer), 0);
        if (bytes <= 0)
            break;
        rawRequest.append(buffer, bytes);

        if (headerEndPos == std::string::npos)
        {
            headerEndPos = rawRequest.find("\r\n\r\n");
            if (headerEndPos != std::string::npos)
            {
                // If Expect: 100-continue, acknowledge so client sends body
                if (rawRequest.find("Expect: 100-continue") != std::string::npos ||
                    rawRequest.find("expect: 100-continue") != std::string::npos)
                {
                    std::string continueResp = "HTTP/1.1 100 Continue\r\n\r\n";
                    send(clientSocket, continueResp.c_str(), (int)continueResp.length(), 0);
                }

                // Parse Content-Length header
                std::string lowerReq = StringMatcher::toLower(rawRequest);
                size_t clPos = lowerReq.find("content-length:");
                if (clPos != std::string::npos && clPos < headerEndPos)
                {
                    size_t numStart = clPos + 15;
                    while (numStart < headerEndPos && (rawRequest[numStart] == ' ' || rawRequest[numStart] == '\t'))
                    {
                        numStart++;
                    }
                    size_t numEnd = rawRequest.find("\r\n", numStart);
                    if (numEnd != std::string::npos)
                    {
                        try
                        {
                            contentLength = std::stoul(rawRequest.substr(numStart, numEnd - numStart));
                        }
                        catch (...)
                        {
                            contentLength = 0;
                        }
                    }
                }
            }
        }

        if (headerEndPos != std::string::npos)
        {
            size_t bodyReceived = rawRequest.length() - (headerEndPos + 4);
            if (bodyReceived >= contentLength)
            {
                break;
            }
        }
    }

    if (rawRequest.empty())
    {
        closesocket(clientSocket);
        return;
    }

    std::istringstream reqStream(rawRequest);
    std::string method, fullPath, version;
    reqStream >> method >> fullPath >> version;

    // Handle OPTIONS Preflight
    if (method == "OPTIONS")
    {
        std::string res = makeHttpResponse(200, "OK", "text/plain", "");
        send(clientSocket, res.c_str(), (int)res.length(), 0);
        closesocket(clientSocket);
        return;
    }

    // Split path and query parameters
    std::string path = fullPath;
    std::string query = "";
    size_t qPos = fullPath.find('?');
    if (qPos != std::string::npos)
    {
        path = fullPath.substr(0, qPos);
        query = fullPath.substr(qPos + 1);
    }

    // Extract body for POST requests
    std::string body = "";
    if (headerEndPos != std::string::npos && headerEndPos + 4 <= rawRequest.length())
    {
        body = rawRequest.substr(headerEndPos + 4);
    }

    std::string response = "";

    // ─────────────────────────────────────────────────────────────────────────
    // ROUTE: GET /api/health
    // ─────────────────────────────────────────────────────────────────────────
    if (method == "GET" && path == "/api/health")
    {
        response = makeHttpResponse(200, "OK", "application/json",
                                    "{\"status\":\"ok\",\"engine\":\"C++ Winsock DSA Engine\"}");
    }
    // ─────────────────────────────────────────────────────────────────────────
    // ROUTE 0: POST /api/login (Role Authentication)
    // ─────────────────────────────────────────────────────────────────────────
    else if (method == "POST" && path == "/api/login")
    {
        std::string role = extractJsonField(body, "role");
        if (role == "ADMIN")
        {
            std::string username = extractJsonField(body, "username");
            std::string password = extractJsonField(body, "password");
            if (username == "admin" && password == "admin123")
            {
                std::cout << "[Auth] Admin logged in successfully.\n";
                response = makeHttpResponse(200, "OK", "application/json",
                                            "{\"success\":true,\"role\":\"ADMIN\",\"token\":\"admin-token-2026\",\"name\":\"Campus Administrator\"}");
            }
            else
            {
                std::cout << "[Auth] Failed admin login attempt: " << username << "\n";
                response = makeHttpResponse(401, "Unauthorized", "application/json",
                                            "{\"success\":false,\"error\":\"Invalid admin username or password\"}");
            }
        }
        else
        {
            std::string contact = extractJsonField(body, "contact");
            if (!contact.empty())
            {
                std::cout << "[Auth] Student logged in: " << contact << "\n";
                response = makeHttpResponse(200, "OK", "application/json",
                                            "{\"success\":true,\"role\":\"STUDENT\",\"contact\":\"" + contact + "\",\"name\":\"Student (" + contact + ")\"}");
            }
            else
            {
                response = makeHttpResponse(400, "Bad Request", "application/json",
                                            "{\"success\":false,\"error\":\"Student email/contact is required\"}");
            }
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // ROUTE 1: GET /api/items (Role-Filtered: Students see only own items; Admins see all)
    // ─────────────────────────────────────────────────────────────────────────
    else if (method == "GET" && path == "/api/items")
    {
        std::string role = getQueryParam(query, "role");
        std::string contact = urlDecode(getQueryParam(query, "contact"));
        std::string token = getQueryParam(query, "token");

        // Role-based Access Enforcement
        bool isAdmin = (role == "ADMIN" && token == "admin-token-2026");
        bool isStudent = (role == "STUDENT" || !contact.empty());

        if (!isAdmin && !isStudent)
        {
            response = makeHttpResponse(403, "Forbidden", "application/json",
                                        "{\"error\":\"Access restricted. Students can only view their own items. Admins can view all items.\"}");
        }
        else
        {
            std::vector<Item> items = g_hashTable.getAllItems();

            std::string typeFilter = getQueryParam(query, "type");
            std::string catFilter = urlDecode(getQueryParam(query, "category"));
            std::string statusFilter = getQueryParam(query, "status");
            std::string sortParam = getQueryParam(query, "sort");
            std::string searchQuery = urlDecode(getQueryParam(query, "q"));

            std::vector<Item> filtered;
            filtered.reserve(items.size());

            for (const auto &item : items)
            {
                // CRITICAL PRIVACY RULE: If student, restrict strictly to items reported by this student
                if (!isAdmin)
                {
                    if (StringMatcher::toLower(item.contact) != StringMatcher::toLower(contact))
                        continue;
                }

                // Filter by Type
                if (!typeFilter.empty() && typeFilter != "ALL")
                {
                    if (itemTypeToString(item.type) != typeFilter)
                        continue;
                }
                // Filter by Category
                if (!catFilter.empty() && catFilter != "ALL")
                {
                    if (StringMatcher::toLower(item.category) != StringMatcher::toLower(catFilter))
                        continue;
                }
                // Filter by Status
                if (!statusFilter.empty() && statusFilter != "ALL")
                {
                    if (itemStatusToString(item.status) != statusFilter)
                        continue;
                }
                // Filter by Search Query (StringMatcher)
                if (!searchQuery.empty())
                {
                    std::string itemContent = item.name + " " + item.brand + " " + item.color + " " +
                                              item.location + " " + item.keywords + " " + item.description;
                    if (!StringMatcher::containsKeyword(itemContent, searchQuery))
                    {
                        continue;
                    }
                }
                filtered.push_back(item);
            }

            // Apply manual Merge Sort
            SortCriteria criteria = SortCriteria::DATE_NEWEST;
            if (sortParam == "DATE_OLDEST")
                criteria = SortCriteria::DATE_OLDEST;
            else if (sortParam == "NAME_AZ")
                criteria = SortCriteria::NAME_AZ;
            else if (sortParam == "NAME_ZA")
                criteria = SortCriteria::NAME_ZA;

            MergeSort::sortItems(filtered, criteria);

            // Serialize to JSON
            std::ostringstream jsonOut;
            jsonOut << "[\n";
            for (size_t i = 0; i < filtered.size(); ++i)
            {
                jsonOut << "  " << filtered[i].toJson();
                if (i + 1 < filtered.size())
                    jsonOut << ",";
                jsonOut << "\n";
            }
            jsonOut << "]";

            response = makeHttpResponse(200, "OK", "application/json", jsonOut.str());
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // ROUTE 2: GET /api/items/{id}
    // ─────────────────────────────────────────────────────────────────────────
    else if (method == "GET" && path.rfind("/api/items/", 0) == 0)
    {
        std::string itemId = path.substr(11);
        Item *item = g_hashTable.search(itemId);
        if (item != nullptr)
        {
            response = makeHttpResponse(200, "OK", "application/json", item->toJson());
        }
        else
        {
            response = makeHttpResponse(404, "Not Found", "application/json", "{\"error\":\"Item not found\"}");
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // ROUTE 3: POST /api/items (Report Lost or Found)
    // ─────────────────────────────────────────────────────────────────────────
    else if (method == "POST" && path == "/api/items")
    {
        std::string typeStr = extractJsonField(body, "type");
        ItemType type = stringToItemType(typeStr);

        std::vector<Item> allItems = g_hashTable.getAllItems();
        int count = 1;
        for (const auto &it : allItems)
        {
            if (it.type == type)
                count++;
        }
        std::string newId = (type == ItemType::LOST ? "LOST_" : "FOUND_") + std::to_string(count);

        Item newItem;
        newItem.id = newId;
        newItem.type = type;
        newItem.name = extractJsonField(body, "name");
        newItem.category = extractJsonField(body, "category");
        newItem.description = extractJsonField(body, "description");
        newItem.brand = extractJsonField(body, "brand");
        newItem.color = extractJsonField(body, "color");
        newItem.location = extractJsonField(body, "location");
        newItem.date = extractJsonField(body, "date");
        newItem.keywords = extractJsonField(body, "keywords");
        newItem.contact = extractJsonField(body, "contact");
        newItem.status = ItemStatus::ACTIVE;

        // Insert into custom DSA structures
        g_hashTable.insert(newItem.id, newItem);
        g_bst.insert(newItem.name, newItem);

        // Persist to JSON files across all locations
        allItems.push_back(newItem);
        saveAllItemsToAllLocations(allItems);

        std::cout << "[DSA Server] Stored new " << typeStr << " item: " << newItem.name
                  << " (ID: " << newItem.id << ") into Hash Table & BST.\n";

        response = makeHttpResponse(201, "Created", "application/json", newItem.toJson());
    }
    // ─────────────────────────────────────────────────────────────────────────
    // ROUTE 4: GET /api/matches?id={lost_id}
    // ─────────────────────────────────────────────────────────────────────────
    else if (method == "GET" && path == "/api/matches")
    {
        std::string lostId = getQueryParam(query, "id");
        std::string role = getQueryParam(query, "role");
        std::string contact = urlDecode(getQueryParam(query, "contact"));
        std::string token = getQueryParam(query, "token");
        bool isAdmin = (role == "ADMIN" && token == "admin-token-2026");

        Item *lostItem = g_hashTable.search(lostId);

        if (lostItem == nullptr)
        {
            response = makeHttpResponse(404, "Not Found", "application/json", "{\"error\":\"Lost item not found\"}");
        }
        else if (!isAdmin && !contact.empty() &&
                 StringMatcher::toLower(lostItem->contact) != StringMatcher::toLower(contact))
        {
            response = makeHttpResponse(403, "Forbidden", "application/json",
                                        "{\"error\":\"Privacy restriction: Students can only view matches for their own reported items\"}");
        }
        else
        {
            std::vector<Item> allItems = g_hashTable.getAllItems();
            // Call MatchEngine which evaluates compatibility and ranks via custom MaxHeap
            std::vector<MatchCandidate> ranked = MatchEngine::findMatches(*lostItem, allItems, 20);

            std::ostringstream jsonOut;
            jsonOut << "[\n";
            for (size_t i = 0; i < ranked.size(); ++i)
            {
                const auto &m = ranked[i];
                jsonOut << "  {\n"
                        << "    \"item\": " << m.item.toJson() << ",\n"
                        << "    \"score\": " << m.score << ",\n"
                        << "    \"categoryLabel\": \"" << m.categoryLabel << "\",\n"
                        << "    \"breakdown\": [\n";
                for (size_t j = 0; j < m.breakdown.size(); ++j)
                {
                    jsonOut << "      \"" << m.breakdown[j] << "\"";
                    if (j + 1 < m.breakdown.size())
                        jsonOut << ",";
                    jsonOut << "\n";
                }
                jsonOut << "    ]\n"
                        << "  }";
                if (i + 1 < ranked.size())
                    jsonOut << ",";
                jsonOut << "\n";
            }
            jsonOut << "]";

            std::cout << "[DSA Matcher] Evaluated matches for " << lostId
                      << " -> Extracted " << ranked.size() << " candidates from Max Heap.\n";

            response = makeHttpResponse(200, "OK", "application/json", jsonOut.str());
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // ROUTE 5: POST /api/recover
    // ─────────────────────────────────────────────────────────────────────────
    else if (method == "POST" && path == "/api/recover")
    {
        std::string itemId = extractJsonField(body, "id");
        Item *item = g_hashTable.search(itemId);

        if (item != nullptr)
        {
            item->status = ItemStatus::RECOVERED;
            g_hashTable.insert(itemId, *item);
            g_bst.insert(item->name, *item);

            saveAllItemsToAllLocations(g_hashTable.getAllItems());
            std::cout << "[DSA Server] Item " << itemId << " marked as RECOVERED!\n";
            response = makeHttpResponse(200, "OK", "application/json", "{\"success\":true}");
        }
        else
        {
            response = makeHttpResponse(404, "Not Found", "application/json", "{\"error\":\"Item not found\"}");
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // ROUTE: PUT /api/items (Admin Update Item)
    // ─────────────────────────────────────────────────────────────────────────
    else if (method == "PUT" && path == "/api/items")
    {
        std::string itemId = extractJsonField(body, "id");
        Item *item = g_hashTable.search(itemId);
        if (item != nullptr)
        {
            std::string nameVal = extractJsonField(body, "name");
            if (!nameVal.empty()) item->name = nameVal;
            std::string typeStr = extractJsonField(body, "type");
            if (!typeStr.empty()) item->type = stringToItemType(typeStr);
            std::string catVal = extractJsonField(body, "category");
            if (!catVal.empty()) item->category = catVal;
            std::string locVal = extractJsonField(body, "location");
            if (!locVal.empty()) item->location = locVal;
            std::string dateVal = extractJsonField(body, "date");
            if (!dateVal.empty()) item->date = dateVal;
            std::string contactVal = extractJsonField(body, "contact");
            if (!contactVal.empty()) item->contact = contactVal;
            std::string descVal = extractJsonField(body, "description");
            if (!descVal.empty()) item->description = descVal;
            std::string statusStr = extractJsonField(body, "status");
            if (statusStr == "RECOVERED") item->status = ItemStatus::RECOVERED;
            else if (statusStr == "MATCHED") item->status = ItemStatus::MATCHED;
            else if (statusStr == "ACTIVE") item->status = ItemStatus::ACTIVE;

            g_hashTable.insert(itemId, *item);
            g_bst.insert(item->name, *item);
            saveAllItemsToAllLocations(g_hashTable.getAllItems());
            std::cout << "[DSA Server] Updated item " << itemId << "\n";
            response = makeHttpResponse(200, "OK", "application/json", item->toJson());
        }
        else
        {
            response = makeHttpResponse(404, "Not Found", "application/json", "{\"error\":\"Item not found\"}");
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // ROUTE: DELETE /api/items/{id} (Admin Delete Item)
    // ─────────────────────────────────────────────────────────────────────────
    else if (method == "DELETE" && path.find("/api/items") != std::string::npos)
    {
        std::string itemId = "";
        size_t lastSlash = path.find_last_of('/');
        if (lastSlash != std::string::npos && lastSlash + 1 < path.length())
        {
            itemId = path.substr(lastSlash + 1);
        }
        if (!itemId.empty() && itemId != "items")
        {
            g_hashTable.remove(itemId);
            std::vector<Item> allItems = g_hashTable.getAllItems();
            reloadDSAStructures(allItems);
            saveAllItemsToAllLocations(allItems);
            std::cout << "[DSA Server] Deleted item " << itemId << "\n";
            response = makeHttpResponse(200, "OK", "application/json", "{\"success\":true,\"message\":\"Item deleted\"}");
        }
        else
        {
            response = makeHttpResponse(400, "Bad Request", "application/json", "{\"error\":\"Missing item id\"}");
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // ROUTE: POST /api/git/sync (Auto Commit & Push Worldwide to GitHub)
    // ─────────────────────────────────────────────────────────────────────────
    else if (method == "POST" && path == "/api/git/sync")
    {
        std::cout << "\n[Git Sync] Triggered Worldwide Update from Web Interface...\n";

        // Save current items to file first across all locations
        std::vector<Item> allItems = g_hashTable.getAllItems();
        saveAllItemsToAllLocations(allItems);

        std::cout << "[Git Sync] Running git add, commit, and push...\n";
        int gitRes = system("git add . && git commit -m \"Worldwide live update via Smart Lost & Found Web Portal\" && git push origin main");

        if (gitRes == 0)
        {
            std::cout << "[Git Sync] SUCCESS! Changes pushed to origin main.\n";
            response = makeHttpResponse(200, "OK", "application/json",
                                        "{\"success\":true,\"message\":\"Successfully committed and pushed to GitHub! Website is updating worldwide.\"}");
        }
        else
        {
            std::cout << "[Git Sync] Git returned status code: " << gitRes << "\n";
            response = makeHttpResponse(200, "OK", "application/json",
                                        "{\"success\":true,\"message\":\"Git commands initiated. Check server terminal for output.\"}");
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // ROUTE 6: GET /api/statistics
    // ─────────────────────────────────────────────────────────────────────────
    else if (method == "GET" && path == "/api/statistics")
    {
        std::vector<Item> allItems = g_hashTable.getAllItems();
        int lostCount = 0, foundCount = 0, recoveredCount = 0;
        std::map<std::string, int> catCounts;

        for (const auto &it : allItems)
        {
            if (it.type == ItemType::LOST)
            {
                lostCount++;
                catCounts[it.category]++;
            }
            else if (it.type == ItemType::FOUND)
            {
                foundCount++;
            }
            if (it.status == ItemStatus::RECOVERED)
            {
                recoveredCount++;
            }
        }

        std::string topCat = "None";
        int maxCatCount = 0;
        for (const auto &pair : catCounts)
        {
            if (pair.second > maxCatCount)
            {
                maxCatCount = pair.second;
                topCat = pair.first;
            }
        }

        double recoveryRate = 0.0;
        if (lostCount > 0)
        {
            recoveryRate = (static_cast<double>(recoveredCount) / lostCount) * 100.0;
        }

        std::ostringstream jsonOut;
        jsonOut << "{\n"
                << "  \"totalLost\": " << lostCount << ",\n"
                << "  \"totalFound\": " << foundCount << ",\n"
                << "  \"totalRecovered\": " << recoveredCount << ",\n"
                << "  \"recoveryRate\": " << recoveryRate << ",\n"
                << "  \"mostLostCategory\": \"" << topCat << "\",\n"
                << "  \"dsaMetrics\": {\n"
                << "    \"hashTableCapacity\": " << g_hashTable.getCapacity() << ",\n"
                << "    \"hashTableSize\": " << g_hashTable.getSize() << ",\n"
                << "    \"hashTableCollisions\": " << g_hashTable.getCollisionCount() << ",\n"
                << "    \"bstNodeCount\": " << g_bst.size() << ",\n"
                << "    \"bstHeight\": " << g_bst.getHeight() << "\n"
                << "  }\n"
                << "}";

        response = makeHttpResponse(200, "OK", "application/json", jsonOut.str());
    }
    // ─────────────────────────────────────────────────────────────────────────
    // ROUTE 7: GET /api/bst/inorder
    // ─────────────────────────────────────────────────────────────────────────
    else if (method == "GET" && path == "/api/bst/inorder")
    {
        std::vector<Item> sortedItems = g_bst.inorderTraversal();
        std::ostringstream jsonOut;
        jsonOut << "[\n";
        for (size_t i = 0; i < sortedItems.size(); ++i)
        {
            jsonOut << "  " << sortedItems[i].toJson();
            if (i + 1 < sortedItems.size())
                jsonOut << ",";
            jsonOut << "\n";
        }
        jsonOut << "]";
        response = makeHttpResponse(200, "OK", "application/json", jsonOut.str());
    }
    // ─────────────────────────────────────────────────────────────────────────
    // STATIC FILE SERVING (Frontend UI)
    // ─────────────────────────────────────────────────────────────────────────
    else
    {
        std::string contentType = "text/html";
        std::string target = (path == "/" || path == "/index.html") ? "index.html" : (path[0] == '/' ? path.substr(1) : path);

        if (target.find(".css") != std::string::npos)
            contentType = "text/css";
        else if (target.find(".js") != std::string::npos)
            contentType = "application/javascript";
        else if (target.find(".json") != std::string::npos)
            contentType = "application/json";

        std::vector<std::string> candidates = {
            target,
            "./" + target,
            "../" + target,
            FRONTEND_DIR + "/" + target,
            "frontend/" + target,
            "../" + FRONTEND_DIR + "/" + target
        };

        std::string content = "";
        for (const auto &c : candidates)
        {
            content = readFileContent(c);
            if (!content.empty())
                break;
        }

        if (!content.empty())
        {
            response = makeHttpResponse(200, "OK", contentType, content);
        }
        else
        {
            response = makeHttpResponse(404, "Not Found", "text/plain", "404 Not Found");
        }
    }

    int totalSent = 0;
    int toSend = static_cast<int>(response.length());
    const char *ptr = response.c_str();
    while (totalSent < toSend)
    {
        int sent = send(clientSocket, ptr + totalSent, toSend - totalSent, 0);
        if (sent <= 0)
            break;
        totalSent += sent;
    }
    shutdown(clientSocket, SD_SEND);
    closesocket(clientSocket);
}

// ── Main Entry Point ───────────────────────────────────────────────────────
int main()
{
    std::cout << "========================================================\n";
    std::cout << "           SMART LOST & FOUND - DSA SERVER              \n";
    std::cout << "           \"Find It. Match It. Return It.\"              \n";
    std::cout << "========================================================\n\n";

    // 1. Initialize DSA Structures
    std::cout << "[Step 1] Loading persistent data & initializing DSA...\n";
    {
        std::ifstream checkCurrent(DATA_FILE);
        if (!checkCurrent.is_open())
        {
            std::ifstream checkParent("../" + DATA_FILE);
            if (checkParent.is_open())
            {
                DATA_FILE = "../" + DATA_FILE;
            }
        }
    }
    std::vector<Item> items = DataManager::loadFromFile(DATA_FILE);
    reloadDSAStructures(items);

    std::cout << "         -> Loaded " << items.size() << " records into Custom Hash Table (101 buckets).\n";
    std::cout << "         -> Inserted into Custom BST (Height: " << g_bst.getHeight() << ").\n";

    // 2. Initialize Winsock
    WSADATA wsaData;
    int wsaRes = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (wsaRes != 0)
    {
        std::cerr << "[Error] WSAStartup failed: " << wsaRes << "\n";
        return 1;
    }

    SOCKET serverSocket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (serverSocket == INVALID_SOCKET)
    {
        std::cerr << "[Error] Socket creation failed: " << WSAGetLastError() << "\n";
        WSACleanup();
        return 1;
    }

    // Allow quick reuse of port
    int opt = 1;
    setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, (const char *)&opt, sizeof(opt));

    sockaddr_in serverAddr;
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_addr.s_addr = INADDR_ANY;
    serverAddr.sin_port = htons(PORT);

    if (bind(serverSocket, (sockaddr *)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR)
    {
        std::cerr << "[Error] Bind failed on port " << PORT << ": " << WSAGetLastError() << "\n";
        closesocket(serverSocket);
        WSACleanup();
        return 1;
    }

    if (listen(serverSocket, SOMAXCONN) == SOCKET_ERROR)
    {
        std::cerr << "[Error] Listen failed: " << WSAGetLastError() << "\n";
        closesocket(serverSocket);
        WSACleanup();
        return 1;
    }

    std::cout << "\n========================================================\n";
    std::cout << "  C++ DSA Web Server is LIVE!\n";
    std::cout << "  URL: http://localhost:" << PORT << "\n";
    std::cout << "  Open this link in your web browser to use the app.\n";
    std::cout << "========================================================\n\n"
              << std::flush;

    // 3. Server Request Loop
    while (true)
    {
        SOCKET clientSocket = accept(serverSocket, nullptr, nullptr);
        if (clientSocket != INVALID_SOCKET)
        {
            handleClient(clientSocket);
        }
    }

    closesocket(serverSocket);
    WSACleanup();
    return 0;
}
