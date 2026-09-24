# 30 UNIVERSITY VIVA QUESTIONS & ANSWERS
## SMART LOST & FOUND: "Find It. Match It. Return It."
### Academic Defense & Viva Voce Guide

---

### PART 1: HASH TABLE & COLLISION RESOLUTION (Questions 1–6)

#### Q1: Why did you choose a Hash Table for storing Items by ID?
**Answer:** An item lookup by its unique ID (e.g., `LOST_1` or `FOUND_5`) is the single most frequent operation in the system (occurring on every item view, edit, recovery, and relationship lookup). A Hash Table provides $O(1)$ average time complexity for insertion, retrieval, and deletion, outperforming linear search ($O(n)$) and tree searches ($O(\log n)$).

#### Q2: What hash function did you use, and why?
**Answer:** We implemented Dan Bernstein's **DJB2 hash function**:
$$hash_{i} = (hash_{i-1} \times 33) + c$$
It uses prime numbers (starting with 5381 and multiplier 33) and bit-shifts (`(hash << 5) + hash`). It achieves an exceptional avalanche effect—minor differences in item keys (like `LOST_1` vs `LOST_2`) produce widely distributed bucket indices across the prime capacity ($M = 101$), minimizing clustering.

#### Q3: How do you handle hash collisions?
**Answer:** We implemented **Separate Chaining** using singly-linked list nodes (`HashNode`). Each bucket in our table holds a pointer to the head of a linked list. If two keys hash to the same bucket index, the new node is simply appended to that bucket's list. Separate chaining was selected over open addressing (linear probing) because:
1. It never suffers from catastrophic primary or secondary clustering.
2. Deletions are trivial (standard linked-list pointer updates without needing dummy "tombstone" markers).
3. It degrades gracefully if the load factor exceeds 1.0.

#### Q4: What is the load factor, and what is its significance?
**Answer:** The load factor $\alpha$ is defined as:
$$\alpha = \frac{n}{M}$$
where $n$ is the number of stored elements and $M$ is the bucket capacity. It represents the average length of the linked list chains in each bucket. In our system, with 20 items and 101 prime buckets, $\alpha \approx 0.198$, which is well below the standard 0.75 threshold. This guarantees that bucket chains are almost always length 0 or 1, ensuring pure $O(1)$ operation.

#### Q5: What is the worst-case time complexity of a Hash Table, and when does it occur?
**Answer:** The worst-case time complexity is $O(n)$. It occurs if an adversarial or pathological set of keys all hash to the exact same bucket index, causing the table to collapse into a single linked list of length $n$.

#### Q6: Why did you choose a prime number (101) for the capacity?
**Answer:** Using a prime number for table capacity reduces collisions when key hash values share common factors with table size. It ensures that the modulo operation (`hash % M`) thoroughly covers all bucket indices.

---

### PART 2: BINARY SEARCH TREE (BST) (Questions 7–12)

#### Q7: Why did you implement a custom Binary Search Tree?
**Answer:** While the Hash Table provides unordered $O(1)$ lookup by ID, it cannot maintain sorted order. The custom BST organizes items lexicographically by **Item Name**. This allows the university system to perform sorted hierarchical browsing and in-order traversals without copying and re-sorting the whole dataset each time.

#### Q8: What are the BST invariants and properties?
**Answer:** For any given node $N$ with key $K$:
1. All nodes in $N$'s left subtree have keys strictly less than $K$ ($Left < K$).
2. All nodes in $N$'s right subtree have keys strictly greater than $K$ ($Right > K$).
3. Both left and right subtrees must themselves be valid Binary Search Trees.

#### Q9: How does in-order traversal work, and why does it produce alphabetical output?
**Answer:** In-order traversal visits nodes recursively in the sequence:
$$\text{Left Subtree} \longrightarrow \text{Root Node} \longrightarrow \text{Right Subtree}$$
Because of the BST invariant ($Left < Root < Right$), visiting the left subtree first ensures all smaller strings precede the root, and visiting the right subtree afterwards ensures all larger strings follow. Thus, in-order traversal outputs all items in strictly ascending alphabetical order in $O(n)$ time.

#### Q10: What is the average vs worst-case complexity of a BST?
**Answer:**
- **Average Case:** $O(\log n)$ for search, insertion, and deletion, provided elements are inserted in random order, keeping the tree balanced with height $h \approx \log_2 n$.
- **Worst Case:** $O(n)$ if items are inserted in already-sorted or reverse-sorted order. The tree degenerates into a linear linked list (skewed tree) of height $h = n$.

