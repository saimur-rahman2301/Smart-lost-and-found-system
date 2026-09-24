import { AppLayout } from '../components/AppLayout.js';
import { graphApi } from '../api.js';

export async function renderCampusGraph() {
  const layout = new AppLayout('Campus Graph');
  document.getElementById('app').innerHTML = layout.wrap(`
    <div style="padding:2rem;max-width:1200px;margin:0 auto">
      <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:2rem">Campus Navigation Graph</h2>
      
      <div style="display:grid;grid-template-columns:3fr 1fr;gap:2rem">
        <div>
          <div class="card" style="padding:0;overflow:hidden;margin-bottom:2rem">
            <svg id="admin-graph-svg" style="width:100%;height:500px;background:var(--slate-900)"></svg>
            <div style="padding:1rem 1.5rem;border-top:1px solid var(--slate-700);display:flex;gap:1rem;align-items:center;flex-wrap:wrap;background:var(--slate-800)">
              <select id="sp-from" class="select select-sm" style="width:auto"></select>
              <span style="color:var(--slate-400)">→</span>
              <select id="sp-to" class="select select-sm" style="width:auto"></select>
              <button class="btn btn-primary btn-sm" id="btn-sp">Find Path</button>
              <div id="sp-result" style="color:var(--amber-400);font-size:.875rem;font-weight:600"></div>
            </div>
          </div>
          
          <div class="card" style="padding:1.5rem;margin-bottom:2rem">
            <h3 style="font-weight:600;margin-bottom:1rem">Buildings</h3>
            <table class="admin-claims-table" style="width:100%;text-align:left;border-collapse:collapse;font-size:.875rem">
              <thead>
                <tr style="border-bottom:1px solid var(--slate-700)">
                  <th style="padding:.75rem">ID</th>
                  <th style="padding:.75rem">Name</th>
                  <th style="padding:.75rem">Code</th>
                  <th style="padding:.75rem">Lat/Lng</th>
                </tr>
              </thead>
              <tbody id="buildings-tbody"></tbody>
            </table>
          </div>
        </div>

        <div>
          <div class="card" style="padding:1.5rem;margin-bottom:2rem">
            <h3 style="font-weight:600;margin-bottom:1rem">Graph Stats</h3>
            <div style="display:flex;flex-direction:column;gap:.5rem;font-size:.875rem">
              <div style="display:flex;justify-content:space-between">
                <span style="color:var(--slate-400)">Nodes</span>
                <span style="font-weight:700;color:var(--slate-200)" id="stat-nodes">0</span>
              </div>
              <div style="display:flex;justify-content:space-between">
                <span style="color:var(--slate-400)">Edges</span>
                <span style="font-weight:700;color:var(--slate-200)" id="stat-edges">0</span>
              </div>
            </div>
          </div>

          <div class="card" style="padding:1.5rem;margin-bottom:2rem">
            <h3 style="font-weight:600;margin-bottom:1rem">Add Building</h3>
            <form id="form-add-building" style="display:flex;flex-direction:column;gap:.75rem">
              <input type="text" class="input input-sm" id="b-name" placeholder="Name (e.g. Main Library)" required>
              <input type="text" class="input input-sm" id="b-code" placeholder="Short Code (e.g. LIB)" required>
              <div style="display:flex;gap:.5rem">
                <input type="number" step="any" class="input input-sm" id="b-lat" placeholder="Latitude" required>
                <input type="number" step="any" class="input input-sm" id="b-lng" placeholder="Longitude" required>
              </div>
              <button type="submit" class="btn btn-secondary btn-sm">Add Building</button>
            </form>
          </div>

          <div class="card" style="padding:1.5rem">
            <h3 style="font-weight:600;margin-bottom:1rem">Add Edge (Path)</h3>
            <form id="form-add-edge" style="display:flex;flex-direction:column;gap:.75rem">
              <select class="select select-sm" id="e-from" required></select>
              <select class="select select-sm" id="e-to" required></select>
              <input type="number" class="input input-sm" id="e-weight" placeholder="Distance in meters" required>
              <button type="submit" class="btn btn-secondary btn-sm">Add Edge</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `, 'Campus Graph');
  layout.attachEventListeners();

  let graphData = { nodes: [], edges: [] };

  async function loadGraph() {
    try {
      const res = await graphApi.getBuildings();
      if (res.success) {
        graphData.nodes = res.data.nodes || [];
        graphData.edges = res.data.edges || [];
        updateUI();
      }
    } catch (e) {
      window.app.toast.error('Failed to load graph data');
    }
  }

  function updateUI() {
    document.getElementById('stat-nodes').textContent = graphData.nodes.length;
    document.getElementById('stat-edges').textContent = graphData.edges.length;

    const bTbody = document.getElementById('buildings-tbody');
    bTbody.innerHTML = graphData.nodes.map(n => `
      <tr style="border-bottom:1px solid var(--slate-800)">
        <td style="padding:.75rem;font-family:monospace;font-size:.75rem">${n.id}</td>
        <td style="padding:.75rem">${n.name}</td>
        <td style="padding:.75rem"><span class="badge" style="background:var(--slate-700)">${n.shortCode}</span></td>
        <td style="padding:.75rem;font-family:monospace;font-size:.75rem;color:var(--slate-400)">${n.latitude.toFixed(5)}, ${n.longitude.toFixed(5)}</td>
      </tr>
    `).join('') || '<tr><td colspan="4" style="padding:1rem;text-align:center">No buildings</td></tr>';

    const opts = '<option value="">Select...</option>' + graphData.nodes.map(n => `<option value="${n.id}">${n.name} (${n.shortCode})</option>`).join('');
    document.getElementById('sp-from').innerHTML = opts;
    document.getElementById('sp-to').innerHTML = opts;
    document.getElementById('e-from').innerHTML = opts;
    document.getElementById('e-to').innerHTML = opts;

    drawGraph();
  }

  function drawGraph() {
    if (!window.d3) return;
    const svg = d3.select("#admin-graph-svg");
    svg.selectAll("*").remove();
    const width = document.getElementById('admin-graph-svg').clientWidth;
    const height = 500;
    
    if (graphData.nodes.length === 0) return;
    
    const minLat = d3.min(graphData.nodes, d => d.latitude);
    const maxLat = d3.max(graphData.nodes, d => d.latitude);
    const minLng = d3.min(graphData.nodes, d => d.longitude);
    const maxLng = d3.max(graphData.nodes, d => d.longitude);

    const padding = 40;
    const xScale = d3.scaleLinear().domain([minLng, maxLng]).range([padding, width - padding]);
    const yScale = d3.scaleLinear().domain([minLat, maxLat]).range([height - padding, padding]);

    if (graphData.edges) {
      graphData.edges.forEach(e => {
        const from = graphData.nodes.find(n => n.id === e.fromId);
        const to = graphData.nodes.find(n => n.id === e.toId);
        if (from && to) {
          svg.append("line")
            .attr("x1", xScale(from.longitude)).attr("y1", yScale(from.latitude))
            .attr("x2", xScale(to.longitude)).attr("y2", yScale(to.latitude))
            .attr("stroke", "var(--slate-700)").attr("stroke-width", 2)
            .attr("class", `edge edge-${from.id}-${to.id} edge-${to.id}-${from.id}`);
            
          svg.append("text")
            .attr("x", (xScale(from.longitude) + xScale(to.longitude))/2)
            .attr("y", (yScale(from.latitude) + yScale(to.latitude))/2 - 5)
            .attr("fill", "var(--slate-500)")
            .attr("font-size", "9px")
            .attr("text-anchor", "middle")
            .text(e.weight + 'm');
        }
      });
    }

    const nodeGroup = svg.selectAll(".node")
      .data(graphData.nodes)
      .enter().append("g")
      .attr("transform", d => `translate(${xScale(d.longitude)},${yScale(d.latitude)})`);

    nodeGroup.append("circle")
      .attr("r", 14)
      .attr("fill", "var(--slate-800)")
      .attr("stroke", "var(--brand-500)")
      .attr("stroke-width", 2);

    nodeGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .attr("fill", "var(--slate-200)")
      .attr("font-size", "11px")
      .attr("font-weight", "bold")
      .text(d => d.shortCode);
  }

  document.getElementById('form-add-building').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('b-name').value,
      shortCode: document.getElementById('b-code').value,
      latitude: parseFloat(document.getElementById('b-lat').value),
      longitude: parseFloat(document.getElementById('b-lng').value)
    };
    try {
      const res = await graphApi.createBuilding(data);
      if (res.success) {
        window.app.toast.success('Building added');
        e.target.reset();
        loadGraph();
      } else throw new Error(res.error);
    } catch(err) { window.app.toast.error(err.message || 'Failed to add building'); }
  });

  document.getElementById('form-add-edge').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      fromId: document.getElementById('e-from').value,
      toId: document.getElementById('e-to').value,
      weight: parseFloat(document.getElementById('e-weight').value)
    };
    try {
      const res = await graphApi.createEdge(data);
      if (res.success) {
        window.app.toast.success('Edge added');
        e.target.reset();
        loadGraph();
      } else throw new Error(res.error);
    } catch(err) { window.app.toast.error(err.message || 'Failed to add edge'); }
  });

  document.getElementById('btn-sp').addEventListener('click', async () => {
    const fromId = document.getElementById('sp-from').value;
    const toId = document.getElementById('sp-to').value;
    if (!fromId || !toId) return;

    try {
      const res = await graphApi.getShortestPath(fromId, toId);
      if (res.success && res.data) {
        const p = res.data;
        document.getElementById('sp-result').textContent = `${p.path.join(' → ')} (${p.totalWeight}m)`;
        if (window.d3) {
          d3.selectAll("line").attr("stroke", "var(--slate-700)").attr("stroke-width", 2);
          for(let i=0; i<p.pathIds.length-1; i++) {
            const f = p.pathIds[i]; const t = p.pathIds[i+1];
            d3.select(`.edge-${f}-${t}`).attr("stroke", "var(--amber-400)").attr("stroke-width", 4);
          }
        }
      } else {
        document.getElementById('sp-result').textContent = 'No path found';
      }
    } catch(e) {
      document.getElementById('sp-result').textContent = 'Error finding path';
    }
  });

  loadGraph();
}

export default renderCampusGraph;
