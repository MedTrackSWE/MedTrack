--Insert Hospitals

INSERT INTO Hospitals (name, address, phone_number)
VALUES 
('Downtown Clinic', '123 Main Street, Springfield', '123-456-7890');

INSERT INTO Hospitals (name, address, phone_number)
VALUES 
('Uptown Clinic', '456 Main Street, Springfield', '123-654-9870');

-- Insert timeslots for all hospitals for Monday to Friday, 8 AM to 5 PM
INSERT INTO Hospitals (name, address, phone_number)
SELECT 
    CONCAT('Hospital ', n) AS name, 
    CONCAT('Address ', n, ', City ', n, ', State ', n) AS address,
    CONCAT('+1-555-000-', LPAD(n, 3, '0')) AS phone_number
FROM (
    SELECT n FROM (
        SELECT @rownum := @rownum + 1 AS n 
        FROM (
            SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 
            UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
        ) t1, (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 
            UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) t2, 
            (SELECT @rownum := -1) r
    ) t3 LIMIT 110
) numbers;

CREATE PROCEDURE GenerateTimeslots()
BEGIN
    DECLARE cur_hospital_id INT;
    DECLARE done INT DEFAULT FALSE;
    DECLARE start_date DATE DEFAULT CURDATE();
    DECLARE end_date DATE DEFAULT DATE_ADD(CURDATE(), INTERVAL 3 YEAR);
    DECLARE weekday INT;
    DECLARE cur_time TIME;

    -- Cursor declaration
    DECLARE hospital_cursor CURSOR FOR SELECT hospital_id FROM Hospitals;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- Open the cursor
    OPEN hospital_cursor;

    -- Loop through hospitals
    hospital_loop: LOOP
        FETCH hospital_cursor INTO cur_hospital_id;

        -- Exit loop if no more hospitals
        IF done THEN
            LEAVE hospital_loop;
        END IF;

        -- Generate timeslots for Monday to Friday
        SET weekday = 0; -- 0 = Monday
        WHILE weekday < 5 DO
            SET cur_time = '08:00:00'; -- Start at 8 AM
            WHILE cur_time <= '17:00:00' DO -- End at 5 PM
                INSERT INTO Timeslots (hospital_id, timeslot_time, timeslot_date)
                SELECT cur_hospital_id, cur_time, calendar.date
                FROM (
                    SELECT start_date + INTERVAL seq DAY AS date
                    FROM (
                        SELECT @rownum := @rownum + 1 AS seq
                        FROM (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) t1,
                             (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) t2,
                             (SELECT @rownum := -1) r
                    ) days
                    WHERE start_date + INTERVAL seq DAY <= end_date
                      AND WEEKDAY(start_date + INTERVAL seq DAY) = weekday
                ) calendar;

                -- Increment the time by 1 hour
                SET cur_time = ADDTIME(cur_time, '01:00:00');
            END WHILE;

            -- Move to the next weekday
            SET weekday = weekday + 1;
        END WHILE;
    END LOOP;

    -- Close the cursor
    CLOSE hospital_cursor;
END;



CALL GenerateTimeslots();