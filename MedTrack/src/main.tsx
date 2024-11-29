import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './pages/Login'
import Dashboard from './pages/Dashboard'
import AppointmentScheduler from './pages/AppointmentScheduler';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.css'


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/appointment-scheduler" element={<AppointmentScheduler />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)