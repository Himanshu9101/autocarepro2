const db = require("../config/database");

async function active() {
  const [rows]=await db.execute("SELECT * FROM services WHERE status='active' ORDER BY service_id DESC");
  return rows;
}
async function all() {
  const [rows]=await db.execute("SELECT * FROM services ORDER BY service_id DESC");
  return rows;
}
async function create(d) {
  const [r]=await db.execute(
    "INSERT INTO services (service_name,description,price,status) VALUES (?,?,?,?)",
    [d.serviceName,d.description||null,d.price,d.status||"active"]);
  return r.insertId;
}
async function update(id,d) {
  const [r]=await db.execute(
    "UPDATE services SET service_name=?,description=?,price=?,status=? WHERE service_id=?",
    [d.serviceName,d.description||null,d.price,d.status||"active",id]);
  return r.affectedRows;
}
async function remove(id) {
  const [r]=await db.execute("DELETE FROM services WHERE service_id=?",[id]);
  return r.affectedRows;
}
module.exports={active,all,create,update,remove};