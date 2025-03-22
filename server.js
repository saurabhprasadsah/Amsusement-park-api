const express = require('express');
const permissions    = require('./abc');

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
    res.send('Welcome to the Property Booking API!');
});

app.get('/permissions', (req, res) => {
    res.json(permissions)
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});