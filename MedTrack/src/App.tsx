import React, { useState, FormEvent } from 'react';
import Button from "./assets/components/Button";
import Input from "./assets/components/Input";
import Alert from "./assets/components/Alert";

const App: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email && password) {
      try {
        const response = await fetch('http://localhost:5000/api/login', {//this is the route that is taken
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (response.ok) {
          setMessage(data.message);
          setError('');
        } else {
          setError(data.error);
          setMessage('');
        }
      } catch (error) {
        setError('An error occurred. Please try again.');
        setMessage('');
      }
    } else {
      setError('Please enter both email and password');
    }
  };

  const handleSignUpClick = async () => {
    //create sign up logic
    // change page and new button
    console.log("Sign up pressed")
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Login</h2>
              <form onSubmit={handleSubmit}>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  label="Email"
                />
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  label="Password"
                />
                {error && <Alert color="danger">{error}</Alert>}
                {message && <Alert color="success">{message}</Alert>}
                <div className="d-grid gap-2 mt-3">
                  <Button color="primary" type="submit">
                    Sign In
                  </Button>
                </div>
              </form>
              <div className="mt-3 text-center">
                <p className="mb-2 text-muted" style={{ fontSize: '0.9rem' }}>Don't Have an Account?</p>
                <Button color="secondary" onClick={handleSignUpClick}>
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;