
import React, { useState, useEffect } from 'react';
import '../tabs.css';

const MedicalHistory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'medical' | 'lab'>('medical');
  const [conditions, setConditions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');


  useEffect(() => {
    const userId = localStorage.getItem('userID');
    if (!userId) { //added this rn
      setError('User not logged in'); //added this rn
      setLoading(false); //added this rn
      return;
    }
    // Fetching conditions data
    const fetchConditions = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/medical_history/conditions?user_id=${userId}`);
        const data = await response.json();

        if (response.ok) {
          setConditions(data);
        } else {
          setError(data.error || 'Failed to load conditions.');
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
              <hr />
            </section>

            {/* Other sections (appointments, medications) are omitted for now */}
          </div>
        )}

        {activeTab === 'lab' && (
          <div>
            <h2>Lab Results</h2>
            <p>Lab results will go here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalHistory;
