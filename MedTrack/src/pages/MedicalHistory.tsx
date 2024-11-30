// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// interface Appointment {
//   appointment_time: string;
//   status: string;
//   appointment_note: string;
//   hospital_name: string;
// }

// interface Condition {
//   condition_name: string;
//   condition_description: string;
//   diagnosed_date: string;
// }

// interface Medication {
//   medication_name: string;
//   dosage: string;
//   start_date: string;
//   end_date: string | null;
// }

// const MedicalHistory: React.FC = () => {
//   const [appointments, setAppointments] = useState<Appointment[]>([]);
//   const [conditions, setConditions] = useState<Condition[]>([]);
//   const [medications, setMedications] = useState<Medication[]>([]);
//   const [loading, setLoading] = useState(true);

//   const userId = "1"; // Replace with dynamically fetched user ID

//   useEffect(() => {
//     const fetchMedicalHistory = async () => {
//       try {
//         setLoading(true);
//         const [appointmentsRes, conditionsRes, medicationsRes] = await Promise.all([
//           axios.get(`/api/medical_history/appointments`, { params: { user_id: userId } }),
//           axios.get(`/api/medical_history/conditions`, { params: { user_id: userId } }),
//           axios.get(`/api/medical_history/medications`, { params: { user_id: userId } }),
//         ]);
//         setAppointments(appointmentsRes.data);
//         setConditions(conditionsRes.data);
//         setMedications(medicationsRes.data);
//       } catch (error) {
//         console.error("Error fetching medical history:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMedicalHistory();
//   }, []);

//   return (
//     <div className="container mt-5">
//       <h1>Medical History</h1>

//       {/* Current Date Section */}
//       <section>
//         <h2>DATE: {new Date().toLocaleDateString()}</h2>
//         <hr />
//       </section>

//       {/* Prior Appointments Section */}
//       <section>
//         <h3>Prior Appointments</h3>
//         <div style={{ border: "2px solid black", padding: "20px", marginBottom: "20px" }}>
//           {loading ? (
//             <p>Loading...</p>
//           ) : appointments.length > 0 ? (
//             <ul>
//               {appointments.map((appt, index) => (
//                 <li key={index}>
//                   <p><strong>Time:</strong> {new Date(appt.appointment_time).toLocaleString()}</p>
//                   <p><strong>Status:</strong> {appt.status}</p>
//                   <p><strong>Note:</strong> {appt.appointment_note}</p>
//                   <p><strong>Hospital:</strong> {appt.hospital_name}</p>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p>No prior appointments.</p>
//           )}
//         </div>
//         <hr />
//       </section>

//       {/* Prior Conditions Section */}
//       <section>
//         <h3>Prior Conditions</h3>
//         <div style={{ border: "2px solid black", padding: "20px", marginBottom: "20px" }}>
//           {loading ? (
//             <p>Loading...</p>
//           ) : conditions.length > 0 ? (
//             <ul>
//               {conditions.map((cond, index) => (
//                 <li key={index}>
//                   <p><strong>Name:</strong> {cond.condition_name}</p>
//                   <p><strong>Description:</strong> {cond.condition_description}</p>
//                   <p><strong>Diagnosed Date:</strong> {new Date(cond.diagnosed_date).toLocaleDateString()}</p>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p>No prior conditions.</p>
//           )}
//         </div>
//         <hr />
//       </section>

//       {/* Medications Section */}
//       <section>
//         <h3>Medications</h3>
//         <div style={{ border: "2px solid black", padding: "20px", marginBottom: "20px" }}>
//           {loading ? (
//             <p>Loading...</p>
//           ) : medications.length > 0 ? (
//             <ul>
//               {medications.map((med, index) => (
//                 <li key={index}>
//                   <p><strong>Name:</strong> {med.medication_name}</p>
//                   <p><strong>Dosage:</strong> {med.dosage}</p>
//                   <p><strong>Start Date:</strong> {new Date(med.start_date).toLocaleDateString()}</p>
//                   <p>
//                     <strong>End Date:</strong> {med.end_date ? new Date(med.end_date).toLocaleDateString() : "Ongoing"}
//                   </p>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p>No medications listed.</p>
//           )}
//         </div>
//         <hr />
//       </section>
//     </div>
//   );
// };

// export default MedicalHistory;


import React, { useState } from 'react';
import '../tabs.css';

const MedicalHistory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'medical' | 'lab'>('medical');

  return (
    <div className="container mt-5">
      <h1>Patient Information</h1>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'medical' ? 'active' : ''}`}
          onClick={() => setActiveTab('medical')}
        >
          Medical History
        </button>
        <button
          className={`tab ${activeTab === 'lab' ? 'active' : ''}`}
          onClick={() => setActiveTab('lab')}
        >
          Lab Results
        </button>
      </div>

      {/* Content Area */}
      <div className="tab-content">
        {activeTab === 'medical' && (
          <div>
            {/* Medical History Page Content */}
            <section>
              <h2>DATE: {new Date().toLocaleDateString()}</h2>
              <hr />
            </section>

            <section>
              <h3>Prior Appointments</h3>
              <div style={{ border: "2px solid black", padding: "20px", marginBottom: "20px" }}>
                <p>Loading...</p>
              </div>
              <hr />
            </section>

            <section>
              <h3>Prior Conditions</h3>
              <div style={{ border: "2px solid black", padding: "20px", marginBottom: "20px" }}>
                <p>Loading...</p>
              </div>
              <hr />
            </section>

            <section>
              <h3>Medications</h3>
              <div style={{ border: "2px solid black", padding: "20px", marginBottom: "20px" }}>
                <p>Loading...</p>
              </div>
              <hr />
            </section>
          </div>
        )}

        {activeTab === 'lab' && (
          <div>
            {/* Lab Results Placeholder */}
            <h2>Lab Results</h2>
            <p>Lab results will go here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalHistory;
