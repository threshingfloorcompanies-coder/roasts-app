import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { useCoffee } from '../context/CoffeeContext';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const { createOrder, availability, fetchAvailability } = useOrder();
  const { coffees, updateCoffee } = useCoffee();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailability();
  }, []);

  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuantityChange = (id, newQuantity) => {
    const item = cartItems.find(i => i.id === id);
    if (newQuantity > item.quantity) {
      alert(`Only ${item.quantity} bags available`);
      return;
    }
    updateQuantity(id, newQuantity);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      alert('Please login to place an order');
      navigate('/login');
      return;
    }

    if (!deliveryMethod) {
      alert('Please select pickup or delivery');
      return;
    }

    if (deliveryMethod === 'pickup' && !pickupDate) {
      alert('Please select a pickup date');
      return;
    }

    if (deliveryMethod === 'delivery' && (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip)) {
      alert('Please fill in all shipping address fields');
      return;
    }

    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        userId: user.email,
        userName: user.name,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.cartQuantity
        })),
        total: getTotalPrice(),
        deliveryMethod,
        pickupDate: deliveryMethod === 'pickup' ? pickupDate : null,
        pickupAddress: deliveryMethod === 'pickup' ? '1234 Roasting Lane, Coffee City, CA 90210' : null,
        shippingAddress: deliveryMethod === 'delivery' ? shippingAddress : null,
        paymentMethod,
        paymentInfo: getPaymentInfo()
      };

      await createOrder(orderData);
      clearCart();
      alert('Order placed successfully! We will confirm once payment is received.');
      navigate('/');
    } catch (error) {
      alert('Failed to place order. Please try again.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getPaymentInfo = () => {
    if (paymentMethod === 'venmo') return 'david-coutts-2';
    if (paymentMethod === 'cashapp') return '$davidcoutts1';
    return 'Cash on pickup';
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <h2>Your Cart is Empty</h2>
          <p>Add some delicious roasts to your cart!</p>
          <button onClick={() => navigate('/')} className="continue-shopping-btn">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Your Cart</h1>

      <div className="cart-content">
        <div className="cart-items">
          <h2>Items</h2>
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} className="cart-item-image" />
              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p className="cart-item-price">${item.price.toFixed(2)} per bag</p>
                <div className="cart-item-quantity">
                  <label>Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    max={item.quantity}
                    value={item.cartQuantity}
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                  />
                  <span className="available-stock">{item.quantity} available</span>
                </div>
              </div>
              <div className="cart-item-total">
                <p>${(item.price * item.cartQuantity).toFixed(2)}</p>
                <button onClick={() => removeFromCart(item.id)} className="remove-btn">Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="checkout-section">
          <h2>Checkout</h2>

          <div className="checkout-group">
            <h3>Delivery Method</h3>
            <label className="radio-option">
              <input
                type="radio"
                value="pickup"
                checked={deliveryMethod === 'pickup'}
                onChange={(e) => setDeliveryMethod(e.target.value)}
              />
              Pickup
            </label>
            <label className="radio-option">
              <input
                type="radio"
                value="delivery"
                checked={deliveryMethod === 'delivery'}
                onChange={(e) => setDeliveryMethod(e.target.value)}
              />
              Delivery
            </label>
          </div>

          {deliveryMethod === 'pickup' && (
            <div className="checkout-group">
              <h3>Pickup Date & Time</h3>
              {availability.length === 0 ? (
                <p className="no-availability">Loading pickup times...</p>
              ) : availability.filter(slot => new Date(slot.date) > new Date()).length === 0 ? (
                <p className="no-availability">No pickup times available. Please check back later or contact us.</p>
              ) : (
                <select
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="date-input"
                >
                  <option value="">Select a pickup time...</option>
                  {availability
                    .filter(slot => new Date(slot.date) > new Date())
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(slot => (
                      <option key={slot.id} value={slot.date}>
                        {new Date(slot.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })} at {new Date(slot.date).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </option>
                    ))}
                </select>
              )}
            </div>
          )}

          {deliveryMethod === 'delivery' && (
            <div className="checkout-group">
              <h3>Shipping Address</h3>
              <input
                type="text"
                placeholder="Street Address"
                value={shippingAddress.street}
                onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                className="address-input"
              />
              <input
                type="text"
                placeholder="City"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                className="address-input"
              />
              <div className="address-row">
                <input
                  type="text"
                  placeholder="State"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  className="address-input-half"
                />
                <input
                  type="text"
                  placeholder="ZIP"
                  value={shippingAddress.zip}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                  className="address-input-half"
                />
              </div>
            </div>
          )}

          {deliveryMethod && (
            <div className="checkout-group">
              <h3>Payment Method</h3>
              {deliveryMethod === 'pickup' && (
                <label className="radio-option">
                  <input
                    type="radio"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  Cash
                </label>
              )}
              <label className="radio-option">
                <input
                  type="radio"
                  value="venmo"
                  checked={paymentMethod === 'venmo'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Venmo
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  value="cashapp"
                  checked={paymentMethod === 'cashapp'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Cash App
              </label>
            </div>
          )}

          {paymentMethod && paymentMethod !== 'cash' && (
            <div className="payment-info">
              <h3>Payment Information</h3>
              {paymentMethod === 'venmo' && (
                <p>Please send payment to: <strong>david-coutts-2</strong></p>
              )}
              {paymentMethod === 'cashapp' && (
                <p>Please send payment to: <strong>$davidcoutts1</strong></p>
              )}
              <p className="payment-note">Your order will be marked as pending until we confirm payment.</p>
            </div>
          )}

          <div className="cart-total">
            <h3>Total: ${getTotalPrice().toFixed(2)}</h3>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isProcessing}
            className="place-order-btn"
          >
            {isProcessing ? 'Processing...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
