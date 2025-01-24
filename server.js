const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8080; // Use dynamic port assignment for Azure

// Azure SQL connection configuration
const dbConfig = {
  user: 'frina', // Azure SQL username
  password: 'Date1234', // Azure SQL password
  server: 'birth.database.windows.net', // Azure SQL server name
  database: 'frinaDB', // Your database name
  options: {
    encrypt: true, // Use encryption
    trustServerCertificate: true, // Ignore SSL certificate validation for simplicity
  },
};

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.send('App is running and healthy.');
});

app.get("/birthdays", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig); // Connect to Azure SQL
    const result = await pool.request().query("SELECT * FROM birthdays ORDER BY id DESC");
    res.json(result.recordset); // Return the query results
  } catch (err) {
    console.error("Error querying the database:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Route to save birthday data
app.post('/birthdays', async (req, res) => {
  const { name, birthday, gift } = req.body;

  try {
    const pool = await sql.connect(dbConfig); // Connect to the database
    await pool
      .request()
      .input('name', sql.NVarChar, name) // Bind 'name' parameter
      .input('birthday', sql.Date, birthday) // Bind 'birthday' parameter
      .input('gift', sql.NVarChar, gift) // Bind 'gift' parameter
      .query('INSERT INTO birthdays (name, birthday, gift) VALUES (@name, @birthday, @gift)'); // Use parameters in the query

    res.status(201).json({ msg: 'Birthday data saved successfully' });
  } catch (err) {
    console.error('Error saving birthday data:', err.message);
    res.status(500).json({ msg: 'Failed to save birthday data' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
