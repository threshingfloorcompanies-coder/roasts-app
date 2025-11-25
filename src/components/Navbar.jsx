import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const cartCount = getTotalItems();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/images/ThreshingFloorLogo11.25.png" alt="Threshing Floor Roasting Co." className="logo-image" />
        </Link>
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          {!isAdmin && (
            <>
              <Link to="/cart" className="nav-link cart-link">
                Cart
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
            </>
          )}
          {user ? (
            <>
              {!isAdmin && <Link to="/my-orders" className="nav-link">My Orders</Link>}
              {isAdmin && <Link to="/admin" className="nav-link">Admin</Link>}
              <span className="nav-link user-name">Hi, {user.name}</span>
              <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-link signup-btn">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
