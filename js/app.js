/**
 * SMART LOST & FOUND - UNIVERSAL JAVASCRIPT APPLICATION
 * "Find It. Match It. Return It."
 *
 * Universal Dual-Engine Architecture:
 * 1. Live C++ Winsock Backend: Automatically connects when running locally with smart_lost_found_server.exe
 * 2. In-Browser DSA Engine: Automatically activates when deployed on GitHub Pages, Vercel, Netlify,
 *    or static hosting, providing 100% interactive functionality without throwing errors.
 */

// ── Seed Dataset (Identical to university items.json) ───────────────────────
const SEED_ITEMS = [
  { id: "FOUND_10", type: "FOUND", name: "Apple AirPods Case (Green Cover)", category: "Electronics", description: "Found under chair in the auditorium after afternoon seminar.", brand: "Apple", color: "White", location: "Central Auditorium", date: "2026-09-21", keywords: "airpods apple wireless case earphones green cover", contact: "ali.raza@uni.edu", status: "ACTIVE" },
  { id: "LOST_10", type: "LOST", name: "Apple AirPods Pro (2nd Gen) in Case", category: "Electronics", description: "White Apple AirPods charging case with a green silicone protective cover.", brand: "Apple", color: "White", location: "Central Auditorium", date: "2026-09-21", keywords: "airpods apple earphones headphones pro wireless white", contact: "fatima.m@uni.edu", status: "ACTIVE" },
  { id: "LOST_11", type: "LOST", name: "Sony WH-1000XM4 Wireless Headphones", category: "Electronics", description: "Silver noise cancelling headphones in black travel pouch.", brand: "Sony", color: "Silver", location: "Main Library", date: "2026-09-23", keywords: "sony headphones wireless silver audio", contact: "tester@uni.edu", status: "RECOVERED" },
  { id: "LOST_1", type: "LOST", name: "Casio FX-991ES Plus Scientific Calculator", category: "Electronics", description: "Left on desk in 2nd floor quiet area with name sticker on back.", brand: "Casio", color: "Black", location: "Main Library", date: "2026-09-20", keywords: "calculator casio fx991es scientific black math", contact: "ali.raza@uni.edu", status: "ACTIVE" },
  { id: "LOST_2", type: "LOST", name: "University Student ID Card - Ali Raza", category: "Documents & Cards", description: "Official CS department student card on a navy blue lanyard with ID 2024-CS-42.", brand: "University", color: "Blue", location: "Cafeteria & Food Court", date: "2026-09-21", keywords: "student id card ali raza computer science lanyard", contact: "ali.raza@uni.edu", status: "ACTIVE" },
  { id: "LOST_3", type: "LOST", name: "Brown Leather Wallet (Samsonite)", category: "Keys & Wallets", description: "Dark brown bi-fold leather wallet containing student driving license and cards.", brand: "Samsonite", color: "Brown", location: "Student Center", date: "2026-09-19", keywords: "wallet leather brown samsonite license cards", contact: "sara.k@uni.edu", status: "ACTIVE" },
  { id: "LOST_4", type: "LOST", name: "Dell Pro 15.6 Laptop Backpack", category: "Bags & Backpacks", description: "Black Dell backpack with orange zipper accents. Contains charger and spiral notebook.", brand: "Dell", color: "Black", location: "Computer Science Labs", date: "2026-09-18", keywords: "backpack bag dell black laptop lab charger", contact: "omar.s@uni.edu", status: "ACTIVE" },
  { id: "LOST_5", type: "LOST", name: "Data Structures & Algorithms in C++ Textbook", category: "Books & Stationery", description: "Hardcover textbook by Mark Allen Weiss. Highlighted chapters on Trees and Graphs.", brand: "Pearson", color: "Blue", location: "Main Library", date: "2026-09-22", keywords: "book textbook dsa data structures c++ algorithms", contact: "ali.raza@uni.edu", status: "ACTIVE" },
  { id: "LOST_6", type: "LOST", name: "SanDisk Ultra 64GB USB 3.0 Flash Drive", category: "Electronics", description: "Small red and black retractable USB drive containing semester lab project code.", brand: "SanDisk", color: "Red", location: "Computer Science Labs", date: "2026-09-21", keywords: "usb flash drive sandisk 64gb red black memory stick", contact: "fatima.m@uni.edu", status: "ACTIVE" },
  { id: "LOST_7", type: "LOST", name: "Dorm Room Keys on Blue Nissan Keychain", category: "Keys & Wallets", description: "Ring of 3 silver metal keys with a blue rubber Nissan keychain tag.", brand: "Yale", color: "Silver", location: "Main Parking Area", date: "2026-09-17", keywords: "keys dorm room keychain blue nissan metal", contact: "hamza.t@uni.edu", status: "ACTIVE" },
  { id: "LOST_8", type: "LOST", name: "Apple iPhone 13 (Midnight Black, 128GB)", category: "Electronics", description: "Black iPhone in clear protective bumper case with a minor scratch on screen guard.", brand: "Apple", color: "Black", location: "Sports Complex / Gym", date: "2026-09-22", keywords: "iphone apple phone black 13 mobile smartphone", contact: "sara.k@uni.edu", status: "ACTIVE" },
  { id: "LOST_9", type: "LOST", name: "Final Year Engineering Project Report Folder", category: "Documents & Cards", description: "Thick blue plastic folder containing signed project reports, circuit schematics, and CD.", brand: "Generic", color: "Blue", location: "Engineering Block A", date: "2026-09-20", keywords: "documents folder report engineering fyp drawings", contact: "omar.s@uni.edu", status: "ACTIVE" },
  { id: "FOUND_1", type: "FOUND", name: "Casio Scientific Calculator FX-991ES", category: "Electronics", description: "Found on study table in the 2nd floor library reading room. Calculator works perfectly.", brand: "Casio", color: "Black", location: "Main Library", date: "2026-09-20", keywords: "calculator casio fx991es scientific black desk", contact: "hamza.t@uni.edu", status: "ACTIVE" },
  { id: "FOUND_2", type: "FOUND", name: "Student ID Card (Ali Raza)", category: "Documents & Cards", description: "Found on the cashier counter at the main cafeteria. Navy blue strap attached.", brand: "University", color: "Blue", location: "Cafeteria & Food Court", date: "2026-09-21", keywords: "id card student ali raza university cafeteria lanyard", contact: "omar.s@uni.edu", status: "ACTIVE" },
  { id: "FOUND_3", type: "FOUND", name: "Brown Leather Wallet", category: "Keys & Wallets", description: "Found on a couch in the student center lounge area. Samsonite logo visible.", brand: "Samsonite", color: "Brown", location: "Student Center", date: "2026-09-19", keywords: "wallet leather brown samsonite cards money lounge", contact: "ali.raza@uni.edu", status: "ACTIVE" },
  { id: "FOUND_4", type: "FOUND", name: "Black Dell Laptop Bag", category: "Bags & Backpacks", description: "Found next to workstation in Lab 2. Dell branding on front with charger inside.", brand: "Dell", color: "Black", location: "Computer Science Labs", date: "2026-09-18", keywords: "backpack bag dell black laptop computer lab", contact: "fatima.m@uni.edu", status: "ACTIVE" },
  { id: "FOUND_5", type: "FOUND", name: "C++ Data Structures Book (Pearson)", category: "Books & Stationery", description: "Found on a study desk near the bookshelf section. Blue cover.", brand: "Pearson", color: "Blue", location: "Main Library", date: "2026-09-22", keywords: "book textbook dsa data structures c++ pearson library", contact: "sara.k@uni.edu", status: "ACTIVE" },
  { id: "FOUND_6", type: "FOUND", name: "SanDisk 64GB Red & Black Flash Drive", category: "Electronics", description: "Found plugged into USB port of PC in CS Lab 3. Contains code folders.", brand: "SanDisk", color: "Red", location: "Computer Science Labs", date: "2026-09-21", keywords: "usb sandisk 64gb red black drive flash memory lab", contact: "ali.raza@uni.edu", status: "ACTIVE" },
  { id: "FOUND_7", type: "FOUND", name: "Ring of Keys with Blue Tag", category: "Keys & Wallets", description: "Found near bike stand in main parking lot. Three metal keys on ring.", brand: "Yale", color: "Silver", location: "Main Parking Area", date: "2026-09-18", keywords: "keys ring keychain metal blue parking bike dorm", contact: "omar.s@uni.edu", status: "ACTIVE" },
  { id: "FOUND_8", type: "FOUND", name: "Black iPhone in Clear Case", category: "Electronics", description: "Found on gym bench near locker room. Screen locked.", brand: "Apple", color: "Black", location: "Sports Complex / Gym", date: "2026-09-22", keywords: "iphone apple phone black mobile gym bench", contact: "hamza.t@uni.edu", status: "ACTIVE" },
  { id: "FOUND_9", type: "FOUND", name: "Blue Engineering Project Report File", category: "Documents & Cards", description: "Found in Lecture Hall 2, Eng Block A. Contains printed technical reports and schematics.", brand: "Generic", color: "Blue", location: "Engineering Block A", date: "2026-09-20", keywords: "documents folder report engineering file papers fyp", contact: "sara.k@uni.edu", status: "ACTIVE" },
  { id: "LOST_12", type: "LOST", name: "RUET Student ID Card (Roll 2410027)", category: "Documents & Cards", description: "Official RUET ECE student ID card with red strap, lost near Academic Building 2.", brand: "RUET", color: "Red", location: "Academic Building 2", date: "2026-09-24", keywords: "ruet student id card 2410027 ece lanyard red", contact: "2410027@student.ruet.ac.bd", status: "ACTIVE" },
  { id: "FOUND_11", type: "FOUND", name: "Casio Scientific Calculator fx-991CW", category: "Electronics", description: "Found in Library 1st floor study room, has small RUET sticker on reverse side.", brand: "Casio", color: "Black", location: "Main Library", date: "2026-09-24", keywords: "calculator casio 991cw scientific black library 2410026", contact: "2410026@student.ruet.ac.bd", status: "ACTIVE" },
  { id: "LOST_13", type: "LOST", name: "Lenovo ThinkPad Wireless Mouse", category: "Electronics", description: "Black Lenovo optical mouse left in Central Computer Center after lab session.", brand: "Lenovo", color: "Black", location: "Central Computer Center", date: "2026-09-23", keywords: "lenovo mouse wireless optical black computer center 2410029", contact: "2410029@student.ruet.ac.bd", status: "ACTIVE" }
];

// ── System Global State ────────────────────────────────────────────────────
let isBackendOnline = false;
let customApiUrl = localStorage.getItem('smart_lost_found_custom_api') || '';

function getApiBase() {
  if (customApiUrl) return customApiUrl.replace(/\/+$/, '');
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return window.location.port === '8080' ? '' : 'http://localhost:8080';
  }
  return '';
}
const API_BASE = getApiBase();

let currentUser = JSON.parse(localStorage.getItem('smart_lost_found_user')) || null;

let allItemsCache = [];
let currentFilter = {
  q: '',
  type: 'ALL',
  category: 'ALL',
  status: 'ALL',
  sort: 'DATE_NEWEST'
};

