import { Link } from "react-router-dom";

const TONE_COLORS = {
  warning: "#c9a24d",
  danger: "#c0392b",
  neutral: "#9aa5b1",
};

function NeedsAttention({ items, emptyMessage }) {
  return (
    <div className="chart-card needs-attention">
      <p className="chart-card-title">Needs Attention</p>

      {items.length === 0 ? (
        <div className="needs-attention-empty">
          <div className="needs-attention-check">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M5 13l4 4L19 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="needs-attention-empty-title">All Caught Up</p>
          <p className="needs-attention-empty-sub">{emptyMessage}</p>
        </div>
      ) : (
        <ul className="needs-attention-list">
          {items.map((item, i) => (
            <li key={item.id} style={{ animationDelay: `${i * 90}ms` }}>
              <div className="needs-attention-item-main">
                <span
                  className="attention-dot"
                  style={{ "--dot-color": TONE_COLORS[item.tone] || TONE_COLORS.warning }}
                  aria-hidden="true"
                />
                <div>
                  <p className="needs-attention-item-title">{item.title}</p>
                  <p className="needs-attention-item-sub">{item.subtitle}</p>
                </div>
              </div>
              <Link to={item.actionTo} className="needs-attention-action">
                {item.actionLabel}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NeedsAttention;
