require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// ====== Middleware ======
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====== Connect Database ======
connectDB(process.env.MONGO_URI);

// ====== Static Files ======
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ====== Routes ======
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/forgot', require('./routes/forgot'));
app.use('/api/plans', require('./routes/plan'));
app.use('/api/plan-requests', require('./routes/planRequests'));
app.use('/api/withdraw', require('./routes/withdraw'));
const userTasksRoutes = require('./routes/userTasks');
app.use('/api/user/tasks', userTasksRoutes);
app.use('/images', express.static('images'));

app.use('/api/profile', require('./routes/profile'));
app.use('/api/referral', require('./routes/referral'));

// ====== Admin Video Upload Routes ======
app.use('/api/admin/videos', require('./routes/adminVideos'));

// ====== Server Start ======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
