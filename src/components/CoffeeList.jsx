import CoffeeCard from './CoffeeCard';
import { useCoffee } from '../context/CoffeeContext';
import './CoffeeList.css';

function CoffeeList() {
  const { coffees } = useCoffee();

  return (
    <div className="coffee-list-container">
      <div className="coffee-list-header">
        <h1>Our Premium Roasts</h1>
        <p>Freshly roasted beans delivered to your door</p>
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
