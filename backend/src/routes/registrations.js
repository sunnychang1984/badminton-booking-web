const express = require('express');
const router = express.Router();

// Dummy database for demonstration purposes
let registrations = [];
let attendance = {};

// Event registration endpoint
router.post('/register', (req, res) => {
    const { eventId, userId } = req.body;

    if (!eventId || !userId) {
        return res.status(400).json({ message: 'Event ID and User ID are required.' });
    }

    registrations.push({ eventId, userId, status: 'registered' });
    res.status(201).json({ message: 'User registered successfully.', eventId, userId });
});

// Check-in status endpoint
router.post('/checkin', (req, res) => {
    const { eventId, userId } = req.body;

    const registration = registrations.find(r => r.eventId === eventId && r.userId === userId);
    if (!registration) {
        return res.status(404).json({ message: 'Registration not found.' });
    }

    registration.status = 'checked-in';
    attendance[eventId] = attendance[eventId] || [];
    attendance[eventId].push(userId);

    res.status(200).json({ message: 'User checked in successfully.', eventId, userId });
});

// Attendance tracking endpoint
router.get('/attendance/:eventId', (req, res) => {
    const { eventId } = req.params;
    const attendees = attendance[eventId] || [];

    res.status(200).json({ eventId, attendees });
});

module.exports = router;