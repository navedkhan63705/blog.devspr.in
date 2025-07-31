const User = require("../models/User");
const generateToken = require("../utils/generateToken");

exports.registerUser = async (req, res) => {
  const { name, email, password, adminKey } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ 
      success: false,
      message: "Email already exists" 
    });

    // Determine user role based on admin key
    let userRole = 'user';
    if (adminKey) {
      if (adminKey === process.env.ADMIN_KEY) {
        userRole = 'admin';
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid admin key provided"
        });
      }
    }

    const user = await User.create({ 
      name, 
      email, 
      password, 
      role: userRole 
    });

    res.status(201).json({
      success: true,
      message: `${userRole === 'admin' ? 'Admin' : 'User'} registered successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: "Registration failed", 
      error: err.message 
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    // Debug log to see the actual request body
    console.log("Login Body:", req.body);

    // Fix if email is coming nested inside another object
    const { email, password } = 
      req.body.email && req.body.password ? req.body : req.body.email;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(400).json({ 
        success: false,
        message: "Invalid email or password" 
      });

    res.json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: "Login failed", 
      error: err.message 
    });
  }
};

