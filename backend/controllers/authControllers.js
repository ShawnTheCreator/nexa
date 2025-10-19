import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

const signup = async (req, res) => {
  try {
    // GET user data from frontend
    const {
      // required fields
      email,
      password,
      firstName,
      lastName,

      // not required fields
      studentNumber,
      campus,
      faculty,
      yearOfStudy,
    } = req.body;

    // Check if required fields are filled in
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        success: false, 
        message: "Please fill in required fields" 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide a valid email address" 
      });
    }

    // 🔒 ENHANCED PASSWORD VALIDATION
    const passwordErrors = [];
    if (password.length < 8) {
      passwordErrors.push("at least 8 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      passwordErrors.push("at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      passwordErrors.push("at least one lowercase letter");
    }
    if (!/\d/.test(password)) {
      passwordErrors.push("at least one number");
    }

    if (passwordErrors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Password must be ${passwordErrors.join(", and ")}.`
      });
    }

    // Check if user already exists
    let userAlreadyExists;
    if (!studentNumber) {
      userAlreadyExists = await User.findByEmail(email);
    } else {
      userAlreadyExists = await User.findByEmailAndStudentNumber(email, studentNumber);
    }

    if (userAlreadyExists) {
      return res.status(400).json({ 
        success: false, 
        message: "User already exists with this email" + (studentNumber ? " and student number" : "")
      });
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user data object
    const userData = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      studentNumber: studentNumber || null,
      campus: campus || null,
      faculty: faculty || null,
      yearOfStudy: yearOfStudy || null,
      verificationToken,
      verificationTokenExpiresAt,
    };

    // Create user in database
    const user = await User.create(userData);

  // Generate JWT token and set cookie (pass req so helper can infer domain in prod)
  generateTokenAndSetCookie(req, res, user.id);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: "Error creating user account" 
    });
  }
};

const login = async (req, res) => {
  // 🔍 DEBUG LOGS — ADDED HERE
  console.log("=== LOGIN DEBUG ===");
  console.log("Raw login body:", req.body);
  console.log("Email:", req.body.email);
  console.log("Password:", req.body.password);
  console.log("Password length:", req.body.password?.length);
  console.log("Email length:", req.body.email?.length);
  console.log("Email (quoted):", `"${req.body.email}"`);
  console.log("Password (quoted):", `"${req.body.password}"`);
  // 🔍 END DEBUG LOGS

  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide email and password" 
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

  // Generate JWT token and set cookie (pass req so helper can infer domain in prod)
  generateTokenAndSetCookie(req, res, user.id);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: "Error logging in" 
    });
  }
};

const logout = async (req, res) => {
  try {
    // Clear the JWT cookie (match attributes used when setting cookie)
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error('Logout error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: "Error logging out" 
    });
  }
};

// Verify email endpoint
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: "Verification token is required" 
      });
    }

    // Find user by verification token
    const user = await User.findByVerificationToken(token);
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired verification token" 
      });
    }

    // Check if token is expired
    if (user.verificationTokenExpiresAt < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: "Verification token has expired" 
      });
    }

    // Update user as verified
    await user.update({
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiresAt: null,
    });

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error('Email verification error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: "Error verifying email" 
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    // User is attached to req by auth middleware
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching user profile" 
    });
  }
};

export { signup, login, logout, verifyEmail, getProfile };