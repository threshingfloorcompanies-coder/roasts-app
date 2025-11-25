import './CoffeeCard.css';

function CoffeeCard({ coffee }) {
  return (
    <div className="coffee-card">
      <div className="coffee-image-container">
        <img src={coffee.image} alt={coffee.name} className="coffee-image" />
      </div>
      <div className="coffee-details">
        <h3 className="coffee-name">{coffee.name}</h3>
        <p className="coffee-description">{coffee.description}</p>
        <div className="coffee-footer">
          <span className="coffee-price">${coffee.price.toFixed(2)}</span>
          <button className="add-to-cart-btn">Add to Cart</button>
        </div>
      </div>
    </div>
  );
}

export default CoffeeCard;
