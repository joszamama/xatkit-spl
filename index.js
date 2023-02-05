const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
require('dotenv').config();

const mongoString = process.env.DATABASE_URL || 'mongodb+srv://test:test@cluster0.asrmhxl.mongodb.net/xatkit-spl-testing';

// Conexión con la BBDD
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(mongoString, () => {
    console.log('Connected to DB!');
  }, () => {
    console.log('Error connecting to DB!');
  });
}

const port = process.env.PORT || 3000;
const UserRoutes = require('./routes/UserRoutes');
const IntentRoutes = require('./routes/IntentRoutes');
const ChatbotRoutes = require('./routes/ChatbotRoutes');

const app = express();
app.use(express.json());
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/v1/users', UserRoutes)
app.use('/api/v1/intents', IntentRoutes)
app.use('/api/v1/chatbots', ChatbotRoutes)


app.get('/', (req, res) => {
    res.send('Xatkit-SPL API Server is running with version 1.0.0')
  })

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

module.exports = app;