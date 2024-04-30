const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middlewares/verifyToken');

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.put('/:id', verifyToken, userController.updateUser);
router.delete('/:id', verifyToken, userController.deleteUser);
router.get('/', verifyToken, userController.getUsers);
router.get('/:id', verifyToken, userController.getUserById);

module.exports = router;
