require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 3000;

const pool = require('./config/db')

// pool.query('SELECT NOW()')
//     .then((res) => console.log('DB connection:', res.rows[0].now))
//     .catch((err) => console.log('DB connection failed:', err.message));

app.listen(PORT, () => {
    console.log(`Server runnuing on port ${PORT}`);
    
})