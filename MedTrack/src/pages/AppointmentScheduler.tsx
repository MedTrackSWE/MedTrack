import React, { useState, useEffect, FormEvent } from 'react';
import '../tabs.css';

interface Hospital {
  hospital_id: number;
  name: string;
}

interface TimeSlot {
  timeslot_time: string;
}

interface Appointment {
  appointment_id: number;
  appointment_time: string;
  hospital_name: string;
  address: string;
}

const AppointmentScheduler: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<'schedule' | 'upcoming'>('schedule');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);

  const userID = localStorage.getItem('userID');

  // Navigation handler
  const handleBackToDashboard = () => {
    window.location.href = '/dashboard';
  };

  // Fetch hospitals on component mount
  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/appointments/hospitals')
      .then((response) => response.json())
      .then((data) => setHospitals(data))
      .catch(() => setError('Failed to load hospitals.'));
  }, []);

  // Fetch available times when hospital or date changes
  useEffect(() => {
    if (selectedHospital && selectedDate) {
      fetch(
        `http://127.0.0.1:5000/api/appointments/available-times?user_id=${userID}&date=${selectedDate}&hospital_id=${selectedHospital}`
      )
        .then((response) => response.json())
        .then((data) => setAvailableTimes(data))
        .catch(() => setError('Failed to load available times.'));
    }
  }, [selectedHospital, selectedDate]);

  // Fetch upcoming appointments
  useEffect(() => {
    fetchUpcomingAppointments();
  }, []);

  // Form handling
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!selectedHospital || !selectedDate || !selectedTime) {
      setError('Please fill in all required fields.');
      return;
    }

    const appointmentTime = `${selectedDate} ${selectedTime}`;
    try {
      const response = await fetch('http://127.0.0.1:5000/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userID,
          appointment_time: appointmentTime,
          hospital_id: selectedHospital,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Appointment successfully booked!');
        resetForm();
        fetchUpcomingAppointments();
      } else {
        setError(data.error || 'Failed to book appointment.');
      }
    } catch {
      setError('An error occurred while booking the appointment.');
    }
  };

  const handleReschedule = async (appointmentId: number) => {
    const newTime = prompt('Enter the new appointment time (YYYY-MM-DD HH:MM:SS):');
    if (!newTime) return;

    try {
      const response = await fetch('http://127.0.0.1:5000/api/appointments/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: appointmentId, new_time: newTime }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Appointment successfully rescheduled!');
        fetchUpcomingAppointments();
      } else {
        setError(data.error || 'Failed to reschedule appointment.');
      }
    } catch {
      setError('An error occurred while rescheduling the appointment.');
    }
  };

  const handleCancel = async (appointmentId: number) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const response = await fetch('http://127.0.0.1:5000/api/appointments/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: appointmentId }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Appointment successfully canceled!');
        // Remove the canceled appointment from the list
        setUpcomingAppointments(prevAppointments => 
          prevAppointments.filter(apt => apt.appointment_id !== appointmentId)
        );
      } else {
        setError(data.error || 'Failed to cancel appointment.');
      }
    } catch {
      setError('An error occurred while canceling the appointment.');
    }
  };

  // Helper functions
  const resetForm = () => {
    setSelectedHospital(null);
    setSelectedDate('');
    setSelectedTime('');
  };

  const fetchUpcomingAppointments = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/appointments/upcoming?user_id=${userID}`);
      const data = await response.json();
      setUpcomingAppointments(Array.isArray(data) ? data : [data].filter(Boolean));
    } catch {
      setError('Failed to load upcoming appointments.');
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Appointment Scheduler</h1>
        <button 
          className="btn btn-secondary" 
          onClick={handleBackToDashboard}
        >
          Back to Dashboard
        </button>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          Schedule Appointment
        </button>
        <button
          className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming Appointments
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'schedule' && (
          <div>
            <h2>Schedule a New Appointment</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Choose a Hospital</label>
                <select
                  className="form-select"
                  value={selectedHospital || ''}
                  onChange={(e) => setSelectedHospital(Number(e.target.value))}
                >
                  <option value="">Select a hospital</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital.hospital_id} value={hospital.hospital_id}>
                      {hospital.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select a Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Select a Time</label>
                <select
                  className="form-select"
                  value={selectedTime || ''}
                  onChange={(e) => setSelectedTime(e.target.value)}
                >
                  <option value="">Select a time</option>
                  {availableTimes.map((time, index) => (
                    <option key={index} value={time.timeslot_time}>
                      {time.timeslot_time}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-danger">{error}</p>}
              {message && <p className="text-success">{message}</p>}

              <button type="submit" className="btn btn-primary">
                Book Appointment
              </button>
            </form>
          </div>
        )}

        {activeTab === 'upcoming' && (
          <div>
            <h2>Your Upcoming Appointments</h2>
            {upcomingAppointments.length > 0 ? (
              <div className="appointments-list">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.appointment_id} className="card mb-3">
                    <div className="card-body">
                      <h5 className="card-title">{appointment.hospital_name}</h5>
                      <p className="card-text">
                        <strong>Time:</strong> {appointment.appointment_time}
                      </p>
                      <p className="card-text">
                        <strong>Address:</strong> {appointment.address}
                      </p>
                      <div className="btn-group">
                        <button
                          className="btn btn-warning me-2"
                          onClick={() => handleReschedule(appointment.appointment_id)}
                        >
                          Reschedule
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleCancel(appointment.appointment_id)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No upcoming appointments found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentScheduler;