import { useState, useEffect } from 'react';
import './PickupCalendar.css';

function PickupCalendar({ availability, selectedDateTime, onSelectDateTime }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableTimesForDate, setAvailableTimesForDate] = useState([]);

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
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);

    return availability.filter(slot => {
      const slotDate = new Date(slot.date);
      return slot.date.startsWith(dateKey) && slotDate >= oneHourFromNow;
    });
  };

  const isDayAvailable = (date) => {
    return getAvailabilityForDate(date).length > 0;
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (clickedDate < today) {
      return;
    }

    const availableTimes = getAvailabilityForDate(clickedDate);
    if (availableTimes.length === 0) {
      return;
    }

    setSelectedDate(clickedDate);
    setAvailableTimesForDate(availableTimes);
  };

  const handleTimeSelect = (dateTime) => {
    onSelectDateTime(dateTime);
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="pickup-calendar-day empty"></div>);
    }

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
          className={`pickup-calendar-day ${isPast ? 'past' : ''} ${isAvailable ? 'available' : 'unavailable'} ${isSelected ? 'selected' : ''}`}
          onClick={() => !isPast && handleDateClick(day)}
        >
          <span className="pickup-day-number">{day}</span>
          {isAvailable && <span className="pickup-availability-dot"></span>}
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
    setAvailableTimesForDate([]);
  };

  return (
    <div className="pickup-calendar-container">
      <div className="pickup-calendar-section">
        <div className="pickup-calendar-header">
          <button onClick={() => changeMonth(-1)} className="pickup-month-nav-btn">←</button>
          <h3>
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={() => changeMonth(1)} className="pickup-month-nav-btn">→</button>
        </div>

        <div className="pickup-calendar-weekdays">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div className="pickup-calendar-grid">
          {renderCalendar()}
        </div>
      </div>

      <div className="pickup-timeslot-section">
        <h3>
          {selectedDate
            ? `Available Times for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
            : 'Select a date'}
        </h3>

        {selectedDate ? (
          <div className="pickup-timeslot-list">
            {availableTimesForDate.map(slot => {
              const slotDate = new Date(slot.date);
              const timeString = slotDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              });
              const isSelected = selectedDateTime === slot.date;

              return (
                <button
                  key={slot.id}
                  className={`pickup-timeslot-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleTimeSelect(slot.date)}
                >
                  {timeString}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="pickup-no-selection">Click a highlighted date to see available times</p>
        )}
      </div>
    </div>
  );
}

export default PickupCalendar;