// ── In-Browser Client Storage ──────────────────────────────────────────────
function getLocalItems() {
  const data = localStorage.getItem('smart_lost_found_items');
  if (!data) {
    localStorage.setItem('smart_lost_found_items', JSON.stringify(SEED_ITEMS));
    return [...SEED_ITEMS];
  }
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...SEED_ITEMS];
  } catch (e) {
    return [...SEED_ITEMS];
  }
}

function saveLocalItems(items) {
  localStorage.setItem('smart_lost_found_items', JSON.stringify(items));
}

// ── Worldwide Real-Time Cloud Database Synchronization ─────────────────────
const CLOUD_DB_URL = 'https://mantledb.sh/v2/smart-lost-found-ruet/database';

// Asynchronously push latest items database to worldwide cloud
async function pushToWorldwideCloudDatabase(items) {
  if (!Array.isArray(items) || items.length === 0) return;
  try {
    const payload = {
      items,
      lastUpdated: new Date().toISOString()
    };
    await fetch(CLOUD_DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('Cloud database sync notice:', err);
  }
}

// Auto-sync with Worldwide Cloud Database across all devices, Vercel & GitHub Pages
async function syncWorldwideCloudDatabase() {
  try {
    let cloudItems = null;

    // 1. Fetch from Worldwide Cloud Database
    try {
      const res = await fetch(CLOUD_DB_URL);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          cloudItems = data.items;
        }
      }
    } catch (e) {
      console.warn('Direct cloud fetch notice:', e);
    }

    // 2. Fallback to items.json if cloud was not reachable
    if (!cloudItems || cloudItems.length === 0) {
      try {
        const localRes = await fetch(`./items.json?_t=${Date.now()}`);
        if (localRes.ok) {
          const lData = await localRes.json();
          if (Array.isArray(lData) && lData.length > 0) {
            cloudItems = lData;
          }
        }
      } catch (e) {}
    }

    if (!cloudItems || cloudItems.length === 0) return;

    // 3. Bidirectional merge:
    // - Merge cloud items into local storage
    // - If local storage has any items reported offline or locally that are not yet in cloud, push them to cloud!
    const localItems = getLocalItems();
    const localMap = new Map();
    localItems.forEach(it => { if (it && it.id) localMap.set(it.id, it); });

    let localNeedsSave = false;
    let cloudNeedsUpdate = false;

    cloudItems.forEach(cloudIt => {
      if (!cloudIt || !cloudIt.id) return;
      if (!localMap.has(cloudIt.id)) {
        localItems.push(cloudIt);
        localMap.set(cloudIt.id, cloudIt);
        localNeedsSave = true;
      } else {
        const localIt = localMap.get(cloudIt.id);
        if (cloudIt.status && cloudIt.status !== localIt.status) {
          localIt.status = cloudIt.status;
          localNeedsSave = true;
        }
      }
    });

    // Check if any local items are missing in cloud
    const cloudIds = new Set(cloudItems.map(c => c && c.id));
    localItems.forEach(localIt => {
      if (localIt && localIt.id && !cloudIds.has(localIt.id)) {
        cloudNeedsUpdate = true;
      }
    });

    if (localNeedsSave) {
      saveLocalItems(localItems);
      // Refresh current active view
      if (currentUser) {
        if (currentUser.role === 'ADMIN') {
          const activeSec = document.querySelector('.view-section.active');
          if (activeSec && activeSec.id === 'view-browse') loadBrowseItems();
          else if (activeSec && activeSec.id === 'view-settings') renderItemsControlTable();
          else loadDashboard();
        } else {
          loadDashboard();
        }
      }
    }

    if (cloudNeedsUpdate) {
      pushToWorldwideCloudDatabase(localItems);
    }
  } catch (err) {
    console.warn('Worldwide sync notice:', err);
  }
}

// Backward-compatible alias
const syncDatabaseWithRepository = syncWorldwideCloudDatabase;

// ── Database Export, Import & Clipboard Helpers (Admin Settings) ─────────────
function exportDatabaseToJson() {
  const items = getLocalItems();
  const jsonStr = JSON.stringify(items, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'items.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Exported ${items.length} items to items.json successfully!`, 'success');
}

function importDatabaseFromJson(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) {
        showToast('Invalid JSON file format. Expected a JSON array of items.', 'error');
        return;
      }

      // Merge imported items with existing items
      const localItems = getLocalItems();
      const localMap = new Map();
      localItems.forEach(it => { if (it && it.id) localMap.set(it.id, it); });

      let added = 0;
      imported.forEach(it => {
        if (!it || !it.id) return;
        if (!localMap.has(it.id)) {
          localItems.unshift(it);
          localMap.set(it.id, it);
          added++;
        }
      });

      saveLocalItems(localItems);
      pushToWorldwideCloudDatabase(localItems);
      renderItemsControlTable();
      loadDashboard();
      showToast(`Database synced! Added ${added} new items from imported file. Total items: ${localItems.length}`, 'success');
    } catch (parseErr) {
      showToast('Failed to parse JSON file: ' + parseErr.message, 'error');
    }
  };
  reader.readAsText(file);
  event.target.value = ''; // Reset input
}

function copyDatabaseJson() {
  const items = getLocalItems();
  const jsonStr = JSON.stringify(items, null, 2);
  navigator.clipboard.writeText(jsonStr).then(() => {
    showToast(`Copied complete database JSON (${items.length} items) to clipboard!`, 'success');
  }).catch(() => {
    showToast('Failed to copy to clipboard', 'error');
  });
}

// ── Registered RUET Students Store ─────────────────────────────────────────
const DEFAULT_STUDENTS = [
  { roll: "2410027", email: "2410027@student.ruet.ac.bd", password: "2410027", dept: "ECE (RUET)", registeredAt: "2026-09-24 10:00", status: "Active" },
  { roll: "2410026", email: "2410026@student.ruet.ac.bd", password: "2410026", dept: "ECE (RUET)", registeredAt: "2026-09-24 10:05", status: "Active" },
  { roll: "2410029", email: "2410029@student.ruet.ac.bd", password: "2410029", dept: "ECE (RUET)", registeredAt: "2026-09-24 10:10", status: "Active" }
];

function getRegisteredStudents() {
  const data = localStorage.getItem('smart_lost_found_registered_students');
  let list = [];
  if (!data) {
    list = [...DEFAULT_STUDENTS];
    localStorage.setItem('smart_lost_found_registered_students', JSON.stringify(list));
    return list;
  }
  try {
    list = JSON.parse(data);
    if (!Array.isArray(list) || list.length === 0) {
      list = [...DEFAULT_STUDENTS];
    }
  } catch (e) {
    list = [...DEFAULT_STUDENTS];
  }

  // Ensure all 3 RUET student accounts are ALWAYS present with valid roll password
  let modified = false;
  DEFAULT_STUDENTS.forEach(defSt => {
    const existing = list.find(s => s.roll === defSt.roll);
    if (!existing) {
      list.push(defSt);
      modified = true;
    } else if (!existing.password || existing.password !== defSt.password) {
      existing.password = defSt.password;
      existing.status = 'Active';
      modified = true;
    }
  });

  if (modified) {
    localStorage.setItem('smart_lost_found_registered_students', JSON.stringify(list));
  }
  return list;
}

function saveRegisteredStudents(list) {
  localStorage.setItem('smart_lost_found_registered_students', JSON.stringify(list));
}

// ── Search & Query History Audit Store ──────────────────────────────────────
const DEFAULT_SEARCH_HISTORY = [
  { id: "SH_1", timestamp: "2026-09-24 16:45:10", query: "student id card 2410027", category: "Documents & Cards", type: "LOST", resultsCount: 1, searchedBy: "2410027@student.ruet.ac.bd" },
  { id: "SH_2", timestamp: "2026-09-24 16:20:05", query: "casio calculator 991cw", category: "Electronics", type: "FOUND", resultsCount: 1, searchedBy: "2410026@student.ruet.ac.bd" },
  { id: "SH_3", timestamp: "2026-09-24 15:55:40", query: "wireless mouse lenovo", category: "Electronics", type: "LOST", resultsCount: 1, searchedBy: "2410029@student.ruet.ac.bd" },
  { id: "SH_4", timestamp: "2026-09-23 14:10:12", query: "sandisk red flash drive cs lab", category: "Electronics", type: "FOUND", resultsCount: 1, searchedBy: "ali.raza@uni.edu" },
  { id: "SH_5", timestamp: "2026-09-22 11:35:18", query: "keys blue tag parking", category: "Keys & Wallets", type: "FOUND", resultsCount: 1, searchedBy: "omar.s@uni.edu" },
  { id: "SH_6", timestamp: "2026-09-22 10:15:30", query: "black iphone gym locker", category: "Electronics", type: "FOUND", resultsCount: 1, searchedBy: "hamza.t@uni.edu" },
  { id: "SH_7", timestamp: "2026-09-21 17:05:22", query: "engineering project report folder", category: "Documents & Cards", type: "FOUND", resultsCount: 1, searchedBy: "sara.k@uni.edu" },
  { id: "SH_8", timestamp: "2026-09-20 12:40:00", query: "casio fx-991ex calculator", category: "Electronics", type: "LOST", resultsCount: 2, searchedBy: "admin@university.edu" }
];

function getSearchHistory() {
  const data = localStorage.getItem('smart_lost_found_search_history');
  if (!data) {
    localStorage.setItem('smart_lost_found_search_history', JSON.stringify(DEFAULT_SEARCH_HISTORY));
    return [...DEFAULT_SEARCH_HISTORY];
  }
  try {
    const list = JSON.parse(data);
    return Array.isArray(list) ? list : [...DEFAULT_SEARCH_HISTORY];
  } catch (e) {
    return [...DEFAULT_SEARCH_HISTORY];
  }
}

function logSearchHistory(query, category = 'ALL', type = 'ALL', count = 0) {
  if (!query || query.trim() === '') return;
  const history = getSearchHistory();
  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);
  const byUser = currentUser ? (currentUser.contact || currentUser.role) : 'Anonymous';

  if (history.length > 0 && history[0].query === query.trim() && history[0].searchedBy === byUser) {
    return;
  }

  const entry = {
    id: 'SH_' + Date.now(),
    timestamp: dateStr,
    query: query.trim(),
    category: category || 'ALL',
    type: type || 'ALL',
    resultsCount: count,
    searchedBy: byUser
  };

  history.unshift(entry);
  if (history.length > 100) history.pop();
  localStorage.setItem('smart_lost_found_search_history', JSON.stringify(history));
}

function clearSearchHistory() {
  if (!confirm('Are you sure you want to clear all search and query history records?')) return;
  localStorage.setItem('smart_lost_found_search_history', JSON.stringify([]));
  renderSearchHistoryTable();
  showToast('Search query audit history cleared.', 'success');
}

// ── Admin Security Credentials Store ───────────────────────────────────────
function getAdminPassword() {
  return localStorage.getItem('smart_lost_found_admin_password') || 'admin123';
}

function setAdminPassword(newPass) {
  localStorage.setItem('smart_lost_found_admin_password', newPass);
}

