const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { notFound, errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const workerRoutes = require('./routes/workerRoutes');
const sensorRoutes = require('./routes/sensorRoutes');
const permitRoutes = require('./routes/permitRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const complianceRoutes = require('./routes/complianceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const zoneRoutes = require('./routes/zoneRoutes');

const app = express();

// ---------- Security & core middleware ----------
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api', apiLimiter);

// ---------- Static uploads ----------
app.use('/uploads', express.static('uploads'));

// ---------- Health check ----------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Industrial Safety Intelligence Platform API', time: new Date() });
});

// ---------- Routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/permits', permitRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/predict', predictionRoutes);
app.use('/api/zones', zoneRoutes);

// ---------- Error handling ----------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
