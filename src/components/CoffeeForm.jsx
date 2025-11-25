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

  const uploadToImgBB = async () => {
    if (!imageFile) return formData.image;

    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      showAlert('API Key Missing', 'Please add your ImgBB API key to the .env file. Get a free key at https://api.imgbb.com/');
      throw new Error('ImgBB API key not configured');
    }

    // Check file size (ImgBB free tier allows up to 32MB)
    const maxSize = 32 * 1024 * 1024; // 32MB in bytes
    if (imageFile.size > maxSize) {
      showAlert('Image Too Large', 'Please use an image smaller than 32MB.');
      throw new Error('Image too large');
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      return data.data.url; // Returns the image URL
    } catch (error) {
      console.error('Error uploading to ImgBB:', error);
      showAlert('Upload Failed', `Failed to upload image: ${error.message}. Please try again or use an image URL instead.`);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Upload image to ImgBB if a new file was selected
      const imageUrl = await uploadToImgBB();

      const coffeeData = {
        ...formData,
        image: imageUrl,
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
              {uploadingImage ? 'Uploading Image...' : coffee ? 'Update Roast' : 'Add Roast'}
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
