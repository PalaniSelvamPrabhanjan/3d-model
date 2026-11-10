// Live data adapter for the twin.
// Every source delivers the same message shape, so the 3D scene never cares where data comes from:
//   { "assets": [ { "id": "L1-PNP", "state": "RUN", "ts": "2026-11-02T13:00:00Z", "metrics": { "oee": 0.86, "count": 1240 } } ] }
// state is one of RUN | IDLE | DOWN | MAINT | OFF. Only changed assets need to be sent (delta updates).

export const STATES = {
  RUN:   { label: 'Running',     color: 0x2ee06e, css: '#2ee06e' },
  IDLE:  { label: 'Idle',        color: 0xffb020, css: '#ffb020' },
  DOWN:  { label: 'Down',        color: 0xff4a3d, css: '#ff4a3d' },
  MAINT: { label: 'Maintenance', color: 0x5fb4ff, css: '#5fb4ff' },
  OFF:   { label: 'Powered off', color: 0x6b7c8f, css: '#6b7c8f' },
  NONE:  { label: 'No live data',color: 0x3a4b5e, css: '#7e93aa' },
};

export function createFeed(config, assetIds, onMessage, onStatus) {
  const src = config.dataSource || { type: 'none' };
  let stop = () => {};
  if (config.demoMode) return demoFeed(assetIds, onMessage, onStatus);
  if (src.type === 'websocket') {
    let ws, retry = 1000, closed = false;
    const open = () => {
      onStatus('connecting', src.websocketUrl);
      ws = new WebSocket(src.websocketUrl);
      ws.onopen = () => { retry = 1000; onStatus('live', src.websocketUrl); };
      ws.onmessage = (e) => { try { onMessage(JSON.parse(e.data)); } catch (err) { console.warn('Bad message', err); } };
      ws.onclose = () => { if (closed) return; onStatus('reconnecting', src.websocketUrl); setTimeout(open, retry); retry = Math.min(retry * 2, 30000); };
      ws.onerror = () => ws.close();
    };
    open();
    stop = () => { closed = true; ws && ws.close(); };
  } else if (src.type === 'rest') {
    let t;
    const poll = async () => {
      try {
        const r = await fetch(src.restUrl, { cache: 'no-store' });
        if (!r.ok) throw new Error(r.status);
        onMessage(await r.json()); onStatus('live', src.restUrl);
      } catch (err) { onStatus('error', src.restUrl + ' (' + err.message + ')'); }
      t = setTimeout(poll, (src.pollSeconds || 5) * 1000);
    };
    poll();
    stop = () => clearTimeout(t);
  } else {
    onStatus('none', 'No data source configured');
  }
  return stop;
}

// Demo feed: clearly labelled in the UI, off by default (config.demoMode or the DEMO switch).
function demoFeed(ids, onMessage, onStatus) {
  onStatus('demo', 'Demo data — not real machine states');
  const pick = () => { const r = Math.random(); return r < 0.78 ? 'RUN' : r < 0.9 ? 'IDLE' : r < 0.96 ? 'DOWN' : 'MAINT'; };
  const machines = ids.filter((id) => !/-(WB|BN|CAB|N2C|DRY|RACK|ESD|WS)-/.test(id));
  onMessage({ assets: machines.map((id) => ({ id, state: pick(), ts: new Date().toISOString(), metrics: { oee: +(0.6 + Math.random() * 0.35).toFixed(2) } })) });
  const t = setInterval(() => {
    const id = machines[Math.floor(Math.random() * machines.length)];
    onMessage({ assets: [{ id, state: pick(), ts: new Date().toISOString(), metrics: { oee: +(0.6 + Math.random() * 0.35).toFixed(2) } }] });
  }, 2500);
  return () => clearInterval(t);
}
