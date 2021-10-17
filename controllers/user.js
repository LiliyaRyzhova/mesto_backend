const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const UnauthorizedError = require('../errors/UnauthorizedError ');
const ConflictError = require('../errors/ConflictError');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(200).send({ data: users }))
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        throw new ValidationError('Пользователь по указанному _id не найден.');
      } else {
        res.status(200).send({ data: user });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new ValidationError('Невалидный id ');
      }
    })
    .catch(next);
};

module.exports.checkToken = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new ValidationError('Пользователь по указанному _id не найден.');
      } else {
        res.status(200).send({ data: user });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new ValidationError('Невалидный id ');
      }
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .catch((err) => {
      if (err.name === 'MongoServerError' || err.code === 11000) {
        next(new ConflictError('Пользователь с таким email уже зарегистрирован'));
      }
    })
    .then((user) => res.status(200).send({
      data: {
        name: user.name, about: user.about, avatar, email: user.email,
      },
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new ValidationError('Некорректные данные');
      }
    })
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь по указанному _id не найден.');
      } else {
        res.status(200).send({ data: user });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new ValidationError('Некорректные данные');
      }
    })
    .catch(next);
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь по указанному _id не найден.');
      } else {
        res.status(200).send({ data: user });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new ValidationError('Некорректные данные');
      }
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'super-strong-secret-test', { expiresIn: '7d' });
      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true, // запрещает доступ к куке из js
        sameSite: true,
      })
        .send({ token });
    })
    .catch((err) => next(new UnauthorizedError(`Произошла ошибка: ${err.message}`)));
};
