exports.private = (req, res, next) => {
    res.json({
        success: true,
        message: "You have access to this private page",
        user: req.user
    })
}    