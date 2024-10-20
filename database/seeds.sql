-- Insert data into the Users table
INSERT INTO Users (username, password_hash, email)
VALUES 
  ('$2b$12$hashedPasswordHere', 'user1@example.com'),
  ('$2b$12$hashedPasswordHere', 'user2@example.com'),
  ('$2b$12$hashedPasswordHere', 'user3@example.com');

-- Insert data into the Appointments table
INSERT INTO Appointments (user_id, appointment_time, hospital_id, status)
VALUES 
  (1, '2024-10-01 10:30:00', 101, 'Scheduled'),
  (2, '2024-10-02 11:00:00', 102, 'Scheduled'),
  (3, '2024-10-03 09:45:00', 103, 'Cancelled');

SHOW TABLES;