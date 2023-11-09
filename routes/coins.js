const express = require("express");
const {
  createCharge,
  createChargeAny,
  createCharge100,
  createCharge300,
  createCharge500,
  createCharge1000,
  createCharge5000,
  createCharge10000,
} = require("../controllers/coins");

const router = express.Router();

router.route("/createCharge").post(createCharge);
router.route("/createChargeany").post(createChargeAny);
router.route("/createCharge-100").post(createCharge100);
router.route("/createCharge-300").post(createCharge300);
router.route("/createCharge-500").post(createCharge500);
router.route("/createCharge-1000").post(createCharge1000);
router.route("/createCharge-5000").post(createCharge5000);
router.route("/createCharge-10000").post(createCharge10000);

module.exports = router;
