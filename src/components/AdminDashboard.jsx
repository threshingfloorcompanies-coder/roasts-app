import { useState } from 'react';
import { useCoffee } from '../context/CoffeeContext';
import CoffeeForm from './CoffeeForm';
import './AdminDashboard.css';

function AdminDashboard() {
  const { coffees, deleteCoffee } = useCoffee();
  const [editingCoffee, setEditingCoffee] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleEdit = (coffee) => {
    setEditingCoffee(coffee);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this coffee?')) {
      deleteCoffee(id);
    }
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
        <button onClick={handleAddNew} className="add-coffee-btn">
          Add New Coffee
        </button>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coffees.map(coffee => (
              <tr key={coffee.id}>
                <td>
                  <img src={coffee.image} alt={coffee.name} className="admin-coffee-img" />
                </td>
                <td>{coffee.name}</td>
                <td>{coffee.description}</td>
                <td>${coffee.price.toFixed(2)}</td>
                <td>
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
    </div>
  );
}

export default AdminDashboard;
