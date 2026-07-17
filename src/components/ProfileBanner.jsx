const ROLE_LABELS = {
  Admin: "Administrator",
  HeadOfDepartment: "Head of Department",
  Faculty: "Faculty",
  Student: "Student",
};

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function ProfileBanner({ user, currentTerm }) {
  if (!user) return null;

  return (
    <section className="dashboard-banner">
      <div className="dashboard-banner-avatar">{getInitials(user.name)}</div>

      <div className="dashboard-banner-info">
        <h1>Welcome back, {user.name}</h1>
        <div className="dashboard-banner-meta">
          <span className="dashboard-badge">
            {ROLE_LABELS[user.role] || user.role}
          </span>
          {user.department && (
            <span className="dashboard-badge dashboard-badge-muted">
              {user.department.name}
            </span>
          )}
        </div>
      </div>

      {currentTerm && (
        <div className="dashboard-banner-term">
          <span>Current Term</span>
          <strong>{currentTerm}</strong>
        </div>
      )}
    </section>
  );
}

export default ProfileBanner;
