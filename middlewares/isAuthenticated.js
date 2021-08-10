// const User = require("../models/User");

// const isAuthenticated = async (req, res, next) => {
//   try {
//     if (req.headers.authorization) {
//       const user = await User.findOne({
//         token: req.headers.authorization.replace("Bearer ", ""),
//       }).select("_id token account");
//       if (user) {
//         req.user = user; // j'ajoute le user, mais sans le hash et le salt (voir .select())
//         next();
//       } else {
//         res.status(401).json({ message: "Unauthorized" });
//       }
//     } else {
//       res.status(401).json({ message: "Unauthorized" });
//     }
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// module.exports = isAuthenticated;

const User = require("../models/User");

// const isAuthenticated = async (req, res, next) => {
//   const token = req.headers.authorization.replace("Bearer ", "");
//   const user = await User.findOne({ token: token }).select("_id account token");
//   if (user) {
//     req.user = user;
//     return next();
//   } else {
//     return res.status(401).json({ message: "Unauthorized" });
//   }
// };

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.replace("Bearer ", "");

    const user = await User.findOne({ token: token }).select(
      "_id account token"
    );

    if (user) {
      req.user = user;
      next();
    } else {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
  } else {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
};

module.exports = isAuthenticated;
