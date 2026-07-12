import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const roleMismatch =
    !!token && !!allowedRoles && (!user || !allowedRoles.includes(user.role));

  useEffect(() => {
    if (!token) {
      toast.error("Please log in to continue.");
    } else if (roleMismatch) {
      toast.error(
        `Your account (${user?.role || "unknown role"}) doesn't have access to this page.`
      );
    }
    // Only fire once when this route is entered, not on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!token) {
    return <Navigate to="/" />;
  }

  if (roleMismatch) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;
