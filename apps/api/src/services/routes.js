/** Small non-negative weighted Dijkstra. Never treat UNKNOWN evidence as confirmed. */
const stepFreeTraversalTypes = new Set(['PATH', 'RAMP']);

export function findRoute(facilities, connections, from, to, { demo = false } = {}) {
  const allIds = new Set(facilities.map((facility) => facility.id));
  if (!allIds.has(from) || !allIds.has(to)) return { found: false, reason: 'Unknown endpoint', demo };
  const ids = demo ? allIds : new Set(facilities
    .filter((facility) => facility.evidenceStatus === 'VERIFIED')
    .map((facility) => facility.id));
  // Even a zero-distance route must not present a fictional or unreviewed hub as verified.
  if (!ids.has(from) || !ids.has(to)) {
    return { found: false, reason: 'Endpoint has no verified accessibility record', demo };
  }
  if (from === to) return { found: true, demo, distanceMetres: 0, nodes: [from], links: [] };
  const edges = connections.filter((e) => {
    const allowed = demo ? e.evidenceStatus === 'DEMO_ONLY' && e.demoPassable === true : e.evidenceStatus === 'VERIFIED' && e.accessibility === 'YES';
    return allowed && stepFreeTraversalTypes.has(e.traversalType)
      && Number.isFinite(e.distanceMetres) && e.distanceMetres > 0 && ids.has(e.from) && ids.has(e.to);
  });
  const distance = Object.fromEntries([...ids].map((id) => [id, Infinity]));
  const previous = new Map();
  const visited = new Set();
  distance[from] = 0;
  while (visited.size < ids.size) {
    const current = [...ids].filter((id) => !visited.has(id)).sort((a, b) => distance[a] - distance[b])[0];
    if (!current || distance[current] === Infinity) break;
    if (current === to) break;
    visited.add(current);
    for (const edge of edges) {
      const neighbor = edge.from === current ? edge.to : edge.to === current ? edge.from : null;
      if (!neighbor || visited.has(neighbor)) continue;
      const tentative = distance[current] + edge.distanceMetres;
      if (tentative < distance[neighbor]) {
        distance[neighbor] = tentative;
        previous.set(neighbor, { parent: current, edge });
      }
    }
  }
  if (!Number.isFinite(distance[to])) {
    const reason = demo ? 'No step-free route in the synthetic graph' : 'No verified step-free route available';
    return { found: false, demo, reason };
  }
  const nodes = [to];
  const links = [];
  let cursor = to;
  while (cursor !== from) {
    const info = previous.get(cursor);
    if (!info) return { found: false, demo, reason: 'Route reconstruction failed' };
    links.unshift(info.edge);
    cursor = info.parent;
    nodes.unshift(cursor);
  }
  return { found: true, demo, distanceMetres: distance[to], nodes, links };
}
