import React, { useState, useEffect, FormEvent } from 'react';
import '../tabs.css';

const AppointmentScheduler: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'upcoming'>('schedule');
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [upcomingAppointment, setUpcomingAppointment] = useState<any>(null);
  
  useEffect(() => {
    fetch('http://localhost:5000/api/hospitals')
      .then((response) => response.json())
      .then((data) => setHospitals(data))
      .catch(() => setError('Failed to load hospitals.'));
  }, []);
  
  useEffect(() => {
    if (selectedHospital && selectedDate) {
      fetch(
        `http://localhost:5000/api/appointments/available-times?user_id=1&date=${selectedDate}&hospital_id=${selectedHospital}`
      )
        .then((response) => response.json())
        .then((data) => setAvailableTimes(data))
        .catch(() => setError('Failed to load available times.'));
    }
  }, [selectedHospital, selectedDate]);
  
  useEffect(() => {
    fetch('http://localhost:5000/api/appointments/upcoming?user_id=1')
      .then((response) => response.json())
      .then((data) => setUpcomingAppointment(data))
      .catch(() => setError('Failed to load upcoming appointment.'));
  }, []);
  
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
      const response = await fetch('http://localhost:5000/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1,
          appointment_time: appointmentTime,
          hospital_id: selectedHospital,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        setMessage('Appointment successfully booked!');
        setSelectedHospital(null);
        setSelectedDate('');
        setSelectedTime('');
      } else {
        setError(data.error || 'Failed to book appointment.');
      }
    } catch {
      setError('An error occurred while booking the appointment.');
    }
  };
  
  return (
    <div className="container mt-5">
      <h1>Appointment Scheduler</h1>
  
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
                  {hospitals.map((hospital: any) => (
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
                  {availableTimes.map((time: any, index: number) => (
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
            <h2>Your Upcoming Appointment</h2>
            {upcomingAppointment ? (
              <div>
                <p>
                  <strong>Time:</strong> {upcomingAppointment.appointment_time}
                </p>
                <p>
                  <strong>Hospital:</strong> {upcomingAppointment.hospital_name}
                </p>
                <p>
                  <strong>Address:</strong> {upcomingAppointment.address}
                </p>
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
