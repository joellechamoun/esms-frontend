import { useEffect, useState } from "react";

function BarChart({ title, bars }) {
  const [animate, setAnimate] = useState(false);
  const max = Math.max(1, ...bars.map((b) => b.value));

  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="chart-card">
      <p className="chart-card-title">{title}</p>
      {bars.length === 0 ? (
        <p className="chart-empty">No data yet.</p>
      ) : (
        <div className="bar-chart">
          {bars.map((b, i) => (
            <div className="bar-row" key={b.label}>
              <span className="bar-label" title={b.label}>
                {b.label}
              </span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: animate ? `${(b.value / max) * 100}%` : "0%",
                    background: b.color,
                    transitionDelay: `${i * 70}ms`,
                  }}
                />
              </div>
              <span className="bar-value">{b.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BarChart;
