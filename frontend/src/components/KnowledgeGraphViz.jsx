import { useCallback, useRef, useEffect, useState } from 'react';

const NODE_COLORS = {
  lab_test: '#38bdf8',
  disease: '#ef4444',
  symptom: '#f59e0b',
  medication: '#22c55e',
  unknown: '#94a3b8',
};

const NODE_SIZES = {
  lab_test: 6,
  disease: 8,
  symptom: 5,
  medication: 5,
  unknown: 4,
};

function KnowledgeGraphViz({ graphData, graphRisks = [] }) {
  const graphRef = useRef(null);
  const [ForceGraph2D, setForceGraph2D] = useState(null);

  useEffect(() => {
    import('react-force-graph-2d')
      .then((mod) => setForceGraph2D(() => mod.default))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('charge')?.strength(-100);
      graphRef.current.d3Force('link')?.distance(80);
    }
  }, [graphData, ForceGraph2D]);

  const nodeCanvasObject = useCallback((node, ctx, globalScale) => {
    const size = NODE_SIZES[node.type] || 4;
    const color = NODE_COLORS[node.type] || NODE_COLORS.unknown;
    const label = node.label || node.id;
    const fontSize = 10 / globalScale;

    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(node.x, node.y, size + 2, 0, 2 * Math.PI);
    ctx.strokeStyle = color + '40';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = `${fontSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(label, node.x, node.y + size + 3);
  }, []);

  const linkCanvasObject = useCallback((link, ctx) => {
    const start = link.source;
    const end = link.target;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const angle = Math.atan2(dy, dx);
    const arrowLen = 6;
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(midX - arrowLen * Math.cos(angle - Math.PI / 6), midY - arrowLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(midX - arrowLen * Math.cos(angle + Math.PI / 6), midY - arrowLen * Math.sin(angle + Math.PI / 6));
    ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.fill();
  }, []);

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="glass-card">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'rgba(236, 72, 153, 0.15)' }}>🕸️</div>
          <h3>Medical Knowledge Graph</h3>
        </div>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>
          No graph data available for this analysis.
        </p>
      </div>
    );
  }

  const fgData = {
    nodes: graphData.nodes.map(n => ({ ...n })),
    links: graphData.edges.map(e => ({
      source: e.source,
      target: e.target,
      relationship: e.relationship,
      description: e.description,
    })),
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div className="glass-card">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'rgba(236, 72, 153, 0.15)' }}>🕸️</div>
          <h3>Medical Knowledge Graph</h3>
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {graphData.nodes.length} nodes • {graphData.edges.length} relationships
          </span>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          {Object.entries(NODE_COLORS).filter(([k]) => k !== 'unknown').map(([type, color]) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }}></div>
              <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{type.replace('_', ' ')}</span>
            </div>
          ))}
        </div>

        {/* Graph */}
        <div className="graph-container">
          {ForceGraph2D ? (
            <ForceGraph2D
              ref={graphRef}
              graphData={fgData}
              nodeCanvasObject={nodeCanvasObject}
              linkCanvasObject={linkCanvasObject}
              backgroundColor="rgba(0,0,0,0)"
              width={800}
              height={400}
              nodeId="id"
              cooldownTicks={50}
            />
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ marginBottom: 12 }}>Loading graph visualization...</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8, textAlign: 'left' }}>
                {graphData.nodes.map(n => (
                  <div key={n.id} style={{
                    padding: '6px 10px', borderRadius: 6,
                    background: NODE_COLORS[n.type] + '15',
                    border: `1px solid ${NODE_COLORS[n.type]}30`,
                    fontSize: '0.8rem',
                  }}>
                    <span style={{ color: NODE_COLORS[n.type] }}>●</span> {n.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Relationships Table */}
      {graphData.edges.length > 0 && (
        <div className="glass-card">
          <div className="card-header">
            <div className="card-icon" style={{ background: 'rgba(56, 189, 248, 0.15)' }}>🔗</div>
            <h3>Medical Relationships</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Relationship</th>
                <th>Target</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {graphData.edges.slice(0, 20).map((edge, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{edge.source}</td>
                  <td>
                    <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                      {edge.relationship}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{edge.target}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{edge.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {graphData.edges.length > 20 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 8, textAlign: 'center' }}>
              Showing 20 of {graphData.edges.length} relationships
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default KnowledgeGraphViz;
