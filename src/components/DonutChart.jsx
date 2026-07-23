import { useEffect, useState } from "react";

const SIZE = 120;
const STROKE = 18;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function DonutChart({ title, segments }) {
  const [animate, setAnimate] = useState(false);
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  let cumulative = 0;

  return (
    <div className="chart-card">
      <p className="chart-card-title">{title}</p>
      <div className="donut-row">
        <svg
          className="donut-svg"
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
        >
          <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
            {total === 0 ? (
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="#e9eef6"
                strokeWidth={STROKE}
              />
            ) : (
              segments.map((s, i) => {
                const fraction = s.value / total;
                const dash = fraction * CIRCUMFERENCE;
                const offset = (cumulative / total) * CIRCUMFERENCE;
                cumulative += s.value;

                return (
                  <circle
                    key={s.label}
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={STROKE}
                    strokeDasharray={
                      animate
                        ? `${dash} ${CIRCUMFERENCE - dash}`
                        : `0 ${CIRCUMFERENCE}`
                    }
                    strokeDashoffset={-offset}
                    className="donut-segment"
                    style={{ transitionDelay: `${i * 90}ms` }}
                  />
                );
              })
            )}
          </g>
        </svg>

        <ul className="chart-legend">
          {segments.map((s) => (
            <li key={s.label}>
              <span
                className="chart-legend-swatch"
                style={{ background: s.color }}
              />
              {s.label} {s.value}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default DonutChart;
