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

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters long" 
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

    // Generate JWT token and set cookie
    generateTokenAndSetCookie(res, user.id);

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
  try {
    const { email, password } = req.body;

    // DEBUG: Log login attempt
    console.log('🔍 Login attempt:', { 
      email, 
      passwordLength: password?.length,
      passwordProvided: !!password 
    });

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide email and password" 
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    
    // DEBUG: Check if user exists
    console.log('👤 User found:', user ? 'YES' : 'NO');
    
    if (!user) {
      console.log('❌ No user found with email:', email);
      return res.status(400).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    // DEBUG: Check password hash format
    console.log('🔒 Stored password hash preview:', user.password?.substring(0, 20) + '...');
    console.log('🔒 Hash starts with $2b$ or $2a$?', user.password?.startsWith('$2b$') || user.password?.startsWith('$2a$'));
    console.log('🔒 Hash length:', user.password?.length);

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    // DEBUG: Password comparison result
    console.log('✅ Password comparison result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password validation failed for user:', email);
      return res.status(400).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    console.log('✅ Login successful for user:', email);

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate JWT token and set cookie
    generateTokenAndSetCookie(res, user.id);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    console.error('Full error:', error);
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
