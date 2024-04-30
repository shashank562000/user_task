const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const db = require('../db/conn');

async function signup(req, res) {
    const { firstName, lastName, email, password } = req.body;
    try {
        // to check the user already exist or not 
        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).send('Email address is already in use.');
        }
        await userModel.createUser(firstName, lastName, email, password);
        res.status(200).send('User registered successfully.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering user.');
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await userModel.getUserByEmail(email);
        if (!user) {
            return res.status(401).send('Invalid email or password.');
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).send('Invalid password.');
        }
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // to save the token in db
        await db.user.update({
            where: { id: user.id },
            data: { token }
        });
        res.status(200).send({ auth: true, token: token, user: user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error logging in.');
    }
}

async function updateUser(req, res) {
    try {
        const userId = req.params.id;
        const { firstName, lastName, email } = req.body;
        // the new email ID is not exist already 
        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).send('Email address is already in use.');
        }
        // Check if the user is authorized to update their own record
        const user = await db.user.findUnique({ where: { id: parseInt(userId) } });
        if (!user) {
            return res.status(404).send('User not found.');
        }
        if (user.id !== req.userId) {
            return res.status(403).send("You're not authorized to update this user.");
        }

        await db.user.update({
            where: { id: parseInt(userId) },
            data: { firstName, lastName, email }
        });
        
        res.status(200).send({message:'User updated successfully.', user:user});
    } catch (error) {
        console.error(error);
        res.status(500).send('Something want worng during updating user.');
    }
}

async function deleteUser(req, res) {
    try {
        const userId = req.params.id;

        // Check if the user is authorized to delete their own record
        const user = await db.user.findUnique({ where: { id: parseInt(userId) } });
        if (!user) {
            return res.status(404).send('User not found.');
        }
        if (user.id !== req.userId) {
            return res.status(403).send("You're not authorized to delete this user.");
        }

        await db.user.delete({ where: { id: parseInt(userId) } });
        
        res.status(200).send('User deleted successfully.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting user.');
    }
}

async function getUsers(req, res) {
    try {
        const users = await db.user.findMany();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users.');
    }
}

async function getUserById(req, res) {
    try {
        const userId = req.params.id;
        const user = await db.user.findUnique({ where: { id: parseInt(userId) } });
        if (!user) {
            return res.status(404).send('User not found.');
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching user.');
    }
}

module.exports = { signup, login, updateUser, deleteUser, getUsers, getUserById };
