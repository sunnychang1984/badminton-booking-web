const express = require('express');
const router = express.Router();

// Mock data for events
let events = [];

// Create a new badminton event
router.post('/', (req, res) => {
    const { name, date, location } = req.body;
    const newEvent = { id: events.length + 1, name, date, location };
    events.push(newEvent);
    res.status(201).json(newEvent);
});

// Update an existing badminton event by ID
router.put('/:id', (req, res) => {
    const eventId = parseInt(req.params.id);
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) {
        return res.status(404).json({ message: 'Event not found' });
    }
    const { name, date, location } = req.body;
    events[eventIndex] = { id: eventId, name, date, location };
    res.json(events[eventIndex]);
});

// Retrieve all badminton events
router.get('/', (req, res) => {
    res.json(events);
});

// Retrieve a single badminton event by ID
router.get('/:id', (req, res) => {
    const eventId = parseInt(req.params.id);
    const event = events.find(e => e.id === eventId);
    if (!event) {
        return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
});

module.exports = router;