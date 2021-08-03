const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const isAuthenticated = require("../middlewares/isAuthenticated");

const Offer = require("../models/Offer");

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    const newOffer = new Offer({
      product_name: req.fields.title,
      product_description: req.fields.description,
      product_price: req.fields.price,
      product_details: [
        { MARQUE: req.fields.brand },
        { TAILLE: req.fields.size },
        { ETAT: req.fields.condition },
        { COULEUR: req.fields.color },
        { EMPLACEMENT: req.fields.city },
      ],
      owner: req.user,
    });
    const result = await cloudinary.uploader.upload(req.files.picture.path, {
      folder: `/vinted/offers/${newOffer._id}`,
    });

    newOffer.product_image = result;

    await newOffer.save();
    res.status(200).json(newOffer);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

router.put("/offer/modify", isAuthenticated, async (req, res) => {
  try {
    const offerToUpdate = await Offer.findById(req.fields._id);
    if (req.fields.title) {
      offerToUpdate.product_name = req.fields.title;
    }
    if (req.fields.description) {
      offerToUpdate.product_description = req.fields.description;
    }
    if (req.fields.price) {
      offerToUpdate.product_price = req.fields.price;
    }

    const details = offerToUpdate.product_details;
    for (let i = 0; i < details.length; i++) {
      if (req.fields.brand) {
        if (details[i].MARQUE) {
          details[i].MARQUE = req.fields.brand;
        }
      }
      if (req.fields.size) {
        if (details[i].TAILLE) {
          details[i].TAILLE = req.fields.size;
        }
      }
      if (req.fields.condition) {
        if (details[i].ETAT) {
          details[i].ETAT = req.fields.condition;
        }
      }
      if (req.fields.color) {
        if (details[i].COULEUR) {
          details[i].COULEUR = req.fields.color;
        }
      }
      if (req.fields.city) {
        if (details[i].EMPLACEMENT) {
          details[i].EMPLACEMENT = req.fields.city;
        }
      }
    }
    offerToUpdate.markModified("product_details");
    await offerToUpdate.save();

    res.status(200).json(offerToUpdate);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

router.delete("/offer/delete", isAuthenticated, async (req, res) => {
  try {
    if (req.fields._id) {
      await Offer.findByIdAndDelete(req.fields._id);
      res.status(200).json({ message: "Offer deleted" });
    } else {
      res.status(400).json({ message: "Offer not found" });
    }
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

router.get("/offer", async (req, res) => {
  try {
    // Title, priceMin et priceMax
    const filters = {};

    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }
    if (req.query.priceMin) {
      filters.product_price = { $gte: req.query.priceMin };
    }
    if (req.query.priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = req.query.priceMax;
      } else {
        filters.product_price = { $lte: req.query.priceMax };
      }
    }

    // Sort;
    const sort = {};

    if (req.query.sort === "price-asc") {
      sort.product_price = 1;
    }

    if (req.query.sort === "price-desc") {
      sort.product_price = -1;
    }

    let page;
    const limit = Number(req.query.limit) || 10;

    if (Number(req.query.page) < 1) {
      page = 1;
    } else {
      page = Number(req.query.page);
    }

    const offers = await Offer.find(filters)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("owner", "account");
    // .select("product_name product_price"); // pour une meilleure lisibilité
    res.status(200).json(offers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offers = await Offer.findById(req.params.id).populate(
      "owner",
      "account"
    );
    res.status(200).json({ offers });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
