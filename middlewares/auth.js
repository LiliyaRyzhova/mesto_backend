const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/UnauthorizedError ');

const { JWT_SECRET, NODE_ENV } = process.env;
module.exports = (req, res, next) => {
  const token = (req.cookies.jwt);
  let payload;
  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'super-strong-secret-test');
  } catch (err) {
    next(new UnauthorizedError('Пожалуйста, авторизуйтесь'));
  }
  req.user = payload;
  next();
};
