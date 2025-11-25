import { useEffect } from 'react';
import { useOrder } from '../context/OrderContext';
import { useCoffee } from '../context/CoffeeContext';
import './AdminOrders.css';

function AdminOrders() {
  const { orders, updateOrderStatus, fetchOrders } = useOrder();
  const { coffees, updateCoffee } = useCoffee();

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleConfirmPayment = async (order) => {
    try {
      // Update order status
      await updateOrderStatus(order.id, 'placed');

      // Decrement quantity for each item in the order
      for (const item of order.items) {
        const coffee = coffees.find(c => c.id === item.id);
        if (coffee) {
          const newQuantity = (coffee.quantity || 0) - item.quantity;
          await updateCoffee(coffee.id, { ...coffee, quantity: Math.max(0, newQuantity) });
        }
      }

      alert('Order confirmed! Quantities have been updated.');
      fetchOrders();
    } catch (error) {
      alert('Failed to confirm order. Please try again.');
      console.error(error);
    }
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString();
  };

  return (
    <div className="admin-orders-container">
      <h1>Order Management</h1>

      <div className="orders-grid">
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>No orders yet</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className={`order-card ${order.status}`}>
              <div className="order-header">
                <div>
                  <h3>Order #{order.id.substring(0, 8)}</h3>
                  <p className="order-date">{formatDate(order.createdAt)}</p>
                </div>
                <span className={`order-status ${order.status}`}>
                  {order.status === 'pending' ? 'Pending Payment' : 'Placed'}
                </span>
              </div>

              <div className="order-customer">
                <p><strong>Customer:</strong> {order.userName}</p>
                <p><strong>Email:</strong> {order.userId}</p>
              </div>

              <div className="order-delivery">
                <p><strong>Method:</strong> {order.deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'}</p>
                {order.pickupDate && (
                  <>
                    <p><strong>Pickup Date:</strong> {new Date(order.pickupDate).toLocaleDateString()}</p>
                    {order.status === 'placed' && order.pickupAddress && (
                      <div className="pickup-address">
                        <p><strong>Pickup Location:</strong></p>
                        <p>{order.pickupAddress}</p>
                      </div>
                    )}
                  </>
                )}
                {order.shippingAddress && (
                  <div className="shipping-address">
                    <p><strong>Shipping Address:</strong></p>
                    <p>{order.shippingAddress.street}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                  </div>
                )}
              </div>

              <div className="order-payment">
                <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                {order.paymentInfo && (
                  <p><strong>Payment Info:</strong> {order.paymentInfo}</p>
                )}
              </div>

              <div className="order-items">
                <h4>Items:</h4>
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <span>{item.name}</span>
                    <span>x{item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="order-total">
                <strong>Total: ${order.total.toFixed(2)}</strong>
              </div>

              {order.status === 'pending' && (
                <button
                  onClick={() => handleConfirmPayment(order)}
                  className="confirm-payment-btn"
                >
                  Confirm Payment Received
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminOrders;
