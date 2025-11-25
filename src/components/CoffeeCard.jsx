import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Toast from './Toast';
import './CoffeeCard.css';

function CoffeeCard({ coffee }) {
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const isOutOfStock = !coffee.quantity || coffee.quantity === 0;
  const isAdmin = currentUser?.email === 'admin@admin.com';

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addToCart(coffee);
      setShowToast(true);
    }
  };

  return (
    <>
      {showToast && (
        <Toast
          message={`${coffee.name} added to cart!`}
          onClose={() => setShowToast(false)}
        />
      )}
      <div className="coffee-card">
        {isOutOfStock && (
          <div className="out-of-stock-badge">Out of Stock</div>
        )}
      <div className="coffee-image-container">
        <img src={coffee.image} alt={coffee.name} className="coffee-image" />
      </div>
      <div className="coffee-details">
        <h3 className="coffee-name">{coffee.name}</h3>
        <p className="coffee-description">{coffee.description}</p>
        <div className="coffee-quantity">
          {coffee.quantity > 0 ? (
            <span className="in-stock">{coffee.quantity} bags available</span>
          ) : (
            <span className="no-stock">Currently unavailable</span>
          )}
        </div>
        <div className="coffee-footer">
          <span className="coffee-price">${coffee.price.toFixed(2)}</span>
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
