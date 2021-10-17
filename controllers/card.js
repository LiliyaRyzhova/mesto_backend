const Card = require('../models/card');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .catch((err) => {
      throw new ValidationError({ message: `Указаны некорректные данные при создании карточки: ${err.message}` });
    })
    .then((card) => res.status(200).send(card))
    .catch(next);
};

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((card) => res.status(200).send(card))
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(() => {
      throw new NotFoundError('Карточка не найдена');
    });
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (!card || card.owner.toString() !== req.user._id) {
        throw new NotFoundError('Недостаточно прав для удаления карточки');
      } else {
        res.status(200).send(card);
      }
    })
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Нет карточки/пользователя по заданному id.');
      } else {
        res.status(200).send(card);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new ValidationError('Невалидный id ');
      }
    })
    .catch(next)
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Нет карточки/пользователя по заданному id.');
      } else {
        res.status(200).send(card);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new ValidationError('Невалидный id ');
      }
    })
    .catch(next);
};
