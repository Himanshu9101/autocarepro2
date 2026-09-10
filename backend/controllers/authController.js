const bcrypt = require("bcrypt"),
  jwt = require("jsonwebtoken"),
  users = require("../models/userModel");

function token(u) {
  return jwt.sign(
    {
      id: u.user_id, role: u.role
    },
    process.env.JWT_SECRET, { expiresIn: "1d" }
  );
}

async function register(req, res) {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });
    if (await users.findByEmail(email)) return res.status(409).json({ message: "Email already registered" });
    const id = await users.create(name, email, await bcrypt.hash(password, 10), phone, "customer");
    const u = { user_id: id, name, email, phone, role: "customer" };
    res.status(201).json({ message: "Registration successful", token: token(u), user: u });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const u = await users.findByEmail(email);
    if (!u || !(await bcrypt.compare(password, u.password))) return res.status(401).json({ message: "Invalid email or password" });
    res.json({ message: "Login successful", token: token(u), user: { user_id: u.user_id, name: u.name, email: u.email, phone: u.phone, role: u.role } });
  } catch (e) {
    console.error(e); res.status(500).json({ message: "Server error" });
  }
}

async function profile(req, res) {
  try {
    const u = await users.findById(req.user.id);
    if (!u) return res.status(404).json({ message: "User not found" });
    res.json(u);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
}

async function updateProfile(req, res) {
  try {
    const { name, phone } = req.body;
    if (phone && !/^[0-9]{9,10}$/.test(phone)) {
      return res.status(400).json({
        message: "Phone number must contain 9 to 10 digits."
      });
    }
    if (!name) return res.status(400).json({ message: "Name is required" });
    res.json(await users.updateProfile(req.user.id, name, phone));
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
}

async function allUsers(req, res) {
  try {
    res.json(await users.all());
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
}

async function deleteUser(req, res) {
  try {
    const userId = Number(req.params.id);
    // Prevent admin from deleting their own account
    if (userId === req.user.id) {
      return res.status(400).json({
        message: "You cannot delete your own admin account"
      });
    }
    const deleted = await users.remove(userId);
    if (!deleted) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    res.json({
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
}
module.exports = { register, login, profile, updateProfile, allUsers, deleteUser };
