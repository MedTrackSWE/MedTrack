
// import React, { useState, useEffect } from 'react';
// import '../tabs.css';

// const MedicalHistory: React.FC = () => {
//   const [activeTab, setActiveTab] = useState<'medical' | 'lab'>('medical');
//   const [conditions, setConditions] = useState<any[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string>('');


//   useEffect(() => {
//     const userId = localStorage.getItem('userID');
//     if (!userId) { //added this rn
//       setError('User not logged in'); //added this rn
//       setLoading(false); //added this rn
//       return;
//     }
//     // Fetching conditions data
//     const fetchConditions = async () => {
//       try {
//         const response = await fetch(`http://127.0.0.1:5000/api/medical_history/conditions?user_id=${userId}`);
//         const data = await response.json();

//         if (response.ok) {
//           setConditions(data);
//         } else {
//           setError(data.error || 'Failed to load conditions.');
//         }
//       } catch (error) {
//         setError('An error occurred while fetching data.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchConditions();
//   }, []);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   return (
//     <div className="container mt-5">
//       <h1>Patient Information</h1>

//       {/* Tabs */}
//       <div className="tabs">
//         <button
//           className={`tab ${activeTab === 'medical' ? 'active' : ''}`}
//           onClick={() => setActiveTab('medical')}
//         >
//           Medical History
//         </button>
//         <button
//           className={`tab ${activeTab === 'lab' ? 'active' : ''}`}
//           onClick={() => setActiveTab('lab')}
//         >
//           Lab Results
//         </button>
//       </div>

//       {/* Content Area */}
//       <div className="tab-content">
//         {activeTab === 'medical' && (
//           <div>
//             {/* Medical History Page Content */}
//             <section>
//               <h2>DATE: {new Date().toLocaleDateString()}</h2>
//               <hr />
//             </section>

//             <section>
//               <h3>Prior Conditions</h3>
//               <div style={{ border: "2px solid black", padding: "20px", marginBottom: "20px" }}>
//                 {conditions.length === 0 ? (
//                   <p>No conditions found.</p>
//                 ) : (
//                   conditions.map((condition, index) => (
//                     <div key={index}>
//                       <p><strong>Condition:</strong> {condition.condition_name}</p>
//                       <p><strong>Diagnosed Date:</strong> {condition.diagnosed_date}</p>
//                       <p><strong>Description:</strong> {condition.condition_description}</p>
//                     </div>
//                   ))
//                 )}
//               </div>
//               <hr />
//             </section>

//             {/* Other sections (appointments, medications) are omitted for now */}
//           </div>
//         )}

//         {activeTab === 'lab' && (
//           <div>
//             <h2>Lab Results</h2>
//             <p>Lab results will go here.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MedicalHistory;


import React, { useState, useEffect } from 'react';
import '../tabs.css';

const MedicalHistory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'medical' | 'lab'>('medical');
  const [conditions, setConditions] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [labResults, setLabResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const userId = localStorage.getItem('userID');
    if (!userId) {
      setError('User not logged in');
      setLoading(false);
      return;
    }

    // Fetching conditions and medications data
    const fetchConditions = async () => {
      try {
        const conditionsResponse = await fetch(
          `http://127.0.0.1:5000/api/medical_history/conditions?user_id=${userId}`
        );
        const medicationsResponse = await fetch(
          `http://127.0.0.1:5000/api/medical_history/medications?user_id=${userId}`
        );
        const labResultsResponse = await fetch(
          `http://127.0.0.1:5000/api/medical_history?user_id=${userId}`
        );
        const conditionsData = await conditionsResponse.json();
        const medicationsData = await medicationsResponse.json();
        const labResultsData = await labResultsResponse.json();

        if (conditionsResponse.ok) {
          setConditions(conditionsData);
        } else {
          setError(conditionsData.error || 'Failed to load conditions.');
        }

        if (medicationsResponse.ok) {
          setMedications(medicationsData);
        } else {
          setError(medicationsData.error || 'Failed to load medications.');
        }

        if (labResultsResponse.ok) {
          setLabResults(labResultsData);
        } else {
          setError(labResultsData.error || 'Failed to load medications.');
        }

      } catch (error) {
        setError('An error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchConditions();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

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
              <h3>Prior Conditions</h3>
              <div style={{ border: "2px solid black", padding: "20px", marginBottom: "20px" }}>
                {conditions.length === 0 ? (
                  <p>No conditions found.</p>
                ) : (
                  conditions.map((condition, index) => (
                    <div key={index}>
                      <p><strong>Condition:</strong> {condition.condition_name}</p>
                      <p><strong>Diagnosed Date:</strong> {condition.diagnosed_date}</p>
                      <p><strong>Description:</strong> {condition.condition_description}</p>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section>
              <h3>Medications</h3>
              <div style={{ border: "2px solid black", padding: "20px", marginBottom: "20px" }}>
                {medications.length === 0 ? (
                  <p>No medications found.</p>
                ) : (
                  medications.map((medication, index) => (
                    <div key={index}>
                      <p><strong>Medication Name:</strong> {medication.medication_name}</p>
                      <p><strong>Dosage:</strong> {medication.dosage}</p>
                      <p><strong>Start Date:</strong> {medication.start_date}</p>
                      <p><strong>End Date:</strong> {medication.end_date}</p>
                    </div>
                  ))
                )}
              </div>
              <hr />
            </section>
          </div>
        )}
        {activeTab === 'lab' && (
          <div>
            <h2>Lab Results</h2>
            <section style={{ border: "2px solid black", padding: "20px", marginBottom: "20px" }}>
              {labResults.length === 0 ? (
                <p>No lab results found.</p>
              ) : (
                labResults.map((result, index) => (
                  <div key={index}>
                    <p><strong>Report Date:</strong> {result.report_date}</p>
                    <p><strong>Lab Results:</strong> {result.lab_results}</p>
                    <p><strong>Doctor Notes:</strong> {result.doctor_notes}</p>
                  </div>
                ))
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalHistory;
