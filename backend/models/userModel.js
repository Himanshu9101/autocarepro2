const db = require("../config/database");
async function findByEmail(email) { 
  const [r] = await db.execute(
    "SELECT * FROM users WHERE email=? LIMIT 1", [email]
  );
  return r[0]; }
async function findById(id) {
  const [r] = await db.execute(
    "SELECT user_id,name,email,phone,role,created_at FROM users WHERE user_id=?", [id]
  );
  return r[0];
}

async function create(name, email, password, phone, role = "customer") {
  const [r] = await db.execute("INSERT INTO users (name,email,password,phone,role) VALUES (?,?,?,?,?)", [name, email, password, phone || null, role]);
  return r.insertId;
}

async function all() {
  const [r] = await db.execute("SELECT user_id,name,email,phone,role,created_at FROM users ORDER BY user_id DESC");
  return r;
}

async function updateProfile(id, name, phone) {
  await db.execute("UPDATE users SET name=?, phone=? WHERE user_id=?", [name, phone || null, id]);
  return findById(id);
}

async function remove(id) {
  const [result] = await db.execute(
    "DELETE FROM users WHERE user_id = ?",
    [id]
  );
  return result.affectedRows;
}
module.exports = { findByEmail, findById, create, all, updateProfile, remove };