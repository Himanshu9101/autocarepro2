const contact = require('../models/contactModel');

async function sendMessage(req, res) {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }
    const id = await contact.create(name, email, subject, message);
    res.status(201).json({ message: 'Message sent successfully', message_id: id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getMessages(req, res) {
  try {
    res.json(await contact.getAll());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

async function deleteMessage(req, res) {
  try {
    const deleted = await contact.remove(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Message not found' });
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { sendMessage, getMessages, deleteMessage };
