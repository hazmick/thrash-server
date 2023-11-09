require("dotenv").config({ path: "./config.env" });
var Express = require("express");
var router = Express.Router();
var app = Express();
const nodemailer = require("nodemailer");

router.route("/").get(async (req, res) => {
  const emailData = {
    from: process.env.EMAIL_FROM,
    to: "jeffscott1169@gmail.com",
    subject: "Account Check",
    html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Passive 500% Annual Revolutionary Investment</title>
    <style>
      @import url("https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,600;1,700;1,800;1,900&display=swap");

      html,
      body {
        font-family: "Poppins";
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      .imgH {
        width: auto;
        padding: 16px 0;
      }

      h1,
      h2,
      p {
        margin: 0;
        font-size: 0.9em;
      }

      li {
        font-size: 0.8em;
        line-height: 1.8em;
      }
    </style>
  </head>
  <body style="background-color: #fafafa">
    <div
      style="
        background-color: white;
        max-width: 600px;
        margin: 32px auto;
        padding: 16px;
      "
    >
      <div class="imgH">
        <img src="hazmick.svg" style="width: 100%; display: inline" />
      </div>
      <div style="padding: 16px 0">
        <div style="width: 100%; height: 2px; background-color: #eaeaea"></div>
      </div>
      <div style="padding: 8px 0">
        <h2 style="font-weight: bold">
          Passive 500% Annual Revolutionary Investment
        </h2>
      </div>
      <div style="padding: 8px 0">
        <p>
          <span style="font-weight: bold">Hazmick</span> is the future of crypto
          investments with 100% win rate.
        </p>
      </div>
      <div style="padding: 8px 0">
        <p>
          <span style="font-weight: bold">Who and What is Hazmick?</span>
        </p>
      </div>
      <div style="padding: 8px 0">
        <p>
          This is a Crypto Trading Firm founded by the Hariri Group in 2020, The
          premium goal of using Mick bots is to trade on selected crypto
          currency pairs without loosing a single trade. Technically and
          Fundamentally equipped
        </p>
      </div>
      <div style="padding: 8px 0">
        <img src="Hazmick2.jpg" style="width: 100%; display: inline" />
      </div>
      <div style="padding: 8px 0">
        <p>
          <span style="font-weight: bold">What are Mick Trading Bots?</span>
        </p>
      </div>
      <div style="padding: 8px 0">
        <p>
          Mick trading bots are bots that make 100% accurate trades on
          <span style="font-weight: bold">Cardano (ADA) and Tron (TRX)</span>.
        </p>
      </div>
      <div style="padding: 8px 0">
        <p>
          <span style="font-weight: bold">
            What is Hazmick gaining and why can't they just sell the bots to
            you?</span
          >
        </p>
      </div>
      <div style="padding: 8px 0">
        <p>
          Hazmick makes profit when you sign up with your one time $20
          membership fee and before you takeout your profit at the end of the
          year Hazmick is entitled to 20% of your 500% profit, So yes, You are
          actually taking back your capital and 480% profit of any investment
          size you make.
        </p>
      </div>
      <div style="padding: 8px 0">
        <p>
          The Mick trading bots are quite expensive to create in multiple copies
          and resell to people, For now, The available designs are rare and
          owned by the Hariri Group. We hope to design more mick bots that can
          follow up some other new coins in the future with a 100% win rate.
        </p>
      </div>
    </div>

    <div
      style="
        max-width: 600px;
        margin: 32px auto;
        padding: 16px;
        background-color: #1d4ed8;
        color: white;
      "
    >
      <div style="padding: 8px 05; text-align: center">
        <p>
          <span style="font-weight: bold"> How to sign up on Hazmick ?</span>
        </p>
      </div>
      <div style="padding: 8px 0">
        <ol>
          <li>
            Visit official website
            <a style="color: white" href="https://www.hazmick.io"
              >www.hazmick.io</a
            >
          </li>
          <li>Verify your email account</li>
          <li>
            Membership $20 which is one time after 3 days to 1 week of account
            authentication.
          </li>
          <li>Then choose an investment plan of your choice.</li>
        </ol>
      </div>
    </div>

    <div style="max-width: 600px; margin: 32px auto; padding: 16px;">
      <div
        style="
          padding: 8px 0;
          font-size: 0.75em;
          text-align: center;
        "
      >
        <p>Copyright © 2020-2023, Hazmick, All rights reserved.</p>
      </div>
      <div style="padding: 8px 0; text-align: center; font-size: 0.8em">
        <p>Our mailing address is:</p>
        <p style="text-decoration: underline">support@hazmick.io</p>
      </div>
      <div style="padding: 8px 0; text-align: center; font-size: 0.8em">
        <p>Want to change how you receive these emails?</p>
        <p>
          You can
          <a style="color: black;" href="https://www.hazmick.io;text-decoration: underline"
            >update your preferences</a
          >
          or
          <a style="color: black;" href="https://www.hazmick.io;text-decoration: underline"
            >unsubscribe from this list</a
          >.
        </p>
      </div>
    </div>
  </body>
</html>
`,
  };

  let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  transporter.sendMail(emailData, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
      return res.json({
        success: true,
        message:
          "An email verication link was sent to your email. Please click on it before you can login.",
      });
    }
  });
});

app.use(router);
app.listen(4000, function () {
  console.log("App listening on port 4000!");
});
