import { useState, useEffect } from 'react';
import { useCoffee } from '../context/CoffeeContext';
import Modal from './Modal';
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
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        image: previewUrl
      });
    }
  };

  const showAlert = (title, message) => {
    setModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => setModal({ ...modal, isOpen: false })
    });
  };

  const convertImageToBase64 = async () => {
    if (!imageFile) return formData.image;

    // Check file size (max 500KB to keep Firestore documents reasonable)
    const maxSize = 500 * 1024; // 500KB in bytes
    if (imageFile.size > maxSize) {
      showAlert('Image Too Large', 'Please use an image smaller than 500KB. You can compress it at tinypng.com or use an image URL instead.');
      throw new Error('Image too large');
    }

    setUploadingImage(true);
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result); // This is the base64 string
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });
    } catch (error) {
      console.error('Error converting image:', error);
      showAlert('Upload Failed', 'Failed to process image. Please try again or use an image URL instead.');
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Convert image to base64 if a new file was selected
      const imageData = await convertImageToBase64();

      const coffeeData = {
        ...formData,
        image: imageData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity) || 0
      };

      if (coffee) {
        updateCoffee(coffee.id, coffeeData);
      } else {
        addCoffee(coffeeData);
      }

      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
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
            <label htmlFor="imageFile">Upload Image</label>
            <input
              type="file"
              id="imageFile"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />
            <small className="form-help">Or enter URL below</small>
          </div>
          <div className="form-group">
            <label htmlFor="image">Image URL (Optional)</label>
            <input
              type="url"
              id="image"
              name="image"
              value={imageFile ? '' : formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              disabled={imageFile !== null}
            />
          </div>
          {formData.image && (
            <div className="image-preview">
              <img src={formData.image} alt="Preview" />
            </div>
          )}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn" disabled={uploadingImage}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={uploadingImage}>
              {uploadingImage ? 'Processing Image...' : coffee ? 'Update Roast' : 'Add Roast'}
            </button>
          </div>
        </form>
      </div>

      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        type="alert"
      />
    </div>
  );
}

export default CoffeeForm;
