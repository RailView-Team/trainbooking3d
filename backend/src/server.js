require('dotenv').config();
const app = require('./app');
const { startAutoAdvance } = require('./services/trainSimulationService');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Railway backend listening on http://localhost:${PORT}`);
  startAutoAdvance();
});
