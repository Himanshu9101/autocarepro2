const bookings = require("../models/bookingModel");
const vehicles = require("../models/vehicleModel");

async function create(req, res) {
  try {
    const { vehicleId, serviceId, bookingDate, remarks } = req.body;
    if (!vehicleId || !serviceId || !bookingDate) {
      return res.status(400).json({
        message: "Vehicle, service and date are required"
      });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minimumDate = new Date(today);
    minimumDate.setDate(minimumDate.getDate() + 7);
    const requestedDate = new Date(bookingDate + "T00:00:00");
    requestedDate.setHours(0, 0, 0, 0);
    if (requestedDate < minimumDate) {
      return res.status(400).json({
        message: "Service must be booked at least 7 days in advance."
      });
    }
    if (!await vehicles.byId(vehicleId, req.user.id)) {
      return res.status(403).json({
        message: "You cannot book this vehicle"
      });
    }
    const id = await bookings.create({
      vehicleId,
      serviceId,
      bookingDate,
      remarks
    });
    res.status(201).json({
      message: "Booking created successfully",
      bookingId: id
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Server error"
    });
  }
}
async function mine(req, res) {
  try {
    res.json(await bookings.byCustomer(req.user.id));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}
async function assigned(req, res) {
  try {
    res.json(await bookings.assignedToMechanic(req.user.id));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

async function all(req, res) {
  try {
    res.json(await bookings.all());
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}
async function one(req, res) {
  try {
    const b = await bookings.byId(req.params.id);
    if (!b) return res.status(404).json({ message: "Booking not found" });
    if (req.user.role === "customer") {
      const own = await bookings.byCustomer(req.user.id);
      if (!own.some(x => x.booking_id == req.params.id)) return res.status(403).json({ message: "Access denied" });
    }
    res.json(b);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

async function updateStatus(req, res) {
  try {
    const { status } = req.body;
    const booking = await bookings.findById(req.params.id);
    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "In Progress",
      "Completed",
      "Cancelled"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid booking status."
      });
    }
    if (
      req.user.role === "mechanic" &&
      booking.mechanic_id !== req.user.id
    ) {
      return res.status(403).json({
        message: "You are not assigned to this booking."
      });
    }
    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }
    if (booking.status === "Completed") {
      return res.status(400).json({
        message: "Completed bookings cannot be updated."
      });
    }
    const updated = await bookings.status(
      req.params.id,
      status
    );
    if (!updated) {
      return res.status(400).json({
        message: "Booking status could not be updated."
      });
    }
    res.json({
      message: "Booking status updated successfully"
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Server error"
    });
  }
}
async function assign(req, res) {
  try {
    if (!req.body.mechanicId) return res.status(400).json({ message: "Mechanic ID is required" });
    const n = await bookings.mechanic(req.params.id, req.body.mechanicId);
    if (!n) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Mechanic assigned successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

async function remove(req, res) {
  try {
    const n = await bookings.remove(req.params.id);
    if (!n) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Booking deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}
module.exports = { create, mine, assigned, all, one, updateStatus, assign, remove };