/**
 * demo-server.js — Smart Lost & Found University DSA Project
 * "Find It. Match It. Return It."
 *
 * Runs locally on Node.js without any external dependencies.
 * Serves the modern frontend and powers the exact 100-point DSA matching engine.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = 3000;
const CLIENT_DIR = path.join(__dirname, 'client');

// ═══════════════════════════════════════════════════════════════════
// 1. CAMPUS LOCATIONS & GRAPH
// ═══════════════════════════════════════════════════════════════════

const BUILDINGS = [
  { id: 'b1', name: 'Main Library', shortCode: 'LIB' },
  { id: 'b2', name: 'Engineering Block A', shortCode: 'ENG-A' },
  { id: 'b3', name: 'Science Faculty', shortCode: 'SCI' },
  { id: 'b4', name: 'Student Center', shortCode: 'SC' },
  { id: 'b5', name: 'Administration Block', shortCode: 'ADMIN' },
  { id: 'b6', name: 'Sports Complex / Gym', shortCode: 'SPORT' },
  { id: 'b7', name: 'Cafeteria & Food Court', shortCode: 'CAF' },
  { id: 'b8', name: 'Medical Center', shortCode: 'MED' },
  { id: 'b9', name: 'Computer Science Labs', shortCode: 'CS-LAB' },
  { id: 'b10', name: 'Campus Hostels', shortCode: 'HOSTEL' },
  { id: 'b12', name: 'Main Parking Area', shortCode: 'PARK' },
  { id: 'b13', name: 'Central Auditorium', shortCode: 'AUD' },
];

// ═══════════════════════════════════════════════════════════════════
// 2. SAMPLE DATA: 10 REALISTIC LOST & 10 FOUND UNIVERSITY ITEMS
// ═══════════════════════════════════════════════════════════════════

let ITEMS = [
  // ── 10 LOST ITEMS ────────────────────────────────────────────────
  {
    id: 'LOST_1', reporterId: 'u1', reporterName: 'Ali Raza', type: 'LOST',
    name: 'Casio FX-991ES Plus Scientific Calculator', category: 'Electronics',
    brand: 'Casio', color: 'Black', locationName: 'Main Library',
    date: '2026-09-20', description: 'Left on study table #14 in 2nd floor quiet area. Has my name sticker on the back.',
    keywords: 'calculator casio fx991es scientific black math desk', contact: 'ali.raza@uni.edu',
    status: 'ACTIVE', createdAt: '2026-09-20T10:00:00Z'
  },
  {
    id: 'LOST_2', reporterId: 'u1', reporterName: 'Ali Raza', type: 'LOST',
    name: 'Student ID Card - Ali Raza (CS Dept)', category: 'Documents & Cards',
    brand: 'University', color: 'Blue', locationName: 'Cafeteria & Food Court',
    date: '2026-09-21', description: 'Official university student card on a navy blue lanyard with student ID 2024-CS-42.',
    keywords: 'student id card ali raza computer science lanyard', contact: 'ali.raza@uni.edu',
    status: 'ACTIVE', createdAt: '2026-09-21T12:30:00Z'
  },
  {
    id: 'LOST_3', reporterId: 'u2', reporterName: 'Sara Khan', type: 'LOST',
    name: 'Brown Leather Wallet (Samsonite)', category: 'Keys & Wallets',
    brand: 'Samsonite', color: 'Brown', locationName: 'Student Center',
    date: '2026-09-19', description: 'Dark brown bi-fold leather wallet containing student driving license and some cash.',
    keywords: 'wallet leather brown samsonite license cards cash', contact: 'sara.k@uni.edu',
    status: 'ACTIVE', createdAt: '2026-09-19T14:15:00Z'
  },
  {
    id: 'LOST_4', reporterId: 'u3', reporterName: 'Omar Sheikh', type: 'LOST',
    name: 'Dell Pro 15.6" Laptop Backpack', category: 'Bags & Backpacks',
    brand: 'Dell', color: 'Black', locationName: 'Computer Science Labs',
    date: '2026-09-18', description: 'Black Dell backpack with orange zipper accents. Contains charger and spiral notebook.',
    keywords: 'backpack bag dell black laptop lab charger notebook', contact: 'omar.s@uni.edu',
    status: 'ACTIVE', createdAt: '2026-09-18T16:00:00Z'
  },
  {
    id: 'LOST_5', reporterId: 'u1', reporterName: 'Ali Raza', type: 'LOST',
    name: 'Data Structures & Algorithms in C++ Textbook', category: 'Books & Stationery',
    brand: 'Pearson', color: 'Blue', locationName: 'Main Library',
    date: '2026-09-22', description: 'Hardcover textbook by Mark Allen Weiss. Highlighted chapters on Trees and Graphs.',
    keywords: 'book textbook dsa data structures c++ algorithms pearson', contact: 'ali.raza@uni.edu',
    status: 'ACTIVE', createdAt: '2026-09-22T09:30:00Z'
  },
  {
    id: 'LOST_6', reporterId: 'u4', reporterName: 'Fatima Malik', type: 'LOST',
    name: 'SanDisk Ultra 64GB USB 3.0 Flash Drive', category: 'Electronics',
    brand: 'SanDisk', color: 'Red', locationName: 'Computer Science Labs',
    date: '2026-09-21', description: 'Small red and black retractable USB drive containing semester lab project code.',
    keywords: 'usb flash drive sandisk 64gb red black memory stick', contact: 'fatima.m@uni.edu',
    status: 'ACTIVE', createdAt: '2026-09-21T17:00:00Z'
  },
  {
    id: 'LOST_7', reporterId: 'u5', reporterName: 'Hamza Tariq', type: 'LOST',
    name: 'Dorm Room Keys on Blue Nissan Keychain', category: 'Keys & Wallets',
    brand: 'Yale', color: 'Silver', locationName: 'Main Parking Area',
    date: '2026-09-17', description: 'Ring of 3 silver metal keys with a blue rubber Nissan keychain tag.',
    keywords: 'keys dorm room keychain blue nissan car yale metal', contact: 'hamza.t@uni.edu',
    status: 'ACTIVE', createdAt: '2026-09-17T18:00:00Z'
  },
  {
    id: 'LOST_8', reporterId: 'u2', reporterName: 'Sara Khan', type: 'LOST',
    name: 'Apple iPhone 13 (Midnight Black, 128GB)', category: 'Electronics',
    brand: 'Apple', color: 'Black', locationName: 'Sports Complex / Gym',
    date: '2026-09-22', description: 'Black iPhone in clear protective bumper case with a minor scratch on screen guard.',
    keywords: 'iphone apple phone black 13 mobile smartphone', contact: 'sara.k@uni.edu',
    status: 'ACTIVE', createdAt: '2026-09-22T15:45:00Z'
  },
  {
    id: 'LOST_9', reporterId: 'u3', reporterName: 'Omar Sheikh', type: 'LOST',
    name: 'Final Year Engineering Project Report Folder', category: 'Documents & Cards',
    brand: 'Generic', color: 'Blue', locationName: 'Engineering Block A',
    date: '2026-09-20', description: 'Thick blue plastic folder containing signed project reports, circuit schematics, and CD.',
    keywords: 'documents folder report engineering fyp drawings project', contact: 'omar.s@uni.edu',
    status: 'ACTIVE', createdAt: '2026-09-20T11:20:00Z'
  },
  {
    id: 'LOST_10', reporterId: 'u4', reporterName: 'Fatima Malik', type: 'LOST',
    name: 'Apple AirPods Pro (2nd Gen) in Case', category: 'Electronics',
    brand: 'Apple', color: 'White', locationName: 'Central Auditorium',
    date: '2026-09-21', description: 'White Apple AirPods charging case with a green silicone protective cover.',
    keywords: 'airpods apple earphones headphones pro wireless white', contact: 'fatima.m@uni.edu',
    status: 'ACTIVE', createdAt: '2026-09-21T19:00:00Z'
  },

  // ── 10 FOUND ITEMS (Carefully paired to generate strong matches) ──
  {
    id: 'FOUND_1', reporterId: 'u5', reporterName: 'Hamza Tariq', type: 'FOUND',
    name: 'Casio Scientific Calculator FX-991ES', category: 'Electronics',
    brand: 'Casio', color: 'Black', locationName: 'Main Library',
    date: '2026-09-20', description: 'Found on table #14 in the 2nd floor library reading room. Calculator works perfectly.',
    keywords: 'calculator casio fx991es scientific black desk table', contact: 'hamza.t@uni.edu',
    status: 'ACTIVE', createdAt: '2026-09-20T14:00:00Z'
  },
  {
    id: 'FOUND_2', reporterId: 'u3', reporterName: 'Omar Sheikh', type: 'FOUND',
    name: 'Student ID Card (Ali Raza)', category: 'Documents & Cards',
    brand: 'University', color: 'Blue', locationName: 'Cafeteria & Food Court',
    date: '2026-09-21', description: 'Found on the cashier counter at the main cafeteria. Navy blue strap.',
    keywords: 'id card student ali raza university cafeteria lanyard', contact: 'omar.s@uni.edu',
    status: 'ACTIVE', createdAt: '2026-09-21T13:10:00Z'
  },
  {
    id: 'FOUND_3', reporterId: 'u1', reporterName: 'Ali Raza', type: 'FOUND',
    name: 'Brown Leather Wallet', category: 'Keys & Wallets',
    brand: 'Samsonite', color: 'Brown', locationName: 'Student Center',
    date: '2026-09-19', description: 'Found on a couch in the student center lounge area. Samsonite logo visible.',
    keywords: 'wallet leather brown samsonite cards money lounge', contact: 'ali.raza@uni.edu',
    status: 'ACTIVE', createdAt: '2026-09-19T16:00:00Z'
  },
  {
    id: 'FOUND_4', reporterId: 'u4', reporterName: 'Fatima Malik', type: 'FOUND',
    name: 'Black Dell Laptop Bag', category: 'Bags & Backpacks',
    brand: 'Dell', color: 'Black', locationName: 'Computer Science Labs',
    date: '2026-09-18', description: 'Found next to workstation #12 in Lab 2. Dell branding on front.',
    keywords: 'backpack bag dell black laptop computer lab', contact: 'fatima.m@uni.edu',
    status: 'ACTIVE', createdAt: '2026-09-18T18:00:00Z'
  },
  {
    id: 'FOUND_5', reporterId: 'u2', reporterName: 'Sara Khan', type: 'FOUND',
    name: 'C++ Data Structures Book (Pearson)', category: 'Books & Stationery',
    brand: 'Pearson', color: 'Blue', locationName: 'Main Library',
    date: '2026-09-22', description: 'Found on a study desk near the bookshelf section. Blue cover.',
    keywords: 'book textbook dsa data structures c++ pearson library', contact: 'sara.k@uni.edu',
    status: 'ACTIVE', createdAt: '2026-09-22T11:00:00Z'
  },
  {
    id: 'FOUND_6', reporterId: 'u1', reporterName: 'Ali Raza', type: 'FOUND',
    name: 'SanDisk 64GB Red & Black Flash Drive', category: 'Electronics',
    brand: 'SanDisk', color: 'Red', locationName: 'Computer Science Labs',
    date: '2026-09-21', description: 'Found plugged into USB port of PC #7 in CS Lab 3.',
    keywords: 'usb sandisk 64gb red black drive flash memory lab', contact: 'ali.raza@uni.edu',
    status: 'ACTIVE', createdAt: '2026-09-21T18:30:00Z'
  },
  {
    id: 'FOUND_7', reporterId: 'u3', reporterName: 'Omar Sheikh', type: 'FOUND',
    name: 'Ring of Keys with Blue Tag', category: 'Keys & Wallets',
    brand: 'Yale', color: 'Silver', locationName: 'Main Parking Area',
    date: '2026-09-18', description: 'Found near bike stand in main parking lot. Three keys on ring.',
    keywords: 'keys ring keychain metal blue parking bike dorm', contact: 'omar.s@uni.edu',
    status: 'ACTIVE', createdAt: '2026-09-18T09:00:00Z'
  },
  {
    id: 'FOUND_8', reporterId: 'u5', reporterName: 'Hamza Tariq', type: 'FOUND',
    name: 'Black iPhone in Clear Case', category: 'Electronics',
    brand: 'Apple', color: 'Black', locationName: 'Sports Complex / Gym',
    date: '2026-09-22', description: 'Found on gym bench near locker room. Screen locked.',
    keywords: 'iphone apple phone black mobile gym bench', contact: 'hamza.t@uni.edu',
    status: 'ACTIVE', createdAt: '2026-09-22T17:00:00Z'
  },
  {
    id: 'FOUND_9', reporterId: 'u2', reporterName: 'Sara Khan', type: 'FOUND',
    name: 'Blue Engineering Project Report File', category: 'Documents & Cards',
    brand: 'Generic', color: 'Blue', locationName: 'Engineering Block A',
    date: '2026-09-20', description: 'Found in Lecture Hall 2, Eng Block A. Contains printed technical reports.',
    keywords: 'documents folder report engineering file papers', contact: 'sara.k@uni.edu',
    status: 'ACTIVE', createdAt: '2026-09-20T13:00:00Z'
  },
  {
    id: 'FOUND_10', reporterId: 'u1', reporterName: 'Ali Raza', type: 'FOUND',
    name: 'Apple AirPods Case (Green Cover)', category: 'Electronics',
    brand: 'Apple', color: 'White', locationName: 'Central Auditorium',
    date: '2026-09-21', description: 'Found under chair row E in the auditorium after seminar.',
    keywords: 'airpods apple wireless case earphones green cover', contact: 'ali.raza@uni.edu',
    status: 'ACTIVE', createdAt: '2026-09-21T20:30:00Z'
  }
];

// ═══════════════════════════════════════════════════════════════════
// 3. EXACT 100-POINT DSA MATCHING FORMULA (Rule-Based, Non-AI)
// ═══════════════════════════════════════════════════════════════════

function tokenize(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
}

function tokenOverlapRatio(strA, strB) {
  const tokA = new Set(tokenize(strA));
  const tokB = new Set(tokenize(strB));
  if (!tokA.size || !tokB.size) return 0;
  let matches = 0;
  for (const t of tokA) {
    if (tokB.has(t)) matches++;
  }
  return matches / Math.max(tokA.size, tokB.size);
}

/**
 * Transparent 100-Point Rule:
 * 1. Same Category          +20
 * 2. Same/Similar Name      +20
 * 3. Same Brand             +15
 * 4. Same Color             +10
 * 5. Same Location          +20
 * 6. Similar Keywords       +10
 * 7. Close Date             +5
 * ─────────────────────────────
 * Total                     100
 */
function calculateMatch(lost, found) {
  let score = 0;
  const breakdown = {};

  // 1. Category Match (20 pts)
  const catMatch = (lost.category || '').toLowerCase() === (found.category || '').toLowerCase();
  const catScore = catMatch ? 20 : 0;
  score += catScore;
  breakdown.category = { awarded: catScore, max: 20, matched: catMatch };

  // 2. Name Similarity (20 pts)
  const nameRatio = tokenOverlapRatio(lost.name, found.name);
  const nameScore = Math.round(nameRatio * 20);
  score += nameScore;
  breakdown.name = { awarded: nameScore, max: 20, ratio: Math.round(nameRatio * 100) };

  // 3. Brand Match (15 pts)
  const bA = (lost.brand || '').toLowerCase().trim();
  const bB = (found.brand || '').toLowerCase().trim();
  let brandScore = 0;
  if (bA && bB && (bA === bB || bA.includes(bB) || bB.includes(bA))) {
    brandScore = 15;
  }
  score += brandScore;
  breakdown.brand = { awarded: brandScore, max: 15, matched: brandScore > 0 };

  // 4. Color Match (10 pts)
  const cA = (lost.color || '').toLowerCase().trim();
  const cB = (found.color || '').toLowerCase().trim();
  const colorMatch = cA && cB && (cA === cB || cA.includes(cB) || cB.includes(cA));
  const colorScore = colorMatch ? 10 : 0;
  score += colorScore;
  breakdown.color = { awarded: colorScore, max: 10, matched: !!colorMatch };

  // 5. Location Match (20 pts)
  const locMatch = (lost.locationName || '').toLowerCase() === (found.locationName || '').toLowerCase();
  const locScore = locMatch ? 20 : 0;
  score += locScore;
  breakdown.location = { awarded: locScore, max: 20, matched: locMatch };

  // 6. Keywords Overlap (10 pts)
  const kwA = (lost.keywords || '') + ' ' + (lost.description || '');
  const kwB = (found.keywords || '') + ' ' + (found.description || '');
  const kwRatio = tokenOverlapRatio(kwA, kwB);
  const kwScore = Math.round(kwRatio * 10);
  score += kwScore;
  breakdown.keywords = { awarded: kwScore, max: 10, ratio: Math.round(kwRatio * 100) };

  // 7. Date Proximity (5 pts)
  const diffDays = Math.abs((new Date(lost.date) - new Date(found.date)) / (1000 * 60 * 60 * 24));
  let dateScore = 0;
  if (diffDays <= 2) dateScore = 5;
  else if (diffDays <= 5) dateScore = 3;
  score += dateScore;
  breakdown.date = { awarded: dateScore, max: 5, daysDifference: Math.round(diffDays) };

  // Classification Tier
  let tier = 'Low Match';
  if (score >= 90) tier = 'Very Strong Match';
  else if (score >= 75) tier = 'Strong Match';
  else if (score >= 60) tier = 'Possible Match';

  return {
    score: Math.min(100, score),
    tier,
    breakdown,
    lostItem: lost,
    foundItem: found
  };
}

// ═══════════════════════════════════════════════════════════════════
// 4. MAX HEAP IMPLEMENTATION (DSA Match Ranker)
// ═══════════════════════════════════════════════════════════════════

class MaxHeap {
  constructor() {
    this.heap = [];
  }
  insert(candidate) {
    this.heap.push(candidate);
    this._bubbleUp(this.heap.length - 1);
  }
  extractMax() {
    if (!this.heap.length) return null;
    const max = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = end;
      this._sinkDown(0);
    }
    return max;
  }
  _bubbleUp(idx) {
    const item = this.heap[idx];
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      const parent = this.heap[parentIdx];
      if (item.score <= parent.score) break;
      this.heap[idx] = parent;
      this.heap[parentIdx] = item;
      idx = parentIdx;
    }
  }
  _sinkDown(idx) {
    const length = this.heap.length;
    const item = this.heap[idx];
    while (true) {
      let left = 2 * idx + 1;
      let right = 2 * idx + 2;
      let swap = null;

      if (left < length && this.heap[left].score > item.score) {
        swap = left;
      }
      if (right < length && (swap === null ? this.heap[right].score > item.score : this.heap[right].score > this.heap[left].score)) {
        swap = right;
      }
      if (swap === null) break;
      this.heap[idx] = this.heap[swap];
      this.heap[swap] = item;
      idx = swap;
    }
  }
  getSortedRankings() {
    const sorted = [];
    while (this.heap.length) {
      sorted.push(this.extractMax());
    }
    return sorted;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 5. HTTP SERVER & API CONTROLLER
// ═══════════════════════════════════════════════════════════════════

function parseBody(req) {
  return new Promise(resolve => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(data)); } catch { resolve({}); }
    });
  });
}

