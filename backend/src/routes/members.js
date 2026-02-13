const express = require('express');
const router = express.Router();

// Mock database for demonstration purposes
let members = [];

// Create a new member
router.post('/members', (req, res) => {
    const { name, email } = req.body;
    const newMember = { id: members.length + 1, name, email, absences: [] };
    members.push(newMember);
    res.status(201).json(newMember);
});

// Update existing member
router.put('/members/:id', (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    const member = members.find(m => m.id === parseInt(id));
    if (!member) return res.status(404).send('Member not found');
    member.name = name;
    member.email = email;
    res.json(member);
});

// Track absence
router.post('/members/:id/absences', (req, res) => {
    const { id } = req.params;
    const { reason, date } = req.body;
    const member = members.find(m => m.id === parseInt(id));
    if (!member) return res.status(404).send('Member not found');
    member.absences.push({ reason, date });
    res.status(201).json(member);
});

// Get all members
router.get('/members', (req, res) => {
    res.json(members);
});

// Get a member by ID
router.get('/members/:id', (req, res) => {
    const { id } = req.params;
    const member = members.find(m => m.id === parseInt(id));
    if (!member) return res.status(404).send('Member not found');
    res.json(member);
});

module.exports = router;