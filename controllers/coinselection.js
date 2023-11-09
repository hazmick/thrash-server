const User = require("../models/User");

exports.coinselection = async(req, res, next) => {

    console.log(req.body)
    const person = await User.findOne({ email : req.body.user.email});

    person.coin = await req.body.coin;

    await person.save(); 

    res.send("Thank you for your coin selection. You're being redirected to your dashboard")

    console.log(req.body);
}