const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../../frontend')));

// API routes
const eventsRouter = require('./routes/events');
const membersRouter = require('./routes/members');
const registrationsRouter = require('./routes/registrations');
const pairingsRouter = require('./routes/pairings');

app.use('/events', eventsRouter);
app.use('/', membersRouter);
app.use('/', registrationsRouter);
app.use('/', pairingsRouter);

// Set the port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Frontend: http://localhost:${PORT}`);
});
