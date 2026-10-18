const express = require('express');
const uploadRoutes = require('./routes/upload.routes');
const errorHandler = require('./middleware/errorHandler');
const batchRoutes = require("./routes/batch.routes");
const auditRoutes = require("./routes/audit.routes");
const swaggerUi = require("swagger-ui-express");
const openapi = require("./docs/openapi");

const app = express();

// middleware 

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
})

app.use('/upload', uploadRoutes);
app.use("/batches", batchRoutes); 
app.use("/audit-logs", auditRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapi));

app.use(errorHandler); // comes in last
module.exports = app;
