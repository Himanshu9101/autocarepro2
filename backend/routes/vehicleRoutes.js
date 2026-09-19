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

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});

router.get("/",protect,allowRoles("customer"),c.mine);

router.get("/all",protect,allowRoles("admin"),c.all);
router.post("/",protect,allowRoles("customer"),upload.single("vehicleImage"),c.add);
router.put("/:id",protect,allowRoles("customer"),c.update);
router.delete("/:id",protect,allowRoles("customer"),c.remove);
module.exports = router;
