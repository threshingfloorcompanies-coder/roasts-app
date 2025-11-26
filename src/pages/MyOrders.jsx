import { useState, useEffect } from 'react';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './MyOrders.css';

function MyOrders() {
  const { orders, loading: ordersLoading } = useOrder();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [userOrders, setUserOrders] = useState([]);

  useEffect(() => {
    // Wait for auth to load before checking user
    if (authLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    // Filter orders for current user
    console.log('All orders:', orders);
    console.log('Current user email:', user.email);
    const filteredOrders = orders.filter(order => {
      console.log('Checking order:', order.id, 'userId:', order.userId, 'matches:', order.userId === user.email);
      return order.userId === user.email;
    });
    console.log('Filtered orders:', filteredOrders);
    setUserOrders(filteredOrders);
  }, [orders, user, navigate, authLoading]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'confirmed':
        return 'status-confirmed';
      case 'fulfilled':
        return 'status-fulfilled';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (authLoading || ordersLoading) {
    return (
      <div className="my-orders-container">
        <div className="loading">Loading your orders...</div>
      </div>
    );
  }

  return (
    <div className="my-orders-container">
      <h1>My Orders</h1>
      <p className="orders-description">
        Track your coffee orders and their status
      </p>

      {/* Debug info */}
      <div style={{ background: '#f0f0f0', padding: '1rem', marginBottom: '1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
        <strong>Debug Info:</strong><br />
        Total orders in system: {orders.length}<br />
        Your email: {user?.email}<br />
        Your filtered orders: {userOrders.length}<br />
        Orders data: {JSON.stringify(orders.map(o => ({ id: o.id.slice(-6), userId: o.userId })), null, 2)}
      </div>

      {userOrders.length === 0 ? (
        <div className="no-orders">
          <h2>No Orders Yet</h2>
          <p>You haven't placed any orders yet.</p>
          <button onClick={() => navigate('/')} className="shop-now-btn">
            Shop Now
          </button>
        </div>
      ) : (
        <div className="orders-grid">
          {userOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <span className="order-id">Order #{order.id.slice(-6).toUpperCase()}</span>
                  <span className={`order-status ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="order-date">
                  {formatDate(order.createdAt)}
                </div>
              </div>

              <div className="order-items">
                <h3>Items:</h3>
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                    <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="order-details">
                <div className="detail-row">
                  <span className="detail-label">Delivery Method:</span>
                  <span className="detail-value">
                    {order.deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'}
                  </span>
                </div>

                {order.deliveryMethod === 'pickup' && order.pickupDate && (
                  <div className="detail-row">
                    <span className="detail-label">Pickup Time:</span>
                    <span className="detail-value">{formatDate(order.pickupDate)}</span>
                  </div>
                )}

                {order.deliveryMethod === 'pickup' && order.pickupAddress && (
                  <div className="detail-row">
                    <span className="detail-label">Pickup Address:</span>
                    <span className="detail-value">{order.pickupAddress}</span>
                  </div>
                )}

                {order.deliveryMethod === 'delivery' && order.shippingAddress && (
                  <div className="detail-row">
                    <span className="detail-label">Shipping Address:</span>
                    <span className="detail-value">
                      {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                    </span>
                  </div>
                )}

                <div className="detail-row">
                  <span className="detail-label">Payment Method:</span>
                  <span className="detail-value">
                    {order.paymentMethod === 'cash' ? 'Cash' :
                     order.paymentMethod === 'venmo' ? 'Venmo' : 'Cash App'}
                  </span>
                </div>

                {order.paymentInfo && (
                  <div className="detail-row">
                    <span className="detail-label">Payment Info:</span>
                    <span className="detail-value">{order.paymentInfo}</span>
                  </div>
                )}
              </div>

              <div className="order-total">
                <span className="total-label">Total:</span>
                <span className="total-amount">${order.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyOrders;
