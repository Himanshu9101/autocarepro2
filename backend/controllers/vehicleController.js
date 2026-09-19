const vehicles = require("../models/vehicleModel");

async function mine(req, res) {
  try {
    res.json(await vehicles.byUser(req.user.id));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

async function all(req, res) {
  try {
    res.json(await vehicles.all());
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

async function add(req, res) {
  try {
    const {
      registrationNo,
      brand,
      model,
      year,
      fuelType
    } = req.body;
    if (!registrationNo || !brand || !model) {
      return res.status(400).json({
        message: "Registration number, brand and model are required"
      });
    }
    const registrationPattern =
      /^[A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{4}$/;

    const registration =
      registrationNo.toUpperCase().trim();

    if (!registrationPattern.test(registration)) {
      return res.status(400).json({
        message: "Invalid vehicle registration number."
      });
    }
    
    let vehicleImage = null;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      vehicleImage = result.secure_url;
    }
    
    const id = await vehicles.create({
      userId: req.user.id,
      registrationNo: registration,
      brand,
      model,
      year,
      fuelType,
      vehicleImage
    });
    res.status(201).json({
      message: "Vehicle added successfully",
      vehicleId: id
    });
  } catch (e) {
    console.error(e);
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Registration number already exists"
      });
    }
    res.status(500).json({
      message: "Server error"
    });
  }
}

async function update(req, res) {
  try {
    const n = await vehicles.update(req.params.id, req.user.id, req.body);
    if (!n) return res.status(404).json({ message: "Vehicle not found" });
    res.json({ message: "Vehicle updated successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}
async function remove(req, res) {
  try {
    const n = await vehicles.remove(req.params.id, req.user.id);
    if (!n) return res.status(404).json({ message: "Vehicle not found" });
    res.json({ message: "Vehicle deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { mine, all, add, update, remove };
