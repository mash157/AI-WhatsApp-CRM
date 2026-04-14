const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MockUserModel } = require('../utils/mockData');

// Get User model - use mock if DB not connected
const getUserModel = () => {
  return mongoose.connection.readyState === 1 ? User : MockUserModel;
};

// Generate JWT Token
const generateToken = (userId, role, isDeveloper) => {
  return jwt.sign(
    { userId, role, isDeveloper },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Register
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const UserModel = getUserModel();

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const user = new (UserModel === User ? User : require('../utils/mockData').MockUser)({
      email,
      password,
      firstName,
      lastName,
      role: 'user',
      isDeveloper: false,
    });

    await user.save();

    const token = generateToken(user._id, user.role, user.isDeveloper);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        trial: user.trial,
        subscription: user.subscription,
      },
      token,
    });
  } catch (error) {
    console.error('❌ Registration Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const UserModel = getUserModel();

    // Find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role, user.isDeveloper);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isDeveloper: user.isDeveloper,
        trial: user.trial,
        subscription: user.subscription,
        usage: user.usage,
      },
      token,
    });
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Developer Login/Registration (Auto-create on first login, login on subsequent attempts)
exports.developerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const UserModel = getUserModel();
    const { MockUser } = require('../utils/mockData');

    // Check if developer account exists
    let user = await UserModel.findOne({ email });

    // If user doesn't exist, create new developer account (first-time registration)
    if (!user) {
      user = new (UserModel === User ? User : MockUser)({
        email,
        password,
        firstName: email.split('@')[0], // Use email prefix as first name
        lastName: 'Developer',
        role: 'admin',
        isDeveloper: true,
      });
      await user.save();
      
      const token = generateToken(user._id, user.role, user.isDeveloper);
      
      return res.status(201).json({
        message: '🎉 Developer account created successfully!',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isDeveloper: user.isDeveloper,
          isNewAccount: true,
        },
        token,
      });
    }

    // If user exists, verify password for login
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Ensure developer privileges
    if (!user.isDeveloper) {
      user.isDeveloper = true;
      user.role = 'admin';
      await user.save();
    }

    const token = generateToken(user._id, user.role, user.isDeveloper);

    res.status(200).json({
      message: '✅ Developer login successful',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isDeveloper: user.isDeveloper,
        isNewAccount: false,
      },
      token,
    });
  } catch (error) {
    console.error('❌ Developer Login Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Developer Registration (Explicit signup with full details)
exports.developerRegister = async (req, res) => {
  try {
    console.log('📝 Developer Registration Request:', {
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      company: req.body.company,
    });

    const { email, password, firstName, lastName, company } = req.body;
    const UserModel = getUserModel();
    const { MockUser } = require('../utils/mockData');

    console.log('🔍 Using UserModel:', UserModel === User ? 'MongoDB' : 'Mock Data');

    // Check if developer already exists
    const existingDeveloper = await UserModel.findOne({ email });
    if (existingDeveloper) {
      console.log('⚠️  Email already exists:', email);
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Password validation
    if (password.length < 8) {
      console.log('❌ Password too short');
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    console.log('✍️  Creating new developer account...');

    // Create new developer account
    const developer = new (UserModel === User ? User : MockUser)({
      email,
      password,
      firstName,
      lastName,
      role: 'admin',
      isDeveloper: true,
      company: company || '',
    });

    console.log('💾 Saving developer...');
    await developer.save();
    console.log('✅ Developer saved successfully');

    const token = generateToken(developer._id, developer.role, developer.isDeveloper);

    console.log('🎫 Token generated:', token.substring(0, 20) + '...');

    res.status(201).json({
      message: '🎉 Developer account created successfully!',
      user: {
        id: developer._id,
        email: developer.email,
        firstName: developer.firstName,
        lastName: developer.lastName,
        company: developer.company,
        role: developer.role,
        isDeveloper: developer.isDeveloper,
      },
      token,
    });
  } catch (error) {
    console.error('❌ Developer Registration Error:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
};

// Logout
exports.logout = (req, res) => {
  try {
    // Token-based logout (client removes token)
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Current User
exports.getCurrentUser = async (req, res) => {
  try {
    const UserModel = getUserModel();
    const user = await UserModel.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('❌ Get User Error:', error);
    res.status(500).json({ error: error.message });
  }
};
