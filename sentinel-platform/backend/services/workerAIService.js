/**
 * Computes an individual worker risk score from live vitals + PPE detection,
 * and generates a human-readable safety recommendation.
 */
const evaluateWorker = (worker) => {
  let score = 0;
  const flags = [];

  if (worker.heartRate > 120 || worker.heartRate < 50) {
    score += 30;
    flags.push('Abnormal heart rate');
  }
  if (worker.temperature > 38.5) {
    score += 25;
    flags.push('Elevated body temperature');
  }
  if (!worker.helmetDetected) {
    score += 25;
    flags.push('Helmet not detected (PPE violation)');
  }
  if (worker.oxygenLevel < 92) {
    score += 20;
    flags.push('Low oxygen saturation');
  }

  const status = score >= 60 ? 'critical' : score >= 30 ? 'warning' : 'safe';

  const recommendation =
    status === 'critical'
      ? `URGENT: Evacuate ${worker.name} from zone immediately and dispatch medical team. Flags: ${flags.join(', ')}`
      : status === 'warning'
      ? `Monitor ${worker.name} closely. Issues detected: ${flags.join(', ')}`
      : 'No action needed. Worker vitals within normal range.';

  return { riskScore: score, status, flags, recommendation };
};

module.exports = { evaluateWorker };
