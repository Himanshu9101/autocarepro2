const jwt = require("jsonwebtoken");

function protect(req,res,next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer "))
    return res.status(401).json({message:"Login required"});
  try {
    req.user = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({message:"Invalid or expired token"});
  }
}

function allowRoles(...roles) {
  return (req,res,next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({message:"Access denied"});
    next();
  };
}
module.exports = {protect, allowRoles};