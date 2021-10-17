require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const cors = require('cors');
const helmet = require('helmet');
const { login, createUser } = require('./controllers/user');
const auth = require('./middlewares/auth');
const { errorsHandler } = require('./middlewares/validation');
const {
  validateUser,
  validateLogin,
} = require('./middlewares/validation');
const NotFoundError = require('./errors/NotFoundError');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const app = express();

const { PORT = 3003, MONGO_URI = 'mongodb://localhost:27017/mestodb' } = process.env;

app.use(cors({
  origin: 'https://mesto.rls.nomoredomains.club',
  credentials: true,
}));

app.use(helmet());
app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(MONGO_URI);

app.use(requestLogger);

app.post('/signup', validateUser, createUser);
app.post('/signin', validateLogin, login);

// app.use(auth);

app.use('/users', auth, require('./routes/user'));
app.use('/cards', auth, require('./routes/card'));

app.use(errorLogger);

app.use('*', () => {
  throw new NotFoundError({ message: 'Запрашиваемый ресурс не найден' });
});

app.use(errors());
app.use(errorsHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
