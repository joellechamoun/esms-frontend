import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    capacity: "",
    building: "",
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await api.get("/rooms");
      setRooms(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch rooms");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      name: "",
      capacity: "",
      building: "",
    });
    setEditingId(null);
  };

  const openDeleteModal = (id) => {
    setSelectedRoomId(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setSelectedRoomId(null);
    setShowDeleteModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const roomData = {
        name: form.name,
        capacity: Number(form.capacity),
        building: form.building,
      };

      if (editingId) {
        await api.put(`/rooms/${editingId}`, roomData);
        toast.success("Room updated successfully");
      } else {
        await api.post("/rooms", roomData);
        toast.success("Room added successfully");
      }

      resetForm();
      fetchRooms();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save room");
    }
  };

  const handleEdit = (room) => {
    setEditingId(room._id);

    setForm({
      name: room.name,
      capacity: room.capacity,
      building: room.building || "",
    });
  };

  const handleDelete = async () => {
    if (!selectedRoomId) return;

    try {
      await api.delete(`/rooms/${selectedRoomId}`);
      toast.success("Room deleted successfully");
      closeDeleteModal();
      fetchRooms();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete room");
      closeDeleteModal();
    }
  };

  return (
    <div className="portal-page">
      <div className="page-header">
        <h2>Rooms Management</h2>
        <p>Manage exam rooms, capacities, and building locations.</p>
      </div>

      <div className="form-card">
        <div className="section-title">
          <h3>{editingId ? "Edit Room" : "Add New Room"}</h3>
          <p>Fill in the room information below.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Room Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="capacity"
            type="number"
            min="1"
            placeholder="Capacity"
            value={form.capacity}
            onChange={handleChange}
            required
          />

          <input
            name="building"
            placeholder="Building (optional)"
            value={form.building}
            onChange={handleChange}
          />

          <button type="submit" className="primary-btn">
            {editingId ? "Update Room" : "Add Room"}
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
            <h3>Rooms List</h3>
            <p>{rooms.length} room(s) available</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Room Name</th>
              <th>Capacity</th>
              <th>Building</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {rooms.map((room) => (
              <tr key={room._id}>
                <td className="strong-cell">{room.name}</td>
                <td>{room.capacity}</td>
                <td>{room.building || "-"}</td>
                <td>
                  <button className="table-btn" onClick={() => handleEdit(room)}>
                    Edit
                  </button>
                  <button
                    className="table-btn danger-btn"
                    onClick={() => openDeleteModal(room._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {rooms.length === 0 && (
              <tr>
                <td colSpan="4" className="empty-table">
                  No rooms added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showDeleteModal && (
        <ConfirmModal
          title="Delete Room"
          message="Are you sure you want to delete this room? This action cannot be undone."
          onCancel={closeDeleteModal}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

export default Rooms;