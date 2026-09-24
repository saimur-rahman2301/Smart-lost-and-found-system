import { AppLayout } from '../components/AppLayout.js';
import { debugApi } from '../api.js';

export async function renderEngineVisualizer() {
  const layout = new AppLayout('Engine Visualizer');
  document.getElementById('app').innerHTML = layout.wrap(`
    <div style="padding:2rem;max-width:1200px;margin:0 auto">
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem">
        <h2 style="font-weight:800;font-size:1.5rem">DSA Engine Visualizer</h2>
        <span class="badge badge-info" id="refresh-countdown">Refreshing in 3s</span>
        <span style="color:var(--slate-500);font-size:.875rem" id="last-updated">Never</span>
        <button class="btn btn-secondary btn-sm" id="refresh-now">↻ Refresh Now</button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(350px, 1fr));gap:1.5rem" class="visualizer-grid">
        <!-- Panel 1: Hash Table -->
        <div class="card" style="padding:1.5rem;display:flex;flex-direction:column">
          <div style="display:flex;justify-content:space-between;margin-bottom:1rem">
            <div style="font-weight:600;display:flex;align-items:center;gap:.5rem"><span style="color:var(--brand-500)">⬡</span> Hash Table</div>
            <span class="badge" style="background:var(--slate-700)" id="ht-lf">LF: 0.00</span>
          </div>
          <div style="display:flex;gap:1.5rem;margin-bottom:1rem">
            <div><div style="font-size:1.5rem;font-weight:700" id="ht-size">0</div><div style="color:var(--slate-400);font-size:.75rem">Items</div></div>
            <div><div style="font-size:1.5rem;font-weight:700" id="ht-cap">0</div><div style="color:var(--slate-400);font-size:.75rem">Capacity</div></div>
            <div><div style="font-size:1.5rem;font-weight:700" id="ht-col">0</div><div style="color:var(--slate-400);font-size:.75rem">Collisions</div></div>
          </div>
          <div style="font-size:.75rem;color:var(--slate-500);margin-bottom:.5rem">Bucket Chain Lengths</div>
          <canvas id="ht-chart" height="120" style="max-height:120px"></canvas>
        </div>

        <!-- Panel 2: Trie -->
        <div class="card" style="padding:1.5rem;display:flex;flex-direction:column">
          <div style="font-weight:600;margin-bottom:1rem;display:flex;align-items:center;gap:.5rem"><span style="color:var(--brand-500)">ᛦ</span> Search Trie</div>
          <div style="display:flex;gap:1.5rem;margin-bottom:1rem">
            <div><div style="font-size:1.5rem;font-weight:700" id="trie-words">0</div><div style="color:var(--slate-400);font-size:.75rem">Words</div></div>
            <div><div style="font-size:1.5rem;font-weight:700" id="trie-nodes">0</div><div style="color:var(--slate-400);font-size:.75rem">Nodes</div></div>
          </div>
          <input class="input" id="trie-prefix" placeholder="Search prefix..." style="margin-bottom:.75rem">
          <div id="trie-results" style="font-size:.875rem;color:var(--slate-300);display:flex;flex-wrap:wrap;gap:.5rem"></div>
        </div>

        <!-- Panel 3: BST -->
        <div class="card" style="padding:1.5rem;display:flex;flex-direction:column">
          <div style="font-weight:600;margin-bottom:1rem">Binary Search Tree</div>
          <div style="display:flex;gap:1.5rem;margin-bottom:1rem">
            <div><div style="font-size:1.5rem;font-weight:700" id="bst-size">0</div><div style="color:var(--slate-400);font-size:.75rem">Nodes</div></div>
            <div><div style="font-size:1.5rem;font-weight:700" id="bst-height">0</div><div style="color:var(--slate-400);font-size:.75rem">Height</div></div>
          </div>
          <div style="background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:.5rem;padding:.75rem;font-size:.8125rem;color:var(--amber-400);margin-bottom:.75rem">
            ⚠️ Naive BST: O(n) worst case with sorted input. AVL rotation would self-balance.
          </div>
          <div style="font-size:.75rem;color:var(--slate-500);margin-bottom:.5rem">Recent Entries (Inorder)</div>
          <div id="bst-entries" style="font-family:monospace;font-size:.8125rem;color:var(--slate-300);white-space:pre-wrap;overflow-y:auto;max-height:100px"></div>
        </div>

        <!-- Panel 4: Max-Heap -->
        <div class="card" style="padding:1.5rem;display:flex;flex-direction:column">
          <div style="display:flex;justify-content:space-between;margin-bottom:1rem">
            <div style="font-weight:600">Max-Heap</div>
            <span class="badge" style="background:var(--brand-500);color:white" id="heap-size">0 items</span>
          </div>
          <div style="font-size:.75rem;color:var(--slate-500);margin-bottom:.75rem">Heap Array (1-based, index 0 = sentinel null)</div>
          <div id="heap-array" style="display:flex;gap:.25rem;overflow-x:auto;padding-bottom:.5rem;align-items:flex-end;height:100px"></div>
          <div style="font-size:.75rem;color:var(--slate-500);margin-top:1rem">Top Scores</div>
          <div id="heap-top" style="font-size:.875rem;margin-top:.25rem;color:var(--slate-300)"></div>
        </div>

        <!-- Panel 5: Campus Graph (D3) -->
        <div class="card" style="padding:0;display:flex;flex-direction:column;grid-column:1 / -1">
          <div style="padding:1.5rem 1.5rem 0 1.5rem;font-weight:600">Campus Graph — Dijkstra Shortest Path</div>
          <svg id="campus-graph-svg" style="width:100%;height:320px;background:var(--slate-900)"></svg>
          <div style="padding:1rem 1.5rem;border-top:1px solid var(--slate-700);display:flex;gap:1rem;align-items:center;flex-wrap:wrap">
            <select id="path-from" class="select select-sm" style="width:auto"></select>
            <span style="color:var(--slate-400)">→</span>
            <select id="path-to" class="select select-sm" style="width:auto"></select>
            <button class="btn btn-primary btn-sm" id="find-path">Find Shortest Path</button>
            <div id="path-result" style="color:var(--amber-400);font-size:.875rem;font-weight:600"></div>
          </div>
        </div>

        <!-- Panel 6: Queue & Stack -->
        <div class="card" style="padding:1.5rem;display:flex;flex-direction:column">
          <div style="font-weight:600;margin-bottom:1rem">Queue & Stack (Undo/Redo)</div>
          <div style="font-size:.75rem;color:var(--slate-500);margin-bottom:.5rem">Claim Queue (FIFO) — HEAD →</div>
          <div id="queue-viz" style="display:flex;gap:.5rem;overflow-x:auto;padding-bottom:.5rem;min-height:40px"></div>
          
          <div style="font-size:.75rem;color:var(--slate-500);margin:1rem 0 .5rem">Action Stack (LIFO) — TOP ↑</div>
          <div id="stack-viz" style="display:flex;flex-direction:column;gap:.25rem;overflow-y:auto;max-height:100px;min-height:40px"></div>
          
          <div style="font-size:.75rem;color:var(--slate-500);margin-top:1rem" id="undo-redo-info"></div>
        </div>
      </div>
    </div>
  `, 'Engine Visualizer');
  layout.attachEventListeners();

  let engineState = null;
  let refreshInterval = null;
  let countdown = 3;
  let htChartInstance = null;

  async function fetchAndUpdate() {
    try {
      const res = await debugApi.getEngineState();
      if (res.success) {
        engineState = res.data;
        updateVisualizer(engineState);
        document.getElementById('last-updated').textContent = 'Updated: ' + new Date().toLocaleTimeString();
      }
    } catch (e) { console.error('Failed to fetch state', e); }
  }

  function updateVisualizer(state) {
    if (!state) return;

    // Panel 1: Hash Table
    const ht = state.hashTable || {};
    document.getElementById('ht-lf').textContent = `LF: ${(ht.loadFactor||0).toFixed(2)}`;
    document.getElementById('ht-size').textContent = ht.size || 0;
    document.getElementById('ht-cap').textContent = ht.capacity || 0;
    document.getElementById('ht-col').textContent = ht.collisionCount || 0;

    const buckets = ht.buckets || [];
    const chainLengths = buckets.map(b => b ? b.length : 0);
    const bgColors = chainLengths.map(l => l === 0 ? 'rgba(30,41,59,1)' : (l === 1 ? '#3B82F6' : '#F59E0B'));

    if (window.Chart) {
      if (htChartInstance) {
        htChartInstance.data.labels = chainLengths.map((_, i) => i);
        htChartInstance.data.datasets[0].data = chainLengths;
        htChartInstance.data.datasets[0].backgroundColor = bgColors;
        htChartInstance.update();
      } else {
        const ctx = document.getElementById('ht-chart').getContext('2d');
        htChartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: chainLengths.map((_, i) => i),
            datasets: [{ data: chainLengths, backgroundColor: bgColors }]
          },
          options: {
            responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false, beginAtZero: true } }
          }
        });
      }
    }

    // Panel 2: Trie
    const trie = state.trie || {};
    document.getElementById('trie-words').textContent = trie.wordCount || 0;
    document.getElementById('trie-nodes').textContent = trie.nodeCount || 0;
    updateTrieResults(); // trigger filter if prefix exists

    // Panel 3: BST
    const bst = state.bst || {};
    document.getElementById('bst-size').textContent = bst.size || 0;
    document.getElementById('bst-height').textContent = bst.height || 0;
    const entries = (bst.inorder || []).slice(-5).reverse();
    document.getElementById('bst-entries').innerHTML = entries.map(e => `<div>${e.key}: ${e.value}</div>`).join('') || 'Empty';

    // Panel 4: Max-Heap
    const heap = state.heap || {};
    document.getElementById('heap-size').textContent = `${heap.size || 0} items`;
    const heapArr = heap.array || [];
    const heapHtml = heapArr.map((v, i) => {
      if (i === 0) return ''; // skip sentinel
      const score = v ? (v.score || 0) : 0;
      const height = Math.max(20, (score/100)*80);
      return `
        <div style="display:flex;flex-direction:column;align-items:center;gap:.25rem;width:30px">
          <div style="background:var(--brand-500);width:100%;height:${height}px;border-radius:.25rem .25rem 0 0;display:flex;align-items:center;justify-content:center;color:white;font-size:.65rem;font-weight:700">${score.toFixed(0)}</div>
          <div style="font-size:.65rem;color:var(--slate-500)">[${i}]</div>
        </div>
      `;
    }).join('');
    document.getElementById('heap-array').innerHTML = heapHtml;
    const topHtml = (heap.top3 || []).map(t => `<div>#${t.id} - Score: ${(t.score||0).toFixed(1)}</div>`).join('');
    document.getElementById('heap-top').innerHTML = topHtml || 'No scores';

    // Panel 5: Graph Selects
    const graph = state.graph || {};
    const nodes = graph.nodes || [];
    const fromSel = document.getElementById('path-from');
    const toSel = document.getElementById('path-to');
    if (fromSel.options.length <= 1 && nodes.length > 0) {
      const opts = nodes.map(n => `<option value="${n.id}">${n.shortCode || n.name}</option>`).join('');
      fromSel.innerHTML = '<option value="">From...</option>' + opts;
      toSel.innerHTML = '<option value="">To...</option>' + opts;
    }
    drawGraph(graph);

    // Panel 6: Queue & Stack
    const q = state.queue || [];
    document.getElementById('queue-viz').innerHTML = q.map(c => `
      <div style="background:var(--slate-800);border:1px solid var(--slate-700);padding:.25rem .5rem;border-radius:.25rem;font-size:.75rem;white-space:nowrap;color:var(--brand-300)">
        ${c}
      </div>
    `).join('') || '<div style="color:var(--slate-600);font-size:.875rem">Empty queue</div>';

    const s = state.stack || [];
    document.getElementById('stack-viz').innerHTML = s.slice().reverse().map(act => `
      <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);padding:.25rem .5rem;border-radius:.25rem;font-size:.75rem;color:var(--rose-400)">
        ${act.type} - ${act.timestamp}
      </div>
    `).join('') || '<div style="color:var(--slate-600);font-size:.875rem">Empty stack</div>';
    
    document.getElementById('undo-redo-info').innerHTML = `Undo Stack: ${state.undoSize||0} | Redo Stack: ${state.redoSize||0}`;
  }

  function drawGraph(graph) {
    if (!window.d3) return;
    const svg = d3.select("#campus-graph-svg");
    svg.selectAll("*").remove();
    const width = document.getElementById('campus-graph-svg').clientWidth;
    const height = 320;
    
    if (!graph.nodes || graph.nodes.length === 0) return;
    
    const minLat = d3.min(graph.nodes, d => d.latitude);
    const maxLat = d3.max(graph.nodes, d => d.latitude);
    const minLng = d3.min(graph.nodes, d => d.longitude);
    const maxLng = d3.max(graph.nodes, d => d.longitude);

    const padding = 30;
    const xScale = d3.scaleLinear().domain([minLng, maxLng]).range([padding, width - padding]);
    const yScale = d3.scaleLinear().domain([minLat, maxLat]).range([height - padding, padding]);

    // Draw edges
    if (graph.edges) {
      graph.edges.forEach(e => {
        const from = graph.nodes.find(n => n.id === e.fromId);
        const to = graph.nodes.find(n => n.id === e.toId);
        if (from && to) {
          svg.append("line")
            .attr("x1", xScale(from.longitude)).attr("y1", yScale(from.latitude))
            .attr("x2", xScale(to.longitude)).attr("y2", yScale(to.latitude))
            .attr("stroke", "var(--slate-700)").attr("stroke-width", 2)
            .attr("class", `edge edge-${from.id}-${to.id} edge-${to.id}-${from.id}`);
        }
      });
    }

    // Draw nodes
    const nodeGroup = svg.selectAll(".node")
      .data(graph.nodes)
      .enter().append("g")
      .attr("transform", d => `translate(${xScale(d.longitude)},${yScale(d.latitude)})`);

    nodeGroup.append("circle")
      .attr("r", 12)
      .attr("fill", "var(--slate-800)")
      .attr("stroke", "var(--brand-500)")
      .attr("stroke-width", 2);

    nodeGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .attr("fill", "var(--slate-300)")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .text(d => d.shortCode);
  }

  function updateTrieResults() {
    if (!engineState || !engineState.trie) return;
    const prefix = document.getElementById('trie-prefix').value.toLowerCase();
    const words = engineState.trie.allWords || [];
    const filtered = prefix ? words.filter(w => w.toLowerCase().startsWith(prefix)).slice(0,10) : [];
    
    document.getElementById('trie-results').innerHTML = filtered.map(w => `
      <span style="background:var(--slate-800);padding:.1rem .5rem;border-radius:1rem">${w}</span>
    `).join('') || (prefix ? 'No matches' : 'Type to search...');
  }

  document.getElementById('trie-prefix').addEventListener('input', updateTrieResults);

  document.getElementById('refresh-now').addEventListener('click', () => {
    countdown = 3;
    fetchAndUpdate();
  });

  document.getElementById('find-path').addEventListener('click', async () => {
    const fromId = document.getElementById('path-from').value;
    const toId = document.getElementById('path-to').value;
    if (!fromId || !toId) return;

    try {
      const res = await window.app.api.graphApi.getShortestPath(fromId, toId);
      if (res.success && res.data) {
        const p = res.data;
        document.getElementById('path-result').textContent = `${p.path.join(' → ')} (${p.totalWeight}m)`;
        
        // Highlight in D3
        if (window.d3) {
          d3.selectAll("line").attr("stroke", "var(--slate-700)").attr("stroke-width", 2);
          for(let i=0; i<p.pathIds.length-1; i++) {
            const f = p.pathIds[i]; const t = p.pathIds[i+1];
            d3.select(`.edge-${f}-${t}`).attr("stroke", "var(--amber-400)").attr("stroke-width", 4);
          }
        }
      } else {
        document.getElementById('path-result').textContent = 'No path found';
      }
    } catch(e) {
      document.getElementById('path-result').textContent = 'Error finding path';
    }
  });

  async function startPolling() {
    await fetchAndUpdate();
    refreshInterval = setInterval(async () => {
      countdown--;
      document.getElementById('refresh-countdown').textContent = `Refreshing in ${countdown}s`;
      if (countdown <= 0) { countdown = 3; await fetchAndUpdate(); }
    }, 1000);
  }

  window.addEventListener('hashchange', () => { clearInterval(refreshInterval); }, { once: true });
  
  startPolling();
}

export default renderEngineVisualizer;
