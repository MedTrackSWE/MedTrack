import React from 'react'
import { useNavigate } from 'react-router-dom';
import Button from '../assets/components/Button';

type NavigationPage = 'appointments' | 'history' | 'faq'

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = (page: NavigationPage): void => {
    console.log(`Navigating to ${page}`);
  }

  const handleSignOut = (): void => {
    // Clear any auth tokens or session data
    if (sessionStorage.getItem('authToken')) {
      sessionStorage.removeItem('authToken');
    }
  
    // Replace the current state to prevent back navigation
    window.history.pushState(null, '', '/');
    window.history.replaceState(null, '', '/');
  
    // Clear the browser's history stack to disable the back button
    const preventBack = () => {
      window.history.pushState(null, '', '/');
    };
  
    // Listen to the 'popstate' event and block back navigation
    window.addEventListener('popstate', preventBack);
  
    // Forcefully redirect to the login or home page
    setTimeout(() => {
      window.location.replace('/');
    }, 100); // Small delay ensures the event is bound before redirection
  };
  
  

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">
      {/* Sign Out Button */}
      <div className="container position-relative">
        <div className="position-absolute top-0 end-0">
          <Button 
            color="outline-danger"
            onClick={handleSignOut}
          >
            <svg
              className="me-2"
              width="16"
              height="16"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ display: 'inline-block', verticalAlign: 'text-bottom' }}
            >
              <path
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </Button>
        </div>

        {/* Header Section */}
        <div className="mb-4 pt-5">
          <h1 className="display-4 fw-bold">Welcome to Your MedTrack Dashboard</h1>
          <p className="text-muted lead">
            Manage your appointments and access important information
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="row g-4">
          {/* Appointments Card */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm hover-shadow">
              <div className="card-body text-center p-4">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3 d-inline-flex mb-3">
                  <svg
                    className="text-primary"
                    width="32"
                    height="32"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                      strokeWidth="2"
                    />
                    <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                    <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                    <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                  </svg>
                </div>
                <h2 className="h4 mb-2">Appointments</h2>
                <p className="text-muted mb-4">
                  Schedule and manage your appointments
                </p>
                <Button
                  color="primary"
                  onClick={() => navigate('/appointment-scheduler')}
                >
                  Book Appointment
                </Button>
              </div>
            </div>
          </div>

          {/* History Card */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm hover-shadow">
              <div className="card-body text-center p-4">
                <div className="rounded-circle bg-success bg-opacity-10 p-3 d-inline-flex mb-3">
                  <svg
                    className="text-success"
                    width="32"
                    height="32"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="h4 mb-2">History</h2>
                <p className="text-muted mb-4">
                  View your past appointments and records
                </p>
                <Button
                  color="primary"
                  onClick={() => navigate('/popup')}
                >
                  View History
                </Button>
              </div>
            </div>
          </div>

          {/* FAQ Card */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm hover-shadow">
              <div className="card-body text-center p-4">
                <div className="rounded-circle bg-info bg-opacity-10 p-3 d-inline-flex mb-3">
                  <svg
                    className="text-info"
                    width="32"
                    height="32"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeWidth="2"
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="h4 mb-2">FAQ</h2>
                <p className="text-muted mb-4">Find answers to common questions</p>
                <Button
                  color="primary"
                  onClick={() => navigate('/faq')}
                >
                  View FAQ
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add some custom CSS for hover effect
const styles = `
  .hover-shadow {
    transition: box-shadow 0.3s ease-in-out;
  }
  .hover-shadow:hover {
    box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
  }
`

// Add styles to document
const styleSheet = document.createElement('style')
styleSheet.innerText = styles
document.head.appendChild(styleSheet)

export default Dashboard