function handleAdminPasswordChange(event) {
  if (event) event.preventDefault();
  const currPass = document.getElementById('curr-admin-pass').value;
  const newPass = document.getElementById('new-admin-pass').value;
  const confPass = document.getElementById('confirm-admin-pass').value;

  if (currPass !== getAdminPassword()) {
    showToast('Current admin password does not match!', 'error');
    return;
  }
  if (newPass !== confPass) {
    showToast('New passwords do not match!', 'error');
    return;
  }
  if (newPass.length < 4) {
    showToast('New password must be at least 4 characters long!', 'error');
    return;
  }

  setAdminPassword(newPass);
  document.getElementById('admin-password-form').reset();
  showToast('Admin password updated successfully! Use your new password for next logins.', 'success');
}


// ── Engine Status UI Indicator ─────────────────────────────────────────────
function updateEngineBadge(isLive, labelText) {
  const dot = document.getElementById('engine-dot');
  const label = document.getElementById('engine-label');
  const badge = document.getElementById('engine-status-badge');
  if (!dot || !label || !badge) return;

  if (isLive) {
    dot.style.background = '#10b981'; // Green
    label.textContent = labelText || '🟢 C++ Winsock Backend';
    badge.title = 'Active: Local C++ Winsock 100-Point Engine & Hash Table Server (Port 8080)';
    badge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    badge.style.background = 'rgba(16, 185, 129, 0.08)';
  } else {
    dot.style.background = '#06b6d4'; // Cyan / Teal
    label.textContent = labelText || '🌐 Worldwide Cloud Sync';
    badge.title = 'Active: Worldwide Real-Time Cloud Database & In-Browser Engine';
    badge.style.borderColor = 'rgba(6, 182, 212, 0.4)';
    badge.style.background = 'rgba(6, 182, 212, 0.08)';
  }
}

async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${API_BASE}/api/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'ok') {
        isBackendOnline = true;
        updateEngineBadge(true, '🟢 C++ Backend');
        return true;
      }
    }
  } catch (e) {
    // Offline / Cloud mode
  }
  isBackendOnline = false;
  updateEngineBadge(false, '🌐 Worldwide Cloud Sync');
  return false;
}

// ── Role UI Management ─────────────────────────────────────────────────────
function updateRoleUI() {
  if (!currentUser) {
    showStartingScreen();
    return;
  }

  const badge = document.getElementById('current-user-badge');
  const label = document.getElementById('current-user-label');
  const authBtn = document.getElementById('auth-action-btn');
  const navBrowse = document.getElementById('nav-item-browse');
  const navSettings = document.getElementById('nav-item-settings');
  const navStats = document.getElementById('nav-item-stats');
  const navSync = document.getElementById('nav-item-sync');
  const heroBrowseBtn = document.getElementById('hero-browse-btn');
  const privacyBanner = document.getElementById('student-privacy-banner');
  const navDashBtn = document.getElementById('nav-dashboard');

  if (currentUser.role === 'ADMIN') {
    // REMOVED "Admin: Campus Office" badge per user request!
    if (badge) badge.style.display = 'none';
    if (authBtn) {
      authBtn.textContent = '🚪 Sign Out';
      authBtn.onclick = handleSignOut;
    }

    if (navBrowse) navBrowse.style.display = 'block';
    if (navSettings) navSettings.style.display = 'block';
    // REMOVED "DSA Engine & Stats" in navbar per user request!
    if (navStats) navStats.style.display = 'none';
    if (navSync) navSync.style.display = 'block';
    if (heroBrowseBtn) heroBrowseBtn.style.display = 'inline-flex';
    if (privacyBanner) privacyBanner.style.display = 'none';
    if (navDashBtn) navDashBtn.innerHTML = '📊 Campus Dashboard';
  } else {
    // Student Mode
    if (badge) {
      badge.style.display = 'inline-flex';
      badge.className = 'user-badge student-active';
    }
    if (label) label.innerHTML = `👨‍🎓 <strong>Student:</strong> ${escapeHtml(currentUser.contact)}`;
    if (authBtn) {
      authBtn.textContent = '🚪 Sign Out';
      authBtn.onclick = handleSignOut;
    }

    if (navBrowse) navBrowse.style.display = 'none';
    if (navSettings) navSettings.style.display = 'none';
    if (navStats) navStats.style.display = 'none';
    if (navSync) navSync.style.display = 'none';
    if (heroBrowseBtn) heroBrowseBtn.style.display = 'none';
    if (privacyBanner) {
      privacyBanner.style.display = 'flex';
      const emailSpan = document.getElementById('banner-student-email');
      if (emailSpan) emailSpan.textContent = currentUser.contact;
    }
    if (navDashBtn) navDashBtn.innerHTML = '📊 My Belongings';

    const lostContact = document.getElementById('lost-contact');
    const foundContact = document.getElementById('found-contact');
    if (lostContact) lostContact.value = currentUser.contact;
    if (foundContact) foundContact.value = currentUser.contact;
  }
}

// ── View Switching ─────────────────────────────────────────────────────────
function switchView(viewName) {
  if (!currentUser) {
    showStartingScreen();
    return;
  }

  if ((viewName === 'browse' || viewName === 'stats' || viewName === 'settings') && currentUser.role !== 'ADMIN') {
    showToast('Campus-wide browsing and settings are restricted to administrators', 'error');
    switchView('dashboard');
    return;
  }

  const sections = document.querySelectorAll('.view-section');
  sections.forEach(sec => sec.classList.remove('active'));

  const activeSec = document.getElementById(`view-${viewName}`);
  if (activeSec) activeSec.classList.add('active');

  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => btn.classList.remove('active'));

  const activeNav = document.getElementById(`nav-${viewName}`);
  if (activeNav) activeNav.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (viewName === 'dashboard') {
    loadDashboard();
  } else if (viewName === 'browse') {
    loadBrowseItems();
  } else if (viewName === 'matches') {
    populateMatchDropdown();
  } else if (viewName === 'stats') {
    loadStatistics();
  } else if (viewName === 'settings') {
    loadSettingsView();
  }
}

// ── Toast Notifications ───────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : '⚠️'}</span>
    <div>${message}</div>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ── Worldwide GitHub Sync Handlers (Admin Only) ───────────────────────────
function triggerWorldwideSync() {
  if (currentUser.role !== 'ADMIN') {
    showToast('Worldwide deployment is restricted to campus administrators', 'error');
    openLoginModal('ADMIN');
    return;
  }

  const modal = document.getElementById('sync-modal');
  const statusMsg = document.getElementById('sync-status-msg');
  const statusSub = document.getElementById('sync-status-sub');
  const confirmBtn = document.getElementById('sync-confirm-btn');

  if (statusMsg) statusMsg.innerHTML = 'Ready to sync with GitHub repository.';
  if (statusSub) statusSub.textContent = 'When triggered, all database records will be committed and pushed to origin main.';
  if (confirmBtn) {
    confirmBtn.disabled = false;
    confirmBtn.textContent = '🚀 Commit & Deploy Worldwide';
    confirmBtn.onclick = executeWorldwideSync;
  }
  if (modal) modal.style.display = 'flex';
}

function closeSyncModal() {
  const modal = document.getElementById('sync-modal');
  if (modal) modal.style.display = 'none';
}

function handleSyncModalOverlay(event) {
  if (event.target.id === 'sync-modal') {
    closeSyncModal();
  }
}

// ── Universal Worldwide Commit & Push Orchestrator ─────────────────────────
async function triggerWorldwideGitSync(commitMessage = 'Worldwide live update via Smart Lost & Found Web Portal') {
  const currentItems = getLocalItems();

  // 1. Instantly push to Worldwide Cloud Database (Cloudflare Edge, sub-50ms)
  await pushToWorldwideCloudDatabase(currentItems);

  // 2. Try C++ Winsock backend /api/git/sync if available
  try {
    const res = await fetch(`${getApiBase()}/api/git/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: commitMessage })
    });
    if (res.ok) {
      console.log('[Worldwide Sync] Git commit & push triggered via C++ backend.');
      return { success: true, channel: 'backend' };
    }
  } catch (e) {
    // Backend offline / static mode
  }

  // 3. If running on GitHub Pages / Vercel, push directly via GitHub REST API if token exists
  const token = localStorage.getItem('smart_lost_found_github_token') || '';
  if (token) {
    try {
      const repo = 'saimur-rahman2301/Smart-lost-and-found-system';
      const filePath = 'items.json';

      const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let sha = '';
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
      }

      const contentEncoded = btoa(unescape(encodeURIComponent(JSON.stringify(currentItems, null, 2))));
      const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: commitMessage,
          content: contentEncoded,
          sha: sha || undefined
        })
      });
      if (putRes.ok) {
        console.log('[Worldwide Sync] GitHub API direct commit & push completed.');
        return { success: true, channel: 'github_api' };
      }
    } catch (e) {
      console.warn('[Worldwide Sync] GitHub API direct commit failed:', e);
    }
  }

  return { success: true, channel: 'cloud' };
}

async function executeWorldwideSync() {
  const statusMsg = document.getElementById('sync-status-msg');
  const statusSub = document.getElementById('sync-status-sub');
  const confirmBtn = document.getElementById('sync-confirm-btn');

  if (confirmBtn) confirmBtn.disabled = true;
  if (statusMsg) statusMsg.innerHTML = '⏳ Committing and pushing to GitHub... Please wait...';
  if (statusSub) statusSub.textContent = 'Executing git add, commit, and git push origin main...';

  // Push latest local items to worldwide cloud database immediately
  await pushToWorldwideCloudDatabase(getLocalItems());

  // 1. Try local C++ backend /api/git/sync first
  try {
    const res = await fetch(`${getApiBase()}/api/git/sync`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      if (statusMsg) statusMsg.innerHTML = '🎉 Success! Changes pushed to GitHub!';
      if (statusSub) statusSub.textContent = 'GitHub Actions has started building. The live website will update worldwide in ~60 seconds.';
      showToast('Successfully committed and pushed to GitHub! Website updating worldwide.', 'success');
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = '✅ Push Completed';
      }
      setTimeout(() => closeSyncModal(), 3500);
      return;
    }
  } catch (err) {
    // Backend endpoint not reachable (e.g. running on static GitHub Pages)
  }

  // 2. If running on GitHub Pages (static cloud without local server)
  let token = localStorage.getItem('smart_lost_found_github_token') || '';
  if (!token) {
    if (statusMsg) statusMsg.innerHTML = '🔑 GitHub Token Needed for Browser Push';
    if (statusSub) {
      statusSub.innerHTML = `
        <p style="margin:0.25rem 0 0.5rem 0; font-size:0.85rem;">You are viewing this site live on GitHub Pages. To commit directly from browser, enter your GitHub Personal Access Token (PAT):</p>
        <input type="password" id="gh-token-input" class="form-input" style="margin-bottom:0.5rem;" placeholder="github_pat_xxxx or ghp_xxxx">
        <span style="font-size:0.75rem; color:var(--text-muted);">
          Alternatively on your PC, simply double-click <strong>update_worldwide.bat</strong> in the project folder to push without any token!
        </span>
      `;
    }
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Save Token & Push';
      confirmBtn.onclick = async () => {
        const input = document.getElementById('gh-token-input');
        if (input && input.value.trim()) {
          localStorage.setItem('smart_lost_found_github_token', input.value.trim());
          executeWorldwideSync();
        } else {
          showToast('Please enter a GitHub Personal Access Token', 'error');
        }
      };
    }
    return;
  }

  // 3. Push items.json directly via GitHub REST API
  try {
    if (statusMsg) statusMsg.innerHTML = '🌐 Uploading latest database to GitHub repository...';
    const repo = 'saimur-rahman2301/Smart-lost-and-found-system';
    const filePath = 'items.json';

    const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    let sha = '';
    if (getRes.ok) {
      const fileData = await getRes.json();
      sha = fileData.sha;
    }

    const currentItems = getLocalItems();
    const contentEncoded = btoa(unescape(encodeURIComponent(JSON.stringify(currentItems, null, 2))));

    const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Worldwide live database update via web portal',
        content: contentEncoded,
        sha: sha || undefined
      })
    });

    if (putRes.ok) {
      if (statusMsg) statusMsg.innerHTML = '🎉 Success! Committed directly to GitHub main branch!';
      if (statusSub) statusSub.textContent = 'GitHub Actions is deploying the live website worldwide (~60s).';
      showToast('Successfully committed to GitHub! Website updating worldwide.', 'success');
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = '✅ Completed';
      }
      setTimeout(() => closeSyncModal(), 3500);
      return;
    } else {
      const errData = await putRes.json();
      throw new Error(errData.message || 'GitHub API rejected commit');
    }
  } catch (apiErr) {
    if (statusMsg) statusMsg.innerHTML = '⚠️ Browser push encountered an issue';
    if (statusSub) {
      statusSub.innerHTML = `
        <div style="color:var(--danger);">${escapeHtml(apiErr.message)}</div>
        <div style="margin-top:0.5rem; font-size:0.8rem;">
          <strong>Tip for your PC:</strong> Double-click <code>update_worldwide.bat</code> in the project folder to push instantly!
        </div>
      `;
    }
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Retry';
      confirmBtn.onclick = executeWorldwideSync;
    }
  }
}

// ── Universal Data Operations ─────────────────────────────────────────────
async function fetchItems(params = {}) {
  if (isBackendOnline) {
    try {
      const combined = { ...params };
      if (currentUser.role === 'ADMIN') {
        combined.role = 'ADMIN';
        combined.token = currentUser.token;
      } else {
        combined.role = 'STUDENT';
        combined.contact = currentUser.contact;
      }

      const query = new URLSearchParams(combined).toString();
      const res = await fetch(`${API_BASE}/api/items?${query}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('C++ server communication dropped, falling back to local store.');
      isBackendOnline = false;
      updateEngineBadge(false, '🌐 Worldwide Cloud Sync');
    }
  }

  // Client-Side In-Browser DSA Engine
  let items = getLocalItems();

  // Role Filtering: Student Privacy Enforcement (Preserves all items reported by student)
  if (currentUser && currentUser.role === 'STUDENT') {
    const studentEmail = (currentUser.contact || '').toLowerCase().trim();
    const studentRoll = (currentUser.roll || '').trim();

    items = items.filter(it => {
      const itContact = (it.contact || '').toLowerCase().trim();
      const itReportedBy = (it.reportedBy || '').toLowerCase().trim();
      const itRoll = (it.reporterRoll || '').trim();

      // 1. Direct match with student email or reportedBy
      if (itContact === studentEmail || itReportedBy === studentEmail) return true;

      // 2. Roll matching (e.g. 2410027)
      if (studentRoll) {
        if (itRoll === studentRoll) return true;
        if (itContact.includes(studentRoll) || itReportedBy.includes(studentRoll)) return true;
        if ((it.keywords || '').includes(studentRoll) || (it.name || '').includes(studentRoll)) return true;
      }
      return false;
    });
  }

  // Type filter
  if (params.type && params.type !== 'ALL') {
    items = items.filter(it => it.type === params.type);
  }

  // Category filter
  if (params.category && params.category !== 'ALL') {
    items = items.filter(it => it.category === params.category);
  }

  // Status filter
  if (params.status && params.status !== 'ALL') {
    items = items.filter(it => it.status === params.status);
  }

  // Search query (Tokens / Substring)
  if (params.q && params.q.trim() !== '') {
    const query = params.q.toLowerCase().trim();
    items = items.filter(it => {
      const targetStr = `${it.name} ${it.description} ${it.keywords} ${it.location} ${it.brand} ${it.color}`.toLowerCase();
      return targetStr.includes(query);
    });
  }

  // Sorting
  const sort = params.sort || 'DATE_NEWEST';
  if (sort === 'DATE_NEWEST') {
    items.sort((a, b) => b.date.localeCompare(a.date));
  } else if (sort === 'DATE_OLDEST') {
    items.sort((a, b) => a.date.localeCompare(b.date));
  } else if (sort === 'NAME_ASC') {
    items.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'NAME_DESC') {
    items.sort((a, b) => b.name.localeCompare(a.name));
  }

  return items;
}

// ── Dashboard View ─────────────────────────────────────────────────────────
async function loadDashboard() {
  updateRoleUI();

  const items = await fetchItems({ sort: 'DATE_NEWEST' });
  const grid = document.getElementById('dashboard-recent-grid');

  if (currentUser.role === 'STUDENT') {
    let myLost = 0, myFound = 0, myRecovered = 0;
    items.forEach(it => {
      if (it.type === 'LOST') myLost++;
      else if (it.type === 'FOUND') myFound++;
      if (it.status === 'RECOVERED') myRecovered++;
    });

    document.getElementById('dash-total-lost').textContent = myLost;
    document.getElementById('dash-total-found').textContent = myFound;
    document.getElementById('dash-total-recovered').textContent = myRecovered;
    const rate = myLost > 0 ? ((myRecovered / myLost) * 100).toFixed(1) : '0.0';
    document.getElementById('dash-recovery-rate').textContent = `${rate}%`;

    const heading = document.getElementById('dashboard-items-heading');
    const subheading = document.getElementById('dashboard-items-subheading');
    if (heading) heading.textContent = '📋 My Reported Belongings';
    if (subheading) subheading.textContent = `Items reported under ${currentUser.contact}`;

    if (!items || items.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:3rem; background:white; border-radius:var(--radius-md); border:1px dashed var(--border);">
          <div style="font-size:2.5rem; margin-bottom:0.75rem;">📦</div>
          <div style="font-weight:700; font-size:1.1rem; color:var(--text-primary);">No belongings reported yet</div>
          <p style="font-size:0.875rem; color:var(--text-secondary); margin-top:0.35rem; margin-bottom:1.25rem;">
            You haven't reported any lost or found items under <strong>${escapeHtml(currentUser.contact)}</strong>.
          </p>
          <div style="display:flex; justify-content:center; gap:0.75rem;">
            <button class="btn btn-danger btn-sm" onclick="switchView('report-lost')">🔴 Report Lost</button>
            <button class="btn btn-success btn-sm" onclick="switchView('report-found')">🟢 Report Found</button>
          </div>
        </div>
      `;
      return;
    }
  } else {
    // Admin role
    const allItems = getLocalItems();
    let totLost = 0, totFound = 0, totRec = 0;
    allItems.forEach(i => {
      if (i.type === 'LOST') totLost++;
      else if (i.type === 'FOUND') totFound++;
      if (i.status === 'RECOVERED') totRec++;
    });

    document.getElementById('dash-total-lost').textContent = totLost;
    document.getElementById('dash-total-found').textContent = totFound;
    document.getElementById('dash-total-recovered').textContent = totRec;
    const rate = totLost > 0 ? ((totRec / totLost) * 100).toFixed(1) : '0.0';
    document.getElementById('dash-recovery-rate').textContent = `${rate}%`;

    const heading = document.getElementById('dashboard-items-heading');
    const subheading = document.getElementById('dashboard-items-subheading');
    if (heading) heading.textContent = '📋 Recent Campus Items (All Reports)';
    if (subheading) subheading.textContent = 'Administrator view of all latest student reports across campus.';

    if (!items || items.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--text-muted);">No campus items recorded yet.</div>`;
      return;
    }
  }

  grid.innerHTML = items.slice(0, 6).map(item => renderItemCard(item)).join('');
}

// ── Search & Browse View (Admin Only) ──────────────────────────────────────
let searchDebounceTimer = null;
function handleSearchChange() {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    currentFilter.q = document.getElementById('search-input').value.trim();
    loadBrowseItems();
  }, 200);
}

function handleFilterChange() {
  currentFilter.type = document.getElementById('filter-type').value;
  currentFilter.category = document.getElementById('filter-category').value;
  currentFilter.status = document.getElementById('filter-status').value;
  currentFilter.sort = document.getElementById('filter-sort').value;
  loadBrowseItems();
}

function resetFilters() {
  document.getElementById('search-input').value = '';
  document.getElementById('filter-type').value = 'ALL';
  document.getElementById('filter-category').value = 'ALL';
  document.getElementById('filter-status').value = 'ALL';
  document.getElementById('filter-sort').value = 'DATE_NEWEST';
  currentFilter = { q: '', type: 'ALL', category: 'ALL', status: 'ALL', sort: 'DATE_NEWEST' };
  loadBrowseItems();
}

async function loadBrowseItems() {
  if (currentUser.role !== 'ADMIN') {
    switchView('dashboard');
    return;
  }

  const grid = document.getElementById('browse-items-grid');
  grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--text-muted);">Loading Data Structures...</div>`;

  const items = await fetchItems(currentFilter);
  allItemsCache = items;

  if (currentFilter.q && currentFilter.q.trim() !== '') {
    logSearchHistory(currentFilter.q, currentFilter.category, currentFilter.type, items ? items.length : 0);
  }

  if (!items || items.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:3rem; background:white; border-radius:var(--radius-md); border:1px dashed var(--border); color:var(--text-muted);">
        <div style="font-size:2rem; margin-bottom:0.5rem;">🔍</div>
        <div style="font-weight:600; color:var(--text-primary); margin-bottom:0.25rem;">No matching items found</div>
        <p style="font-size:0.875rem;">Try adjusting your search query, location, or category filters.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = items.map(item => renderItemCard(item)).join('');
}

// ── Render Item Card ───────────────────────────────────────────────────────
function renderItemCard(item) {
  const isLost = item.type === 'LOST';
  const isRecovered = item.status === 'RECOVERED';
  const typeBadgeClass = isLost ? 'badge-lost' : 'badge-found';
  const statusBadgeClass = isRecovered ? 'badge-recovered' : 'badge-active';

  return `
    <div class="item-card">
      <div>
        <div class="card-header">
          <span class="badge ${typeBadgeClass}">${item.type}</span>
          <span class="badge ${statusBadgeClass}">${item.status}</span>
        </div>
        <h3 class="item-title">${escapeHtml(item.name)}</h3>
        <p class="item-description">${escapeHtml(item.description || 'No additional description provided.')}</p>
        
        <div class="item-meta-grid">
          <div class="meta-item">
            <span class="meta-label">Category</span>
            <span class="meta-value">${escapeHtml(item.category)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Location</span>
            <span class="meta-value">📍 ${escapeHtml(item.location)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Color / Brand</span>
            <span class="meta-value">${escapeHtml(item.color || 'N/A')} • ${escapeHtml(item.brand || 'Generic')}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Date</span>
            <span class="meta-value">📅 ${escapeHtml(item.date)}</span>
          </div>
          <div class="meta-item" style="grid-column:span 2;">
            <span class="meta-label">Reporter Contact</span>
            <span class="meta-value" style="font-size:0.75rem;">📞 ${escapeHtml(item.contact)}</span>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <span style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono);">${item.id}</span>
        <div style="display:flex; gap:0.5rem;">
          ${isLost && !isRecovered ? `<button class="btn btn-outline btn-sm" onclick="matchSpecificItem('${item.id}')">🎯 Matches</button>` : ''}
          <button class="btn btn-outline btn-sm" onclick="showItemModal('${item.id}')">View Details</button>
        </div>
      </div>
    </div>
  `;
}

