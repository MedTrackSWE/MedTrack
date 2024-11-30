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
  const [upcomingAppointment, setUpcomingAppointment] = useState<Appointment | null>(null);

  // API endpoints
  const API_BASE_URL = 'http://127.0.0.1:5000/api';
  const USER_ID = 1;

  // Fetch hospitals on component mount
  useEffect(() => {
    fetchHospitals();
    fetchUpcomingAppointment();
  }, []);

  // Fetch available times when hospital or date changes
  useEffect(() => {
    if (selectedHospital && selectedDate) {
      fetchAvailableTimes();
    }
  }, [selectedHospital, selectedDate]);

  // API calls
  const fetchHospitals = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/hospitals`);
      const data = await response.json();
      setHospitals(data);
    } catch {
      //setError('Failed to load hospitals.');
    }
  };

  const fetchAvailableTimes = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/appointments/available-times?user_id=${USER_ID}&date=${selectedDate}&hospital_id=${selectedHospital}`
      );
      const data = await response.json();
      setAvailableTimes(data);
    } catch {
      //setError('Failed to load available times.');
    }
  };

  const fetchUpcomingAppointment = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/upcoming?user_id=${USER_ID}`);
      const data = await response.json();
      setUpcomingAppointment(data);
    } catch {
      //setError('Failed to load upcoming appointment.');
    }
  };

  // Form handling
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!selectedHospital || !selectedDate || !selectedTime) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/appointments/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: USER_ID,
          appointment_time: `${selectedDate} ${selectedTime}`,
          hospital_id: selectedHospital,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Appointment successfully booked!');
        resetForm();
        fetchUpcomingAppointment();
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
      const response = await fetch(`${API_BASE_URL}/appointments/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: appointmentId, new_time: newTime }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Appointment successfully rescheduled!');
        fetchUpcomingAppointment();
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
      const response = await fetch(`${API_BASE_URL}/appointments/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: appointmentId }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Appointment successfully canceled!');
        setUpcomingAppointment(null);
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

  // Navigation
  const handleBackToDashboard = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Appointment Scheduler</h1>
        <button className="btn btn-secondary" onClick={handleBackToDashboard}>
          Back to Dashboard
        </button>
      </div>

      <div className="tabs mb-4">
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

      {error && <div className="alert alert-danger mb-4">{error}</div>}
      {message && <div className="alert alert-success mb-4">{message}</div>}

      <div className="tab-content">
        {activeTab === 'schedule' ? (
          <div className="card">
            <div className="card-body">
              <h2 className="card-title mb-4">Schedule a New Appointment</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Choose a Hospital</label>
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

                <div className="mb-3">
                  <label className="form-label">Select a Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">Select a Time</label>
                  <select
                    className="form-select"
                    value={selectedTime}
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

                <button type="submit" className="btn btn-primary">
                  Book Appointment
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-body">
              <h2 className="card-title mb-4">Your Upcoming Appointment</h2>
              {upcomingAppointment ? (
                <div>
                  <div className="mb-4">
                    <p className="mb-2">
                      <strong>Time:</strong> {upcomingAppointment.appointment_time}
                    </p>
                    <p className="mb-2">
                      <strong>Hospital:</strong> {upcomingAppointment.hospital_name}
                    </p>
                    <p className="mb-2">
                      <strong>Address:</strong> {upcomingAppointment.address}
                    </p>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-warning"
                      onClick={() => handleReschedule(upcomingAppointment.appointment_id)}
                    >
                      Reschedule Appointment
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleCancel(upcomingAppointment.appointment_id)}
                    >
                      Cancel Appointment
                    </button>
                  </div>
                </div>
              ) : (
                <p>No upcoming appointments found.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentScheduler;