import { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase/config';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const OrderContext = createContext();

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  // Wait for auth to be ready before fetching
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('OrderContext: Auth state changed, user:', user?.email || 'none');
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (authReady) {
      console.log('OrderContext: Auth ready, fetching data...');
      fetchOrders();
      fetchAvailability();
    }
  }, [authReady]);

  const fetchOrders = async () => {
    try {
      console.log('OrderContext: Starting to fetch orders...');
      const querySnapshot = await getDocs(collection(db, 'orders'));
      console.log('OrderContext: Query completed, found docs:', querySnapshot.size);
      const orderList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('OrderContext: Mapped orders:', orderList);
      // Sort by createdAt in JavaScript instead
      orderList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(orderList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error('Error details:', error.code, error.message);
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'availability'));
      const availabilityList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Fetched availability:', availabilityList);
      setAvailability(availabilityList);
    } catch (error) {
      console.error('Error fetching availability:', error);
      console.error('Error details:', error.message);
      // Set empty array on error so UI can handle it
      setAvailability([]);
    }
  };

  const createOrder = async (orderData) => {
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      const newOrder = { id: docRef.id, ...orderData, status: 'pending', createdAt: new Date().toISOString() };
      setOrders([newOrder, ...orders]);
      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  const addAvailableDate = async (date) => {
    try {
      const docRef = await addDoc(collection(db, 'availability'), { date });
      const newDate = { id: docRef.id, date };
      setAvailability([...availability, newDate]);
      return newDate;
    } catch (error) {
      console.error('Error adding availability:', error);
      throw error;
    }
  };

  const removeAvailableDate = async (id) => {
    try {
      await deleteDoc(doc(db, 'availability', id));
      setAvailability(availability.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing availability:', error);
      throw error;
    }
  };

  const value = {
    orders,
    availability,
    loading,
    createOrder,
    updateOrderStatus,
    addAvailableDate,
    removeAvailableDate,
    fetchOrders,
    fetchAvailability
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};
