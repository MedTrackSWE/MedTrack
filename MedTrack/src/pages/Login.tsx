// import React, { useState, FormEvent } from 'react';
// import Button from "../assets/components/Button";
// import Input from "../assets/components/Input";
// import Alert from "../assets/components/Alert";

// const App: React.FC = () => {
//   const [isLogin, setIsLogin] = useState<boolean>(true);
//   const [email, setEmail] = useState<string>('');
//   const [password, setPassword] = useState<string>('');
//   const [confirmPassword, setConfirmPassword] = useState<string>('');
//   const [error, setError] = useState<string>('');
//   const [message, setMessage] = useState<string>('');

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setError('');
//     setMessage('');

//     if (!email || !password) {
//       setError('Please fill in all required fields');
//       return;
//     }

//     if (!isLogin && password !== confirmPassword) {
//       setError('Passwords do not match');
//       return;
//     }

//     try {
//       const endpoint = isLogin ? 'login' : 'signup';
//       const response = await fetch(`http://127.0.0.1:5000/api/auth/${endpoint}`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ 
//           email, 
//           password,
//           ...((!isLogin && confirmPassword) && { confirmPassword })
//         }),
//       });
      
//       const data = await response.json();
//       if (response.ok) {
//         setMessage(data.message);
//         if (!isLogin) {
//           // After successful signup, switch to login
//           setTimeout(() => {
//             resetForm();
//             setIsLogin(true);
//           }, 2000);
//         }
//       } else {
//         setError(data.error);
//       }
//     } catch (error) {
//       setError('An error occurred. Please try again.');
//     }
//   };

//   const resetForm = () => {
//     setEmail('');
//     setPassword('');
//     setConfirmPassword('');
//     setError('');
//     setMessage('');
//   };

//   const toggleAuthMode = () => {
//     setIsLogin(!isLogin);
//     resetForm();
//   };

//   return (
//     <div className="container mt-5">
//       <div className="row justify-content-center">
//         <div className="col-md-6">
//           <div className="card">
//             <div className="card-body">
//               <h2 className="card-title text-center mb-4">
//                 {isLogin ? 'Login' : 'Sign Up'}
//               </h2>
//               <form onSubmit={handleSubmit}>
//                 <Input
//                   type="email"
//                   placeholder="Enter your email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   label="Email"
//                 />
//                 <Input
//                   type="password"
//                   placeholder="Enter your password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   label="Password"
//                 />
//                 {!isLogin && (
//                   <Input
//                     type="password"
//                     placeholder="Confirm your password"
//                     value={confirmPassword}
//                     onChange={(e) => setConfirmPassword(e.target.value)}
//                     label="Confirm Password"
//                   />
//                 )}
//                 {error && <Alert color="danger">{error}</Alert>}
//                 {message && <Alert color="success">{message}</Alert>}
//                 <div className="d-grid gap-2 mt-3">
//                   <Button color="primary" type="submit">
//                     {isLogin ? 'Sign In' : 'Sign Up'}
//                   </Button>
//                 </div>
//               </form>
//               <div className="mt-3 text-center">
//                 <p className="mb-2 text-muted" style={{ fontSize: '0.9rem' }}>
//                   {isLogin ? "Don't have an account?" : "Already have an account?"}
//                 </p>
//                 <Button color="secondary" onClick={toggleAuthMode}>
//                   {isLogin ? 'Sign Up' : 'Sign In'}
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;

import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from "../assets/components/Button";
import Input from "../assets/components/Input";
import Alert from "../assets/components/Alert";


const App: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const endpoint = isLogin ? 'login' : 'signup';
      const response = await fetch(`http://127.0.0.1:5000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password,
          ...((!isLogin && confirmPassword) && { confirmPassword })
        }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        if (isLogin) {
          localStorage.setItem('userID',data.userID); //added this rn to fix hard code user issue
          // Store the token if your API returns one
          if (data.token) {
            localStorage.setItem('authToken', data.token);
          }
          // Navigate to dashboard after successful login
          navigate('/dashboard');
        } else {
          // After successful signup, show success message and switch to login
          setMessage('Account created successfully! Redirecting to login...');
          setTimeout(() => {
            setIsLogin(true);
            resetForm();
          }, 2000);
        }
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setMessage('');
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">
                {isLogin ? 'Login' : 'Sign Up'}
              </h2>
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
                {!isLogin && (
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    label="Confirm Password"
                  />
                )}
                {error && <Alert color="danger">{error}</Alert>}
                {message && <Alert color="success">{message}</Alert>}
                <div className="d-grid gap-2 mt-3">
                  <Button color="primary" type="submit">
                    {isLogin ? 'Sign In' : 'Sign Up'}
                  </Button>
                </div>
              </form>
              <div className="mt-3 text-center">
                <p className="mb-2 text-muted" style={{ fontSize: '0.9rem' }}>
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                </p>
                <Button color="secondary" onClick={toggleAuthMode}>
                  {isLogin ? 'Sign Up' : 'Sign In'}
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