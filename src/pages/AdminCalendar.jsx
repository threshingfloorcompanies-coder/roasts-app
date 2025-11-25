import { useState, useEffect } from 'react';
import { useOrder } from '../context/OrderContext';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import './AdminCalendar.css';

function AdminCalendar() {
  const { availability, addAvailableDate, removeAvailableDate, fetchAvailability } = useOrder();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, onCancel: null, type: 'alert' });
  const [toast, setToast] = useState({ show: false, message: '' });
  const [copyFromDate, setCopyFromDate] = useState(null);

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  useEffect(() => {
    fetchAvailability();
  }, []);

  const showAlert = (title, message) => {
    setModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => setModal({ ...modal, isOpen: false }),
      onCancel: null,
      type: 'alert'
    });
  };

  const showConfirm = (title, message, onConfirm) => {
    setModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        setModal({ ...modal, isOpen: false });
        onConfirm();
      },
      onCancel: () => setModal({ ...modal, isOpen: false }),
      type: 'confirm'
    });
  };

  const showToast = (message) => {
    setToast({ show: true, message });
  };

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
      showAlert('No Date Selected', 'Please select a date first');
      return;
    }

    if (selectedTimeSlots.length === 0) {
      showAlert('No Time Slots', 'Please select at least one time slot');
      return;
    }

    try {
      // Remove all existing slots for this date
      const existingSlots = getAvailabilityForDate(selectedDate);
      for (const slot of existingSlots) {
        await removeAvailableDate(slot.id);
      }

      // Add new slots (only unique ones)
      const uniqueTimeSlots = [...new Set(selectedTimeSlots)];

      for (const time of uniqueTimeSlots) {
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

      showToast('Time slots saved successfully!');
      await fetchAvailability();
      setSelectedDate(null);
      setSelectedTimeSlots([]);
      setCopyFromDate(null);
    } catch (error) {
      showAlert('Error', 'Failed to save time slots');
      console.error(error);
    }
  };

  const handleClearDate = async () => {
    if (!selectedDate) return;

    showConfirm(
      'Clear Time Slots',
      'Remove all time slots for this date?',
      async () => {
        try {
          const existingSlots = getAvailabilityForDate(selectedDate);
          for (const slot of existingSlots) {
            await removeAvailableDate(slot.id);
          }
          setSelectedTimeSlots([]);
          showToast('Date cleared successfully!');
          await fetchAvailability();
        } catch (error) {
          showAlert('Error', 'Failed to clear date');
        }
      }
    );
  };

  const handleCopyFromDate = () => {
    if (!copyFromDate || !selectedDate) return;

    const slotsFromCopyDate = getAvailabilityForDate(copyFromDate);
    const existingTimes = slotsFromCopyDate.map(slot => {
      const date = new Date(slot.date);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    });

    setSelectedTimeSlots(existingTimes);
    showToast(`Copied ${existingTimes.length} time slots from ${copyFromDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);
  };

  const getDatesWithSlots = () => {
    const dates = new Set();
    availability.forEach(slot => {
      const date = new Date(slot.date);
      date.setHours(0, 0, 0, 0);
      dates.add(date.toISOString());
    });
    return Array.from(dates).map(dateStr => new Date(dateStr)).sort((a, b) => b - a);
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
              {getDatesWithSlots().length > 0 && (
                <div className="copy-section">
                  <label htmlFor="copyFrom">Copy from previous date:</label>
                  <div className="copy-controls">
                    <select
                      id="copyFrom"
                      value={copyFromDate ? copyFromDate.toISOString() : ''}
                      onChange={(e) => setCopyFromDate(e.target.value ? new Date(e.target.value) : null)}
                      className="copy-select"
                    >
                      <option value="">Select a date...</option>
                      {getDatesWithSlots()
                        .filter(date => date.toDateString() !== selectedDate.toDateString())
                        .map(date => {
                          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                          const slots = getAvailabilityForDate(date);
                          return (
                            <option key={date.toISOString()} value={date.toISOString()}>
                              {dateStr} ({slots.length} slots)
                            </option>
                          );
                        })}
                    </select>
                    <button
                      onClick={handleCopyFromDate}
                      disabled={!copyFromDate}
                      className="copy-btn"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

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

      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel}
        type={modal.type}
      />

      {toast.show && (
        <Toast message={toast.message} onClose={() => setToast({ show: false, message: '' })} />
      )}
    </div>
  );
}

export default AdminCalendar;
