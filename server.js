require('express-async-errors');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const errorHandler = require('./middleware/error-handler');
const db = require('./config/database');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// Routes
app.use('/accounts', require('./routes/accounts.route'));

// Swagger docs
try {
    const swaggerDoc = YAML.load('./swagger.yaml');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
} catch(e) {
    console.log('Swagger file not found, skipping...');
}

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

db.authenticate()
    .then(() => {
        console.log('Database connected successfully');
        return db.sync({ alter: true });
    })
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    })
    .catch(err => {
        console.error('Database connection failed:', err.message);
    });