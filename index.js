const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const mongoString = process.env.DATABASE_URL;
mongoose.connect(mongoString);
const database = mongoose.connection;
database.on('error', (error) => {
    console.log('Database Connection Error: ' + error);
})
database.once('connected', () => {
    console.log('Database Connected');
})

const port = process.env.PORT || 3000;
const UserRoutes = require('./routes/UserRoutes');
const IntentRoutes = require('./routes/IntentRoutes');
const ChatbotRoutes = require('./routes/ChatbotRoutes');

const app = express();
app.use(express.json());
app.use('/api/v1/users', UserRoutes)
app.use('/api/v1/intents', IntentRoutes)
app.use('/api/v1/chatbots', ChatbotRoutes)


app.get('/', (req, res) => {
    res.send('Xatkit-SPL API Server is running with version 1.0.0')
  })

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})