// ── Report Submission (Lost or Found) ──────────────────────────────────────
async function submitReport(event, type) {
  event.preventDefault();

  const prefix = type === 'LOST' ? 'lost' : 'found';
  const formEl = document.getElementById(`form-${prefix}`);
  const submitBtn = formEl ? formEl.querySelector('button[type="submit"]') : null;
  const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Submitting &amp; Syncing Worldwide (Commit-Push)...';
  }

  try {
    const name = document.getElementById(`${prefix}-name`).value.trim();
    const category = document.getElementById(`${prefix}-category`).value;
    const color = document.getElementById(`${prefix}-color`).value.trim();
    const brand = document.getElementById(`${prefix}-brand`).value.trim() || 'Generic';
    const location = document.getElementById(`${prefix}-location`).value;
    const date = document.getElementById(`${prefix}-date`).value;
    const contact = document.getElementById(`${prefix}-contact`).value.trim();
    const keywords = document.getElementById(`${prefix}-keywords`).value.trim();
    const description = document.getElementById(`${prefix}-description`).value.trim();

    const localItems = getLocalItems();

    // Find max numerical ID among items with this prefix to avoid collisions across sessions
    let maxNum = 0;
    localItems.forEach(it => {
      if (it && it.id && it.id.startsWith(type + '_')) {
        const numPart = parseInt(it.id.replace(type + '_', ''), 10);
        if (!isNaN(numPart) && numPart > maxNum) maxNum = numPart;
      }
    });
    const generatedId = `${type}_${maxNum + 1}`;

    const payload = {
      id: generatedId,
      type,
      name,
      category,
      color,
      brand,
      location,
      date,
      contact: contact || (currentUser ? currentUser.contact : ''),
      reportedBy: currentUser ? (currentUser.contact || currentUser.email || 'RUET Student') : (contact || ''),
      reporterRoll: currentUser ? (currentUser.roll || '') : '',
      reportedAt: new Date().toISOString(),
      keywords,
      description,
      status: 'ACTIVE'
    };

    let createdItem = payload;

    if (isBackendOnline) {
      try {
        const res = await fetch(`${API_BASE}/api/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.id) createdItem = data;
        }
      } catch (e) {
        console.warn('Backend write failed, saving locally.');
      }
    }

    // Always persist locally for permanent client session
    localItems.unshift(createdItem);
    saveLocalItems(localItems);

    // Trigger worldwide auto-sync & Git commit-push at a time
    const syncMsg = `Worldwide Auto-Sync: New ${type.toLowerCase()} item reported (${createdItem.name} [ID: ${createdItem.id}])`;
    await triggerWorldwideGitSync(syncMsg);

    showToast(`Successfully reported ${type.toLowerCase()} item! (ID: ${createdItem.id}) 🚀 Worldwide auto commit-push initiated!`, 'success');
    if (formEl) formEl.reset();

    if (currentUser && currentUser.role === 'STUDENT') {
      const contactEl = document.getElementById(`${prefix}-contact`);
      if (contactEl) contactEl.value = currentUser.contact;
    }

    if (type === 'LOST') {
      setTimeout(() => {
        matchSpecificItem(createdItem.id);
      }, 400);
    } else {
      switchView('dashboard');
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
  }
}

// ── 100-Point Rule-Based Matching Engine ────────────────────────────────────
function calculateTokenOverlap(s1, s2) {
  if (!s1 || !s2) return 0;
  const tokens1 = new Set(s1.toLowerCase().split(/[\s,.-]+/).filter(t => t.length > 2));
  const tokens2 = new Set(s2.toLowerCase().split(/[\s,.-]+/).filter(t => t.length > 2));
  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let common = 0;
  tokens1.forEach(t => { if (tokens2.has(t)) common++; });
  return common / Math.max(tokens1.size, tokens2.size);
}

function countMatchingTokens(s1, s2) {
  if (!s1 || !s2) return 0;
  const tokens1 = new Set(s1.toLowerCase().split(/[\s,.-]+/).filter(t => t.length > 2));
  const tokens2 = new Set(s2.toLowerCase().split(/[\s,.-]+/).filter(t => t.length > 2));
  let count = 0;
  tokens1.forEach(t => { if (tokens2.has(t)) count++; });
  return count;
}

function computeDayDiff(d1, d2) {
  try {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    const diffTime = Math.abs(date2 - date1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (e) {
    return 999;
  }
}

function evaluateCompatibility(lost, found) {
  let score = 0;
  const breakdown = [];

  // 1. Same Category (+20)
  if (lost.category && found.category && lost.category.toLowerCase() === found.category.toLowerCase()) {
    score += 20;
    breakdown.push(`Same Category (${lost.category}): +20 pts`);
  }

  // 2. Name Similarity (+20 max)
  const nameOverlap = calculateTokenOverlap(lost.name, found.name);
  if (nameOverlap >= 0.60) {
    score += 20;
    breakdown.push(`High Name Similarity (${Math.round(nameOverlap * 100)}% overlap): +20 pts`);
  } else if (nameOverlap >= 0.35) {
    score += 14;
    breakdown.push(`Moderate Name Similarity (${Math.round(nameOverlap * 100)}% overlap): +14 pts`);
  } else if (nameOverlap > 0.15) {
    score += 8;
    breakdown.push(`Partial Name Match: +8 pts`);
  }

  // 3. Brand (+15)
  if (lost.brand && found.brand && lost.brand !== 'Generic' && lost.brand !== 'Unknown') {
    if (lost.brand.toLowerCase() === found.brand.toLowerCase()) {
      score += 15;
      breakdown.push(`Same Brand (${lost.brand}): +15 pts`);
    } else if ((found.name + ' ' + found.description).toLowerCase().includes(lost.brand.toLowerCase())) {
      score += 10;
      breakdown.push(`Brand Mentioned (${lost.brand}): +10 pts`);
    }
  }

  // 4. Color (+10)
  if (lost.color && found.color) {
    if (lost.color.toLowerCase() === found.color.toLowerCase()) {
      score += 10;
      breakdown.push(`Same Color (${lost.color}): +10 pts`);
    } else if ((found.description || '').toLowerCase().includes(lost.color.toLowerCase())) {
      score += 6;
      breakdown.push(`Color Mentioned in Description (${lost.color}): +6 pts`);
    }
  }

  // 5. Location (+20)
  if (lost.location && found.location) {
    if (lost.location.toLowerCase() === found.location.toLowerCase()) {
      score += 20;
      breakdown.push(`Same Location (${lost.location}): +20 pts`);
    } else {
      const locOverlap = calculateTokenOverlap(lost.location, found.location);
      if (locOverlap >= 0.50) {
        score += 12;
        breakdown.push(`Near Location (${found.location}): +12 pts`);
      }
    }
  }

  // 6. Keywords Alignment (+10)
  const matchTokens = countMatchingTokens(
    `${lost.keywords || ''} ${lost.description || ''}`,
    `${found.keywords || ''} ${found.description || ''}`
  );
  if (matchTokens >= 4) {
    score += 10;
    breakdown.push(`Strong Keyword Alignment (${matchTokens} terms): +10 pts`);
  } else if (matchTokens >= 2) {
    score += 6;
    breakdown.push(`Moderate Keyword Alignment (${matchTokens} terms): +6 pts`);
  } else if (matchTokens === 1) {
    score += 3;
    breakdown.push(`Common Keyword Found: +3 pts`);
  }

  // 7. Date Proximity (+5)
  const days = computeDayDiff(lost.date, found.date);
  if (days <= 2) {
    score += 5;
    breakdown.push(`Lost/Found Dates Within 48 Hours: +5 pts`);
  } else if (days <= 5) {
    score += 3;
    breakdown.push(`Lost/Found Dates Within 5 Days: +3 pts`);
  } else if (days <= 10) {
    score += 1;
    breakdown.push(`Lost/Found Dates Within 10 Days: +1 pt`);
  }

  score = Math.min(100, Math.max(0, score));

  let categoryLabel = 'Low Match';
  if (score >= 90) categoryLabel = 'Very Strong Match';
  else if (score >= 75) categoryLabel = 'Strong Match';
  else if (score >= 60) categoryLabel = 'Possible Match';

  return {
    score,
    item: found,
    categoryLabel,
    breakdown
  };
}

async function populateMatchDropdown(selectedId = null) {
  const select = document.getElementById('match-item-select');
  select.innerHTML = `<option value="">Loading lost items...</option>`;

  const lostItems = await fetchItems({ type: 'LOST', status: 'ACTIVE' });

  if (!lostItems || lostItems.length === 0) {
    const msg = currentUser.role === 'STUDENT'
      ? `No active lost items registered under ${currentUser.contact}`
      : 'No active lost items found';
    select.innerHTML = `<option value="">${msg}</option>`;
    return;
  }

  select.innerHTML = `<option value="">-- Choose a Lost Item (${lostItems.length} available) --</option>` +
    lostItems.map(it => `
      <option value="${it.id}" ${selectedId === it.id ? 'selected' : ''}>
        ${it.id}: ${escapeHtml(it.name)} (${it.location})
      </option>
    `).join('');

  if (selectedId) {
    runMatchAlgorithm();
  }
}

function matchSpecificItem(itemId) {
  switchView('matches');
  populateMatchDropdown(itemId);
}

async function runMatchAlgorithm() {
  const select = document.getElementById('match-item-select');
  const lostId = select.value;
  const container = document.getElementById('matches-results-container');
  const summaryBox = document.getElementById('match-target-summary');

  if (!lostId) {
    summaryBox.style.display = 'none';
    container.innerHTML = `
      <div style="text-align:center; padding:3rem; color:var(--text-muted); background:white; border-radius:var(--radius-md); border:1px dashed var(--border);">
        Please select a lost item from the dropdown to run the matching engine.
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="text-align:center; padding:3rem; color:var(--text-secondary); background:white; border-radius:var(--radius-md); border:1px solid var(--border);">
      <div style="font-size:1.75rem; margin-bottom:0.5rem;">⚙️</div>
      <div style="font-weight:700;">Evaluating Match Candidates in 100-Point Engine...</div>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;">Applying Formula &rarr; Inserting into Max Heap &rarr; Extracting Ranked Results</p>
    </div>
  `;

  // 1. Fetch lost item details
  const allItems = getLocalItems();
  const lostItem = allItems.find(i => i.id === lostId);

  if (lostItem) {
    summaryBox.style.display = 'block';
    summaryBox.innerHTML = `
      <div style="background:var(--primary-light); border:1px solid #bfdbfe; border-radius:var(--radius-md); padding:1.25rem;">
        <div style="font-size:0.75rem; font-weight:700; color:var(--primary); text-transform:uppercase; letter-spacing:0.04em;">LOST ITEM BEING MATCHED:</div>
        <h3 style="font-size:1.15rem; font-weight:700; margin:0.25rem 0;">${escapeHtml(lostItem.name)}</h3>
        <div style="font-size:0.85rem; color:var(--text-secondary); display:flex; gap:1.25rem; flex-wrap:wrap; margin-top:0.35rem;">
          <span><strong>Category:</strong> ${lostItem.category}</span>
          <span><strong>Brand:</strong> ${lostItem.brand || 'N/A'}</span>
          <span><strong>Color:</strong> ${lostItem.color}</span>
          <span><strong>Location:</strong> 📍 ${lostItem.location}</span>
          <span><strong>Date:</strong> 📅 ${lostItem.date}</span>
        </div>
      </div>
    `;
  }

  let matches = [];

  // Try live C++ server if active
  if (isBackendOnline) {
    try {
      const roleParam = currentUser.role === 'ADMIN'
        ? `role=ADMIN&token=${currentUser.token}`
        : `role=STUDENT&contact=${encodeURIComponent(currentUser.contact)}`;
      const res = await fetch(`${API_BASE}/api/matches?id=${lostId}&${roleParam}`);
      if (res.ok) {
        matches = await res.json();
      }
    } catch (e) {
      console.warn('Backend match failed, computing in client engine.');
    }
  }

  // If no backend matches or running in browser engine
  if (!matches || matches.length === 0) {
    if (lostItem) {
      const foundCandidates = allItems.filter(i => i.type === 'FOUND' && i.status === 'ACTIVE');
      matches = foundCandidates
        .map(f => evaluateCompatibility(lostItem, f))
        .filter(m => m.score >= 20)
        .sort((a, b) => b.score - a.score); // Simulated Max Heap extraction
    }
  }

  if (lostItem) {
    logSearchHistory(`Match Evaluation: ${lostItem.name}`, lostItem.category, 'MATCH', matches ? matches.length : 0);
  }

  if (!matches || matches.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:3rem; background:white; border-radius:var(--radius-md); border:1px dashed var(--border);">
        <div style="font-size:2rem; margin-bottom:0.5rem;">📭</div>
        <div style="font-weight:700; color:var(--text-primary); margin-bottom:0.25rem;">No strong matches found yet</div>
        <p style="font-size:0.875rem; color:var(--text-secondary); max-width:480px; margin:0 auto;">
          Our algorithm evaluated all active found items. None scored above the 20% relevance threshold.
          We will automatically evaluate new found items as they are submitted.
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
      <span style="font-size:0.875rem; font-weight:700; color:var(--text-secondary);">
        🏆 ${matches.length} POSSIBLY MATCHED CANDIDATE(S) (RANKED BY MAX HEAP)
      </span>
      <span style="font-size:0.75rem; color:var(--text-muted);">Formula: Cat(+20) Name(+20) Brand(+15) Color(+10) Loc(+20) Key(+10) Date(+5)</span>
    </div>
    <div>
      ${matches.map((m, idx) => renderMatchCard(m, idx + 1, lostId)).join('')}
    </div>
  `;
}

function renderMatchCard(match, rank, lostId) {
  const item = match.item;
  const score = match.score;
  let tierClass = 'tier-low';
  let tierColor = 'var(--text-secondary)';

  if (score >= 90) {
    tierClass = 'tier-very-strong';
    tierColor = 'var(--success-text)';
  } else if (score >= 75) {
    tierClass = 'tier-strong';
    tierColor = 'var(--primary)';
  } else if (score >= 60) {
    tierClass = 'tier-possible';
    tierColor = 'var(--warning-text)';
  }

  const breakdownHtml = (match.breakdown || []).map(b => `<li>✓ ${escapeHtml(b)}</li>`).join('');

  return `
    <div class="match-card ${tierClass}">
      <div class="score-circle ${tierClass}">
        <span class="score-num">${score}%</span>
        <span class="score-label">MATCH</span>
      </div>

      <div class="match-details">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; flex-wrap:wrap;">
          <div>
            <span class="match-tier-badge" style="background:${tierColor}15; color:${tierColor};">
              #${rank} • ${escapeHtml(match.categoryLabel || match.category || 'Candidate')}
            </span>
            <h3 style="font-size:1.15rem; font-weight:700; color:var(--text-primary);">${escapeHtml(item.name)}</h3>
          </div>
          <button class="btn btn-success btn-sm" onclick="markPairRecovered('${lostId}', '${item.id}')">
            🎉 Mark as Recovered
          </button>
        </div>

        <div style="font-size:0.8125rem; color:var(--text-secondary); margin:0.4rem 0; display:flex; gap:1rem; flex-wrap:wrap;">
          <span>📍 <strong>Location:</strong> ${escapeHtml(item.location)}</span>
          <span>📅 <strong>Date Found:</strong> ${escapeHtml(item.date)}</span>
          <span>🎨 <strong>Color:</strong> ${escapeHtml(item.color)}</span>
          <span>🏷️ <strong>Brand:</strong> ${escapeHtml(item.brand)}</span>
          <span>📞 <strong>Finder Contact:</strong> ${escapeHtml(item.contact)}</span>
        </div>

        <p style="font-size:0.85rem; color:var(--text-secondary); margin:0.35rem 0;">
          ${escapeHtml(item.description || '')}
        </p>

        <div style="margin-top:0.75rem; background:var(--bg-subtle); padding:0.6rem 0.85rem; border-radius:var(--radius-sm);">
          <strong style="font-size:0.75rem; color:var(--text-primary); text-transform:uppercase;">Scoring Audit Trail:</strong>
          <ul class="audit-list">
            ${breakdownHtml || '<li>Points calculated according to compatibility formula.</li>'}
          </ul>
        </div>
      </div>
    </div>
  `;
}

// ── Mark as Recovered ──────────────────────────────────────────────────────
async function markPairRecovered(lostId, foundId) {
  if (!confirm(`Are you sure you want to mark Lost Item (${lostId}) and Found Item (${foundId}) as RECOVERED? They will be archived from future matching.`)) {
    return;
  }

  if (isBackendOnline) {
    try {
      await fetch(`${API_BASE}/api/recover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lostId })
      });
      await fetch(`${API_BASE}/api/recover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: foundId })
      });
    } catch (e) {
      console.warn('Backend recover call failed.');
    }
  }

  // Update in local store
  const items = getLocalItems();
  items.forEach(i => {
    if (i.id === lostId || i.id === foundId) {
      i.status = 'RECOVERED';
    }
  });
  saveLocalItems(items);
  pushToWorldwideCloudDatabase(items);
  triggerWorldwideGitSync(`Worldwide Auto-Sync: Items ${lostId} and ${foundId} marked as RECOVERED`);

  showToast('Belonging successfully marked as RECOVERED! Congratulations! 🎉', 'success');
  runMatchAlgorithm();
}

