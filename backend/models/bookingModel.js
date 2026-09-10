const db = require("../config/database");

async function create(d) {
  const [r]=await db.execute(
    "INSERT INTO bookings (vehicle_id,service_id,mechanic_id,booking_date,status,remarks) VALUES (?,?,?,?,'Pending',?)",
    [d.vehicleId,d.serviceId,d.mechanicId||null,d.bookingDate,d.remarks||null]);
  return r.insertId;
}
async function byCustomer(userId) {
  const [rows]=await db.execute(`
    SELECT b.booking_id,b.booking_date,b.status,b.remarks,b.mechanic_id,
    v.vehicle_id,v.registration_no,v.brand,v.model,
    s.service_id,s.service_name,s.price,u.name AS mechanic_name
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id=v.vehicle_id
    JOIN services s ON b.service_id=s.service_id
    LEFT JOIN users u ON b.mechanic_id=u.user_id
    WHERE v.user_id=? ORDER BY b.booking_id DESC`,[userId]);
  return rows;
}
async function assignedToMechanic(mechanicId) {
  const [rows]=await db.execute(`
    SELECT b.booking_id,b.booking_date,b.status,b.remarks,b.mechanic_id,
    v.registration_no,v.brand,v.model,s.service_name,s.price,
    customer.name AS customer_name
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id=v.vehicle_id
    JOIN users customer ON v.user_id=customer.user_id
    JOIN services s ON b.service_id=s.service_id
    WHERE b.mechanic_id=? ORDER BY b.booking_id DESC`,[mechanicId]);
  return rows;
}

async function all() {
  const [rows]=await db.execute(`
    SELECT b.booking_id,b.booking_date,b.status,b.remarks,b.mechanic_id,
    v.registration_no,v.brand,v.model,s.service_name,s.price,
    c.name AS customer_name,m.name AS mechanic_name
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id=v.vehicle_id
    JOIN users c ON v.user_id=c.user_id
    JOIN services s ON b.service_id=s.service_id
    LEFT JOIN users m ON b.mechanic_id=m.user_id
    ORDER BY b.booking_id DESC`);
  return rows;
}
async function byId(id) {
  const [rows]=await db.execute(`
    SELECT
    b.*,v.registration_no,v.brand,v.model,v.vehicle_image,s.service_name,s.description,s.price,
    c.name AS customer_name,c.phone AS customer_phone,m.name AS mechanic_name
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id=v.vehicle_id
    JOIN users c ON v.user_id=c.user_id
    JOIN services s ON b.service_id=s.service_id
    LEFT JOIN users m ON b.mechanic_id=m.user_id
    WHERE b.booking_id=?`,[id]);
  return rows[0];
}
async function findById(id) {
  const [rows] = await db.execute(
    "SELECT * FROM bookings WHERE booking_id = ?",
    [id]
  );

  return rows[0];
}
async function status(id,status) {
  const [r]=await db.execute("UPDATE bookings SET status=? WHERE booking_id=?",[status,id]);
  return r.affectedRows;
}
async function mechanic(id,mechanicId) {
  const [r]=await db.execute("UPDATE bookings SET mechanic_id=? WHERE booking_id=?",[mechanicId,id]);
  return r.affectedRows;
}
async function remove(id) {
  const [r]=await db.execute("DELETE FROM bookings WHERE booking_id=?",[id]);
  return r.affectedRows;
}
module.exports={create,byCustomer,assignedToMechanic,all,byId,status,mechanic,remove,findById};