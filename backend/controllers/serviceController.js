const services = require("../models/serviceModel");

async function get(req, res) {
  try {
    res.json(await services.active());
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}
async function getAll(req, res) {
  try {
    res.json(await services.all());
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}
async function add(req, res) {
  try {
    const { serviceName, description, price, status } = req.body;
    if (!serviceName || price === undefined) return res.status(400).json({ message: "Service name and price are required" }); 
    const id = await services.create({ serviceName, description, price, status });
    res.status(201).json({ message: "Service added successfully", serviceId: id });
  } catch (e) { 
    console.error(e); 
    res.status(500).json({ message: "Server error" }); 
  }
}
async function update(req, res) { 
  try { 
    const n = await services.update(req.params.id, req.body); 
    if (!n) return res.status(404).json({ message: "Service not found" }); 
    res.json({ message: "Service updated successfully" }); 
  } catch (e) { 
    console.error(e); 
    res.status(500).json({ message: "Server error" }); 
  } 
}
async function remove(req, res) { 
  try { 
    const n = await services.remove(req.params.id); 
    if (!n) return res.status(404).json({ message: "Service not found" }); 
    res.json({ message: "Service deleted successfully" }); 
  } catch (e) { 
    console.error(e); 
    res.status(500).json({ message: "Server error" }); 
  } 
}

module.exports = { get, getAll, add, update, remove };