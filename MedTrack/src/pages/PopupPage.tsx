import React, { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';

const PopupPage: React.FC = () => {
  const navigate = useNavigate();

  const handleYesClick = () => {
    navigate('/medical-history'); // Redirect to the medical history page
  };

  const handleNoClick = () => {
    navigate('/dashboard'); // Redirect back to the dashboard
  };

  const overlayStyles: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const popupStyles: CSSProperties = {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '10px',
    textAlign: 'center',
    width: '300px',
  };

  const buttonContainerStyles: CSSProperties = {
    marginTop: '1.5rem',
    display: 'flex',
    justifyContent: 'space-around',
  };

  const buttonStyles: CSSProperties = {
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    cursor: 'pointer',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    transition: 'background-color 0.3s ease',
  };

  return (
    <div style={overlayStyles}>
      <div style={popupStyles}>
        <h2>Are you sure you want to view your medical history?</h2>
        <div style={buttonContainerStyles}>
          <button style={buttonStyles} onClick={handleYesClick}>
            Yes
          </button>
          <button style={buttonStyles} onClick={handleNoClick}>
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupPage;

