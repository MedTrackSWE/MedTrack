import React from 'react';

interface Props {
  children: React.ReactNode;
  color: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<Props> = ({ children, color, onClick, type = 'button' }) => {
  return (
    <button
      className={`btn btn-${color}`}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
};

export default Button;