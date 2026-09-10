const db = require('../config/database');

async function create(name, email, subject, message) {
  const [result] = await db.execute(
    'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
    [name, email, subject, message]
  );
  return result.insertId;
}

async function getAll() {
  const [rows] = await db.execute(
    'SELECT * FROM contact_messages ORDER BY created_at DESC'
  );
  return rows;
}

async function remove(id) {
  const [result] = await db.execute('DELETE FROM contact_messages WHERE message_id = ?', [id]);
  return result.affectedRows;
}

module.exports = { create, getAll, remove };
