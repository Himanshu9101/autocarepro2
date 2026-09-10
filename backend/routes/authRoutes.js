const express= require("express"),
router=express.Router(),
c=require("../controllers/authController"),
{protect,allowRoles}=require("../middleware/authMiddleware");

router.post("/register",c.register);
router.post("/login",c.login);
router.get("/profile",protect,c.profile);
router.put("/profile",protect,c.updateProfile);
router.get("/users",protect,allowRoles("admin"),c.allUsers);
router.delete("/users/:id",protect,allowRoles("admin"),c.deleteUser);

module.exports=router;