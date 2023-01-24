const express = require('express');
const mongoose = require('mongoose');
require('./models/User');
require('dotenv').config();

const mongoString = process.env.DATABASE_URL;
mongoose.connect(mongoString);
const database = mongoose.connection;
database.on('error', (error) => {
    console.log(error)
})
database.once('connected', () => {
    console.log('Database Connected');
})

const port = process.env.PORT || 3000;
const routes = require('./routes/UserRoutes');

const app = express();
app.use(express.json());
app.use('/api/users', routes)


app.get('/', (req, res) => {
    res.send('Xatkit-SPL API Server is running with version 1.0.0')
  })

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})