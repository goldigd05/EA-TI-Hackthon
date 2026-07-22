const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Incident = require('../models/Incident');
const Worker = require('../models/Worker');
const Sensor = require('../models/Sensor');
const Prediction = require('../models/Prediction');

const REPORTS_DIR = path.join(__dirname, '../uploads/reports');
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

const getDateRange = (type) => {
  const now = new Date();
  const from = new Date(now);
  if (type === 'daily') from.setDate(now.getDate() - 1);
  if (type === 'weekly') from.setDate(now.getDate() - 7);
  if (type === 'monthly') from.setMonth(now.getMonth() - 1);
  return { from, to: now };
};

/**
 * Generates a PDF safety report (daily / weekly / monthly) summarizing
 * incidents, predictions, sensor alerts and worker status in the period.
 */
const generateReport = async (type = 'daily') => {
  const { from, to } = getDateRange(type);

  const [incidents, predictions, criticalSensors, criticalWorkers] = await Promise.all([
    Incident.find({ timestamp: { $gte: from, $lte: to } }),
    Prediction.find({ createdAt: { $gte: from, $lte: to } }),
    Sensor.find({ status: 'critical', timestamp: { $gte: from, $lte: to } }),
    Worker.find({ status: 'critical' }),
  ]);

  const fileName = `${type}-report-${Date.now()}.pdf`;
  const filePath = path.join(REPORTS_DIR, fileName);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).fillColor('#1e3a8a').text('Industrial Safety Intelligence Report', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(12).fillColor('black').text(`Report Type: ${type.toUpperCase()}`, { align: 'center' });
  doc.text(`Period: ${from.toDateString()} — ${to.toDateString()}`, { align: 'center' });
  doc.moveDown(1.5);

  doc.fontSize(15).fillColor('#1e3a8a').text('Executive Summary');
  doc.moveDown(0.3);
  doc.fontSize(11).fillColor('black');
  doc.text(`Total Incidents: ${incidents.length}`);
  doc.text(`AI Predictions Generated: ${predictions.length}`);
  doc.text(`Critical Sensor Alerts: ${criticalSensors.length}`);
  doc.text(`Workers Currently in Critical Status: ${criticalWorkers.length}`);
  doc.moveDown(1);

  doc.fontSize(15).fillColor('#1e3a8a').text('Incidents');
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor('black');
  if (incidents.length === 0) {
    doc.text('No incidents recorded in this period.');
  } else {
    incidents.forEach((i) => {
      doc.text(`• [${i.severity.toUpperCase()}] Zone ${i.zone} — ${i.prediction || 'N/A'} (${i.status})`);
    });
  }
  doc.moveDown(1);

  doc.fontSize(15).fillColor('#1e3a8a').text('High-Risk AI Predictions');
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor('black');
  const highRisk = predictions.filter((p) => p.riskScore >= 60);
  if (highRisk.length === 0) {
    doc.text('No high-risk predictions in this period.');
  } else {
    highRisk.forEach((p) => {
      doc.text(`• Zone ${p.zone}: ${p.incident} — Risk ${p.riskScore}% (confidence ${p.confidence}%)`);
      doc.text(`   Recommendation: ${p.recommendation}`, { indent: 10 });
    });
  }

  doc.end();

  const summary = {
    incidentCount: incidents.length,
    predictionCount: predictions.length,
    criticalSensorCount: criticalSensors.length,
    criticalWorkerCount: criticalWorkers.length,
  };

  return { filePath, fileName, summary, from, to };
};

module.exports = { generateReport };
