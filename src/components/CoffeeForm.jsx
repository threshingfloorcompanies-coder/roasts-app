import { useState, useEffect } from 'react';
import { useCoffee } from '../context/CoffeeContext';
import './CoffeeForm.css';

function CoffeeForm({ coffee, onClose }) {
  const { addCoffee, updateCoffee } = useCoffee();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    quantity: ''
  });

  useEffect(() => {
    if (coffee) {
      setFormData({
        name: coffee.name,
        description: coffee.description,
        price: coffee.price.toString(),
        image: coffee.image,
        quantity: coffee.quantity?.toString() || '0'
      });
    }
  }, [coffee]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const coffeeData = {
      ...formData,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity) || 0
    };

    if (coffee) {
      updateCoffee(coffee.id, coffeeData);
    } else {
      addCoffee(coffeeData);
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{coffee ? 'Edit Roast' : 'Add New Roast'}</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="coffee-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Ethiopian Yirgacheffe"
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Brief description of the beans"
              rows="3"
            />
          </div>
          <div className="form-group">
            <label htmlFor="price">Price ($)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder="e.g., 4.50"
            />
          </div>
          <div className="form-group">
            <label htmlFor="quantity">Quantity Available</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="0"
              placeholder="e.g., 10"
            />
          </div>
          <div className="form-group">
            <label htmlFor="image">Image URL</label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              required
              placeholder="https://example.com/image.jpg"
            />
          </div>
          {formData.image && (
            <div className="image-preview">
              <img src={formData.image} alt="Preview" />
            </div>
          )}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {coffee ? 'Update' : 'Add'} Roast
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CoffeeForm;
