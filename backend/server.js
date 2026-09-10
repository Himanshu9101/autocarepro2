require("dotenv").config();
const fs = require("fs");
const express= require("express");
const path= require("path");

const app=express()
const PORT= process.env.PORT||3000;

app.use(express.json());
app.use(express.urlencoded({extended:true}));
const vehicleUploadDir = path.join(__dirname, "uploads", "vehicles");

if (!fs.existsSync(vehicleUploadDir)) {
  fs.mkdirSync(vehicleUploadDir, { recursive: true });
}
app.use(express.static(path.join(__dirname, "../public")));
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.get("/api",(req,res)=>res.json({message:"AutoCare Pro API is running"}));

app.use("/api/auth",require("./routes/authRoutes"));
app.use("/api/vehicles",require("./routes/vehicleRoutes"));
app.use("/api/services",require("./routes/serviceRoutes"));
app.use("/api/bookings",require("./routes/bookingRoutes"));
app.use("/api/contact",require("./routes/contactRoutes"));

app.use((req,res)=>{
  res.status(404).json({message:"Route not found"})
});

const db=require("./config/database");

app.listen(PORT,async()=>{
  console.log(`Server running at http://localhost:${PORT}`);
});