const express = require('express');
const sql = require('mssql'); // For Azure SQL integration
require('dotenv').config(); // For environment variables

const app = express();
const port = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static('public'));

// Azure SQL Database configuration
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER, // e.g., "your-db-server.database.windows.net"
  database: process.env.DB_NAME,
  options: {
    encrypt: true, // Use encryption for Azure SQL
    enableArithAbort: true,
  },
};

// Endpoint to fetch data for display
app.get('/data', async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT home_id, appliance, energy_consumption_kWh, usage_duration_minutes
      FROM EnergyData
      ORDER BY home_id, energy_consumption_kWh DESC
    `);

    res.json(result.recordset); // Return the data as JSON
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

// Serve display.html
app.get('/display', (req, res) => {
  res.sendFile(__dirname + '/public/display.html');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});