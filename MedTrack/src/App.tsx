import React, { useState, FormEvent } from 'react';
import Button from "./assets/components/Button";
import Input from "./assets/components/Input";
import Alert from "./assets/components/Alert";

const App: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email && password) {
      console.log('Login attempt with:', { email, password });
      setError('');

      // Add your authentication logic here
      
    } else {
      setError('Please enter both email and password');
    }
  };

  const handleSignUpClick = () => {
    console.log('Sign up clicked');
    // Add your sign up logic here
    // For example, you could navigate to a sign-up page or open a modal
    // alert('Sign up functionality would be implemented here');
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
                <div className="d-grid gap-2 mt-3">
                  <Button color="primary" onClick={() => {}}>
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