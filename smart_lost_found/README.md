# SMART LOST & FOUND: "Find It. Match It. Return It."
### University Data Structures & Algorithms (DSA) Lab Project

A complete, modern, presentation-ready university Lost & Found Management System built in **pure C++17** for the core Data Structures & Algorithms and **HTML5/CSS3/Vanilla JavaScript** for the responsive web interface.

---

## 🚀 Quick Start (One-Click Launch)

Simply double-click:
```cmd
run_system.bat
```
This automatically starts the C++ DSA Web Server on `http://localhost:8080` and opens your browser.

## 🔐 Role-Based Access Control (Student Privacy & Admin Portal)

- **👨‍🎓 Student Mode (Privacy Active):**
  - Students sign in using their university email / Student ID (e.g. `ali.raza@uni.edu`).
  - Students can **only** see items they personally reported (items they lost or found).
  - Students can submit new lost/found reports and run the 100-Point Match Engine for *their* lost items.
  - **Campus-wide item browsing is strictly blocked** for students to prevent fraudulent claims.
- **🛡️ Admin Mode (Campus Lost & Found Office):**
  - Sign in using credentials: **Username:** `admin` | **Password:** `admin123`.
  - Unlocks full campus visibility: **Browse All Items** with search and manual Merge Sort.
  - Full access to live C++ DSA Diagnostics (Hash Table capacity/load factor, BST in-order traversal).
  - Ability to mark any item pair as `RECOVERED`.

---

## 🛠️ Technology Stack

- **Core Backend & DSA Engine:** Pure C++17 (`HashTable.h`, `BST.h`, `MaxHeap.h`, `StringMatcher.h`, `MergeSort.h`, `MatchEngine.h`, `DataManager.h`)
- **Networking:** Native Windows Sockets (`Winsock2` with `-lws2_32`)
- **Frontend Presentation:** HTML5, Modern CSS3 (custom properties design system), Vanilla JavaScript (zero external dependencies)
- **Data Persistence:** Standard JSON (`items.json`)

---

## 🧠 Implemented Data Structures & Algorithms

| Topic | Implementation File | Academic Purpose | Complexity |
| :--- | :--- | :--- | :--- |
| **Hash Table** | `HashTable.h` | Fast Item ID lookup using Separate Chaining & DJB2 hash | Average: $O(1)$, Worst: $O(n)$ |
| **Binary Search Tree** | `BST.h` | Item organization by Name; in-order alphabetical traversal | Average: $O(\log n)$, Worst: $O(n)$ |
| **Max Heap** | `MaxHeap.h` | Priority Queue ranking match scores from highest to lowest | Insert/Extract: $O(\log k)$ |
| **String Matcher** | `StringMatcher.h` | Rule-based token intersection & stopword elimination | Linear: $O(L)$ |
| **Merge Sort** | `MergeSort.h` | Divide-and-conquer sorting (Newest, Oldest, Name A-Z) | All cases: $O(n \log n)$ |
| **Match Engine** | `MatchEngine.h` | 100-Point Rule Formula evaluating compatibility | Max Heap prioritized |

---

## 📊 100-Point Matching Formula

```text
Same Category          +20 pts
Same/Similar Name      +20 pts
Same Brand             +15 pts
Same Color             +10 pts
Same Location          +20 pts
Similar Keywords       +10 pts
Close Date             +05 pts
--------------------------------
Maximum                100 pts
```

**Classification Tiers:**
- $90 - 100\%$: Very Strong Match
- $75 - 89\%$: Strong Match
- $60 - 74\%$: Possible Match
- Below $60\%$: Low Match

---

## 🧪 Running Automated Tests

To run the complete 10-test automated verification suite:
```cmd
cd smart_lost_found/backend
C:\msys64\ucrt64\bin\g++.exe -std=c++17 -I"include" "src/test_suite.cpp" -o "test_suite.exe"
.\test_suite.exe
```

All 10 tests verify:
1. Hash table $O(1)$ lookup for existing item
2. Hash table lookup for non-existent item returns `nullptr`
3. BST search by item name
4. BST in-order traversal alphabetical ordering
5. Max Heap extraction order ($95 \rightarrow 91 \rightarrow 82 \rightarrow 65 \rightarrow 45$)
6. String matcher with token overlap and stopword removal
7. Merge sort ascending and descending
8. 100-point match calculation accuracy
9. Recovery workflow: `ACTIVE` $\rightarrow$ `RECOVERED`
10. Statistics and load factor calculation

---

## 📂 Project Structure

```
smart_lost_found/
├── backend/
│   ├── include/
│   │   ├── Item.h             # Fundamental Item data entity
│   │   ├── DataManager.h      # File persistence & 20 sample items
│   │   ├── HashTable.h        # Custom Separate Chaining Hash Table
│   │   ├── BST.h              # Custom Binary Search Tree
│   │   ├── MaxHeap.h          # Custom Max Heap Priority Queue
│   │   ├── StringMatcher.h    # Rule-based string & token matcher
│   │   ├── MergeSort.h        # Manual Divide-and-Conquer Merge Sort
│   │   └── MatchEngine.h      # 100-Point Match Scoring Engine
│   └── src/
│       ├── main.cpp           # C++ HTTP Web Server & REST API
│       ├── test_stage2.cpp    # Stage 2 unit test
│       ├── test_stage3.cpp    # Stage 3 Hash Table test
│       ├── test_stage4.cpp    # Stage 4 BST test
│       ├── test_stage5.cpp    # Stage 5 Max Heap test
│       ├── test_stage6.cpp    # Stage 6 String Matcher test
│       ├── test_stage7.cpp    # Stage 7 Merge Sort test
│       ├── test_stage8.cpp    # Stage 8 Match Engine test
│       └── test_suite.cpp     # Complete 10-test automated verification suite
├── frontend/
│   ├── index.html             # Presentation-ready single-page interface
│   ├── css/
│   │   └── style.css          # Modern university design system
│   └── js/
│       └── app.js             # Vanilla JS API connector
├── run_system.bat             # One-click launch script
├── PRESENTATION_SLIDES.md     # 12-slide presentation deck
├── VIVA_QA_GUIDE.md           # 30 University Viva Q&A Guide
└── items.json                 # Persistent records database
```

---

## 🎓 Viva Preparation Resources

Read `PRESENTATION_SLIDES.md` for the presentation structure and `VIVA_QA_GUIDE.md` for 30 comprehensive viva questions with thorough explanations.

