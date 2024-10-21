import React from "react";

interface InputProps {
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label?: string;
}

export const Input = ({type, placeholder, value, onChange, label}: InputProps) => {
    return (
        <div className="mb-3">
            {label && <label className="form-label">{label}</label>}
            <input
                type={type}
                className="form-control"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
    )
}
export default Input;