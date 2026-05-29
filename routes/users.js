import express from 'express';
import {
    getUsers,
    getUser,
    createUser,
    updateUser,
    loginUser,
    registerUser,
    deleteUser,
    getUserCount,
} from '../controllers/user.controller.js';

const router = express.Router();

router.get('/', getUsers);
router.get('/get/count', getUserCount);
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.post('/login', loginUser);
router.post('/register', registerUser);
router.delete('/:id', deleteUser);

export default router;