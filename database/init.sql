-- Users table
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Medical history table
CREATE TABLE Medical_History (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    doctor_notes TEXT,
    lab_results TEXT,
    report_date DATE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Conditions table
CREATE TABLE Conditions (
    condition_id INT AUTO_INCREMENT PRIMARY KEY,
    history_id INT NOT NULL,
    condition_name VARCHAR(255) NOT NULL,
    condition_description TEXT,
    diagnosed_date DATE,
    FOREIGN KEY (history_id) REFERENCES Medical_History(history_id)
);

-- Medications table
CREATE TABLE Medications (
    medication_id INT AUTO_INCREMENT PRIMARY KEY,
    history_id INT NOT NULL,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE DEFAULT NULL,
    FOREIGN KEY (history_id) REFERENCES Medical_History(history_id)
);

-- Hospitals table
CREATE TABLE Hospitals (
    hospital_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50)
);

-- Appointments table
CREATE TABLE Appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    appointment_time DATETIME NOT NULL,
    hospital_id INT NOT NULL,
    status ENUM('Scheduled', 'Cancelled', 'Completed') DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (hospital_id) REFERENCES Hospitals(hospital_id)
);

-- Available time slots table
CREATE TABLE Timeslots (
    timeslot_id INT AUTO_INCREMENT PRIMARY KEY,
    hospital_id INT NOT NULL,
    timeslot_time TIME NOT NULL,
    FOREIGN KEY (hospital_id) REFERENCES Hospitals(hospital_id)
);
