import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";
import Spinner from "../components/Spinner";

const ROLES = ["Admin", "Faculty", "HeadOfDepartment"];

function Users() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Faculty",
    department: "",
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    Promise.all([fetchUsers(), fetchDepartments()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch departments");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      role: "Faculty",
      department: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.department) {
      toast.error("Please select a department");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, {
          name: form.name,
          email: form.email,
          role: form.role,
          department: form.department,
        });
        toast.success("User updated successfully");
      } else {
        await api.post("/auth/register", {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          department: form.department,
        });
        toast.success("User created successfully");
      }

      resetForm();
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save user");
    }
  };

  const handleEdit = (user) => {
    setEditingId(user._id);
    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "Faculty",
      department: user.department?._id || user.department || "",
    });
  };

  const openDeleteModal = (id) => {
    setSelectedUserId(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setSelectedUserId(null);
    setShowDeleteModal(false);
  };

  const handleDelete = async () => {
    if (!selectedUserId) return;

    try {
      await api.delete(`/users/${selectedUserId}`);
      toast.success("User deleted successfully");
      closeDeleteModal();
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete user");
      closeDeleteModal();
    }
  };

  return (
    <div className="portal-page">
      <div className="page-header">
        <h2>Users Management</h2>
        <p>Create and manage user accounts of any role.</p>
      </div>

      <div className="form-card">
        <div className="section-title">
          <h3>{editingId ? "Edit User" : "Create New User"}</h3>
          <p>Fill in the user information below.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

          {!editingId && (
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
          )}

          <select name="role" value={form.role} onChange={handleChange}>
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            required
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.code} - {dept.name}
              </option>
            ))}
          </select>

          <button type="submit" className="primary-btn">
            {editingId ? "Update User" : "Create User"}
          </button>

          {editingId && (
            <button type="button" className="secondary-btn" onClick={resetForm}>
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div>
            <h3>Users List</h3>
            <p>{users.length} user(s) available</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <Spinner />
            <span>Loading users...</span>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="strong-cell">{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    {user.department
                      ? `${user.department.code} - ${user.department.name}`
                      : "—"}
                  </td>
                  <td>
                    <button className="table-btn" onClick={() => handleEdit(user)}>
                      Edit
                    </button>
                    {currentUser?.id !== user._id && (
                      <button
                        className="table-btn danger-btn"
                        onClick={() => openDeleteModal(user._id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-table">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showDeleteModal && (
        <ConfirmModal
          title="Delete User"
          message="Are you sure you want to delete this user? This action cannot be undone."
          onCancel={closeDeleteModal}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

export default Users;
