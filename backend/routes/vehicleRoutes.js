const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const router = express.Router();

const c = require("../controllers/vehicleController");
const {
  protect,
  allowRoles
} = require("../middleware/authMiddleware");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/vehicles"));
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const filename =
      "vehicle-" +
      Date.now() +
      "-" +
      crypto.randomBytes(6).toString("hex") +
      extension;
    cb(null, filename);
  }
});
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only JPG, PNG and WEBP images are allowed.")
      );
    }
    cb(null, true);
  }
});
router.get("/",protect,allowRoles("customer"),c.mine);

router.get("/all",protect,allowRoles("admin"),c.all);
router.post("/",protect,allowRoles("customer"),upload.single("vehicleImage"),c.add);
router.put("/:id",protect,allowRoles("customer"),c.update);
router.delete("/:id",protect,allowRoles("customer"),c.remove);
module.exports = router;