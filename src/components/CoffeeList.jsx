import CoffeeCard from './CoffeeCard';
import { useCoffee } from '../context/CoffeeContext';
import './CoffeeList.css';

function CoffeeList() {
  const { coffees } = useCoffee();

  return (
    <div className="coffee-list-container">
      <div className="coffee-list-header">
        <h1>Our Coffee Selection</h1>
        <p>Discover your perfect cup</p>
      </div>
      <div className="coffee-grid">
        {coffees.map(coffee => (
          <CoffeeCard key={coffee.id} coffee={coffee} />
        ))}
      </div>
    </div>
  );
}

export default CoffeeList;
