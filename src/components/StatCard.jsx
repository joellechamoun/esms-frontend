import { Link } from "react-router-dom";

function StatCard({ label, value, to }) {
  const content = (
    <>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </>
  );

  if (to) {
    return (
      <Link to={to} className="stat-card stat-card-clickable">
        {content}
      </Link>
    );
  }

  return <div className="stat-card">{content}</div>;
}

export default StatCard;
