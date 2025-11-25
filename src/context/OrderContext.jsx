import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';

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

  useEffect(() => {
    fetchOrders();
    fetchAvailability();
  }, []);

  const fetchOrders = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const orderList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort by createdAt in JavaScript instead
      orderList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(orderList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
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
      setAvailability(availabilityList);
    } catch (error) {
      console.error('Error fetching availability:', error);
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
