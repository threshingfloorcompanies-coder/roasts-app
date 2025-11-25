import { useState, useEffect } from 'react';
import { useOrder } from '../context/OrderContext';
import './AdminCalendar.css';

function AdminCalendar() {
  const { availability, addAvailableDate, removeAvailableDate, fetchAvailability } = useOrder();
  const [selectedDateTime, setSelectedDateTime] = useState('');

  useEffect(() => {
    fetchAvailability();
  }, []);

  const handleAddDate = async () => {
    if (!selectedDateTime) {
      alert('Please select a date and time');
      return;
    }

    const dateExists = availability.some(item => item.date === selectedDateTime);
    if (dateExists) {
      alert('This date and time is already available');
      return;
    }

    try {
      await addAvailableDate(selectedDateTime);
      setSelectedDateTime('');
      alert('Pickup time added successfully!');
    } catch (error) {
      alert('Failed to add pickup time');
    }
  };

  const handleRemoveDate = async (id) => {
    if (window.confirm('Remove this pickup date?')) {
      try {
        await removeAvailableDate(id);
      } catch (error) {
        alert('Failed to remove date');
      }
    }
  };

  const getMinDateTime = () => {
    const today = new Date();
    // Set to next hour
    today.setHours(today.getHours() + 1);
    today.setMinutes(0);
    return today.toISOString().slice(0, 16);
  };

  const sortedAvailability = [...availability].sort((a, b) =>
    new Date(a.date) - new Date(b.date)
  );

  return (
    <div className="admin-calendar-container">
      <h1>Pickup Calendar Management</h1>
      <p className="calendar-description">
        Manage available dates and times for customer pickups. Customers can only select times you add here.
      </p>

      <div className="calendar-content">
        <div className="add-date-section">
          <h2>Add Pickup Date & Time</h2>
          <div className="date-input-group">
            <input
              type="datetime-local"
              value={selectedDateTime}
              min={getMinDateTime()}
              onChange={(e) => setSelectedDateTime(e.target.value)}
              className="calendar-date-input"
            />
            <button onClick={handleAddDate} className="add-date-btn">
              Add Time Slot
            </button>
          </div>
        </div>

        <div className="available-dates-section">
          <h2>Available Pickup Times</h2>
          {sortedAvailability.length === 0 ? (
            <div className="no-dates">
              <p>No pickup times available. Add dates and times above to allow customers to schedule pickups.</p>
            </div>
          ) : (
            <div className="dates-grid">
              {sortedAvailability.map(item => (
                <div key={item.id} className="date-card">
                  <div className="date-info">
                    <span className="date-day">
                      {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="date-full">
                      {new Date(item.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="date-time">
                      {new Date(item.date).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveDate(item.id)}
                    className="remove-date-btn"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminCalendar;
