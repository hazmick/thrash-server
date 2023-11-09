require("dotenv").config({ path: "../config.env" });
var Webhook = require("coinbase-commerce-node").Webhook;
const webhookSecret = "81bdd9ed-ab9e-421b-91e0-84047744526b";
var Express = require("express");
var router = Express.Router();
var app = Express();
const User = require("../models/User");
const connection = require("../config/db");

connection;

function rawBody(req, res, next) {
  req.setEncoding("utf8");
  var data = "";
  req.on("data", function (chunk) {
    data += chunk;
  }); 
  req.on("end", function () {
    req.rawBody = data;
    next();
  });
}

router.route("/").post(async (req, res) => {
  const rawBody = req.rawBody;
  const signature = req.headers["x-cc-webhook-signature"];
  const webhookSecret = "81bdd9ed-ab9e-421b-91e0-84047744526b";

  try {
    const event = Webhook.verifyEventBody(rawBody, signature, webhookSecret);

    if (event.type === "charge:pending") {
      console.log("Payment On the way");
      res.send("Payment On the way");
      return res.json("Payment on the way");
    }

    if (event.type === "charge:confirmed") {
      const person = await event.data.metadata.user;

      if (!person) {
        console.log("User not inserted");
        res.send("User not inserted");
        return;
      }

      const userInDb = await User.findOne({ email: person });

      if (!userInDb) {
        console.log("User not found");
        res.send("User not found");
        return;
      }

      userInDb.level = 1;

      console.log(userInDb);
      res.send("Payment Received");
      console.log("Payment Received");

      return await userInDb.save();
    }

    if (event.type === "charge:failed") {
      res.send("Something Happened and things went south");
      console.log("Something went wrong!");
    }

    res.send(`success ${event.id}`);
    console.log(`success ${event.id}`);
  } catch (error) {
    res.status(400).send("failure!");
  }
});

app.use(rawBody);
app.use(router);
app.listen(4000, function () {
  console.log("App listening on port 4000!");
});
