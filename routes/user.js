const router = require('express').Router();
const {
  validateUserUpdate,
  validateAvatar,
  validateId,
} = require('../middlewares/validation');

const {
  getUsers, getCurrentUser, updateUser, updateAvatar, checkToken,
} = require('../controllers/user');

router.get(' ', getUsers);

router.get('/me', checkToken);

router.get('/:userId', validateId, getCurrentUser);

router.patch('/me', validateUserUpdate, updateUser);

router.patch('/me/avatar', validateAvatar, updateAvatar);

module.exports = router;
