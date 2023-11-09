const express = require('express');
const { private } = require('../controllers/private');
const router = express.Router();
const protection = require("../middleware/protect");

router.route("/").get(protection, private)

module.exports = router;