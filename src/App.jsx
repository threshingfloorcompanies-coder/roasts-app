import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CoffeeProvider } from './context/CoffeeContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import Navbar from './components/Navbar';
import CoffeeList from './components/CoffeeList';
import Login from './components/Login';
import Signup from './components/Signup';
import AdminDashboard from './components/AdminDashboard';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import AdminOrders from './pages/AdminOrders';
import AdminCalendar from './pages/AdminCalendar';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CoffeeProvider>
        <CartProvider>
          <OrderProvider>
            <Router>
              <div className="app">
                <Navbar />
                <Routes>
                  <Route path="/" element={<CoffeeList />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/my-orders" element={<MyOrders />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/orders"
                    element={
                      <ProtectedRoute>
                        <AdminOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/calendar"
                    element={
                      <ProtectedRoute>
                        <AdminCalendar />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </div>
            </Router>
          </OrderProvider>
        </CartProvider>
      </CoffeeProvider>
    </AuthProvider>
  );
}

export default App;
