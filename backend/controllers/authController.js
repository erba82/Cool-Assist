const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

// در این نمونه، برای سادگی کاربران در آرایه درون حافظه ذخیره می‌شوند.
// برای استفاده در حالت عملی، از دیتابیس واقعی بهره بگیرید.
const users = [];

/**
 * ثبت‌نام کاربر جدید
 * انتظار دریافت fullName, email, password در req.body
 */
exports.signUp = async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'Missing required fields: email, password, and fullName are required.' });
    }

    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: users.length + 1,
      email,
      name: fullName,
      password: hashedPassword
    };
    users.push(newUser);

    // ایجاد توکن JWT
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });
    console.log(`User created: ${JSON.stringify(newUser)}`);
    return res.status(201).json({
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ورود کاربر
 * انتظار دریافت email, password در req.body
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing required fields: email, password' });
    }

    const existingUser = users.find(user => user.email === email);
    if (!existingUser) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Wrong password.' });
    }

    // تولید توکن JWT
    const token = jwt.sign({ id: existingUser.id, email: existingUser.email }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });
    return res.status(200).json({
      user: { id: existingUser.id, email: existingUser.email, name: existingUser.name },
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * کال‌بک مربوط به احراز هویت Google
 */
exports.googleCallback = (req, res) => {
  res.status(200).json({ message: 'Google OAuth callback processed.' });
};

/**
 * کال‌بک مربوط به احراز هویت LinkedIn
 */
exports.linkedinAuth = (req, res) => {
  res.status(200).json({ message: 'LinkedIn OAuth callback processed.' });
};