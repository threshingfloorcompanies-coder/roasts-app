import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const CoffeeContext = createContext();

export const useCoffee = () => {
  const context = useContext(CoffeeContext);
  if (!context) {
    throw new Error('useCoffee must be used within a CoffeeProvider');
  }
  return context;
};

export const CoffeeProvider = ({ children }) => {
  const [coffees, setCoffees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoffees();
  }, []);

  const fetchCoffees = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'coffees'));
      const coffeeList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCoffees(coffeeList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching coffees:', error);
      setLoading(false);
    }
  };

  const addCoffee = async (coffee) => {
    try {
      const docRef = await addDoc(collection(db, 'coffees'), coffee);
      const newCoffee = { id: docRef.id, ...coffee };
      setCoffees([...coffees, newCoffee]);
      return newCoffee;
    } catch (error) {
      console.error('Error adding coffee:', error);
    }
  };

  const updateCoffee = async (id, updatedCoffee) => {
    try {
      await updateDoc(doc(db, 'coffees', id), updatedCoffee);
      setCoffees(coffees.map(coffee =>
        coffee.id === id ? { ...coffee, ...updatedCoffee } : coffee
      ));
    } catch (error) {
      console.error('Error updating coffee:', error);
    }
  };

  const deleteCoffee = async (id) => {
    try {
      await deleteDoc(doc(db, 'coffees', id));
      setCoffees(coffees.filter(coffee => coffee.id !== id));
    } catch (error) {
      console.error('Error deleting coffee:', error);
    }
  };

  const value = {
    coffees,
    addCoffee,
    updateCoffee,
    deleteCoffee,
    loading
  };

  return <CoffeeContext.Provider value={value}>{children}</CoffeeContext.Provider>;
};
