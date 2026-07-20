require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const logRoutes = require('./routes/logRoutes');

const app = express();
app.use(cors());
// Increase limit for bulk upload (10,000 logs could be around 5-10MB)
app.use(express.json({ limit: '50mb' }));

app.use('/api/logs', logRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://huntergaming2kkids_db_user:Hunter2002@cluster0.yx8qhqq.mongodb.net/audit_logs_db?appName=Cluster0';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err.message);
    });