#### Q11: How could the BST worst-case be prevented?
**Answer:** By using a self-balancing binary search tree, such as an **AVL Tree** (using height-balanced tree rotations) or a **Red-Black Tree**. In our lab project, we intentionally implemented a classical BST to clearly demonstrate the contrast between average $O(\log n)$ behavior and potential tree skewing.

#### Q12: How do you delete a node with two children in a BST?
**Answer:**
1. Locate the target node to delete.
2. Find its **in-order successor** (the node with the minimum key in its right subtree, found by traversing as far left as possible from `node->right`).
3. Copy the successor's key and item into the target node.
4. Recursively delete the in-order successor from the right subtree (which is guaranteed to have at most one child).

---

### PART 3: MAX HEAP & PRIORITY QUEUE (Questions 13–18)

#### Q13: Why is a Max Heap the ideal data structure for match ranking?
**Answer:** When evaluating matches, we want to present the highest scoring candidates first. A Max Heap is a specialized complete binary tree that maintains the **Heap Invariant**: every parent node has a value greater than or equal to its children.
- Root is always guaranteed to be the maximum score in $O(1)$.
- Extracting the top $k$ matches takes $O(k \log n)$ time.
- If we used simple sorting, it would cost $O(n \log n)$ regardless of $k$.
- If we used an unsorted array, finding the top $k$ would require repeatedly scanning the array ($O(k \cdot n)$).

#### Q14: How is the Max Heap represented in memory?
**Answer:** We use an array-based (contiguous dynamic array/vector) representation of a complete binary tree. No node pointers are needed. For any element at index $i$ (0-indexed):
- Parent Index: $\lfloor (i - 1) / 2 \rfloor$
- Left Child Index: $2i + 1$
- Right Child Index: $2i + 2$
This contiguous storage provides excellent CPU cache locality.

#### Q15: Explain the `heapifyUp` (Bubble-Up) operation.
**Answer:** When a new `MatchCandidate` is inserted, it is placed at the end of the array (bottom of the tree) to preserve the complete tree shape. If its score is greater than its parent's score, it violates the max-heap property. We swap it with its parent and repeat the comparison up to the root. Since the height of a complete binary tree is $\lfloor \log_2 n \rfloor$, `heapifyUp` runs in $O(\log n)$ time.

#### Q16: Explain the `extractMax` and `heapifyDown` (Sift-Down) operations.
**Answer:** To remove the maximum element:
1. Save the root element (`heap[0]`).
2. Move the last element of the array into the root position and reduce array size by 1.
3. Call `heapifyDown(0)`: compare the root with its left and right children. Swap with the larger child if the parent is smaller. Repeat down the tree until the invariant is restored.
Time complexity is $O(\log n)$.

#### Q17: What is the difference between building a heap one-by-one vs `buildHeap` (Floyd's algorithm)?
**Answer:** Inserting $n$ elements one by one into an initially empty heap takes $O(n \log n)$ time. Floyd's bottom-up `buildHeap` algorithm starts with an arbitrary array and calls `heapifyDown` from index $\lfloor n/2 \rfloor - 1$ down to 0, which runs in linear time $O(n)$ because the majority of nodes reside near the leaves where tree height is minimal.

#### Q18: What is Heap Sort, and how does your project use it?
**Answer:** Heap Sort repeatedly extracts the maximum element from the heap until the heap is empty. The extracted elements form a sequence sorted in descending order. Our project uses this in `MaxHeap::getRankedMatches()` to return the ranked match candidates.

---

### PART 4: STRING MATCHING & ALGORITHM (Questions 19–22)

#### Q19: Why did you not use AI or Machine Learning for string matching?
**Answer:**
1. **Explainability & Transparency:** Machine learning models are statistical black boxes where score derivations cannot be proven to a user or administrator.
2. **Determinism:** University lab projects require verifiable, reproducible, and mathematically rigorous behavior.
3. **Efficiency:** Rule-based keyword matching runs in microseconds without external Python runtimes, GPU dependencies, or neural weights.

#### Q20: Explain the token overlap formula used in your `StringMatcher`.
**Answer:** We normalize strings by converting to lowercase, removing punctuation, and filtering out common stopwords (`the`, `with`, `in`, `on`, `a`). We then compute:
$$\text{Overlap Ratio} = \frac{2 \times |\text{Tokens}_A \cap \text{Tokens}_B|}{|\text{Tokens}_A| + |\text{Tokens}_B|}$$
This is the Sørensen–Dice coefficient, which ranges from $0.0$ (no common words) to $1.0$ (identical token sets).

