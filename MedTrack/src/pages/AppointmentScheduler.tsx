import React, { useState, useEffect, FormEvent } from 'react';
import '../tabs.css';

const AppointmentScheduler: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'upcoming'>('schedule');
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<any[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [rescheduleDetails, setRescheduleDetails] = useState<{ id: number; hospital_id: number; date: string; time: string } | null>(null);
  const [rescheduleTimes, setRescheduleTimes] = useState<{ [key: number]: any[] }>({}); // Times for each appointment

  const userID = localStorage.getItem('userID');

  const handleBackToDashboard = () => {
    window.location.href = '/dashboard';
  };

  const fetchUpcomingAppointments = () => {
    fetch(`http://127.0.0.1:5000/api/appointments/upcoming?user_id=${userID}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setUpcomingAppointments(data);
      })
      .catch(() => setError('Failed to load upcoming appointments.'));
  };

  const clearMessageAfterTimeout = () => {
    setTimeout(() => {
        setError('');
        setMessage('');
    }, 3000);
};

  const fetchAvailableTimes = (hospital_id: number, date: string, appointment_id?: number) => {
    fetch(
      `http://127.0.0.1:5000/api/appointments/available-times?user_id=${userID}&date=${date}&hospital_id=${hospital_id}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (appointment_id) {
          setRescheduleTimes((prev) => ({
            ...prev,
            [appointment_id]: data,
          }));
        } else {
          setAvailableTimes(data);
        }
      })
      .catch(() => setError('Failed to load available times.'));
  };

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/appointments/hospitals')
      .then((response) => response.json())
      .then((data) => setHospitals(data))
      .catch(() => setError('Failed to load hospitals.'));
  }, []);

  useEffect(() => {
    if (error) {
        clearMessageAfterTimeout();
    }
  }, [error]);
  
  useEffect(() => {
    if (selectedHospital && selectedDate) {
      fetchAvailableTimes(selectedHospital, selectedDate);
    }
  }, [selectedHospital, selectedDate]);

  useEffect(() => {
    fetchUpcomingAppointments();
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
        setSelectedHospital(null);
        setSelectedDate('');
        setSelectedTime('');
        fetchUpcomingAppointments();
        clearMessageAfterTimeout();
      } else {
        setError(data.error || 'Failed to book appointment.');
        clearMessageAfterTimeout();
      }
    } catch {
      setError('An error occurred while booking the appointment.');
      clearMessageAfterTimeout();
    }
  };

  const handleReschedule = async (appointmentID: number) => {
    if (!rescheduleDetails || rescheduleDetails.id !== appointmentID || !rescheduleDetails.date || !rescheduleDetails.time) {
      setError('Please select a valid reschedule date and time.');
      clearMessageAfterTimeout();
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/api/appointments/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment_id: appointmentID,
          new_time: `${rescheduleDetails.date} ${rescheduleDetails.time}`,
        }),
      });

      if (response.ok) {
        setMessage('Appointment successfully rescheduled!');
        window.location.reload(); // Refresh the page after rescheduling
        clearMessageAfterTimeout();
      } else {
        setError('Failed to reschedule the appointment.');
        clearMessageAfterTimeout();
      }
    } catch {
      setError('An error occurred while rescheduling the appointment.');
      clearMessageAfterTimeout();
    }
  };

  const handleCancel = async (appointmentID: number) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const response = await fetch('http://127.0.0.1:5000/api/appointments/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: appointmentID }),
      });

      if (response.ok) {
        setMessage('Appointment successfully canceled.');
        fetchUpcomingAppointments();
        clearMessageAfterTimeout();
      } else {
        setError('Failed to cancel the appointment.');
        clearMessageAfterTimeout();
      }
    } catch {
      setError('An error occurred while canceling the appointment.');
      clearMessageAfterTimeout();
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'GMT', // Force GMT
      timeZoneName: 'short',
    };
    return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Appointment Scheduler</h1>
        <button className="btn btn-secondary" onClick={handleBackToDashboard}>
          Back to Dashboard
        </button>
      </div>
      {(message || error) && (
        <div className={`alert ${message ? 'alert-success' : 'alert-danger'}`}>
          {message || error}
        </div>
      )}

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
              upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.appointment_id}
                  style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}
                >
                  <p>
                    <strong>Time:</strong> {formatDate(appointment.appointment_time)}
                  </p>
                  <p>
                    <strong>Hospital:</strong> {appointment.hospital_name}
                  </p>
                  <p>
                    <strong>Address:</strong> {appointment.address || 'No address available'}
                  </p>
                  <div className="form-group">
                    <label>Reschedule Date</label>
                    <input
                      type="date"
                      className="form-control"
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setRescheduleDetails((prev) => ({
                          ...prev,
                          id: appointment.appointment_id,
                          hospital_id: appointment.hospital_id,
                          date: newDate,
                          time: '',
                        }));
                        fetchAvailableTimes(appointment.hospital_id, newDate, appointment.appointment_id);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Reschedule Time</label>
                    <select
                      className="form-select"
                      value={rescheduleDetails?.time || ''}
                      onChange={(e) =>
                        setRescheduleDetails((prev) => ({
                          ...prev,
                          time: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select a new time</option>
                      {(rescheduleTimes[appointment.appointment_id] || []).map((time, index) => (
                        <option key={index} value={time.timeslot_time}>
                          {time.timeslot_time}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    className="btn btn-secondary"
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
              ))
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