function send(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
  });
  res.end(JSON.stringify(body));
}

function serveStatic(res, filePath) {
  const ext = path.extname(filePath);
  const mimes = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
    '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
    '.json': 'application/json'
  };
  const mime = mimes[ext] || 'text/plain';
  fs.readFile(filePath, (e, data) => {
    if (e) {
      // Fallback to index.html for SPA routes
      fs.readFile(path.join(CLIENT_DIR, 'index.html'), (err, fallback) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fallback);
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];
  const qs = Object.fromEntries(new URLSearchParams(req.url.includes('?') ? req.url.split('?')[1] : ''));
  const method = req.method;

  if (method === 'OPTIONS') { send(res, 204, {}); return; }

  // Static Frontend Files
  if (!url.startsWith('/api/')) {
    let filePath = path.join(CLIENT_DIR, url === '/' ? 'index.html' : url);
    if (!path.extname(filePath)) filePath = path.join(CLIENT_DIR, 'index.html');
    serveStatic(res, filePath);
    return;
  }

  const body = method !== 'GET' ? await parseBody(req) : {};

  // ── 1. GET /api/v1/items (Filter, Search & List) ──────────────────
  if (url === '/api/v1/items' && method === 'GET') {
    let list = [...ITEMS];

    if (qs.type && qs.type !== 'All') list = list.filter(i => i.type === qs.type);
    if (qs.category) list = list.filter(i => i.category === qs.category);
    if (qs.location) list = list.filter(i => i.locationName === qs.location);
    if (qs.status && qs.status !== 'All') list = list.filter(i => i.status === qs.status);
    if (qs.q) {
      const q = qs.q.toLowerCase();
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        (i.description || '').toLowerCase().includes(q) ||
        (i.brand || '').toLowerCase().includes(q) ||
        (i.keywords || '').toLowerCase().includes(q)
      );
    }

    // MergeSort-style sorting
    if (qs.sort === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (qs.sort === 'oldest') {
      list.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else {
      // Default: Newest first
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    send(res, 200, { success: true, data: { items: list, total: list.length } });
    return;
  }

  // ── 2. GET /api/v1/items/:id ──────────────────────────────────────
  const itemMatch = url.match(/^\/api\/v1\/items\/([^/]+)$/);
  if (itemMatch && method === 'GET') {
    const item = ITEMS.find(i => i.id === itemMatch[1]);
    if (!item) return send(res, 404, { success: false, message: 'Item not found' });
    send(res, 200, { success: true, data: item });
    return;
  }

  // ── 3. POST /api/v1/items/lost (Report Lost Item) ─────────────────
  if (url === '/api/v1/items/lost' && method === 'POST') {
    const newItem = {
      id: 'LOST_' + (ITEMS.filter(i => i.type === 'LOST').length + 1),
      reporterId: 'u1',
      reporterName: body.contactName || 'Ali Raza',
      type: 'LOST',
      name: body.name || 'Untitled Lost Item',
      category: body.category || 'Other',
      brand: body.brand || 'N/A',
      color: body.color || 'N/A',
      locationName: body.locationName || 'Main Library',
      date: body.date || new Date().toISOString().split('T')[0],
      description: body.description || '',
      keywords: body.keywords || body.name || '',
      contact: body.contact || 'student@uni.edu',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    ITEMS.unshift(newItem);

    // Compute immediate top match
    const heap = new MaxHeap();
    ITEMS.filter(i => i.type === 'FOUND' && i.status === 'ACTIVE').forEach(found => {
      heap.insert(calculateMatch(newItem, found));
    });
    const topMatch = heap.extractMax();

    if (topMatch && topMatch.score >= 60) {
      newItem.status = 'MATCHED';
    }

    send(res, 200, { success: true, message: 'Lost item reported successfully', data: { item: newItem, topMatch } });
    return;
  }

  // ── 4. POST /api/v1/items/found (Report Found Item) ───────────────
  if (url === '/api/v1/items/found' && method === 'POST') {
    const newItem = {
      id: 'FOUND_' + (ITEMS.filter(i => i.type === 'FOUND').length + 1),
      reporterId: 'u1',
      reporterName: body.contactName || 'Ali Raza',
      type: 'FOUND',
      name: body.name || 'Untitled Found Item',
      category: body.category || 'Other',
      brand: body.brand || 'N/A',
      color: body.color || 'N/A',
      locationName: body.locationName || 'Main Library',
      date: body.date || new Date().toISOString().split('T')[0],
      description: body.description || '',
      keywords: body.keywords || body.name || '',
      contact: body.contact || 'student@uni.edu',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    ITEMS.unshift(newItem);

    // Check if matches any active lost item
    const heap = new MaxHeap();
    ITEMS.filter(i => i.type === 'LOST' && i.status === 'ACTIVE').forEach(lost => {
      heap.insert(calculateMatch(lost, newItem));
    });
    const topMatch = heap.extractMax();

    send(res, 200, { success: true, message: 'Found item posted successfully', data: { item: newItem, topMatch } });
    return;
  }

  // ── 5. GET /api/v1/items/:id/matches (Max Heap Match Extractor) ───
  const matchReq = url.match(/^\/api\/v1\/items\/([^/]+)\/matches$/);
  if (matchReq && method === 'GET') {
    const targetId = matchReq[1];
    const target = ITEMS.find(i => i.id === targetId);
    if (!target) return send(res, 404, { success: false, message: 'Item not found' });

    const oppositeType = target.type === 'LOST' ? 'FOUND' : 'LOST';
    const candidates = ITEMS.filter(i => i.type === oppositeType && i.status !== 'RECOVERED');

    const heap = new MaxHeap();
    candidates.forEach(cand => {
      const match = target.type === 'LOST'
        ? calculateMatch(target, cand)
        : calculateMatch(cand, target);
      heap.insert(match);
    });

    const rankedResults = heap.getSortedRankings();
    send(res, 200, {
      success: true,
      data: {
        targetItem: target,
        matches: rankedResults,
        totalChecked: candidates.length
      }
    });
    return;
  }

  // ── 6. PATCH /api/v1/items/:id/recover (Mark Item as Recovered) ───
  const recoverReq = url.match(/^\/api\/v1\/items\/([^/]+)\/recover$/);
  if (recoverReq && method === 'PATCH') {
    const item = ITEMS.find(i => i.id === recoverReq[1]);
    if (!item) return send(res, 404, { success: false, message: 'Item not found' });

    item.status = 'RECOVERED';
    item.recoveredAt = new Date().toISOString();

    send(res, 200, {
      success: true,
      message: `Item "${item.name}" marked as RECOVERED!`,
      data: item
    });
    return;
  }

  // ── 7. GET /api/v1/analytics (Statistics) ─────────────────────────
  if ((url === '/api/v1/analytics' || url === '/api/v1/admin/analytics') && method === 'GET') {
    const totalLost = ITEMS.filter(i => i.type === 'LOST').length;
    const totalFound = ITEMS.filter(i => i.type === 'FOUND').length;
    const totalRecovered = ITEMS.filter(i => i.status === 'RECOVERED').length;
    const activeMatches = ITEMS.filter(i => i.status === 'MATCHED').length;
    const recoveryRate = totalLost > 0 ? Math.round((totalRecovered / totalLost) * 100) : 0;

    // Categories frequency
    const catCounts = {};
    ITEMS.forEach(i => { catCounts[i.category] = (catCounts[i.category] || 0) + 1; });
    const mostLostCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Electronics';

    // Locations frequency
    const locCounts = {};
    ITEMS.forEach(i => { locCounts[i.locationName] = (locCounts[i.locationName] || 0) + 1; });
    const mostCommonLocation = Object.entries(locCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Main Library';

    send(res, 200, {
      success: true,
      data: {
        totalLost,
        totalFound,
        totalRecovered,
        activeMatches,
        recoveryRate: recoveryRate + '%',
        mostLostCategory,
        mostCommonLocation
      }
    });
    return;
  }

  // ── 8. GET /api/v1/buildings ──────────────────────────────────────
  if (url === '/api/v1/graph/buildings' || url === '/api/v1/buildings') {
    send(res, 200, { success: true, data: BUILDINGS });
    return;
  }

  // ── 9. GET /api/v1/auth/me (Auto Demo Student Session) ────────────
  if (url === '/api/v1/auth/me') {
    send(res, 200, {
      success: true,
      data: { id: 'u1', name: 'Ali Raza', role: 'STUDENT', email: 'ali.raza@uni.edu' }
    });
    return;
  }

  send(res, 404, { success: false, message: 'Endpoint not found' });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ╔═════════════════════════════════════════════════════════╗');
  console.log('  ║       SMART LOST & FOUND — University DSA Engine        ║');
  console.log('  ║            "Find It. Match It. Return It."              ║');
  console.log('  ╚═════════════════════════════════════════════════════════╝');
  console.log(`  🚀  System is Live and Ready at:  http://localhost:${PORT}`);
  console.log('');
  console.log('  ✔ Max Heap Priority Ranking: Active');
  console.log('  ✔ 100-Point Rule Scoring Engine: Active');
  console.log('  ✔ 10 Lost & 10 Found Pre-loaded Campus Items: Ready');
  console.log('');
});
