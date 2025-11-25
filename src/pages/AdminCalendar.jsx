import { useState, useEffect } from 'react';
import { useOrder } from '../context/OrderContext';
import './AdminCalendar.css';

function AdminCalendar() {
  const { availability, addAvailableDate, removeAvailableDate, fetchAvailability } = useOrder();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  useEffect(() => {
    fetchAvailability();
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getAvailabilityForDate = (date) => {
    const dateKey = formatDateKey(date);
    return availability.filter(slot => slot.date.startsWith(dateKey));
  };

  const isDayAvailable = (date) => {
    return getAvailabilityForDate(date).length > 0;
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (clickedDate < today) {
      return; // Can't select past dates
    }

    setSelectedDate(clickedDate);

    // Load existing time slots for this date
    const existingSlots = getAvailabilityForDate(clickedDate);
    const existingTimes = existingSlots.map(slot => {
      const date = new Date(slot.date);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    });
    setSelectedTimeSlots(existingTimes);
  };

  const toggleTimeSlot = (time) => {
    setSelectedTimeSlots(prev => {
      if (prev.includes(time)) {
        return prev.filter(t => t !== time);
      } else {
        return [...prev, time];
      }
    });
  };

  const handleSaveTimeSlots = async () => {
    if (!selectedDate) {
      alert('Please select a date first');
      return;
    }

    try {
      // Remove all existing slots for this date
      const existingSlots = getAvailabilityForDate(selectedDate);
      for (const slot of existingSlots) {
        await removeAvailableDate(slot.id);
      }

      // Add new slots
      for (const time of selectedTimeSlots) {
        const [timePart, meridiem] = time.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);

        if (meridiem === 'PM' && hours !== 12) {
          hours += 12;
        } else if (meridiem === 'AM' && hours === 12) {
          hours = 0;
        }

        const dateTime = new Date(selectedDate);
        dateTime.setHours(hours, minutes || 0, 0, 0);

        await addAvailableDate(dateTime.toISOString());
      }

      alert('Time slots saved successfully!');
      fetchAvailability();
      setSelectedDate(null);
      setSelectedTimeSlots([]);
    } catch (error) {
      alert('Failed to save time slots');
      console.error(error);
    }
  };

  const handleClearDate = async () => {
    if (!selectedDate) return;

    if (window.confirm('Remove all time slots for this date?')) {
      try {
        const existingSlots = getAvailabilityForDate(selectedDate);
        for (const slot of existingSlots) {
          await removeAvailableDate(slot.id);
        }
        setSelectedTimeSlots([]);
        alert('Date cleared successfully!');
        fetchAvailability();
      } catch (error) {
        alert('Failed to clear date');
      }
    }
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isPast = date < today;
      const isAvailable = isDayAvailable(date);
      const isSelected = selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year;

      days.push(
        <div
          key={day}
          className={`calendar-day ${isPast ? 'past' : ''} ${isAvailable ? 'available' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => !isPast && handleDateClick(day)}
        >
          <span className="day-number">{day}</span>
          {isAvailable && <span className="availability-dot"></span>}
        </div>
      );
    }

    return days;
  };

  const changeMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
    setSelectedDate(null);
    setSelectedTimeSlots([]);
  };

  return (
    <div className="admin-calendar-container">
      <h1>Pickup Calendar Management</h1>
      <p className="calendar-description">
        Select available days and times for customer pickups
      </p>

      <div className="calendar-wrapper">
        <div className="calendar-section">
          <div className="calendar-header">
            <button onClick={() => changeMonth(-1)} className="month-nav-btn">←</button>
            <h2>
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={() => changeMonth(1)} className="month-nav-btn">→</button>
          </div>

          <div className="calendar-weekdays">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="calendar-grid">
            {renderCalendar()}
          </div>

          <div className="calendar-legend">
            <div className="legend-item">
              <span className="legend-dot available"></span>
              <span>Has time slots</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot selected"></span>
              <span>Selected</span>
            </div>
          </div>
        </div>

        <div className="timeslot-section">
          <h2>
            {selectedDate
              ? `Time Slots for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
              : 'Select a date'}
          </h2>

          {selectedDate ? (
            <>
              <div className="timeslot-grid">
                {timeSlots.map(time => (
                  <button
                    key={time}
                    className={`timeslot-btn ${selectedTimeSlots.includes(time) ? 'selected' : ''}`}
                    onClick={() => toggleTimeSlot(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>

              <div className="timeslot-actions">
                <button onClick={handleClearDate} className="clear-btn">
                  Clear All
                </button>
                <button onClick={handleSaveTimeSlots} className="save-btn">
                  Save Time Slots
                </button>
              </div>
            </>
          ) : (
            <p className="no-selection">Click a date on the calendar to set time slots</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminCalendar;
