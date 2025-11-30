require('dotenv').config();
const express = require('express');
const cors = require('cors');
const AuthRouter = require('./Routes/AuthRouter');
const PetitionRouter = require('./Routes/PetitionRouter');
require('./Models/db');
const pollRoutes = require('./Routes/PollRouter');
const reportsRouter = require('./Routes/ReportRouter');
const feedbackRouter = require('./Routes/FeedbackRouter');

const app = express();

// ✅ 1. Allow all required HTTP methods for your frontend
app.use(cors({
  origin: 'http://localhost:3000',  // React app port
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ 2. Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 3. Log every request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ✅ 4. Routes
app.get('/ping', (req, res) => {
  res.send('Server is active and running ✅');
});

// ✅ Routers
app.use('/auth', AuthRouter);
app.use('/petition', PetitionRouter);

//polls
app.use("/polls", pollRoutes);


//report 
app.use("/reports", reportsRouter);

//for serving images statically for feedback
app.use('/uploads', express.static('uploads'));


//for feedback
app.use('/feedback', feedbackRouter);



// ✅ 5. Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

