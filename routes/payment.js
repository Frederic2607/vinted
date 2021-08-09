const express = require("express");
const formidable = require("express-formidable");
const router = express.Router();
const isAuthenticated = require("../middlewares/isAuthenticated");
const stripe = require("stripe")(
  "sk_test_51JLodcFTc2lW5LhwN3UXU466ouanDJSoRTFpFb3rbepL584zXyzUpoMR9pQiTO1EP0dilXDnwc65xW9mC7DOQxqv00dvx9XHkV"
);

router.post("/payment", isAuthenticated, async (req, res) => {
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