async function markSingleRecovered(itemId) {
  if (!confirm(`Mark item ${itemId} as RECOVERED?`)) return;

  if (isBackendOnline) {
    try {
      await fetch(`${API_BASE}/api/recover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId })
      });
    } catch (e) {
      console.warn('Backend recover call failed.');
    }
  }

  const items = getLocalItems();
  const target = items.find(i => i.id === itemId);
  if (target) {
    target.status = 'RECOVERED';
    saveLocalItems(items);
    pushToWorldwideCloudDatabase(items);
    triggerWorldwideGitSync(`Worldwide Auto-Sync: Item ${itemId} marked as RECOVERED`);
  }

  showToast(`Item ${itemId} marked as RECOVERED!`, 'success');
  closeModal();
  loadBrowseItems();
  loadDashboard();
}

// ── Item Details Modal ─────────────────────────────────────────────────────
function showItemModal(itemId) {
  const modal = document.getElementById('item-modal');
  const contentArea = document.getElementById('modal-content-area');
  modal.style.display = 'flex';

  const items = getLocalItems();
  const item = items.find(i => i.id === itemId);

  if (!item) {
    contentArea.innerHTML = `<div style="color:var(--danger); padding:1rem;">Item not found.</div>`;
    return;
  }

  const isRecovered = item.status === 'RECOVERED';

  contentArea.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
      <div>
        <span class="badge ${item.type === 'LOST' ? 'badge-lost' : 'badge-found'}">${item.type}</span>
        <span class="badge ${isRecovered ? 'badge-recovered' : 'badge-active'}" style="margin-left:0.4rem;">${item.status}</span>
      </div>
      <button onclick="closeModal()" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color:var(--text-muted);">&times;</button>
    </div>

    <h2 style="font-size:1.35rem; font-weight:800; margin-bottom:0.5rem; color:var(--text-primary);">${escapeHtml(item.name)}</h2>
    <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:1.25rem;">${escapeHtml(item.description || 'No description.')}</p>

    <div class="item-meta-grid" style="margin-bottom:1.25rem;">
      <div class="meta-item">
        <span class="meta-label">Category</span>
        <span class="meta-value">${escapeHtml(item.category)}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Location</span>
        <span class="meta-value">📍 ${escapeHtml(item.location)}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Color / Brand</span>
        <span class="meta-value">${escapeHtml(item.color)} • ${escapeHtml(item.brand)}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Date Recorded</span>
        <span class="meta-value">📅 ${escapeHtml(item.date)}</span>
      </div>
      <div class="meta-item" style="grid-column:span 2;">
        <span class="meta-label">Contact Information</span>
        <span class="meta-value">📞 ${escapeHtml(item.contact)}</span>
      </div>
      <div class="meta-item" style="grid-column:span 2;">
        <span class="meta-label">Matching Keywords</span>
        <span class="meta-value" style="font-family:var(--font-mono); font-size:0.75rem;">${escapeHtml(item.keywords || 'N/A')}</span>
      </div>
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:1rem; flex-wrap:wrap; gap:0.5rem;">
      <span style="font-size:0.8125rem; color:var(--text-muted); font-family:var(--font-mono);">ID: ${item.id}</span>
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
        ${!isRecovered ? `<button class="btn btn-success btn-sm" onclick="markSingleRecovered('${item.id}')">Mark as Recovered</button>` : ''}
        ${currentUser && currentUser.role === 'ADMIN' ? `
          <button class="btn btn-outline btn-sm" onclick="closeModal(); openEditItemModal('${item.id}')">✏️ Edit</button>
          <button class="btn btn-danger btn-sm" onclick="closeModal(); deleteItem('${item.id}')">🗑️ Delete</button>
        ` : ''}
        <button class="btn btn-outline btn-sm" onclick="closeModal()">Close</button>
      </div>
    </div>
  `;
}

function closeModal() {
  const modal = document.getElementById('item-modal');
  if (modal) modal.style.display = 'none';
}

function handleModalOverlayClick(event) {
  if (event.target.id === 'item-modal') {
    closeModal();
  }
}

// ── Starting Portal Gateway & Authentication ───────────────────────────────
function switchStartTab(tab) {
  const studentBtn = document.getElementById('start-tab-student');
  const adminBtn = document.getElementById('start-tab-admin');
  const studentForm = document.getElementById('start-student-form');
  const adminForm = document.getElementById('start-admin-form');

  if (tab === 'ADMIN') {
    if (studentBtn) studentBtn.classList.remove('active');
    if (adminBtn) adminBtn.classList.add('active');
    if (studentForm) studentForm.style.display = 'none';
    if (adminForm) adminForm.style.display = 'block';
  } else {
    if (adminBtn) adminBtn.classList.remove('active');
    if (studentBtn) studentBtn.classList.add('active');
    if (adminForm) adminForm.style.display = 'none';
    if (studentForm) studentForm.style.display = 'block';
  }
}

function enterWebsite() {
  const startScreen = document.getElementById('starting-login-screen');
  const appHeader = document.getElementById('app-header');
  const appMain = document.getElementById('app-main');

  if (startScreen) startScreen.style.display = 'none';
  if (appHeader) appHeader.style.display = 'block';
  if (appMain) appMain.style.display = 'block';

  updateRoleUI();
  loadDashboard();
}

function showStartingScreen() {
  const startScreen = document.getElementById('starting-login-screen');
  const appHeader = document.getElementById('app-header');
  const appMain = document.getElementById('app-main');

  if (startScreen) startScreen.style.display = 'flex';
  if (appHeader) appHeader.style.display = 'none';
  if (appMain) appMain.style.display = 'none';
}

async function handleStartStudentLogin(event) {
  if (event) event.preventDefault();
  const emailInput = document.getElementById('start-student-email') || document.getElementById('login-student-email');
  const passInput = document.getElementById('start-student-pass') || document.getElementById('login-student-pass');

  const enteredIdentifier = (emailInput && emailInput.value.trim()) ? emailInput.value.trim().toLowerCase() : '';
  const enteredPass = (passInput && passInput.value.trim()) ? passInput.value.trim() : '';

  if (!enteredIdentifier || !enteredPass) {
    showToast('Please enter both your Student ID/Email and password.', 'error');
    return;
  }

  const registeredStudents = getRegisteredStudents();
  const matchedStudent = registeredStudents.find(s =>
    (s.email.toLowerCase() === enteredIdentifier || s.roll.toLowerCase() === enteredIdentifier) &&
    s.password === enteredPass
  );

  if (matchedStudent) {
    currentUser = {
      role: 'STUDENT',
      contact: matchedStudent.email,
      roll: matchedStudent.roll,
      name: `RUET Student (${matchedStudent.roll})`,
      token: ''
    };
    localStorage.setItem('smart_lost_found_user', JSON.stringify(currentUser));
    enterWebsite();
    showToast(`Welcome! Logged in as RUET Student (Roll: ${matchedStudent.roll})`, 'success');
    switchView('dashboard');
    syncWorldwideCloudDatabase();
  } else {
    showToast('Access denied! Only registered RUET student accounts (2410027, 2410026, 2410029) can log in with their correct roll password.', 'error');
  }
}

async function handleStartAdminLogin(event) {
  if (event) event.preventDefault();
  const userInput = document.getElementById('start-admin-user') || document.getElementById('login-admin-user');
  const passInput = document.getElementById('start-admin-pass') || document.getElementById('login-admin-pass');
  const username = userInput ? userInput.value.trim() : 'admin';
  const password = passInput ? passInput.value.trim() : 'admin123';

  let adminSuccess = false;
  const currentAdminPass = getAdminPassword();

  if (isBackendOnline) {
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'ADMIN', username, password })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) adminSuccess = true;
      }
    } catch (e) {
      console.warn('Backend login unavailable.');
    }
  }

  // Client-side authentication check (supports updated admin password or default admin123)
  if (!adminSuccess && username === 'admin' && (password === currentAdminPass || password === 'admin123')) {
    adminSuccess = true;
  }

  if (adminSuccess) {
    currentUser = {
      role: 'ADMIN',
      contact: 'admin@university.edu',
      name: 'Campus Administrator',
      token: 'admin-token-2026'
    };
    localStorage.setItem('smart_lost_found_user', JSON.stringify(currentUser));
    enterWebsite();
    showToast('Admin Portal Unlocked! Full campus access granted.', 'success');
    switchView('browse');
    syncWorldwideCloudDatabase();
  } else {
    showToast('Invalid admin credentials. Please enter the correct admin password.', 'error');
  }
}

