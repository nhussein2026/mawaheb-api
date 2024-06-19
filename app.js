const express = require('express');
const userRoutes = require('./routes/userRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const courseRoutes = require('./routes/courseRoutes');
const noteRoutes = require('./routes/noteRoutes');
require('dotenv').config();
const cors = require('cors');
const path = require('path');

const app = express();

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Enable All CORS Requests
// Configure CORS
app.use(cors({
    origin: 'http://localhost:3001', // Allow requests from this origin
}));

app.use(express.json());

// Connect to MongoDB
const connectDB = require('./config/db');
connectDB();

//user rotes
app.use('/user', userRoutes)

//certificates rotes
app.use('/', certificateRoutes);

//course rotes
app.use('/', courseRoutes);

//notes rotes
app.use('/', noteRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;