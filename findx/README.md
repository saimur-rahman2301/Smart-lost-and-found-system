# FindX — Campus Lost & Found Platform

<div align="center">

```
  ╔═══════════════════════════════════════╗
  ║    F I N D X   — FindX Campus L&F    ║
  ║   Algorithmic Smart Matching System   ║
  ╚═══════════════════════════════════════╝
```

**Primary Language: C++17** · Frontend: HTML5 + CSS3 + JavaScript ES2022

[![CI](https://github.com/your-org/findx/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/findx/actions)
[![C++17](https://img.shields.io/badge/C%2B%2B-17-blue.svg)](https://en.cppreference.com/w/cpp/17)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> *"FindX is an algorithm-driven campus Lost & Found platform that automatically discovers, analyzes, ranks, and verifies potential relationships between lost and found item reports."*

</div>

---

## 🔷 Languages & Technologies Used

### C++17 (Primary — Backend + All DSA Engine)

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Web Framework** | [Crow](https://crowcpp.org/) | REST API server (like Flask for C++) |
| **JSON** | [nlohmann/json](https://github.com/nlohmann/json) | JSON serialization/deserialization |
| **Database** | PostgreSQL + libpq | Persistent storage |
| **Auth** | OpenSSL HMAC-SHA256 | JWT signing/verification |
| **Password** | bcrypt | Secure password hashing |
| **Build** | CMake 3.20 + Ninja | Build system |
| **Testing** | [Catch2](https://github.com/catchorg/Catch2) | Unit testing framework |
| **Logging** | Custom JSON logger | Structured stdout logging |
| **Container** | Docker (GCC 13) | Reproducible builds |

**C++ Concepts Demonstrated:**

| Concept | Where Used |
|---------|-----------|
| **Templates / Generic Programming** | All 11 DSA modules: `HashTable<K,V>`, `BST<T>`, `MaxHeap<T>`, etc. |
| **Object-Oriented Programming** | Engine classes, route handlers, DB wrapper, models |
| **RAII / Smart Pointers** | `unique_ptr` in BST nodes, Trie nodes, Stack nodes |
| **Move Semantics** | All data structure insertions use `std::move` |
| **Lambda Functions** | Sort comparators: `hybridSort(arr, [](auto& a, auto& b){ return a.score > b.score; })` |
| **Exception Handling** | API handlers wrap all operations in try/catch |
| **Namespaces** | `findx::engine`, `findx::api`, `findx::db`, `findx::models` |
| **Constexpr** | HashTable::LOAD_UPPER, INITIAL_CAPACITY |
| **Const Correctness** | All read-only methods marked `const`, parameters passed by const ref |
| **Operator Overloading** | `HeapEntry::operator<`, `operator>` for heap comparison |
| **Pointers & References** | Raw node pointers in BST, LinkedList, Trie internals |
| **std::optional** | All nullable return types (HashTable::get, BST::find, etc.) |
| **std::variant / std::string_view** | Config parsing, query params |
| **Singleton Pattern** | `EngineRegistry::getInstance()`, `Database::getInstance()` |
| **Template Specialization** | HashTable key hashing (string vs numeric) |

### 🌐 HTML5 (Frontend Structure)
- Semantic elements (`<nav>`, `<main>`, `<section>`, `<article>`)
- Single Page Application with hash-based routing (`#/dashboard`)
- ARIA roles and labels for accessibility
- `<template>` elements for reusable UI patterns

### 🎨 CSS3 (Frontend Styling)
- **CSS Custom Properties** (design token system — colors, spacing, typography)
- **CSS Grid** and **Flexbox** layouts
- **CSS Animations** with `@keyframes`
- **Media Queries** — mobile/tablet/desktop responsive
- Pure hand-written CSS, zero framework dependencies

### ⚡ JavaScript ES2022 (Frontend Logic)
- **ES6 Modules** (`import`/`export`, dynamic `import()`)
- **Fetch API** + `async`/`await` for REST calls
- **Classes** — Router, ToastManager, page components
- **localStorage** — JWT token persistence
- **Hash Router** — `hashchange` event listener
- **DOM API** — `querySelector`, `createElement`, `insertAdjacentHTML`
- **[Chart.js 4](https://www.chartjs.org/)** (CDN) — analytics charts
- **[D3.js 7](https://d3js.org/)** (CDN) — DSA tree/graph visualizations
- Debounce pattern for search autocomplete

---

## Quick Start

> **Prerequisites:** Docker 24+ and Docker Compose v2+.

```bash
# 1. Clone
git clone https://github.com/your-org/findx.git
cd findx

# 2. Configure (defaults work out of the box)
cp .env.example .env

# 3. Build and start the entire stack
docker compose up --build

# 4. Open browser
open http://localhost:4000
```

**What happens automatically:**
1. PostgreSQL starts and runs `sql/init.sql` (schema creation)
2. C++ server compiles inside Docker (GCC 13, CMake, Ninja)
3. `findx_seed` binary runs — inserts demo data
4. `findx_server` starts on port 4000, serves both API and frontend

**First boot takes ~3–5 minutes** (C++ compilation + dependency download).

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│              PRESENTATION LAYER  (served on :4000/static)           │
│         HTML5 · CSS3 · JavaScript ES2022 · Chart.js · D3.js        │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTP REST (Crow framework)
┌────────────────────────────▼────────────────────────────────────────┐
│             APPLICATION LAYER  (C++ Crow server :4000)               │
│   Auth · Items · Claims · Admin · Search · Graph · Notifications    │
│              Zod-equivalent C++ validation · JWT RBAC              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                    FINDX DSA ENGINE (C++17)                          │
│  HashTable<K,V>  Trie  BST<T>  MaxHeap<T>  Queue<T>  Stack<T>     │
│  DoublyLinkedList<T>  SortAlgorithms  Graph + Dijkstra             │
│  StringMatching (Levenshtein, KMP, Rabin-Karp, Jaccard, Cosine)    │
│  DuplicateDetector  MatchEngine  ClaimVerifier  EngineRegistry     │
└────────────────────────────┬────────────────────────────────────────┘
                             │ libpq
┌────────────────────────────▼────────────────────────────────────────┐
│                    DATA STORAGE (PostgreSQL 16)                      │
│  users · items · matches · claims · buildings · edges               │
│  status_history · audit_logs · notifications · refresh_tokens       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## DSA Engine — All 11 Modules

| Module | Data Structure | C++ Features | Purpose |
|--------|---------------|--------------|---------|
| `HashTable.hpp` | Hash Table (FNV-1a, chaining) | Templates, `operator[]` | O(1) item/user lookup |
| `Trie.hpp` | Prefix Tree | `unique_ptr`, recursion | Live autocomplete |
| `BST.hpp` | Binary Search Tree | Templates, `unique_ptr` | Date-range queries |
| `MaxHeap.hpp` | Array-backed Max-Heap | Templates, move semantics | Top-K match ranking |
| `Queue.hpp` | Circular Buffer Queue | Templates, resize | FIFO claim pipeline |
| `Stack.hpp` | Linked-List Stack | Templates, `unique_ptr` | Undo/redo system |
| `LinkedList.hpp` | Doubly Linked List | Raw pointers + managed | Status history chain |
| `SortAlgorithms.hpp` | Merge/Quick/Insertion + Hybrid | Function templates, lambdas | Result sorting |
| `Graph.hpp` | Adjacency List + Dijkstra | `unordered_map`, Dijkstra | Location similarity |
| `StringMatching.hpp` | Levenshtein · KMP · Rabin-Karp · Jaccard | Free functions | Fuzzy matching |
| `DuplicateDetector.hpp` | Hash + String composite | Composition | Pre-submit dedup |

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 🔑 Admin | `admin@findx.edu` | `Admin1234!` |
| 👤 Student | `student1@findx.edu` | `Student1234!` |
| 👤 Student | `student2@findx.edu` | `Student1234!` |

**DSA Visualizer:** Login as admin → navigate to `/engine-visualizer`

---

## Development (Without Docker)

Requires: GCC 13+, CMake 3.20+, libssl-dev, libpq-dev, PostgreSQL 16

```bash
# Configure
cmake -B build -DCMAKE_BUILD_TYPE=Debug -G Ninja

# Build all targets
cmake --build build --parallel

# Run tests
cd build && ctest --output-on-failure

# Run server (after starting postgres)
./build/server/findx_server

# Frontend: open client/index.html in browser (or serve from server)
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `findx_db` | Database name |
| `DB_USER` | `findx` | Database user |
| `DB_PASSWORD` | `findx_secret` | Database password |
| `JWT_ACCESS_SECRET` | — | Min 32 chars |
| `JWT_REFRESH_SECRET` | — | Min 32 chars |
| `JWT_ACCESS_EXPIRES_IN` | `900` | Seconds (15 min) |
| `JWT_REFRESH_EXPIRES_IN` | `604800` | Seconds (7 days) |
| `PORT` | `4000` | Server port |

---

## Documentation

| File | Contents |
|------|---------|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Layered architecture, data flows |
| [`docs/DSA_JUSTIFICATION.md`](docs/DSA_JUSTIFICATION.md) | Big-O analysis, structure rationale |
| [`docs/API_REFERENCE.md`](docs/API_REFERENCE.md) | All endpoints documented |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Future features, out-of-scope items |

---

## License

MIT © FindX Team