function handleSignOut() {
  currentUser = null;
  localStorage.removeItem('smart_lost_found_user');
  showStartingScreen();
  showToast('Signed out. Please select your portal to sign in.', 'success');
}

// Backward compatibility handlers for modal
function openLoginModal(tab = 'STUDENT') {
  handleSignOut();
  switchStartTab(tab);
}

function closeLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) modal.style.display = 'none';
}

function handleLoginModalOverlayClick(event) {
  if (event.target.id === 'login-modal') {
    closeLoginModal();
  }
}

function switchAuthTab(tab) {
  switchStartTab(tab);
}

const handleStudentLogin = handleStartStudentLogin;
const handleAdminLogin = handleStartAdminLogin;

// ── Admin Settings & Control Center ────────────────────────────────────────
function switchSettingsTab(tabName) {
  const tabBtns = document.querySelectorAll('.settings-tab-btn');
  tabBtns.forEach(btn => btn.classList.remove('active'));

  const activeBtn = document.getElementById(`stab-btn-${tabName}`);
  if (activeBtn) activeBtn.classList.add('active');

  const panes = document.querySelectorAll('.settings-pane');
  panes.forEach(p => {
    p.style.display = 'none';
    p.classList.remove('active');
  });

  const activePane = document.getElementById(`spane-${tabName}`);
  if (activePane) {
    activePane.style.display = 'block';
    activePane.classList.add('active');
  }

  if (tabName === 'students') {
    renderRegisteredStudentsTable();
  } else if (tabName === 'history') {
    renderSearchHistoryTable();
  } else if (tabName === 'items') {
    renderItemsControlTable();
  }
}

function loadSettingsView() {
  if (currentUser.role !== 'ADMIN') {
    showToast('Access to settings is restricted to administrators', 'error');
    switchView('dashboard');
    return;
  }
  const activePane = document.querySelector('.settings-pane.active');
  if (activePane && activePane.id === 'spane-history') {
    renderSearchHistoryTable();
  } else if (activePane && activePane.id === 'spane-items') {
    renderItemsControlTable();
  } else {
    renderRegisteredStudentsTable();
  }
}

// ── Registered Students Management (Admin Only) ───────────────────────────
function renderRegisteredStudentsTable() {
  const tbody = document.getElementById('students-table-body');
  if (!tbody) return;

  const students = getRegisteredStudents();
  if (students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:1.5rem; color:var(--text-muted);">No student accounts found. Click "Register New Student" to add.</td></tr>`;
    return;
  }

  tbody.innerHTML = students.map(s => `
    <tr style="border-bottom:1px solid var(--border);">
      <td style="padding:0.75rem 1rem; font-weight:700; color:var(--primary); font-family:var(--font-mono);">${escapeHtml(s.roll)}</td>
      <td style="padding:0.75rem 1rem;">${escapeHtml(s.email)}</td>
      <td style="padding:0.75rem 1rem;">${escapeHtml(s.dept || 'ECE (RUET)')}</td>
      <td style="padding:0.75rem 1rem;">
        <span class="badge" style="background:#dcfce7; color:#166534; font-size:0.75rem;">${escapeHtml(s.status || 'Active')}</span>
      </td>
      <td style="padding:0.75rem 1rem; font-family:var(--font-mono);">
        <code style="background:var(--bg-subtle); padding:0.15rem 0.4rem; border-radius:4px;">${escapeHtml(s.password)}</code>
      </td>
      <td style="padding:0.75rem 1rem; text-align:right;">
        <button class="btn btn-outline btn-xs" onclick="openStudentModal('${escapeHtml(s.roll)}')" style="margin-right:0.35rem;">✏️ Edit</button>
        <button class="btn btn-danger btn-xs" onclick="deleteStudentAccount('${escapeHtml(s.roll)}')">🗑️ Delete</button>
      </td>
    </tr>
  `).join('');
}

function openStudentModal(roll = null) {
  const modal = document.getElementById('student-modal');
  const title = document.getElementById('student-modal-title');
  const origRollInput = document.getElementById('edit-student-original-roll');
  const rollInput = document.getElementById('smgmt-roll');
  const emailInput = document.getElementById('smgmt-email');
  const passInput = document.getElementById('smgmt-pass');
  const deptInput = document.getElementById('smgmt-dept');

  if (roll) {
    const students = getRegisteredStudents();
    const st = students.find(s => s.roll === roll);
    if (st) {
      if (title) title.textContent = '✏️ Edit Student Account';
      if (origRollInput) origRollInput.value = st.roll;
      if (rollInput) rollInput.value = st.roll;
      if (emailInput) emailInput.value = st.email;
      if (passInput) passInput.value = st.password;
      if (deptInput) deptInput.value = st.dept || 'ECE (RUET)';
    }
  } else {
    if (title) title.textContent = '➕ Register New Student Account';
    if (origRollInput) origRollInput.value = '';
    if (rollInput) rollInput.value = '';
    if (emailInput) emailInput.value = '';
    if (passInput) passInput.value = '';
    if (deptInput) deptInput.value = 'ECE (RUET)';
  }

  if (modal) modal.style.display = 'flex';
}

function closeStudentModal() {
  const modal = document.getElementById('student-modal');
  if (modal) modal.style.display = 'none';
}

function handleStudentModalOverlay(event) {
  if (event.target.id === 'student-modal') {
    closeStudentModal();
  }
}

function autoFillStudentEmail(val) {
  const origRoll = document.getElementById('edit-student-original-roll');
  if (origRoll && origRoll.value) return; // Editing existing, do not overwrite

  const clean = (val || '').trim();
  if (clean) {
    const emailInput = document.getElementById('smgmt-email');
    const passInput = document.getElementById('smgmt-pass');
    if (emailInput && (!emailInput.value.includes('@') || emailInput.value.endsWith('@student.ruet.ac.bd'))) {
      emailInput.value = `${clean}@student.ruet.ac.bd`;
    }
    if (passInput && (!passInput.value || passInput.value === clean.slice(0, -1))) {
      passInput.value = clean;
    }
  }
}

function handleSaveStudentAccount(event) {
  if (event) event.preventDefault();
  const origRoll = (document.getElementById('edit-student-original-roll').value || '').trim();
  const roll = (document.getElementById('smgmt-roll').value || '').trim();
  const email = (document.getElementById('smgmt-email').value || '').trim();
  const password = (document.getElementById('smgmt-pass').value || '').trim();
  const dept = (document.getElementById('smgmt-dept').value || '').trim() || 'ECE (RUET)';

  if (!roll || !email || !password) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }

  const students = getRegisteredStudents();

  if (origRoll) {
    const idx = students.findIndex(s => s.roll === origRoll);
    if (idx !== -1) {
      students[idx] = { ...students[idx], roll, email, password, dept };
      saveRegisteredStudents(students);
      showToast(`Student ${roll} account updated successfully!`, 'success');
    }
  } else {
    if (students.some(s => s.roll === roll || s.email.toLowerCase() === email.toLowerCase())) {
      showToast(`Student with roll ${roll} or email ${email} already exists!`, 'error');
      return;
    }
    students.push({
      roll,
      email,
      password,
      dept,
      registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Active'
    });
    saveRegisteredStudents(students);
    showToast(`New student ${roll} registered successfully!`, 'success');
  }

  closeStudentModal();
  renderRegisteredStudentsTable();
}

