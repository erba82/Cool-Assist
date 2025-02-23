const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const { handleErrors } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// روت‌های احراز هویت
app.use('/auth', authRoutes);

// Middleware برای هندل کردن خطاها
app.use(handleErrors);

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});