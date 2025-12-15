import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Toast from './Toast';
import './CoffeeCard.css';

function CoffeeCard({ coffee }) {
  const { addToCart } = useCart();
  const { isAdmin } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Get available sizes and roasts
  const availableSizes = coffee.sizes || [];
  const availableRoasts = coffee.roasts || ['Medium'];

  // State for selected size and roast
  const [selectedSize, setSelectedSize] = useState(availableSizes[0] || null);
  const [selectedRoast, setSelectedRoast] = useState(coffee.defaultRoast || 'Medium');

  // Update selected size when coffee changes
  useEffect(() => {
    if (availableSizes.length > 0) {
      setSelectedSize(availableSizes[0]);
    }
  }, [coffee.id]);

  // Update selected roast when coffee changes
  useEffect(() => {
    setSelectedRoast(coffee.defaultRoast || 'Medium');
  }, [coffee.id]);

  const isOutOfStock = !selectedSize || selectedSize.quantity === 0;

  const handleAddToCart = () => {
    if (!isOutOfStock && selectedSize) {
      addToCart(coffee, selectedSize, selectedRoast);
      setShowToast(true);
    }
  };

  const handleImageClick = () => {
    setShowImageModal(true);
  };

  return (
    <>
      {showToast && (
        <Toast
          message={`${coffee.name} added to cart!`}
          onClose={() => setShowToast(false)}
        />
      )}
      {showImageModal && (
        <div className="image-modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={() => setShowImageModal(false)}>&times;</button>
            <img src={coffee.image} alt={coffee.name} className="image-modal-img" />
          </div>
        </div>
      )}
      <div className="coffee-card">
        {isOutOfStock && (
          <div className="out-of-stock-badge">Out of Stock</div>
        )}
      <div className="coffee-image-container">
        <img
          src={coffee.image}
          alt={coffee.name}
          className="coffee-image"
          onClick={handleImageClick}
          title="Click to view full image"
        />
      </div>
      <div className="coffee-details">
        <h3 className="coffee-name">{coffee.name}</h3>
        <p className="coffee-description">{coffee.description}</p>

        {availableSizes.length > 0 && (
          <div className="coffee-options">
            <div className="option-group">
              <label htmlFor={`size-${coffee.id}`}>Size:</label>
              <select
                id={`size-${coffee.id}`}
                value={selectedSize?.size || ''}
                onChange={(e) => {
                  const size = availableSizes.find(s => s.size === e.target.value);
                  setSelectedSize(size);
                }}
                className="size-select"
              >
                {availableSizes.map(size => (
                  <option key={size.size} value={size.size}>
                    {size.size} - ${size.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {availableRoasts.length > 0 && (
              <div className="option-group">
                <label htmlFor={`roast-${coffee.id}`}>Roast:</label>
                <select
                  id={`roast-${coffee.id}`}
                  value={selectedRoast}
                  onChange={(e) => setSelectedRoast(e.target.value)}
                  className="roast-select"
                >
                  {availableRoasts.map(roast => (
                    <option key={roast} value={roast}>
                      {roast}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        <div className="coffee-quantity">
          {selectedSize && selectedSize.quantity > 0 ? (
            <span className="in-stock">{selectedSize.quantity} bags available</span>
          ) : (
            <span className="no-stock">Currently unavailable</span>
          )}
        </div>
        <div className="coffee-footer">
          <span className="coffee-price">
            {selectedSize ? `$${selectedSize.price.toFixed(2)}` : 'N/A'}
          </span>
          {!isAdmin && (
            <button
              className={`add-to-cart-btn ${isOutOfStock ? 'disabled' : ''}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

export default CoffeeCard;