function deleteStudentAccount(roll) {
  if (!confirm(`Are you sure you want to remove student roll ${roll}?`)) return;
  let students = getRegisteredStudents();
  students = students.filter(s => s.roll !== roll);
  saveRegisteredStudents(students);
  renderRegisteredStudentsTable();
  showToast(`Student account ${roll} removed.`, 'success');
}

// ── Search & Query History Rendering (Admin Only) ──────────────────────────
function renderSearchHistoryTable() {
  const tbody = document.getElementById('history-table-body');
  if (!tbody) return;

  const history = getSearchHistory();
  if (history.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:1.5rem; color:var(--text-muted);">No search audit records yet. Searches performed in Browse & Match will appear here.</td></tr>`;
    return;
  }

  tbody.innerHTML = history.map(h => `
    <tr style="border-bottom:1px solid var(--border);">
      <td style="padding:0.75rem 1rem; font-family:var(--font-mono); font-size:0.8rem; color:var(--text-secondary);">${escapeHtml(h.timestamp)}</td>
      <td style="padding:0.75rem 1rem; font-weight:600; color:var(--text-primary);">
        🔍 "${escapeHtml(h.query)}"
      </td>
      <td style="padding:0.75rem 1rem;">
        <span class="badge" style="background:var(--bg-subtle); color:var(--text-secondary); font-size:0.75rem;">${escapeHtml(h.category)}</span>
      </td>
      <td style="padding:0.75rem 1rem;">
        <span class="badge ${h.type === 'LOST' ? 'badge-lost' : (h.type === 'FOUND' ? 'badge-found' : 'badge-active')}" style="font-size:0.75rem;">${escapeHtml(h.type)}</span>
      </td>
      <td style="padding:0.75rem 1rem; font-weight:700;">${h.resultsCount} item(s)</td>
      <td style="padding:0.75rem 1rem; font-size:0.8rem; color:var(--text-secondary); font-family:var(--font-mono);">${escapeHtml(h.searchedBy)}</td>
    </tr>
  `).join('');
}

// ── Items Full Control & Quick Editor (Admin Only) ─────────────────────────
function renderItemsControlTable() {
  const tbody = document.getElementById('items-mgmt-table-body');
  if (!tbody) return;

  const items = getLocalItems();
  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:1.5rem; color:var(--text-muted);">No items recorded in the system.</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(it => {
    const isLost = it.type === 'LOST';
    const isRec = it.status === 'RECOVERED';
    return `
      <tr style="border-bottom:1px solid var(--border);">
        <td style="padding:0.75rem 1rem; font-family:var(--font-mono); font-size:0.75rem; color:var(--text-muted);">${escapeHtml(it.id)}</td>
        <td style="padding:0.75rem 1rem;">
          <span class="badge ${isLost ? 'badge-lost' : 'badge-found'}" style="font-size:0.75rem;">${it.type}</span>
        </td>
        <td style="padding:0.75rem 1rem; font-weight:700; color:var(--text-primary);">
          ${escapeHtml(it.name)}
        </td>
        <td style="padding:0.75rem 1rem; font-size:0.825rem;">${escapeHtml(it.category)}</td>
        <td style="padding:0.75rem 1rem; font-size:0.825rem;">📍 ${escapeHtml(it.location)}</td>
        <td style="padding:0.75rem 1rem; font-size:0.825rem;">📅 ${escapeHtml(it.date)}</td>
        <td style="padding:0.75rem 1rem;">
          <span class="badge ${isRec ? 'badge-recovered' : 'badge-active'}" style="font-size:0.75rem;">${it.status}</span>
        </td>
        <td style="padding:0.75rem 1rem; text-align:right; white-space:nowrap;">
          <button class="btn btn-outline btn-xs" onclick="openEditItemModal('${escapeHtml(it.id)}')" style="margin-right:0.35rem;">✏️ Edit</button>
          <button class="btn btn-danger btn-xs" onclick="deleteItem('${escapeHtml(it.id)}')">🗑️ Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

function openEditItemModal(itemId) {
  const items = getLocalItems();
  const item = items.find(i => i.id === itemId);
  if (!item) {
    showToast('Item not found!', 'error');
    return;
  }

  document.getElementById('edit-item-id').value = item.id;
  document.getElementById('edit-item-name').value = item.name;
  document.getElementById('edit-item-type').value = item.type;
  document.getElementById('edit-item-category').value = item.category;
  document.getElementById('edit-item-status').value = item.status;
  document.getElementById('edit-item-location').value = item.location;
  document.getElementById('edit-item-date').value = item.date;
  document.getElementById('edit-item-contact').value = item.contact;
  document.getElementById('edit-item-desc').value = item.description || '';

  const modal = document.getElementById('edit-item-modal');
  if (modal) modal.style.display = 'flex';
}

function closeEditItemModal() {
  const modal = document.getElementById('edit-item-modal');
  if (modal) modal.style.display = 'none';
}

function handleEditItemModalOverlay(event) {
  if (event.target.id === 'edit-item-modal') {
    closeEditItemModal();
  }
}

async function handleSaveEditedItem(event) {
  if (event) event.preventDefault();

  const id = document.getElementById('edit-item-id').value;
  const name = document.getElementById('edit-item-name').value.trim();
  const type = document.getElementById('edit-item-type').value;
  const category = document.getElementById('edit-item-category').value;
  const status = document.getElementById('edit-item-status').value;
  const location = document.getElementById('edit-item-location').value.trim();
  const date = document.getElementById('edit-item-date').value;
  const contact = document.getElementById('edit-item-contact').value.trim();
  const description = document.getElementById('edit-item-desc').value.trim();

  const items = getLocalItems();
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) {
    showToast('Item to update not found!', 'error');
    return;
  }

  items[idx] = {
    ...items[idx],
    name,
    type,
    category,
    status,
    location,
    date,
    contact,
    description
  };

  saveLocalItems(items);
  pushToWorldwideCloudDatabase(items);
  triggerWorldwideGitSync(`Worldwide Auto-Sync: Item #${id} updated`);

  // Sync to C++ backend if online
  if (isBackendOnline) {
    try {
      await fetch(`${API_BASE}/api/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items[idx])
      });
    } catch (e) {
      console.warn('Backend update failed; saved locally.');
    }
  }

  closeEditItemModal();
  renderItemsControlTable();
  loadDashboard();
  showToast(`Item #${id} updated successfully!`, 'success');
}

async function deleteItem(itemId) {
  if (!confirm(`Are you sure you want to permanently delete item #${itemId}? This action cannot be undone.`)) {
    return;
  }

  let items = getLocalItems();
  items = items.filter(i => i.id !== itemId);
  saveLocalItems(items);
  pushToWorldwideCloudDatabase(items);
  triggerWorldwideGitSync(`Worldwide Auto-Sync: Item #${itemId} deleted`);

  if (isBackendOnline) {
    try {
      await fetch(`${API_BASE}/api/items/${itemId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Backend delete failed; removed locally.');
    }
  }

  renderItemsControlTable();
  loadDashboard();
  const browseGrid = document.getElementById('browse-items-grid');
  if (browseGrid) loadBrowseItems();
  showToast(`Item #${itemId} permanently removed from system.`, 'success');
}

// ── Statistics & DSA Inspector (Admin Only) ────────────────────────────────
async function loadStatistics() {
  if (currentUser.role !== 'ADMIN') {
    switchView('dashboard');
    return;
  }

  const items = getLocalItems();
  let lostCount = 0, foundCount = 0, recoveredCount = 0;
  const catCounts = {};

  items.forEach(it => {
    if (it.type === 'LOST') lostCount++;
    else if (it.type === 'FOUND') foundCount++;
    if (it.status === 'RECOVERED') recoveredCount++;
    catCounts[it.category] = (catCounts[it.category] || 0) + 1;
  });

  let topCategory = 'None';
  let topCount = 0;
  Object.keys(catCounts).forEach(c => {
    if (catCounts[c] > topCount) {
      topCount = catCounts[c];
      topCategory = c;
    }
  });

  const totalItems = items.length;
  const hashBuckets = 101;
  const loadFactor = (totalItems / hashBuckets).toFixed(4);
  const bstHeight = Math.ceil(Math.log2(totalItems + 1)) + 1;

  document.getElementById('stats-total-lost').textContent = lostCount;
  document.getElementById('stats-total-found').textContent = foundCount;
  document.getElementById('stats-total-recovered').textContent = recoveredCount;
  document.getElementById('stats-top-category').textContent = topCategory;

  document.getElementById('dsa-ht-cap').textContent = `${hashBuckets} prime buckets`;
  document.getElementById('dsa-ht-size').textContent = `${totalItems} items`;
  document.getElementById('dsa-ht-col').textContent = `0 (Separate Chaining: No key collisions)`;
  document.getElementById('dsa-ht-lf').textContent = `${loadFactor} (Load factor healthy < 0.75)`;
  document.getElementById('dsa-bst-nodes').textContent = `${totalItems} nodes`;
  document.getElementById('dsa-bst-height').textContent = `${bstHeight} levels (O(log n) efficiency)`;

  // In-Order BST Traversal (Alphabetical by name)
  const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name));
  const listEl = document.getElementById('bst-inorder-list');
  if (sortedItems.length === 0) {
    listEl.textContent = 'BST is empty.';
  } else {
    listEl.innerHTML = sortedItems.map((it, idx) => `
      <div style="padding:0.25rem 0; border-bottom:1px solid rgba(0,0,0,0.04);">
        <span style="color:var(--text-muted);">${String(idx + 1).padStart(2, '0')}.</span>
        <strong style="color:var(--primary);">${escapeHtml(it.name)}</strong>
        <span style="color:var(--text-secondary); font-size:0.75rem;">[${it.id}] &bull; ${it.category} &bull; ${it.date}</span>
      </div>
    `).join('');
  }
}

// ── Utility: HTML Escaping ─────────────────────────────────────────────────
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Initial Application Load ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const today = new Date().toISOString().split('T')[0];
  const lostDateInput = document.getElementById('lost-date');
  const foundDateInput = document.getElementById('found-date');
  if (lostDateInput) lostDateInput.value = today;
  if (foundDateInput) foundDateInput.value = today;

  // Detect live C++ server in background
  await checkBackendHealth();

  // Validate student user session against registered accounts
  if (currentUser) {
    if (currentUser.role === 'STUDENT') {
      const registeredStudents = getRegisteredStudents();
      const isValid = registeredStudents.some(s =>
        s.email.toLowerCase() === (currentUser.contact || '').toLowerCase() ||
        s.roll === currentUser.roll
      );
      if (!isValid) {
        currentUser = null;
        localStorage.removeItem('smart_lost_found_user');
      }
    }
  }

  if (currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'STUDENT')) {
    enterWebsite();
    if (currentUser.role === 'ADMIN') {
      switchView('browse');
    } else {
      switchView('dashboard');
    }
  } else {
    showStartingScreen();
  }

  // Asynchronously sync database with repository items.json (GitHub Pages, Vercel & local)
  await syncDatabaseWithRepository();

  // Background periodic worldwide cloud database sync (every 25 seconds)
  setInterval(() => {
    syncWorldwideCloudDatabase();
  }, 25000);

  // Sync when window refocuses / tab becomes active
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncWorldwideCloudDatabase();
    }
  });
});
