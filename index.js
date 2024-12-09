const express = require('express');
const sql = require('mssql'); 
require('dotenv').config();
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Azure SQL Database configuration
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    enableArithAbort: true,
  },
};

// Route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.resolve('index.html'));
});

// Endpoint to fetch data for display
app.get('/data', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT home_id, appliance, energy_consumption_kWh, usage_duration_minutes
      FROM EnergyUsage
      ORDER BY home_id, energy_consumption_kWh DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

// Serve display.html
app.get('/display', (req, res) => {
  res.sendFile(path.resolve('display.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
