const express = require("express");
const router = express.Router();
require("dotenv").config();
const isAuthenticated = require("../middlewares/isAuthenticated");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

router.post("/payment", async (req, res) => {
  try {
    const stripeToken = req.fields.stripeToken;
    console.log(stripeToken);
    const response = await stripe.charges.create({
      amount: req.fields.amount * 100,
      currency: "eur",
      description: `Paiement pour : ${req.fields.productName}`,
      source: stripeToken,
    });
    console.log(response.status);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
