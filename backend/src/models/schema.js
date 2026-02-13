// SQL Schema for Badminton Booking System

/* Table for Events */
CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    event_date DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* Table for Members */
CREATE TABLE members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* Table for Registrations */
CREATE TABLE registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    member_id INT,
    event_id INT,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (event_id) REFERENCES events(id)
);

/* Table for Pairings */
CREATE TABLE pairings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT,
    member1_id INT,
    member2_id INT,
    pairing_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (member1_id) REFERENCES members(id),
    FOREIGN KEY (member2_id) REFERENCES members(id)
);