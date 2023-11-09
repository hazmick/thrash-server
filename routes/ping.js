const express = require('express');
const router = express.Router();

router.route("/").get((req, res, next) => {
    res.json({
        success: true,
        message: "Shit be buzzing in intervals of 10mins you dig 2@@1"
    })
}    )

module.exports = router;