#### Q21: What are stopwords, and why do we remove them?
**Answer:** Stopwords are frequently occurring grammatical noise words (such as "in", "on", "the", "a", "with", "my") that carry little identifying semantic value. If two students write "Lost on the table" and "Found on the table", matching "the" and "on" would falsely inflate the match score. Removing them ensures points are only awarded for salient keywords like "Casio", "calculator", "backpack", or "Dell".

#### Q22: What is the time complexity of your string matching?
**Answer:** For two strings of lengths $L_1$ and $L_2$:
- Tokenization and stopword filtering take $O(L_1 + L_2)$ linear time.
- Token set intersection takes $O(|T_1| \times |T_2|)$ where $|T|$ is the token count (typically $< 10$).
- Total execution time is effectively linear in input string length ($O(L)$).

---

### PART 5: MERGE SORT & SORTING (Questions 23–26)

#### Q23: Why did you implement Merge Sort rather than Quick Sort or Bubble Sort?
**Answer:**
1. **Guaranteed $O(n \log n)$ Time:** Quick Sort has a catastrophic worst-case of $O(n^2)$ when pivots are poorly chosen (e.g., on already sorted lists). Merge Sort guarantees $O(n \log n)$ across all cases.
2. **Stability:** Merge Sort is a **stable** sorting algorithm—items with identical keys preserve their original relative order. Bubble Sort is $O(n^2)$ and unsuitable for production.
3. **Academic Value:** Demonstrates the canonical Divide-and-Conquer paradigm.

#### Q24: Explain the recurrence relation of Merge Sort.
**Answer:**
$$T(n) = 2T(n/2) + O(n)$$
- $2T(n/2)$: Recursively sorting the two halves of the array.
- $O(n)$: Merging the two sorted halves into a single sorted array.
By the Master Theorem (Case 2), where $a = 2, b = 2, d = 1$, since $\log_b a = \log_2 2 = 1 = d$, the solution is:
$$T(n) = O(n \log n)$$

#### Q25: What is the space complexity of Merge Sort, and why?
**Answer:** $O(n)$ auxiliary space. Unlike Quick Sort or In-Place Heap Sort, the `merge()` step requires temporary arrays (`L` and `R`) to hold elements while comparing and copying them back into the main array.

#### Q26: Is your Merge Sort implementation recursive or iterative?
**Answer:** Recursive. The recursion depth is $\lceil \log_2 n \rceil$, meaning the call stack consumes $O(\log n)$ stack frames, while the merge allocations consume $O(n)$ heap memory.

---

### PART 6: SYSTEM ARCHITECTURE & INTEGRATION (Questions 27–30)

#### Q27: How does the C++ backend communicate with the frontend?
**Answer:** The C++ backend runs a custom HTTP server using Windows Sockets (`Winsock2`) listening on local TCP port 8080. The frontend (HTML5/CSS3/Vanilla JS) communicates via standard asynchronous HTTP requests (`fetch()` API) sending and receiving standard JSON payloads.

#### Q28: How is data persisted when the C++ server restarts?
**Answer:** The `DataManager` class serializes the `Item` objects into standard JSON format and saves them to `items.json`. Upon server boot, `DataManager::loadFromFile()` parses the file and re-populates both the `HashTable` ($O(1)$ per insert) and the `BST` ($O(\log n)$ per insert).

#### Q29: What happens when an item is marked as RECOVERED?
**Answer:**
1. Its status transitions from `ACTIVE` to `RECOVERED`.
2. The item is updated in the `HashTable` and persisted to disk.
3. In `MatchEngine::findMatches()`, the condition `item.status == ItemStatus::ACTIVE` ensures that recovered items are immediately excluded from future candidate comparisons.

#### Q30: What are the primary strengths of your project architecture?
**Answer:**
1. **Separation of Concerns:** The C++ backend owns all data structures, memory management, and algorithmic evaluations; the frontend is strictly responsible for presentation and interaction.
2. **Zero Framework Bloat:** No external dependencies like Node.js, React, or Python were required—just standard C++17 and standard web APIs.
3. **Complete Viva Defensibility:** Every line of code from DJB2 hashing to BST rotations, heap sift-downs, and merge sort can be explained and drawn on a whiteboard.

