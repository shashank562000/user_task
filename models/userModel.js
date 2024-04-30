const bcrypt = require('bcrypt');
const db = require('../db/conn');

async function createUser(firstName, lastName, email, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  await db.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword
    }
  });
}

async function getUserByEmail(email) {
  return db.user.findUnique({
    where: {
      email: email
    }
  });
}

module.exports = { createUser, getUserByEmail };
