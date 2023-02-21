const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const logger = require('./commons/Logger');

require('dotenv').config();
mongoose.set('strictQuery', true);

console.log(`
Y88b   d88P          8G8    8G8      d8b 8G8           .d8888b.  8G88888b.  8G8      
 Y88b d88P           8U8    8U8      Y8P 8U8          d88P  Y88b 8U8   Y88b 8U8      
  Y88o88P            8A8    8A8          8A8          Y88b.      8A8    888 8A8      
   Y888P     8888b.  8I8888 8I8  888 888 8I8888        "Y888b.   8I8   d88P 8I8      
   d888b        "88b 8T8    8T8 .88P 888 8T8              "Y88b. 8T88888P"  8T8      
  d88888b   .d888888 8O8    8O8888K  888 6O8   888888       "888 8O8        8O8      
 d88P Y88b  888  888 Y88b.  888 "88b 888 Y88b.        Y88b  d88P 888        888      
d88P   Y88b "Y888888  "Y888 888  888 888  "Y888        "Y8888P"  888        8888888                                                                                  
`);

async function connectToDatabase() {
  await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/xatkit-spl');
}

connectToDatabase()
  .then(() => {
    logger.info('Connected to database');
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
      logger.info('GET /');
      res.send('Xatkit-SPL API Server is running with version 1.0.0')
    })

    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    })

    module.exports = app;
  })
  .catch((error) => {
    logger.error(`Error connecting to database: ${error}`);
  });
