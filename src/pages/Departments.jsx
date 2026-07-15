import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";
import Spinner from "../components/Spinner";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    code: "",
    name: "",
  });

  const [assigningDept, setAssigningDept] = useState(null);
  const [assignMode, setAssignMode] = useState(null); // "create" | "existing"

  const [assignForm, setAssignForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [selectedUserId, setSelectedUserId] = useState("");

  const [removeHeadDept, setRemoveHeadDept] = useState(null);

  useEffect(() => {
    Promise.all([fetchDepartments(), fetchUsers()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch departments");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    }
  };

  const eligibleUsers = users.filter((u) => u.role !== "HeadOfDepartment");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/departments", form);
      toast.success("Department added successfully");
      setForm({ code: "", name: "" });
      fetchDepartments();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save department");
    }
  };

  const openAssignForm = (dept, mode) => {
    setAssigningDept(dept);
    setAssignMode(mode);
    setAssignForm({ name: "", email: "", password: "" });
    setSelectedUserId("");
  };

  const closeAssignForm = () => {
    setAssigningDept(null);
    setAssignMode(null);
    setAssignForm({ name: "", email: "", password: "" });
    setSelectedUserId("");
  };

  const handleAssignChange = (e) => {
    setAssignForm({ ...assignForm, [e.target.name]: e.target.value });
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/register", {
        name: assignForm.name,
        email: assignForm.email,
        password: assignForm.password,
        role: "HeadOfDepartment",
        department: assigningDept._id,
      });

      toast.success("Head of Department assigned successfully");
      closeAssignForm();
      fetchDepartments();
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to assign head of department"
      );
    }
  };

  const handleAssignExistingSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }

    try {
      await api.put(`/departments/${assigningDept._id}/head`, {
        userId: selectedUserId,
      });

      toast.success("Head of Department assigned successfully");
      closeAssignForm();
      fetchDepartments();
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to assign head of department"
      );
    }
  };

  const handleRemoveHead = async () => {
    if (!removeHeadDept) return;

    try {
      await api.delete(`/departments/${removeHeadDept._id}/head`);
      toast.success("Head of Department removed successfully");
      setRemoveHeadDept(null);
      fetchDepartments();
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to remove head of department"
      );
      setRemoveHeadDept(null);
    }
  };

  return (
    <div className="portal-page">
      <div className="page-header">
        <h2>Departments Management</h2>
        <p>Manage departments and assign each one a Head of Department.</p>
      </div>

      <div className="form-card">
        <div className="section-title">
          <h3>Add New Department</h3>
          <p>Fill in the department information below.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            name="code"
            placeholder="Department Code e.g. CS"
            value={form.code}
            onChange={handleChange}
            required
          />

          <input
            name="name"
            placeholder="Department Name e.g. Computer Science"
            value={form.name}
            onChange={handleChange}
            required
          />

          <button type="submit" className="primary-btn">
            Add Department
          </button>
        </form>
      </div>

      {assigningDept && assignMode === "create" && (
        <div className="form-card">
          <div className="section-title">
            <h3>Create New Head</h3>
            <p>Create a Head of Department account for {assigningDept.name}.</p>
          </div>

          <form onSubmit={handleAssignSubmit}>
            <input
              name="name"
              placeholder="Full Name"
              value={assignForm.name}
              onChange={handleAssignChange}
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={assignForm.email}
              onChange={handleAssignChange}
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={assignForm.password}
              onChange={handleAssignChange}
              required
            />

            <button type="submit" className="primary-btn">
              Assign Head
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={closeAssignForm}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {assigningDept && assignMode === "existing" && (
        <div className="form-card">
          <div className="section-title">
            <h3>Assign Existing User</h3>
            <p>
              Pick an existing user to become head of {assigningDept.name}.
              Their role and department will be updated accordingly.
            </p>
          </div>

          <form onSubmit={handleAssignExistingSubmit}>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
            >
              <option value="">Select User</option>
              {eligibleUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email}) — {user.role}
                </option>
              ))}
            </select>

            <button type="submit" className="primary-btn">
              Assign Head
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={closeAssignForm}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="table-header">
          <div>
            <h3>Departments List</h3>
            <p>{departments.length} department(s) available</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <Spinner />
            <span>Loading departments...</span>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Head of Department</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {departments.map((dept) => (
                <tr key={dept._id}>
                  <td className="strong-cell">{dept.code}</td>
                  <td>{dept.name}</td>
                  <td>
                    {dept.head
                      ? `${dept.head.name} (${dept.head.email})`
                      : "— none assigned —"}
                  </td>
                  <td>
                    {dept.head ? (
                      <button
                        className="table-btn danger-btn"
                        onClick={() => setRemoveHeadDept(dept)}
                      >
                        Remove Head
                      </button>
                    ) : (
                      <>
                        <button
                          className="table-btn"
                          onClick={() => openAssignForm(dept, "create")}
                        >
                          Create New Head
                        </button>
                        <button
                          className="table-btn"
                          onClick={() => openAssignForm(dept, "existing")}
                        >
                          Assign Existing User
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}

              {departments.length === 0 && (
                <tr>
                  <td colSpan="4" className="empty-table">
                    No departments added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {removeHeadDept && (
        <ConfirmModal
          title="Remove Head of Department"
          message={`Are you sure you want to remove ${removeHeadDept.head?.name} as head of ${removeHeadDept.name}? Their account will revert to Faculty.`}
          confirmLabel="Remove"
          onCancel={() => setRemoveHeadDept(null)}
          onConfirm={handleRemoveHead}
        />
      )}
    </div>
  );
}

export default Departments;
