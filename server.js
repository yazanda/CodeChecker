const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRouts');
const crudRouts = require('./routes/crudRouts');
const compileRouts = require('./routes/compileRouts');
const downloadRouts = require('./routes/downloadRouts');
const cors = require('cors'); 

const app = express();
const serverport = 3003;

app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from this origin only
  methods: 'GET,POST,PUT,DELETE',  // Allow these HTTP methods
  allowedHeaders: 'Content-Type,Authorization', // Allow these headers
}));

app.use('/api', authRoutes);
app.use('/api', uploadRoutes);
app.use('/api', crudRouts);
app.use('/api', compileRouts);
app.use('/api', downloadRouts);

app.listen(serverport, () => {
  console.log(`Server running on port ${serverport}`);
});
