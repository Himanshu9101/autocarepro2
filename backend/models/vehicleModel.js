const db = require("../config/database");

async function byUser(userId) {
  const [rows] = await db.execute(
    "SELECT * FROM vehicles WHERE user_id=? ORDER BY vehicle_id DESC", [userId]);
  return rows;
}

async function all() {

  const [rows] = await db.execute(`
        SELECT
            v.vehicle_id,
            v.user_id,
            v.registration_no,
            v.brand,
            v.model,
            v.year,
            v.fuel_type,
            COALESCE(u.name, '-') AS owner_name
        FROM vehicles v
        LEFT JOIN users u
            ON v.user_id = u.user_id
        ORDER BY v.vehicle_id DESC
    `);
  return rows;
}

async function byId(id, userId = null) {
  let sql = "SELECT * FROM vehicles WHERE vehicle_id=?";
  const p = [id];
  if (userId !== null) { sql += " AND user_id=?"; 
  p.push(userId); }
  const [rows] = await db.execute(sql, p);
  return rows[0];
}

async function create(d) {
  const [r] = await db.execute(
    `INSERT INTO vehicles
    (user_id,registration_no,brand,model,year,fuel_type,vehicle_image)
    VALUES (?,?,?,?,?,?,?)`,
    [
      d.userId,
      d.registrationNo,
      d.brand,
      d.model,
      d.year || null,
      d.fuelType || null,
      d.vehicleImage || null
    ]
  );
  return r.insertId;
}

async function update(id, userId, d) {
  const [r] = await db.execute(
    "UPDATE vehicles SET registration_no=?,brand=?,model=?,year=?,fuel_type=? WHERE vehicle_id=? AND user_id=?",
    [d.registrationNo, d.brand, d.model, d.year || null, d.fuelType || null, id, userId]);
  return r.affectedRows;
}

async function remove(id, userId) {
  const [r] = await db.execute("DELETE FROM vehicles WHERE vehicle_id=? AND user_id=?", [id, userId]);
  return r.affectedRows;
}

module.exports = { byUser, all, byId, create, update, remove };