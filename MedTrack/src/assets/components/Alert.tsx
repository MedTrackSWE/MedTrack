import React from "react";

interface AlertProps {
    children: string;
    color: string;
}

export const Alert = ({children, color}: AlertProps) => {
    return (
        <div className={`alert alert-${color}`} role="alert">
            {children}
        </div>
    )
}

export default Alert;