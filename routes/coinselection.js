const express = require("express");
const { coinselection } = require("../controllers/coinselection");
const router = express.Router();

router.route("/coinselection").post(coinselection);

module.exports = router;