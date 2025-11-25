import { createContext, useContext, useState } from 'react';

const CoffeeContext = createContext();

export const useCoffee = () => {
  const context = useContext(CoffeeContext);
  if (!context) {
    throw new Error('useCoffee must be used within a CoffeeProvider');
  }
  return context;
};

const INITIAL_COFFEES = [
  {
    id: 1,
    name: 'Espresso',
    description: 'Rich and bold, our classic espresso shot',
    price: 3.50,
    image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    name: 'Cappuccino',
    description: 'Smooth espresso with steamed milk and foam',
    price: 4.50,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    name: 'Latte',
    description: 'Creamy espresso with steamed milk',
    price: 4.75,
    image: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400&h=300&fit=crop'
  },
  {
    id: 4,
    name: 'Americano',
    description: 'Espresso diluted with hot water',
    price: 3.75,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop'
  },
  {
    id: 5,
    name: 'Mocha',
    description: 'Rich chocolate with espresso and steamed milk',
    price: 5.25,
    image: 'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=400&h=300&fit=crop'
  },
  {
    id: 6,
    name: 'Cold Brew',
    description: 'Smooth, cold-steeped coffee served over ice',
    price: 4.25,
    image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop'
  },
  {
    id: 7,
    name: 'Macchiato',
    description: 'Espresso marked with a dollop of foam',
    price: 3.75,
    image: 'https://images.unsplash.com/photo-1557006021-b85faa2bc5e2?w=400&h=300&fit=crop'
  },
  {
    id: 8,
    name: 'Flat White',
    description: 'Velvety microfoam over a double shot of espresso',
    price: 4.50,
    image: 'https://images.unsplash.com/photo-1542181961-9590d0c79dab?w=400&h=300&fit=crop'
  }
];

export const CoffeeProvider = ({ children }) => {
  const [coffees, setCoffees] = useState(INITIAL_COFFEES);

  const addCoffee = (coffee) => {
    const newCoffee = {
      ...coffee,
      id: Math.max(...coffees.map(c => c.id), 0) + 1
    };
    setCoffees([...coffees, newCoffee]);
    return newCoffee;
  };

  const updateCoffee = (id, updatedCoffee) => {
    setCoffees(coffees.map(coffee =>
      coffee.id === id ? { ...coffee, ...updatedCoffee } : coffee
    ));
  };

  const deleteCoffee = (id) => {
    setCoffees(coffees.filter(coffee => coffee.id !== id));
  };

  const value = {
    coffees,
    addCoffee,
    updateCoffee,
    deleteCoffee
  };

  return <CoffeeContext.Provider value={value}>{children}</CoffeeContext.Provider>;
};
