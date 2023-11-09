const ErrorResponse = require("../utils/errorResponse");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protection = async(req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1];
    }

    if(!token) {
        next(new ErrorResponse("You are not authorized to view this page !", 401))
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if(!user) {
            next(new ErrorResponse("You are not authorized to view this page !", 401));
        }
        req.user = user;
        next();

    } catch (error) {
        res.status(401).json({
        success: false,
        message: "Session Expired",
        });
    } 

} 

module.exports = protection;