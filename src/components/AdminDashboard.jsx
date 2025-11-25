import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCoffee } from '../context/CoffeeContext';
import CoffeeForm from './CoffeeForm';
import Modal from './Modal';
import './AdminDashboard.css';

function AdminDashboard() {
  const { coffees, deleteCoffee } = useCoffee();
  const [editingCoffee, setEditingCoffee] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, onCancel: null });

  const handleEdit = (coffee) => {
    setEditingCoffee(coffee);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    setModal({
      isOpen: true,
      title: 'Delete Roast',
      message: 'Are you sure you want to delete this roast? This action cannot be undone.',
      onConfirm: () => {
        deleteCoffee(id);
        setModal({ ...modal, isOpen: false });
      },
      onCancel: () => setModal({ ...modal, isOpen: false })
    });
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingCoffee(null);
  };

  const handleAddNew = () => {
    setEditingCoffee(null);
    setIsFormOpen(true);
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-actions-group">
          <Link to="/admin/orders" className="view-orders-btn">
            View Orders
          </Link>
          <Link to="/admin/calendar" className="view-calendar-btn">
            Manage Calendar
          </Link>
          <button onClick={handleAddNew} className="add-coffee-btn">
            Add New Roast
          </button>
        </div>
      </div>

      {isFormOpen && (
        <CoffeeForm
          coffee={editingCoffee}
          onClose={handleFormClose}
        />
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coffees.map(coffee => (
              <tr key={coffee.id}>
                <td data-label="Image">
                  <img src={coffee.image} alt={coffee.name} className="admin-coffee-img" />
                </td>
                <td data-label="Name">{coffee.name}</td>
                <td data-label="Description">{coffee.description}</td>
                <td data-label="Price">${coffee.price.toFixed(2)}</td>
                <td data-label="Quantity">{coffee.quantity || 0} in stock</td>
                <td data-label="Actions">
                  <div className="admin-actions">
                    <button
                      onClick={() => handleEdit(coffee)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(coffee.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel}
        type="confirm"
      />
    </div>
  );
}

export default AdminDashboard;
