// Importing required modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Creating an instance of express
const app = express();

// Middleware configuration
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse JSON bodies

// Sample route
app.get('/', (req, res) => {
    res.send('Welcome to the Badminton Booking API!');
});

// Set the port
const PORT = process.env.PORT || 5000;

// Starting the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
