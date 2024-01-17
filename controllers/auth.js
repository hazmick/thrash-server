const User = require("../models/User");
const Transaction = require("../models/Transaction");
const AccountInfo = require("../models/info");
const ErrorResponse = require("../utils/errorResponse");
const crypto = require("crypto");
const sendMail = require("../utils/sendMail");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const axios = require("axios");

exports.register = async (req, res, next) => {
  const { username, email, password } = req.body;

  User.findOne({
    email,
  }).exec((err, user) => {
    if (user) {
      return res.status(400).json({
        error: "Email is taken",
      });
    }
  });

  const token = jwt.sign(
    {
      username,
      email,
      password,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "360m",
    }
  );

  const emailData = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Email Account Verification",
    html: `<!DOCTYPE html>
    <html lang="en">
       <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Email Account Verification</title>
          <style>
             @import url("https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,600;1,700;1,800;1,900&display=swap");html,body {font-family: "Lato";box-sizing: border-box;margin: 0;padding: 0;}.imgH {width: auto;padding: 16px 0;}p {margin: 0;font-size: 0.9em;}li {font-size: 0.8em;line-height: 1.8em;}
          </style>
       </head>
       <body style="background-color: #fafafa">
          <div style="max-width: 520px;margin: 32px auto;padding: 16px;line-height: 24px;">
            <div class="imgH">
                <img src="https://www.titanmarketfx.com/Images/png/Logo.png" style="width: 100%; display: inline"/>
             </div>
             <div style="padding: 0 0 16px">
                <div style="width: 100%; height: 2px; background-color: #eaeaea">
                </div>
             </div>
             <div style="padding: 8px 0">
                <h3>Dear ${username},</h3>
             </div>
             <div style="padding: 8px 0">
                <p>Welcome to Titanmarketfx! We are delighted to have you here and look forward to helping you achieve your financial goals.</p>
             </div>
             <div style="padding: 8px 0">
                <p>To get started, you'll need to activate your account. This will allow you access your dashboard.</p>
             </div>
             <div style="padding: 8px 0">
                <p>To activate your account, simply click on the button below:</p>
             </div>
          </div>
    
          <div style="max-width: 600px; margin: 32px auto; padding: 16px; text-align: center;">
              <a
                title="Verify email address"
                href="https://titanmarketfx.com/auth/activate/${token}"
                target="_blank"
                style="background-color: #1d4ed8; color: white; padding: 14px 28px; text-decoration: none;text-align: center;">Verify email address</a>
          </div>
    
          <div style="max-width: 600px; margin: 32px auto; padding: 16px">
             <div style="padding: 8px 0; font-size: 0.75em; text-align: center">
                <p>Copyright © 2020-2023, Titanmarketfx, All rights reserved.</p>
             </div>
             <div style="padding: 8px 0; text-align: center; font-size: 0.8em">
                <p>Our mailing address is:</p>
                <p style="text-decoration: underline">support@titanmarketfx.xyz</p>
             </div>
             <div style="padding: 8px 0; text-align: center; font-size: 0.8em">
                <p>Want to change how you receive these emails? Reply this mail</p>
              </div>
          </div>
       </body>
    </html>`,
  };

  let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  transporter.sendMail(emailData, (err, info) => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse("Something went wrong!", 400));
    } else {
      console.log(info);
      return res.json({
        success: true,
        message:
          "An email verification link was sent to your email, please check your Inbox or Junk.",
      });
    }
  });
};

exports.activationController = (req, res, next) => {
  const { token } = req.body;
  const phone_number = "+1 111-2222-333";
  const house_address = ""
  const total_assets = 0;
  const total_withdrawals = 0;
  const mining = {
    gains: 0,
    balance: 0,
    plan: 0,
  };
  const trading = {
    gains: 0,
    balance: 0,
    plan: 0,
  };
  const staking = {
    gains: 0,
    balance: 0,
    plan: 0,
  };

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log("Activation error");
        return res.status(401).json({
          message: "Expired link. Signup again",
        });
      } else {
        const { username, email, password } = jwt.decode(token);

        console.log(email);
        const user = new User({
          username,
          phone_number,
          house_address,
          email,
          password,
          total_assets,
          total_withdrawals,
          mining,
          trading,
          staking,
        });

        user.save((err, user) => {
          if (err) {
            console.log("Save error");
            return res.status(401).json({
              message: "Account Error",
            });
          } else {
            const emailData = {
              from: process.env.EMAIL_FROM,
              to: email,
              subject: "Welcome to Titanmarketfx",
              html: `<!DOCTYPE html>
              <html lang="en">
                 <head>
                    <meta charset="UTF-8" />
                    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Welcome to Titanmarketfx</title>
                    <style>
                       @import url("https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,600;1,700;1,800;1,900&display=swap");html,body {font-family: "Lato";box-sizing: border-box;margin: 0;padding: 0;}.imgH {width: auto;padding: 16px 0;}p {margin: 0;font-size: 0.9em;}li {font-size: 0.8em;line-height: 1.8em;}
                    </style>
                 </head>
                 <body style="background-color: #fafafa">
                    <div style="max-width: 520px;margin: 32px auto;padding: 16px;line-height: 24px;">
                      <div class="imgH">
                          <img src="https://www.titanmarketfx.com/Images/png/Logo.png" style="width: 100%; display: inline"/>
                       </div>
                       <div style="padding: 0 0 16px">
                          <div style="width: 100%; height: 2px; background-color: #eaeaea">
                          </div>
                       </div>
                       <div style="padding: 8px 0">
                          <h3>Dear ${username},</h3>
                       </div>
                       <div style="padding: 8px 0">
                          <p>Thanks for signing up for Titanmarketfx!</p>
                       </div>
                       <div style="padding: 8px 0">
                          <p>We're excited to have you get started. First, you need to know Titanmarketfx will never ask you for your password or credentials, For more information about us, Kindly check our white paper and also subscribe to our YouTube channel for more useful videos about Titanmarketfx.
                            Titanmarketfx is your one platform, all things Crypto Mining, Staking and trading.</p>
                       </div>
                       <div style="padding: 24px 0 8px;">
                          <p style="font-weight: 700;">Signed</p>
                       <div style="padding: 4px 0">
                          <p>Management</p>
                       </div>
                       </div>
                    </div>
              
                    <div style="max-width: 600px; margin: 32px auto; padding: 16px; text-align: center;">
                        <a
                          title="View your dashboard"
                          href="https://titanmarketfx.com/dashboard"
                          target="_blank"
                          style="background-color: #1d4ed8; color: white; padding: 14px 28px; text-decoration: none;text-align: center;">View your dashboard</a>
                    </div>
              
                    <div style="max-width: 600px; margin: 32px auto; padding: 16px">
                       <div style="padding: 8px 0; font-size: 0.75em; text-align: center">
                          <p>Copyright © 2020-2023, Titanmarketfx, All rights reserved.</p>
                       </div>
                       <div style="padding: 8px 0; text-align: center; font-size: 0.8em">
                          <p>Our mailing address is:</p>
                          <p style="text-decoration: underline">support@titanmarketfx.xyz</p>
                       </div>
                       <div style="padding: 8px 0; text-align: center; font-size: 0.8em">
                          <p>Want to change how you receive these emails? Reply this mail</p>
                        </div>
                    </div>
                 </body>
              </html>`,
            };

            let transporter = nodemailer.createTransport({
              host: process.env.EMAIL_HOST,
              port: process.env.EMAIL_PORT,
              secure: process.env.EMAIL_SECURE,
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
              tls: {
                rejectUnauthorized: false,
              },
            });

            transporter.sendMail(emailData, (err, info) => {
              if (err) {
                console.log(err);
                return next(new ErrorResponse("Something went wrong!", 400));
              } else {
                const txnsss = {
                  general: {
                    information: "Welcome to your dashboard. Choose a staking, mining, trading plan to get started",
                    warning: "",
                    show: "i",
                  },
                  staking: {
                    information: "Welcome to your staking dashboard. Choose a staking plan to get started",
                    warning: "",
                    show: "i",
                  },
                  mining: {
                    information: "Welcome to your mining dashboard. Choose a mining plan to get started",
                    warning: "",
                    show: "i",
                  },
                  trading: {
                    information: "Welcome to your trading dashboard. Choose a trading plan to get started",
                    warning: "",
                    show: "i",
                  },
                };

                try {
                  const txns = new AccountInfo({
                    email: email,
                    info: txnsss,
                  });

                  txns.save((err, user) => {
                    if (err) {
                      console.log(err);
                      sendToken(user, 200, res);
                    } else {
                      res.status(200).json("Good");
                    }
                  });
                } catch (error) {
                  return next(new ErrorResponse("Something went wrong!", 400));
                }
              }
            });
          }
        });
      }
    });
  } else {
    return next(
      new ErrorResponse("Something went wrong, please try again", 400)
    );
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return next(
        new ErrorResponse("Please provide both Email and Password", 401)
      );
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorResponse("Email does not exists", 404));
    }

    const isMatch = await user.checkpasswords(password);

    if (!isMatch) {
      return next(
        new ErrorResponse("You have entered an invalid password"),
        401
      );
    }

    sendToken(user, 200, res);
  } catch (error) {
    return next(error);
  }
};

exports.forgotpassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    if (!email) {
      next(new ErrorResponse("Invalid Credentials", 404));
    }

    const user = await User.findOne({ email });

    if (!user) {
      next(new ErrorResponse("Email not found", 404));
    }

    const resetToken = await user.getResetPasswordToken();

    if (!resetToken) {
      next(new ErrorResponse("oops! An error occured", 401));
    }

    try {
      const emailData = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Password Reset",
        html: `<!DOCTYPE html>
        <html
          xmlns="http://www.w3.org/1999/xhtml"
          xmlns:v="urn:schemas-microsoft-com:vml"
          xmlns:o="urn:schemas-microsoft-com:office:office"
        >
          <head>
            <!-- NAME: 1 COLUMN -->
            <!--[if gte mso 15]>
              <xml>
                <o:OfficeDocumentSettings>
                  <o:AllowPNG />
                  <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
              </xml>
            <![endif]-->
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
        
            <style type="text/css">
              p {
                margin: 10px 0;
                padding: 0;
              }
              table {
                border-collapse: collapse;
              }
              h1,
              h2,
              h3,
              h4,
              h5,
              h6 {
                display: block;
                margin: 0;
                padding: 0;
              }
              img,
              a img {
                border: 0;
                height: auto;
                outline: none;
                text-decoration: none;
              }
              body,
              #bodyTable,
              #bodyCell {
                height: 100%;
                margin: 0;
                padding: 0;
                width: 100%;
              }
              .mcnPreviewText {
                display: none !important;
              }
              #outlook a {
                padding: 0;
              }
              img {
                -ms-interpolation-mode: bicubic;
              }
              table {
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
              }
              .ReadMsgBody {
                width: 100%;
              }
              .ExternalClass {
                width: 100%;
              }
              p,
              a,
              li,
              td,
              blockquote {
                mso-line-height-rule: exactly;
              }
              a[href^="tel"],
              a[href^="sms"] {
                color: inherit;
                cursor: default;
                text-decoration: none;
              }
              p,
              a,
              li,
              td,
              body,
              table,
              blockquote {
                -ms-text-size-adjust: 100%;
                -webkit-text-size-adjust: 100%;
              }
              .ExternalClass,
              .ExternalClass p,
              .ExternalClass td,
              .ExternalClass div,
              .ExternalClass span,
              .ExternalClass font {
                line-height: 100%;
              }
              a[x-apple-data-detectors] {
                color: inherit !important;
                text-decoration: none !important;
                font-size: inherit !important;
                font-family: inherit !important;
                font-weight: inherit !important;
                line-height: inherit !important;
              }
              #bodyCell {
                padding: 10px;
              }
              .templateContainer {
                max-width: 600px !important;
              }
              a.mcnButton {
                display: block;
              }
              .mcnImage,
              .mcnRetinaImage {
                vertical-align: bottom;
              }
              .mcnTextContent {
                word-break: break-word;
              }
              .mcnTextContent img {
                height: auto !important;
              }
              .mcnDividerBlock {
                table-layout: fixed !important;
              }
              /*
          @tab Page
          @section Background Style
          @tip Set the background color and top border for your email. You may want to choose colors that match your company's branding.
          */
              body,
              #bodyTable {
                /*@editable*/
                background-color: #fafafa;
              }
              /*
          @tab Page
          @section Background Style
          @tip Set the background color and top border for your email. You may want to choose colors that match your company's branding.
          */
              #bodyCell {
                /*@editable*/
                border-top: 0;
              }
              /*
          @tab Page
          @section Email Border
          @tip Set the border for your email.
          */
              .templateContainer {
                /*@editable*/
                border: 0;
              }
              /*
          @tab Page
          @section Heading 1
          @tip Set the styling for all first-level headings in your emails. These should be the largest of your headings.
          @style heading 1
          */
              h1 {
                /*@editable*/
                color: #202020;
                /*@editable*/
                font-family: Helvetica;
                /*@editable*/
                font-size: 26px;
                /*@editable*/
                font-style: normal;
                /*@editable*/
                font-weight: bold;
                /*@editable*/
                line-height: 125%;
                /*@editable*/
                letter-spacing: normal;
                /*@editable*/
                text-align: left;
              }
              /*
          @tab Page
          @section Heading 2
          @tip Set the styling for all second-level headings in your emails.
          @style heading 2
          */
              h2 {
                /*@editable*/
                color: #202020;
                /*@editable*/
                font-family: Helvetica;
                /*@editable*/
                font-size: 22px;
                /*@editable*/
                font-style: normal;
                /*@editable*/
                font-weight: bold;
                /*@editable*/
                line-height: 125%;
                /*@editable*/
                letter-spacing: normal;
                /*@editable*/
                text-align: left;
              }
              /*
          @tab Page
          @section Heading 3
          @tip Set the styling for all third-level headings in your emails.
          @style heading 3
          */
              h3 {
                /*@editable*/
                color: #202020;
                /*@editable*/
                font-family: Helvetica;
                /*@editable*/
                font-size: 20px;
                /*@editable*/
                font-style: normal;
                /*@editable*/
                font-weight: bold;
                /*@editable*/
                line-height: 125%;
                /*@editable*/
                letter-spacing: normal;
                /*@editable*/
                text-align: left;
              }
              /*
          @tab Page
          @section Heading 4
          @tip Set the styling for all fourth-level headings in your emails. These should be the smallest of your headings.
          @style heading 4
          */
              h4 {
                /*@editable*/
                color: #202020;
                /*@editable*/
                font-family: Helvetica;
                /*@editable*/
                font-size: 18px;
                /*@editable*/
                font-style: normal;
                /*@editable*/
                font-weight: bold;
                /*@editable*/
                line-height: 125%;
                /*@editable*/
                letter-spacing: normal;
                /*@editable*/
                text-align: left;
              }
              /*
          @tab Preheader
          @section Preheader Style
          @tip Set the background color and borders for your email's preheader area.
          */
              #templatePreheader {
                /*@editable*/
                background-color: #fafafa;
                /*@editable*/
                background-image: none;
                /*@editable*/
                background-repeat: no-repeat;
                /*@editable*/
                background-position: center;
                /*@editable*/
                background-size: cover;
                /*@editable*/
                border-top: 0;
                /*@editable*/
                border-bottom: 0;
                /*@editable*/
                padding-top: 9px;
                /*@editable*/
                padding-bottom: 9px;
              }
              /*
          @tab Preheader
          @section Preheader Text
          @tip Set the styling for your email's preheader text. Choose a size and color that is easy to read.
          */
              #templatePreheader .mcnTextContent,
              #templatePreheader .mcnTextContent p {
                /*@editable*/
                color: #656565;
                /*@editable*/
                font-family: Helvetica;
                /*@editable*/
                font-size: 12px;
                /*@editable*/
                line-height: 150%;
                /*@editable*/
                text-align: left;
              }
              /*
          @tab Preheader
          @section Preheader Link
          @tip Set the styling for your email's preheader links. Choose a color that helps them stand out from your text.
          */
              #templatePreheader .mcnTextContent a,
              #templatePreheader .mcnTextContent p a {
                /*@editable*/
                color: #656565;
                /*@editable*/
                font-weight: normal;
                /*@editable*/
                text-decoration: underline;
              }
              /*
          @tab Header
          @section Header Style
          @tip Set the background color and borders for your email's header area.
          */
              #templateHeader {
                /*@editable*/
                background-color: #ffffff;
                /*@editable*/
                background-image: none;
                /*@editable*/
                background-repeat: no-repeat;
                /*@editable*/
                background-position: center;
                /*@editable*/
                background-size: cover;
                /*@editable*/
                border-top: 0;
                /*@editable*/
                border-bottom: 0;
                /*@editable*/
                padding-top: 9px;
                /*@editable*/
                padding-bottom: 0;
              }
              /*
          @tab Header
          @section Header Text
          @tip Set the styling for your email's header text. Choose a size and color that is easy to read.
          */
              #templateHeader .mcnTextContent,
              #templateHeader .mcnTextContent p {
                /*@editable*/
                color: #202020;
                /*@editable*/
                font-family: Helvetica;
                /*@editable*/
                font-size: 16px;
                /*@editable*/
                line-height: 150%;
                /*@editable*/
                text-align: left;
              }
              /*
          @tab Header
          @section Header Link
          @tip Set the styling for your email's header links. Choose a color that helps them stand out from your text.
          */
              #templateHeader .mcnTextContent a,
              #templateHeader .mcnTextContent p a {
                /*@editable*/
                color: #007c89;
                /*@editable*/
                font-weight: normal;
                /*@editable*/
                text-decoration: underline;
              }
              /*
          @tab Body
          @section Body Style
          @tip Set the background color and borders for your email's body area.
          */
              #templateBody {
                /*@editable*/
                background-color: #ffffff;
                /*@editable*/
                background-image: none;
                /*@editable*/
                background-repeat: no-repeat;
                /*@editable*/
                background-position: center;
                /*@editable*/
                background-size: cover;
                /*@editable*/
                border-top: 0;
                /*@editable*/
                border-bottom: 2px solid #eaeaea;
                /*@editable*/
                padding-top: 0;
                /*@editable*/
                padding-bottom: 9px;
              }
              /*
          @tab Body
          @section Body Text
          @tip Set the styling for your email's body text. Choose a size and color that is easy to read.
          */
              #templateBody .mcnTextContent,
              #templateBody .mcnTextContent p {
                /*@editable*/
                color: #202020;
                /*@editable*/
                font-family: Helvetica;
                /*@editable*/
                font-size: 16px;
                /*@editable*/
                line-height: 150%;
                /*@editable*/
                text-align: left;
              }
              /*
          @tab Body
          @section Body Link
          @tip Set the styling for your email's body links. Choose a color that helps them stand out from your text.
          */
              #templateBody .mcnTextContent a,
              #templateBody .mcnTextContent p a {
                /*@editable*/
                color: #007c89;
                /*@editable*/
                font-weight: normal;
                /*@editable*/
                text-decoration: underline;
              }
              /*
          @tab Footer
          @section Footer Style
          @tip Set the background color and borders for your email's footer area.
          */
              #templateFooter {
                /*@editable*/
                background-color: #fafafa;
                /*@editable*/
                background-image: none;
                /*@editable*/
                background-repeat: no-repeat;
                /*@editable*/
                background-position: center;
                /*@editable*/
                background-size: cover;
                /*@editable*/
                border-top: 0;
                /*@editable*/
                border-bottom: 0;
                /*@editable*/
                padding-top: 9px;
                /*@editable*/
                padding-bottom: 9px;
              }
              /*
          @tab Footer
          @section Footer Text
          @tip Set the styling for your email's footer text. Choose a size and color that is easy to read.
          */
              #templateFooter .mcnTextContent,
              #templateFooter .mcnTextContent p {
                /*@editable*/
                color: #656565;
                /*@editable*/
                font-family: Helvetica;
                /*@editable*/
                font-size: 12px;
                /*@editable*/
                line-height: 150%;
                /*@editable*/
                text-align: center;
              }
              /*
          @tab Footer
          @section Footer Link
          @tip Set the styling for your email's footer links. Choose a color that helps them stand out from your text.
          */
              #templateFooter .mcnTextContent a,
              #templateFooter .mcnTextContent p a {
                /*@editable*/
                color: #656565;
                /*@editable*/
                font-weight: normal;
                /*@editable*/
                text-decoration: underline;
              }
              @media only screen and (min-width: 768px) {
                .templateContainer {
                  width: 600px !important;
                }
              }
              @media only screen and (max-width: 480px) {
                body,
                table,
                td,
                p,
                a,
                li,
                blockquote {
                  -webkit-text-size-adjust: none !important;
                }
              }
              @media only screen and (max-width: 480px) {
                body {
                  width: 100% !important;
                  min-width: 100% !important;
                }
              }
              @media only screen and (max-width: 480px) {
                .mcnRetinaImage {
                  max-width: 100% !important;
                }
              }
              @media only screen and (max-width: 480px) {
                .mcnImage {
                  width: 100% !important;
                }
              }
              @media only screen and (max-width: 480px) {
                .mcnCartContainer,
                .mcnCaptionTopContent,
                .mcnRecContentContainer,
                .mcnCaptionBottomContent,
                .mcnTextContentContainer,
                .mcnBoxedTextContentContainer,
                .mcnImageGroupContentContainer,
                .mcnCaptionLeftTextContentContainer,
                .mcnCaptionRightTextContentContainer,
                .mcnCaptionLeftImageContentContainer,
                .mcnCaptionRightImageContentContainer,
                .mcnImageCardLeftTextContentContainer,
                .mcnImageCardRightTextContentContainer,
                .mcnImageCardLeftImageContentContainer,
                .mcnImageCardRightImageContentContainer {
                  max-width: 100% !important;
                  width: 100% !important;
                }
              }
              @media only screen and (max-width: 480px) {
                .mcnBoxedTextContentContainer {
                  min-width: 100% !important;
                }
              }
              @media only screen and (max-width: 480px) {
                .mcnImageGroupContent {
                  padding: 9px !important;
                }
              }
              @media only screen and (max-width: 480px) {
                .mcnCaptionLeftContentOuter .mcnTextContent,
                .mcnCaptionRightContentOuter .mcnTextContent {
                  padding-top: 9px !important;
                }
              }
              @media only screen and (max-width: 480px) {
                .mcnImageCardTopImageContent,
                .mcnCaptionBottomContent:last-child .mcnCaptionBottomImageContent,
                .mcnCaptionBlockInner .mcnCaptionTopContent:last-child .mcnTextContent {
                  padding-top: 18px !important;
                }
              }
              @media only screen and (max-width: 480px) {
                .mcnImageCardBottomImageContent {
                  padding-bottom: 9px !important;
                }
              }
              @media only screen and (max-width: 480px) {
                .mcnImageGroupBlockInner {
                  padding-top: 0 !important;
                  padding-bottom: 0 !important;
                }
              }
              @media only screen and (max-width: 480px) {
                .mcnImageGroupBlockOuter {
                  padding-top: 9px !important;
                  padding-bottom: 9px !important;
                }
              }
              @media only screen and (max-width: 480px) {
                .mcnTextContent,
                .mcnBoxedTextContentColumn {
                  padding-right: 18px !important;
                  padding-left: 18px !important;
                }
              }
              @media only screen and (max-width: 480px) {
                .mcnImageCardLeftImageContent,
                .mcnImageCardRightImageContent {
                  padding-right: 18px !important;
                  padding-bottom: 0 !important;
                  padding-left: 18px !important;
                }
              }
              @media only screen and (max-width: 480px) {
                .mcpreview-image-uploader {
                  display: none !important;
                  width: 100% !important;
                }
              }
              @media only screen and (max-width: 480px) {
                /*
          @tab Mobile Styles
          @section Heading 1
          @tip Make the first-level headings larger in size for better readability on small screens.
          */
                h1 {
                  /*@editable*/
                  font-size: 22px !important;
                  /*@editable*/
                  line-height: 125% !important;
                }
              }
              @media only screen and (max-width: 480px) {
                /*
          @tab Mobile Styles
          @section Heading 2
          @tip Make the second-level headings larger in size for better readability on small screens.
          */
                h2 {
                  /*@editable*/
                  font-size: 20px !important;
                  /*@editable*/
                  line-height: 125% !important;
                }
              }
              @media only screen and (max-width: 480px) {
                /*
          @tab Mobile Styles
          @section Heading 3
          @tip Make the third-level headings larger in size for better readability on small screens.
          */
                h3 {
                  /*@editable*/
                  font-size: 18px !important;
                  /*@editable*/
                  line-height: 125% !important;
                }
              }
              @media only screen and (max-width: 480px) {
                /*
          @tab Mobile Styles
          @section Heading 4
          @tip Make the fourth-level headings larger in size for better readability on small screens.
          */
                h4 {
                  /*@editable*/
                  font-size: 16px !important;
                  /*@editable*/
                  line-height: 150% !important;
                }
              }
              @media only screen and (max-width: 480px) {
                /*
          @tab Mobile Styles
          @section Boxed Text
          @tip Make the boxed text larger in size for better readability on small screens. We recommend a font size of at least 16px.
          */
                .mcnBoxedTextContentContainer .mcnTextContent,
                .mcnBoxedTextContentContainer .mcnTextContent p {
                  /*@editable*/
                  font-size: 14px !important;
                  /*@editable*/
                  line-height: 150% !important;
                }
              }
              @media only screen and (max-width: 480px) {
                /*
          @tab Mobile Styles
          @section Preheader Visibility
          @tip Set the visibility of the email's preheader on small screens. You can hide it to save space.
          */
                #templatePreheader {
                  /*@editable*/
                  display: block !important;
                }
              }
              @media only screen and (max-width: 480px) {
                /*
          @tab Mobile Styles
          @section Preheader Text
          @tip Make the preheader text larger in size for better readability on small screens.
          */
                #templatePreheader .mcnTextContent,
                #templatePreheader .mcnTextContent p {
                  /*@editable*/
                  font-size: 14px !important;
                  /*@editable*/
                  line-height: 150% !important;
                }
              }
              @media only screen and (max-width: 480px) {
                /*
          @tab Mobile Styles
          @section Header Text
          @tip Make the header text larger in size for better readability on small screens.
          */
                #templateHeader .mcnTextContent,
                #templateHeader .mcnTextContent p {
                  /*@editable*/
                  font-size: 16px !important;
                  /*@editable*/
                  line-height: 150% !important;
                }
              }
              @media only screen and (max-width: 480px) {
                /*
          @tab Mobile Styles
          @section Body Text
          @tip Make the body text larger in size for better readability on small screens. We recommend a font size of at least 16px.
          */
                #templateBody .mcnTextContent,
                #templateBody .mcnTextContent p {
                  /*@editable*/
                  font-size: 16px !important;
                  /*@editable*/
                  line-height: 150% !important;
                }
              }
              @media only screen and (max-width: 480px) {
                /*
          @tab Mobile Styles
          @section Footer Text
          @tip Make the footer content text larger in size for better readability on small screens.
          */
                #templateFooter .mcnTextContent,
                #templateFooter .mcnTextContent p {
                  /*@editable*/
                  font-size: 14px !important;
                  /*@editable*/
                  line-height: 150% !important;
                }
              }
            </style>
          </head>
          <body>
            <center>
              <table
                align="center"
                border="0"
                cellpadding="0"
                cellspacing="0"
                height="100%"
                width="100%"
                id="bodyTable"
              >
                <tr>
                  <td align="center" valign="top" id="bodyCell">
                    <!-- BEGIN TEMPLATE // -->
                    <!--[if (gte mso 9)|(IE)]>
                                <table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
                                <tr>
                                <td align="center" valign="top" width="600" style="width:600px;">
                                <![endif]-->
                    <table
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      width="100%"
                      class="templateContainer"
                    >
                      <tr>
                        <td valign="top" id="templatePreheader"></td>
                      </tr>
                      <tr>
                        <td valign="top" id="templateHeader">
                          <table
                            border="0"
                            cellpadding="0"
                            cellspacing="0"
                            width="100%"
                            class="mcnImageBlock"
                            style="min-width: 100%"
                          >
                            <tbody class="mcnImageBlockOuter">
                              <tr>
                                <td
                                  valign="top"
                                  style="padding: 9px"
                                  class="mcnImageBlockInner"
                                >
                                  <table
                                    align="left"
                                    width="100%"
                                    border="0"
                                    cellpadding="0"
                                    cellspacing="0"
                                    class="mcnImageContentContainer"
                                    style="min-width: 100%"
                                  >
                                    <tbody>
                                      <tr>
                                        <td
                                          class="mcnImageContent"
                                          valign="top"
                                          style="
                                            padding-right: 9px;
                                            padding-left: 9px;
                                            padding-top: 0;
                                            padding-bottom: 0;
                                            text-align: center;
                                          "
                                        >
                                          <img
                                            align="center"
                                            alt="Reset Password"
                                            src="https://www.titanmarketfx.com/Images/png/Logo.png"
                                            width="284"
                                            style="
                                              max-width: 284px;
                                              padding-bottom: 0;
                                              display: inline !important;
                                              vertical-align: bottom;
                                            "
                                            class="mcnImage"
                                          />
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <table
                            border="0"
                            cellpadding="0"
                            cellspacing="0"
                            width="100%"
                            class="mcnDividerBlock"
                            style="min-width: 100%"
                          >
                            <tbody class="mcnDividerBlockOuter">
                              <tr>
                                <td
                                  class="mcnDividerBlockInner"
                                  style="min-width: 100%; padding: 18px"
                                >
                                  <table
                                    class="mcnDividerContent"
                                    border="0"
                                    cellpadding="0"
                                    cellspacing="0"
                                    width="100%"
                                    style="
                                      min-width: 100%;
                                      border-top: 2px solid #eaeaea;
                                    "
                                  >
                                    <tbody>
                                      <tr>
                                        <td>
                                          <span></span>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <!--            
                        <td class="mcnDividerBlockInner" style="padding: 18px;">
                        <hr class="mcnDividerContent" style="border-bottom-color:none; border-left-color:none; border-right-color:none; border-bottom-width:0; border-left-width:0; border-right-width:0; margin-top:0; margin-right:0; margin-bottom:0; margin-left:0;" />
        -->
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <table
                            border="0"
                            cellpadding="0"
                            cellspacing="0"
                            width="100%"
                            class="mcnTextBlock"
                            style="min-width: 100%"
                          >
                            <tbody class="mcnTextBlockOuter">
                              <tr>
                                <td
                                  valign="top"
                                  class="mcnTextBlockInner"
                                  style="padding-top: 9px"
                                >
                                  <!--[if mso]>
                <table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
                <tr>
                <![endif]-->
        
                                  <!--[if mso]>
                <td valign="top" width="600" style="width:600px;">
                <![endif]-->
                                  <table
                                    align="left"
                                    border="0"
                                    cellpadding="0"
                                    cellspacing="0"
                                    style="max-width: 100%; min-width: 100%"
                                    width="100%"
                                    class="mcnTextContentContainer"
                                  >
                                    <tbody>
                                      <tr>
                                        <td
                                          valign="top"
                                          class="mcnTextContent"
                                          style="
                                            padding-top: 0;
                                            padding-right: 18px;
                                            padding-bottom: 9px;
                                            padding-left: 18px;
                                          "
                                        >
                                          <h1 style="text-align: center">
                                            <span
                                              style="
                                                font-family: helvetica neue, helvetica,
                                                  arial, verdana, sans-serif;
                                              "
                                              >You have requested to reset your
                                              password</span
                                            >
                                          </h1>
                                          &nbsp;
        
                                          <div style="text-align: center">
                                            <span
                                              style="
                                                font-family: helvetica neue, helvetica,
                                                  arial, verdana, sans-serif;
                                              "
                                              >We cannot simply send you your old
                                              password. A unique link to reset your
                                              password has been generated for you. To
                                              reset your password, click the following
                                              link and follow the instructions.</span
                                            >
                                          </div>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <!--[if mso]>
                </td>
                <![endif]-->
        
                                  <!--[if mso]>
                </tr>
                </table>
                <![endif]-->
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <table
                            border="0"
                            cellpadding="0"
                            cellspacing="0"
                            width="100%"
                            class="mcnButtonBlock"
                            style="min-width: 100%"
                          >
                            <tbody class="mcnButtonBlockOuter">
                              <tr>
                                <td
                                  style="
                                    padding-top: 0;
                                    padding-right: 18px;
                                    padding-bottom: 18px;
                                    padding-left: 18px;
                                  "
                                  valign="top"
                                  align="center"
                                  class="mcnButtonBlockInner"
                                >
                                  <table
                                    border="0"
                                    cellpadding="0"
                                    cellspacing="0"
                                    class="mcnButtonContentContainer"
                                    style="
                                      border-collapse: separate !important;
                                      border-radius: 4px;
                                      background-color: #295ae5;
                                    "
                                  >
                                    <tbody>
                                      <tr>
                                        <td
                                          align="center"
                                          valign="middle"
                                          class="mcnButtonContent"
                                          style="
                                            font-family: Arial;
                                            font-size: 16px;
                                            padding: 18px;
                                          "
                                        >
                                          <a
                                            class="mcnButton"
                                            title="Reset Password"
                                            href="https://titanmarketfx.com/auth/resetpassword/${resetToken}"
                                            target="_blank"
                                            style="
                                              font-weight: bold;
                                              letter-spacing: normal;
                                              line-height: 100%;
                                              text-align: center;
                                              text-decoration: none;
                                              color: #ffffff;
                                            "
                                            >Reset Password</a
                                          >
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td valign="top" id="templateBody"></td>
                      </tr>
                      <tr>
                        <td valign="top" id="templateFooter">
                          <table
                            border="0"
                            cellpadding="0"
                            cellspacing="0"
                            width="100%"
                            class="mcnDividerBlock"
                            style="min-width: 100%"
                          >
                            <tbody class="mcnDividerBlockOuter">
                              <tr>
                                <td
                                  class="mcnDividerBlockInner"
                                  style="min-width: 100%; padding: 10px 18px 25px"
                                >
                                  <table
                                    class="mcnDividerContent"
                                    border="0"
                                    cellpadding="0"
                                    cellspacing="0"
                                    width="100%"
                                    style="
                                      min-width: 100%;
                                      border-top: 2px solid #eeeeee;
                                    "
                                  >
                                    <tbody>
                                      <tr>
                                        <td>
                                          <span></span>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <!--            
                        <td class="mcnDividerBlockInner" style="padding: 18px;">
                        <hr class="mcnDividerContent" style="border-bottom-color:none; border-left-color:none; border-right-color:none; border-bottom-width:0; border-left-width:0; border-right-width:0; margin-top:0; margin-right:0; margin-bottom:0; margin-left:0;" />
        -->
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <table
                            border="0"
                            cellpadding="0"
                            cellspacing="0"
                            width="100%"
                            class="mcnTextBlock"
                            style="min-width: 100%"
                          >
                            <tbody class="mcnTextBlockOuter">
                              <tr>
                                <td
                                  valign="top"
                                  class="mcnTextBlockInner"
                                  style="padding-top: 9px"
                                >
                                  <!--[if mso]>
                <table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
                <tr>
                <![endif]-->
        
                                  <!--[if mso]>
                <td valign="top" width="600" style="width:600px;">
                <![endif]-->
                                  <table
                                    align="left"
                                    border="0"
                                    cellpadding="0"
                                    cellspacing="0"
                                    style="max-width: 100%; min-width: 100%"
                                    width="100%"
                                    class="mcnTextContentContainer"
                                  >
                                    <tbody>
                                      <tr>
                                        <td
                                          valign="top"
                                          class="mcnTextContent"
                                          style="
                                            padding-top: 0;
                                            padding-right: 18px;
                                            padding-bottom: 9px;
                                            padding-left: 18px;
                                          "
                                        >
                                          <em
                                            >Copyright © 2020-2023, Titanmarketfx, All rights
                                            reserved.</em
                                          ><br />
                                          <br />
                                          <strong>Our mailing address is:</strong><br />
                                          <a
                                            href="mailto:support@titanmarketfx.com"
                                            target="_blank"
                                            >support@titanmarketfx.com</a
                                          ><br />
                                          <br />
                                          Want to change how you receive these
                                          emails?<br />
                                          You can
                                          <a href="*|UPDATE_PROFILE|*"
                                            >update your preferences</a
                                          >
                                          or
                                          <a href="*|UNSUB|*"
                                            >unsubscribe from this list</a
                                          >.
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <!--[if mso]>
                </td>
                <![endif]-->
        
                                  <!--[if mso]>
                </tr>
                </table>
                <![endif]-->
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <!--[if (gte mso 9)|(IE)]>
                                </td>
                                </tr>
                                </table>
                                <![endif]-->
                    <!-- // END TEMPLATE -->
                  </td>
                </tr>
              </table>
            </center>
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
        tls: {
          rejectUnauthorized: false,
        },
      });

      transporter.sendMail(emailData, (err, info) => {
        if (err) {
          console.log(err);
          return next(new ErrorResponse("Something went wrong!", 400));
        } else {
          console.log(info);
          return res.json({
            success: true,
            message:
              "A password reset link was sent to your email, please check your Inbox or Junk.",
          });
        }
      });

      await user.save();
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();
      next(new ErrorResponse("Email not sent !", 401));
    }
  } catch (error) {
    next(error);
  }
};

exports.resetpassword = async (req, res, next) => {
  const { password } = req.body;
  const resetToken = req.params.resetToken;

  try {
    if (!resetToken) {
      next(new ErrorResponse("Link has been expired", 400));
    }

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    if (!resetPasswordToken) {
      next(new ErrorResponse("Please try again! Link has expired."), 404);
    }

    const user = await User.findOne({ resetPasswordToken });

    if (!user) {
      next(new ErrorResponse("Please try again! Link has expired."), 404);
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    const emailData = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Password has been changed successfully",
      html: `<!DOCTYPE html>
      <html
        xmlns="http://www.w3.org/1999/xhtml"
        xmlns:v="urn:schemas-microsoft-com:vml"
        xmlns:o="urn:schemas-microsoft-com:office:office"
      >
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
      
          <style type="text/css">
            p {
              margin: 10px 0;
              padding: 0;
            }
            table {
              border-collapse: collapse;
            }
            h1,
            h2,
            h3,
            h4,
            h5,
            h6 {
              display: block;
              margin: 0;
              padding: 0;
            }
            img,
            a img {
              border: 0;
              height: auto;
              outline: none;
              text-decoration: none;
            }
            body,
            #bodyTable,
            #bodyCell {
              height: 100%;
              margin: 0;
              padding: 0;
              width: 100%;
            }
            .mcnPreviewText {
              display: none !important;
            }
            #outlook a {
              padding: 0;
            }
            img {
              -ms-interpolation-mode: bicubic;
            }
            table {
              mso-table-lspace: 0pt;
              mso-table-rspace: 0pt;
            }
            .ReadMsgBody {
              width: 100%;
            }
            .ExternalClass {
              width: 100%;
            }
            p,
            a,
            li,
            td,
            blockquote {
              mso-line-height-rule: exactly;
            }
            a[href^="tel"],
            a[href^="sms"] {
              color: inherit;
              cursor: default;
              text-decoration: none;
            }
            p,
            a,
            li,
            td,
            body,
            table,
            blockquote {
              -ms-text-size-adjust: 100%;
              -webkit-text-size-adjust: 100%;
            }
            .ExternalClass,
            .ExternalClass p,
            .ExternalClass td,
            .ExternalClass div,
            .ExternalClass span,
            .ExternalClass font {
              line-height: 100%;
            }
            a[x-apple-data-detectors] {
              color: inherit !important;
              text-decoration: none !important;
              font-size: inherit !important;
              font-family: inherit !important;
              font-weight: inherit !important;
              line-height: inherit !important;
            }
            #bodyCell {
              padding: 10px;
            }
            .templateContainer {
              max-width: 600px !important;
            }
            a.mcnButton {
              display: block;
            }
            .mcnImage,
            .mcnRetinaImage {
              vertical-align: bottom;
            }
            .mcnTextContent {
              word-break: break-word;
            }
            .mcnTextContent img {
              height: auto !important;
            }
            .mcnDividerBlock {
              table-layout: fixed !important;
            }
            /*
        @tab Page
        @section Background Style
        @tip Set the background color and top border for your email. You may want to choose colors that match your company's branding.
        */
            body,
            #bodyTable {
              /*@editable*/
              background-color: #fafafa;
            }
            /*
        @tab Page
        @section Background Style
        @tip Set the background color and top border for your email. You may want to choose colors that match your company's branding.
        */
            #bodyCell {
              /*@editable*/
              border-top: 0;
            }
            /*
        @tab Page
        @section Email Border
        @tip Set the border for your email.
        */
            .templateContainer {
              /*@editable*/
              border: 0;
            }
            /*
        @tab Page
        @section Heading 1
        @tip Set the styling for all first-level headings in your emails. These should be the largest of your headings.
        @style heading 1
        */
            h1 {
              /*@editable*/
              color: #202020;
              /*@editable*/
              font-family: Helvetica;
              /*@editable*/
              font-size: 26px;
              /*@editable*/
              font-style: normal;
              /*@editable*/
              font-weight: bold;
              /*@editable*/
              line-height: 125%;
              /*@editable*/
              letter-spacing: normal;
              /*@editable*/
              text-align: left;
            }
            /*
        @tab Page
        @section Heading 2
        @tip Set the styling for all second-level headings in your emails.
        @style heading 2
        */
            h2 {
              /*@editable*/
              color: #202020;
              /*@editable*/
              font-family: Helvetica;
              /*@editable*/
              font-size: 22px;
              /*@editable*/
              font-style: normal;
              /*@editable*/
              font-weight: bold;
              /*@editable*/
              line-height: 125%;
              /*@editable*/
              letter-spacing: normal;
              /*@editable*/
              text-align: left;
            }
            /*
        @tab Page
        @section Heading 3
        @tip Set the styling for all third-level headings in your emails.
        @style heading 3
        */
            h3 {
              /*@editable*/
              color: #202020;
              /*@editable*/
              font-family: Helvetica;
              /*@editable*/
              font-size: 20px;
              /*@editable*/
              font-style: normal;
              /*@editable*/
              font-weight: bold;
              /*@editable*/
              line-height: 125%;
              /*@editable*/
              letter-spacing: normal;
              /*@editable*/
              text-align: left;
            }
            /*
        @tab Page
        @section Heading 4
        @tip Set the styling for all fourth-level headings in your emails. These should be the smallest of your headings.
        @style heading 4
        */
            h4 {
              /*@editable*/
              color: #202020;
              /*@editable*/
              font-family: Helvetica;
              /*@editable*/
              font-size: 18px;
              /*@editable*/
              font-style: normal;
              /*@editable*/
              font-weight: bold;
              /*@editable*/
              line-height: 125%;
              /*@editable*/
              letter-spacing: normal;
              /*@editable*/
              text-align: left;
            }
            /*
        @tab Preheader
        @section Preheader Style
        @tip Set the background color and borders for your email's preheader area.
        */
            #templatePreheader {
              /*@editable*/
              background-color: #fafafa;
              /*@editable*/
              background-image: none;
              /*@editable*/
              background-repeat: no-repeat;
              /*@editable*/
              background-position: center;
              /*@editable*/
              background-size: cover;
              /*@editable*/
              border-top: 0;
              /*@editable*/
              border-bottom: 0;
              /*@editable*/
              padding-top: 9px;
              /*@editable*/
              padding-bottom: 9px;
            }
            /*
        @tab Preheader
        @section Preheader Text
        @tip Set the styling for your email's preheader text. Choose a size and color that is easy to read.
        */
            #templatePreheader .mcnTextContent,
            #templatePreheader .mcnTextContent p {
              /*@editable*/
              color: #656565;
              /*@editable*/
              font-family: Helvetica;
              /*@editable*/
              font-size: 12px;
              /*@editable*/
              line-height: 150%;
              /*@editable*/
              text-align: left;
            }
            /*
        @tab Preheader
        @section Preheader Link
        @tip Set the styling for your email's preheader links. Choose a color that helps them stand out from your text.
        */
            #templatePreheader .mcnTextContent a,
            #templatePreheader .mcnTextContent p a {
              /*@editable*/
              color: #656565;
              /*@editable*/
              font-weight: normal;
              /*@editable*/
              text-decoration: underline;
            }
            /*
        @tab Header
        @section Header Style
        @tip Set the background color and borders for your email's header area.
        */
            #templateHeader {
              /*@editable*/
              background-color: #ffffff;
              /*@editable*/
              background-image: none;
              /*@editable*/
              background-repeat: no-repeat;
              /*@editable*/
              background-position: center;
              /*@editable*/
              background-size: cover;
              /*@editable*/
              border-top: 0;
              /*@editable*/
              border-bottom: 0;
              /*@editable*/
              padding-top: 9px;
              /*@editable*/
              padding-bottom: 0;
            }
            /*
        @tab Header
        @section Header Text
        @tip Set the styling for your email's header text. Choose a size and color that is easy to read.
        */
            #templateHeader .mcnTextContent,
            #templateHeader .mcnTextContent p {
              /*@editable*/
              color: #202020;
              /*@editable*/
              font-family: Helvetica;
              /*@editable*/
              font-size: 16px;
              /*@editable*/
              line-height: 150%;
              /*@editable*/
              text-align: left;
            }
            /*
        @tab Header
        @section Header Link
        @tip Set the styling for your email's header links. Choose a color that helps them stand out from your text.
        */
            #templateHeader .mcnTextContent a,
            #templateHeader .mcnTextContent p a {
              /*@editable*/
              color: #007c89;
              /*@editable*/
              font-weight: normal;
              /*@editable*/
              text-decoration: underline;
            }
            /*
        @tab Body
        @section Body Style
        @tip Set the background color and borders for your email's body area.
        */
            #templateBody {
              /*@editable*/
              background-color: #ffffff;
              /*@editable*/
              background-image: none;
              /*@editable*/
              background-repeat: no-repeat;
              /*@editable*/
              background-position: center;
              /*@editable*/
              background-size: cover;
              /*@editable*/
              border-top: 0;
              /*@editable*/
              border-bottom: 2px solid #eaeaea;
              /*@editable*/
              padding-top: 0;
              /*@editable*/
              padding-bottom: 9px;
            }
            /*
        @tab Body
        @section Body Text
        @tip Set the styling for your email's body text. Choose a size and color that is easy to read.
        */
            #templateBody .mcnTextContent,
            #templateBody .mcnTextContent p {
              /*@editable*/
              color: #202020;
              /*@editable*/
              font-family: Helvetica;
              /*@editable*/
              font-size: 16px;
              /*@editable*/
              line-height: 150%;
              /*@editable*/
              text-align: left;
            }
            /*
        @tab Body
        @section Body Link
        @tip Set the styling for your email's body links. Choose a color that helps them stand out from your text.
        */
            #templateBody .mcnTextContent a,
            #templateBody .mcnTextContent p a {
              /*@editable*/
              color: #007c89;
              /*@editable*/
              font-weight: normal;
              /*@editable*/
              text-decoration: underline;
            }
            /*
        @tab Footer
        @section Footer Style
        @tip Set the background color and borders for your email's footer area.
        */
            #templateFooter {
              /*@editable*/
              background-color: #fafafa;
              /*@editable*/
              background-image: none;
              /*@editable*/
              background-repeat: no-repeat;
              /*@editable*/
              background-position: center;
              /*@editable*/
              background-size: cover;
              /*@editable*/
              border-top: 0;
              /*@editable*/
              border-bottom: 0;
              /*@editable*/
              padding-top: 9px;
              /*@editable*/
              padding-bottom: 9px;
            }
            /*
        @tab Footer
        @section Footer Text
        @tip Set the styling for your email's footer text. Choose a size and color that is easy to read.
        */
            #templateFooter .mcnTextContent,
            #templateFooter .mcnTextContent p {
              /*@editable*/
              color: #656565;
              /*@editable*/
              font-family: Helvetica;
              /*@editable*/
              font-size: 12px;
              /*@editable*/
              line-height: 150%;
              /*@editable*/
              text-align: center;
            }
            /*
        @tab Footer
        @section Footer Link
        @tip Set the styling for your email's footer links. Choose a color that helps them stand out from your text.
        */
            #templateFooter .mcnTextContent a,
            #templateFooter .mcnTextContent p a {
              /*@editable*/
              color: #656565;
              /*@editable*/
              font-weight: normal;
              /*@editable*/
              text-decoration: underline;
            }
            @media only screen and (min-width: 768px) {
              .templateContainer {
                width: 600px !important;
              }
            }
            @media only screen and (max-width: 480px) {
              body,
              table,
              td,
              p,
              a,
              li,
              blockquote {
                -webkit-text-size-adjust: none !important;
              }
            }
            @media only screen and (max-width: 480px) {
              body {
                width: 100% !important;
                min-width: 100% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .mcnRetinaImage {
                max-width: 100% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .mcnImage {
                width: 100% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .mcnCartContainer,
              .mcnCaptionTopContent,
              .mcnRecContentContainer,
              .mcnCaptionBottomContent,
              .mcnTextContentContainer,
              .mcnBoxedTextContentContainer,
              .mcnImageGroupContentContainer,
              .mcnCaptionLeftTextContentContainer,
              .mcnCaptionRightTextContentContainer,
              .mcnCaptionLeftImageContentContainer,
              .mcnCaptionRightImageContentContainer,
              .mcnImageCardLeftTextContentContainer,
              .mcnImageCardRightTextContentContainer,
              .mcnImageCardLeftImageContentContainer,
              .mcnImageCardRightImageContentContainer {
                max-width: 100% !important;
                width: 100% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .mcnBoxedTextContentContainer {
                min-width: 100% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .mcnImageGroupContent {
                padding: 9px !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .mcnCaptionLeftContentOuter .mcnTextContent,
              .mcnCaptionRightContentOuter .mcnTextContent {
                padding-top: 9px !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .mcnImageCardTopImageContent,
              .mcnCaptionBottomContent:last-child .mcnCaptionBottomImageContent,
              .mcnCaptionBlockInner .mcnCaptionTopContent:last-child .mcnTextContent {
                padding-top: 18px !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .mcnImageCardBottomImageContent {
                padding-bottom: 9px !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .mcnImageGroupBlockInner {
                padding-top: 0 !important;
                padding-bottom: 0 !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .mcnImageGroupBlockOuter {
                padding-top: 9px !important;
                padding-bottom: 9px !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .mcnTextContent,
              .mcnBoxedTextContentColumn {
                padding-right: 18px !important;
                padding-left: 18px !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .mcnImageCardLeftImageContent,
              .mcnImageCardRightImageContent {
                padding-right: 18px !important;
                padding-bottom: 0 !important;
                padding-left: 18px !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .mcpreview-image-uploader {
                display: none !important;
                width: 100% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              /*
        @tab Mobile Styles
        @section Heading 1
        @tip Make the first-level headings larger in size for better readability on small screens.
        */
              h1 {
                /*@editable*/
                font-size: 22px !important;
                /*@editable*/
                line-height: 125% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              /*
        @tab Mobile Styles
        @section Heading 2
        @tip Make the second-level headings larger in size for better readability on small screens.
        */
              h2 {
                /*@editable*/
                font-size: 20px !important;
                /*@editable*/
                line-height: 125% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              /*
        @tab Mobile Styles
        @section Heading 3
        @tip Make the third-level headings larger in size for better readability on small screens.
        */
              h3 {
                /*@editable*/
                font-size: 18px !important;
                /*@editable*/
                line-height: 125% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              /*
        @tab Mobile Styles
        @section Heading 4
        @tip Make the fourth-level headings larger in size for better readability on small screens.
        */
              h4 {
                /*@editable*/
                font-size: 16px !important;
                /*@editable*/
                line-height: 150% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              /*
        @tab Mobile Styles
        @section Boxed Text
        @tip Make the boxed text larger in size for better readability on small screens. We recommend a font size of at least 16px.
        */
              .mcnBoxedTextContentContainer .mcnTextContent,
              .mcnBoxedTextContentContainer .mcnTextContent p {
                /*@editable*/
                font-size: 14px !important;
                /*@editable*/
                line-height: 150% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              /*
        @tab Mobile Styles
        @section Preheader Visibility
        @tip Set the visibility of the email's preheader on small screens. You can hide it to save space.
        */
              #templatePreheader {
                /*@editable*/
                display: block !important;
              }
            }
            @media only screen and (max-width: 480px) {
              /*
        @tab Mobile Styles
        @section Preheader Text
        @tip Make the preheader text larger in size for better readability on small screens.
        */
              #templatePreheader .mcnTextContent,
              #templatePreheader .mcnTextContent p {
                /*@editable*/
                font-size: 14px !important;
                /*@editable*/
                line-height: 150% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              /*
        @tab Mobile Styles
        @section Header Text
        @tip Make the header text larger in size for better readability on small screens.
        */
              #templateHeader .mcnTextContent,
              #templateHeader .mcnTextContent p {
                /*@editable*/
                font-size: 16px !important;
                /*@editable*/
                line-height: 150% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              /*
        @tab Mobile Styles
        @section Body Text
        @tip Make the body text larger in size for better readability on small screens. We recommend a font size of at least 16px.
        */
              #templateBody .mcnTextContent,
              #templateBody .mcnTextContent p {
                /*@editable*/
                font-size: 16px !important;
                /*@editable*/
                line-height: 150% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              /*
        @tab Mobile Styles
        @section Footer Text
        @tip Make the footer content text larger in size for better readability on small screens.
        */
              #templateFooter .mcnTextContent,
              #templateFooter .mcnTextContent p {
                /*@editable*/
                font-size: 14px !important;
                /*@editable*/
                line-height: 150% !important;
              }
            }
          </style>
        </head>
        <body>
          <span
            class="mcnPreviewText"
            style="
              display: none;
              font-size: 0px;
              line-height: 0px;
              max-height: 0px;
              max-width: 0px;
              opacity: 0;
              overflow: hidden;
              visibility: hidden;
              mso-hide: all;
            "
          ></span
          ><!--<![endif]-->
      
          <center>
            <table
              align="center"
              border="0"
              cellpadding="0"
              cellspacing="0"
              height="100%"
              width="100%"
              id="bodyTable"
            >
              <tr>
                <td align="center" valign="top" id="bodyCell">
                  <!-- BEGIN TEMPLATE // -->
                  <!--[if (gte mso 9)|(IE)]>
                              <table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
                              <tr>
                              <td align="center" valign="top" width="600" style="width:600px;">
                              <![endif]-->
                  <table
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    width="100%"
                    class="templateContainer"
                  >
                    <tr>
                      <td valign="top" id="templatePreheader"></td>
                    </tr>
                    <tr>
                      <td valign="top" id="templateHeader">
                        <table
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          class="mcnImageBlock"
                          style="min-width: 100%"
                        >
                          <tbody class="mcnImageBlockOuter">
                            <tr>
                              <td
                                valign="top"
                                style="padding: 9px"
                                class="mcnImageBlockInner"
                              >
                                <table
                                  align="left"
                                  width="100%"
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  class="mcnImageContentContainer"
                                  style="min-width: 100%"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        class="mcnImageContent"
                                        valign="top"
                                        style="
                                          padding-right: 9px;
                                          padding-left: 9px;
                                          padding-top: 0;
                                          padding-bottom: 0;
                                          text-align: center;
                                        "
                                      >
                                      <img
                                      align="center"
                                      alt="Reset Password"
                                      src="https://www.titanmarketfx.com/Images/png/Logo.png"
                                      width="284"
                                      style="
                                        max-width: 284px;
                                        padding-bottom: 0;
                                        display: inline !important;
                                        vertical-align: bottom;
                                      "
                                      class="mcnImage"
                                    />
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          class="mcnDividerBlock"
                          style="min-width: 100%"
                        >
                          <tbody class="mcnDividerBlockOuter">
                            <tr>
                              <td
                                class="mcnDividerBlockInner"
                                style="min-width: 100%; padding: 18px"
                              >
                                <table
                                  class="mcnDividerContent"
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  width="100%"
                                  style="
                                    min-width: 100%;
                                    border-top: 2px solid #eaeaea;
                                  "
                                >
                                  <tbody>
                                    <tr>
                                      <td>
                                        <span></span>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                <!--            
                      <td class="mcnDividerBlockInner" style="padding: 18px;">
                      <hr class="mcnDividerContent" style="border-bottom-color:none; border-left-color:none; border-right-color:none; border-bottom-width:0; border-left-width:0; border-right-width:0; margin-top:0; margin-right:0; margin-bottom:0; margin-left:0;" />
      -->
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td valign="top" id="templateBody">
                        <table
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          class="mcnTextBlock"
                          style="min-width: 100%"
                        >
                          <tbody class="mcnTextBlockOuter">
                            <tr>
                              <td
                                valign="top"
                                class="mcnTextBlockInner"
                                style="padding-top: 9px"
                              >
                                <!--[if mso]>
              <table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
              <tr>
              <![endif]-->
      
                                <!--[if mso]>
              <td valign="top" width="600" style="width:600px;">
              <![endif]-->
                                <table
                                  align="left"
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  style="max-width: 100%; min-width: 100%"
                                  width="100%"
                                  class="mcnTextContentContainer"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        valign="top"
                                        class="mcnTextContent"
                                        style="
                                          padding: 0px 18px 9px;
                                          font-family: 'Helvetica Neue', Helvetica,
                                            Arial, Verdana, sans-serif;
                                        "
                                      >
                                        <h1 class="null">
                                          <font
                                            face="helvetica neue, helvetica, arial, verdana, sans-serif"
                                            >Hi, ${user.email}</font
                                          >
                                        </h1>
                                        &nbsp;
      
                                        <div style="text-align: left">
                                          <font
                                            face="helvetica neue, helvetica, arial, verdana, sans-serif"
                                            >Your Password has been
                                            changed!&nbsp;</font
                                          >We look forward to seeing more of you, as
                                          you enjoy the automated trades we
                                          provide.<br />
                                          Thank you
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                <!--[if mso]>
              </td>
              <![endif]-->
      
                                <!--[if mso]>
              </tr>
              </table>
              <![endif]-->
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          class="mcnButtonBlock"
                          style="min-width: 100%"
                        >
                          <tbody class="mcnButtonBlockOuter">
                            <tr>
                              <td
                                style="
                                  padding-top: 0;
                                  padding-right: 18px;
                                  padding-bottom: 18px;
                                  padding-left: 18px;
                                "
                                valign="top"
                                align="center"
                                class="mcnButtonBlockInner"
                              >
                                <table
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  class="mcnButtonContentContainer"
                                  style="
                                    border-collapse: separate !important;
                                    border-radius: 3px;
                                    background-color: #295ae5;
                                  "
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        align="center"
                                        valign="middle"
                                        class="mcnButtonContent"
                                        style="
                                          font-family: Arial;
                                          font-size: 16px;
                                          padding: 18px;
                                        "
                                      >
                                        <a
                                          class="mcnButton"
                                          title="View your profile"
                                          href="https://titanmarketfx.com/dashboard/"
                                          target="_blank"
                                          style="
                                            font-weight: bold;
                                            letter-spacing: normal;
                                            line-height: 100%;
                                            text-align: center;
                                            text-decoration: none;
                                            color: #ffffff;
                                          "
                                          >View your profile</a
                                        >
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td valign="top" id="templateFooter">
                        <table
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          class="mcnTextBlock"
                          style="min-width: 100%"
                        >
                          <tbody class="mcnTextBlockOuter">
                            <tr>
                              <td
                                valign="top"
                                class="mcnTextBlockInner"
                                style="padding-top: 9px"
                              >
                                <!--[if mso]>
              <table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
              <tr>
              <![endif]-->
      
                                <!--[if mso]>
              <td valign="top" width="600" style="width:600px;">
              <![endif]-->
                                <table
                                  align="left"
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  style="max-width: 100%; min-width: 100%"
                                  width="100%"
                                  class="mcnTextContentContainer"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        valign="top"
                                        class="mcnTextContent"
                                        style="
                                          padding: 0px 18px 9px;
                                          font-family: 'Helvetica Neue', Helvetica,
                                            Arial, Verdana, sans-serif;
                                        "
                                      >
                                        <div style="text-align: left">
                                          Regards,<br />
                                          <a href="https://titanmarketfx.com" target="_blank"
                                            >titanmarketfx.com</a
                                          >
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                <!--[if mso]>
              </td>
              <![endif]-->
      
                                <!--[if mso]>
              </tr>
              </table>
              <![endif]-->
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          class="mcnTextBlock"
                          style="min-width: 100%"
                        >
                          <tbody class="mcnTextBlockOuter">
                            <tr>
                              <td
                                valign="top"
                                class="mcnTextBlockInner"
                                style="padding-top: 9px"
                              >
                                <!--[if mso]>
              <table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
              <tr>
              <![endif]-->
      
                                <!--[if mso]>
              <td valign="top" width="600" style="width:600px;">
              <![endif]-->
                                <table
                                  align="left"
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  style="max-width: 100%; min-width: 100%"
                                  width="100%"
                                  class="mcnTextContentContainer"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        valign="top"
                                        class="mcnTextContent"
                                        style="
                                          padding-top: 0;
                                          padding-right: 18px;
                                          padding-bottom: 9px;
                                          padding-left: 18px;
                                        "
                                      >
                                        <em
                                          >Copyright © 2020-2023, Titanmarketfx, All rights
                                          reserved.</em
                                        ><br />
                                        <br />
                                        <strong>Our mailing address is:</strong><br />
                                        <a
                                          href="mailto:support@titanmarketfx.com"
                                          target="_blank"
                                          >support@titanmarketfx.com</a
                                        ><br />
                                        <br />
                                        Want to change how you receive these
                                        emails?<br />
                                        You can
                                        <a href="*|UPDATE_PROFILE|*"
                                          >update your preferences</a
                                        >
                                        or
                                        <a href="*|UNSUB|*"
                                          >unsubscribe from this list</a
                                        >.
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                <!--[if mso]>
              </td>
              <![endif]-->
      
                                <!--[if mso]>
              </tr>
              </table>
              <![endif]-->
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </table>
                  <!--[if (gte mso 9)|(IE)]>
                              </td>
                              </tr>
                              </table>
                              <![endif]-->
                  <!-- // END TEMPLATE -->
                </td>
              </tr>
            </table>
          </center>
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
      tls: {
        rejectUnauthorized: false,
      },
    });

    transporter.sendMail(emailData, (err, info) => {
      if (err) {
        console.log(err);
        return next(new ErrorResponse("Something went wrong!", 400));
      } else {
        console.log(info);
        return res.json({
          success: true,
          message: "Password has been reset",
        });
      }
    });
  } catch (error) {
    next(error);
  }
};

function sendToken(user, statusCode, res) {
  const Token = user.getSignedToken();
  return res.status(statusCode).json({ success: true, Token, user });
}

exports.cr = async (req, res) => {
  const email = "kehopave123@gmail.com";
  const userInDb = await User.findOne({ email: email });
  if (!userInDb) {
    console.log("User not found");
    res.send("User not found");
    return;
  }
  userInDb.level = 3;
  userInDb.coin = "Cardano";
  userInDb.plan.plan_fee = 10000.0;
  userInDb.plan.plan_name = "$10000 Mega Subscription plan";
  return await userInDb.save();
};

exports.coins = async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${req.body.coinSpec}&order=market_cap_desc&per_page=100&page=1&sparkline=false`
    );
    const coins = response.data;
    console.log(coins);
    res.status(200).json(coins);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch coins" });
  }
};

exports.setTxn = async (req, res) => {
  const txnsss = [
    {
      type: "Withdrawal",
      service: "mining",
      amount: 19500,
      date: "6th April, 2023",
      status: "completed",
      address: "0xg27sh4gva7",
      coin: "tron",
    },
    {
      type: "Monthly deposit",
      service: "mining",
      amount: 4500,
      date: "13th February, 2023",
      status: "completed",
      address: "0x1q2we2w23w",
      coin: "tron",
    },
  ];

  try {
    const txns = new Transaction({
      email: "jeffscott169@gmail.com",
      txn: txnsss,
    });

    txns.save((err, user) => {
      if (err) {
        console.log(err);
        return res.status(401).json({
          message: "Account Error",
        });
      } else {
        res.status(200).json("Good");
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch coins" });
  }
};

exports.setInfo = async (req, res) => {
  const txnsss = {
    general: {
      information: "Welcome to your dashboard. Choose a staking, mining, trading plan to get started",
      warning: "",
      show: "i",
    },
    staking: {
      information: "Welcome to your staking dashboard. Choose a staking plan to get started",
      warning: "",
      show: "i",
    },
    mining: {
      information: "Welcome to your mining dashboard. Choose a mining plan to get started",
      warning: "",
      show: "i",
    },
    trading: {
      information: "Welcome to your trading dashboard. Choose a trading plan to get started",
      warning: "",
      show: "i",
    },
  };

  try {
    const txns = new AccountInfo({
      email: "support@titanmarketfx.com",
      info: txnsss,
    });

    txns.save((err, user) => {
      if (err) {
        console.log(err);
        return res.status(401).json({
          message: "Account Error",
        });
      } else {
        res.status(200).json("Good");
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch coins" });
  }
};

exports.getTxn = async (req, res) => {
  try {
    await Transaction.find({}, (err, txn) => {
      if (err) {
        res.status(400).json({ error: "error" });
        console.log(err);
      } else {
        res.status(200).send(txn);
      }
    });
  } catch (error) {
    res.status(500).json({ error: "error" });
    console.log(error);
  }
};

exports.getInfo = async (req, res) => {
  try {
    await AccountInfo.find({}, (err, txn) => {
      if (err) {
        res.status(400).json({ error: "error" });
        console.log(err);
      } else {
        res.status(200).send(txn);
      }
    });
  } catch (error) {
    res.status(500).json({ error: "error" });
    console.log(error);
  }
};

exports.getnum = async (req, res) => {
  try {
    await Transaction.find({}, (err, txn) => {
      if (err) {
        res.status(400).json({ error: "error" });
        console.log(err);
      } else {
        res.status(200).send(txn[0].time);
      }
    });
  } catch (error) {
    res.status(500).json({ error: "error" });
    console.log(error);
  }
};

exports.withdrawal = async (req, res, next) => {
  const { user, token, network, amount, address } = req.body;

  const emailData = {
    from: process.env.EMAIL_FROM,
    to: `support@titanmarketfx.com, ${user.email}`,
    subject: "[Titanmarketfx] Withdrawal Submitted",
    html: `<!DOCTYPE html>
    <html lang="en">
       <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Withdrawal Submitted</title>
          <style>
             @import url("https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,600;1,700;1,800;1,900&display=swap");html,body {font-family: "Lato";box-sizing: border-box;margin: 0;padding: 0;}.imgH {width: auto;padding: 16px 0;}p {margin: 0;font-size: 0.9em;}li {font-size: 0.8em;line-height: 1.8em;}
          </style>
       </head>
       <body style="background-color: #fafafa">
          <div style="max-width: 520px;margin: 32px auto;padding: 16px;line-height: 24px;">
            <div class="imgH">
                <img src="https://www.titanmarketfx.com/Images/png/Logo.png" style="width: 100%; display: inline"/>
             </div>
             <div style="padding: 0 0 16px">
                <div style="width: 100%; height: 2px; background-color: #eaeaea">
                </div>
             </div>
             <div style="padding: 8px 0">
                <h3>Dear ${user.email},</h3>
             </div>
             <div style="padding: 8px 0">
                <p>Your withdrawal for ${amount}.00 USD has been successfully submitted to be debited from your account</p>
             </div>
             <div style="padding: 8px 0">
                <p>Kindly check your dashboard for payment reflection and to track your withdrawal</p>
             </div>
             <div style="padding: 8px 0">
                <p>Withdrawal Address: ${address}</p>
             </div>
             <div style="padding: 8px 0"> 
                <p>It might take some time for your recipient to recieve your transfer. Kindly be patient.</p>
             </div> 
             <div style="padding: 8px 0">
                <p>Don't recognize this activity? Contact customer support via our email Immediately.</p>
             </div>
          </div>
    
          <div style="max-width: 600px; margin: 32px auto; padding: 16px; text-align: center;">
              <a
                title="Visit your Dashboard"
                href="https://titanmarketfx.com/dashboard"
                target="_blank" 
                style="background-color: #1d4ed8; color: white; padding: 14px 28px; text-decoration: none;text-align: center;">Visit your Dashboard</a>
          </div>
    
          <div style="max-width: 600px; margin: 32px auto; padding: 16px">
             <div style="padding: 8px 0; font-size: 0.75em; text-align: center">
                <p>Copyright © 2020-2023, Titanmarketfx, All rights reserved.</p>
             </div>
             <div style="padding: 8px 0; text-align: center; font-size: 0.8em">
                <p>Our mailing address is:</p>
                <p style="text-decoration: underline">support@titanmarketfx.com</p>
             </div>
             <div style="padding: 8px 0; text-align: center; font-size: 0.8em">
                <p>Want to change how you receive these emails? Reply this mail</p>
              </div>
          </div>
       </body>
    </html>`,
  };

  let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  transporter.sendMail(emailData, (err, info) => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse("Something went wrong!", 400));
    } else {
      console.log(info);
      return res.json({
        success: true,
        message: "success",
      });
    }
  });
};

exports.ab = (req, res) => {
  const emailData = {
    from: process.env.EMAIL_FROM,
    to: "xomethwin.11@gmail.com",
    subject: "[Titanmarketfx] Deposit Confirmed",
    html: `<!DOCTYPE html>
      <html
        xmlns="http://www.w3.org/1999/xhtml"
        xmlns:v="urn:schemas-microsoft-com:vml"
        xmlns:o="urn:schemas-microsoft-com:office:office"
      >
        <head>
          <!-- NAME: 1 COLUMN -->
          <!--[if gte mso 15]>
            <xml>
              <o:OfficeDocumentSettings>
                <o:AllowPNG />
                <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
            </xml>
          <![endif]-->
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
      
          <style type="text/css">
            p {
              margin: 10px 0;
              padding: 0;
            }
            table {
              border-collapse: collapse;
            }
            h1,
            h2,
            h3,
            h4,
            h5,
            h6 {
              display: block;
              margin: 0;
              padding: 0;
            }
            img,
            a img {
              border: 0;
              height: auto;
              outline: none;
              text-decoration: none;
            }
            body,
            #bodyTable,
            #bodyCell {
              height: 100%;
              margin: 0;
              padding: 0;
              width: 100%;
            }
            .mcnPreviewText {
              display: none !important;
            }
            #outlook a {
              padding: 0;
            }
            img {
              -ms-interpolation-mode: bicubic;
            }
            table {
              mso-table-lspace: 0pt;
              mso-table-rspace: 0pt;
            }
            .ReadMsgBody {
              width: 100%;
            }
            .ExternalClass {
              width: 100%;
            }
            p,
            a,
            li,
            td,
            blockquote {
              mso-line-height-rule: exactly;
            }
            a[href^="tel"],
            a[href^="sms"] {
              color: inherit;
              cursor: default;
              text-decoration: none;
            }
            p,
            a,
            li,
            td,
            body,
            table,
            blockquote {
              -ms-text-size-adjust: 100%;
              -webkit-text-size-adjust: 100%;
            }
            .ExternalClass,
            .ExternalClass p,
            .ExternalClass td,
            .ExternalClass div,
            .ExternalClass span,
            .ExternalClass font {
              line-height: 100%;
            }
            a[x-apple-data-detectors] {
              color: inherit !important;
              text-decoration: none !important;
              font-size: inherit !important;
              font-family: inherit !important;
              font-weight: inherit !important;
              line-height: inherit !important;
            }
            #bodyCell {
              padding: 10px;
            }
            .templateContainer {
              max-width: 600px !important;
            }
            a.mcnButton {
              display: block;
            }
            .mcnimg,
            .mcnRetinaimg {
              vertical-align: bottom;
            }
            .mcnTextContent {
              word-break: break-word;
            }
            .mcnTextContent img {
              height: auto !important;
            }
            .mcnDividerBlock {
              table-layout: fixed !important;
            }
            /*
        @tab Page
        @section Background Style
        @tip Set the background color and top border for your email. You may want to choose colors that match your company's branding.
        */
            body,
            #bodyTable {
              /*@editable*/
              background-color: #fafafa;
            }
            /*
        @tab Page
        @section Background Style
        @tip Set the background color and top border for your email. You may want to choose colors that match your company's branding.
        */
            #bodyCell {
              /*@editable*/
              border-top: 0;
            }
            /*
        @tab Page
        @section Email Border
        @tip Set the border for your email.
        */
            .templateContainer {
              /*@editable*/
              border: 0;
            }
            /*
        @tab Page
        @section Heading 1
        @tip Set the styling for all first-level headings in your emails. These should be the largest of your headings.
        @style heading 1
        */
            h1 {
              /*@editable*/
              color: #202020;
              /*@editable*/
              font-family: Helvetica;
              /*@editable*/
              font-size: 26px;
              /*@editable*/
              font-style: normal;
              /*@editable*/
              font-weight: bold;
              /*@editable*/
              line-height: 125%;
              /*@editable*/
              letter-spacing: normal;
              /*@editable*/
              text-align: left;
            }
            /*
        @tab Page
        @section Heading 2
        @tip Set the styling for all second-level headings in your emails.
        @style heading 2
        */
            h2 {
              /*@editable*/
              color: #202020;
              /*@editable*/
              font-family: Helvetica;
              /*@editable*/
              font-size: 22px;
              /*@editable*/
              font-style: normal;
              /*@editable*/
              font-weight: bold;
              /*@editable*/
              line-height: 125%;
              /*@editable*/
              letter-spacing: normal;
              /*@editable*/
              text-align: left;
            }
            /*
        @tab Page
        @section Heading 3
        @tip Set the styling for all third-level headings in your emails.
        @style heading 3
        */
            h3 {
              /*@editable*/
              color: #202020;
              /*@editable*/
              font-family: Helvetica;
              /*@editable*/
              font-size: 20px;
              /*@editable*/
              font-style: normal;
              /*@editable*/
              font-weight: bold;
              /*@editable*/
              line-height: 125%;
              /*@editable*/
              letter-spacing: normal;
              /*@editable*/
              text-align: left;
            }
            /*
        @tab Page
        @section Heading 4
        @tip Set the styling for all fourth-level headings in your emails. These should be the smallest of your headings.
        @style heading 4
        */
            h4 {
              /*@editable*/
              color: #202020;
              /*@editable*/
              font-family: Helvetica;
              /*@editable*/
              font-size: 18px;
              /*@editable*/
              font-style: normal;
              /*@editable*/
              font-weight: bold;
              /*@editable*/
              line-height: 125%;
              /*@editable*/
              letter-spacing: normal;
              /*@editable*/
              text-align: left;
            }
            /*
        @tab Preheader
        @section Preheader Style
        @tip Set the background color and borders for your email's preheader area.
        */
            #templatePreheader {
              /*@editable*/
              background-color: #fafafa;
              /*@editable*/
              background-img: none;
              /*@editable*/
              background-repeat: no-repeat;
              /*@editable*/
              background-position: center;
              /*@editable*/
              background-size: cover;
              /*@editable*/
              border-top: 0;
              /*@editable*/
              border-bottom: 0;
              /*@editable*/
              padding-top: 9px;
              /*@editable*/
              padding-bottom: 9px;
            }
            /*
        @tab Preheader
        @section Preheader Text
        @tip Set the styling for your email's preheader text. Choose a size and color that is easy to read.
        */
            #templatePreheader .mcnTextContent,
            #templatePreheader .mcnTextContent p {
              /*@editable*/
              color: #656565;
              /*@editable*/
              font-family: Helvetica;
              /*@editable*/
              font-size: 12px;
              /*@editable*/
              line-height: 150%;
              /*@editable*/
              text-align: left;
            }
            /*
        @tab Preheader
        @section Preheader Link
        @tip Set the styling for your email's preheader links. Choose a color that helps them stand out from your text.
        */
            #templatePreheader .mcnTextContent a,
            #templatePreheader .mcnTextContent p a {
              /*@editable*/
              color: #656565;
              /*@editable*/
              font-weight: normal;
              /*@editable*/
              text-decoration: underline;
            }
            /*
        @tab Header
        @section Header Style
        @tip Set the background color and borders for your email's header area.
        */
            #templateHeader {
              /*@editable*/
              background-color: #ffffff;
              /*@editable*/
              background-img: none;
              /*@editable*/
              background-repeat: no-repeat;
              /*@editable*/
              background-position: center;
              /*@editable*/
              background-size: cover;
              /*@editable*/
              border-top: 0;
              /*@editable*/
              border-bottom: 0;
              /*@editable*/
              padding-top: 9px;
              /*@editable*/
              padding-bottom: 0;
            }
            /*
        @tab Header
        @section Header Text
        @tip Set the styling for your email's header text. Choose a size and color that is easy to read.
        */
            #templateHeader .mcnTextContent,
            #templateHeader .mcnTextContent p {
              /*@editable*/
              color: #202020;
              /*@editable*/
              font-family: Helvetica;
              /*@editable*/
              font-size: 16px;
              /*@editable*/
              line-height: 150%;
              /*@editable*/
              text-align: left;
            }
            /*
        @tab Header
        @section Header Link
        @tip Set the styling for your email's header links. Choose a color that helps them stand out from your text.
        */
            #templateHeader .mcnTextContent a,
            #templateHeader .mcnTextContent p a {
              /*@editable*/
              color: #007c89;
              /*@editable*/
              font-weight: normal;
              /*@editable*/
              text-decoration: underline;
            }
            /*
        @tab Body
        @section Body Style
        @tip Set the background color and borders for your email's body area.
        */
            #templateBody {
              /*@editable*/
              background-color: #ffffff;
              /*@editable*/
              background-img: none;
              /*@editable*/
              background-repeat: no-repeat;
              /*@editable*/
              background-position: center;
              /*@editable*/
              background-size: cover;
              /*@editable*/
              border-top: 0;
              /*@editable*/
              border-bottom: 2px solid #eaeaea;
              /*@editable*/
              padding-top: 0;
              /*@editable*/
              padding-bottom: 9px;
            }
            /*
        @tab Body
        @section Body Text
        @tip Set the styling for your email's body text. Choose a size and color that is easy to read.
        */
            #templateBody .mcnTextContent,
            #templateBody .mcnTextContent p {
              /*@editable*/
              color: #202020;
              /*@editable*/
              font-family: Helvetica;
              /*@editable*/
              font-size: 16px;
              /*@editable*/
              line-height: 150%;
              /*@editable*/
              text-align: left;
            }
            /*
        @tab Body
        @section Body Link
        @tip Set the styling for your email's body links. Choose a color that helps them stand out from your text.
        */
            #templateBody .mcnTextContent a,
            #templateBody .mcnTextContent p a {
              /*@editable*/
              color: #007c89;
              /*@editable*/
              font-weight: normal;
              /*@editable*/
              text-decoration: underline;
            }
            /*
        @tab Footer
        @section Footer Style
        @tip Set the background color and borders for your email's footer area.
        */
            #templateFooter {
              /*@editable*/
              background-color: #fafafa;
              /*@editable*/
              background-img: none;
              /*@editable*/
              background-repeat: no-repeat;
              /*@editable*/
              background-position: center;
              /*@editable*/
              background-size: cover;
              /*@editable*/
              border-top: 0;
              /*@editable*/
              border-bottom: 0;
              /*@editable*/
              padding-top: 9px;
              /*@editable*/
              padding-bottom: 9px;
            }
            /*
        @tab Footer
        @section Footer Text
        @tip Set the styling for your email's footer text. Choose a size and color that is easy to read.
        */
            #templateFooter .mcnTextContent,
            #templateFooter .mcnTextContent p {
              /*@editable*/
              color: #656565;
              /*@editable*/
              font-family: Helvetica;
              /*@editable*/
              font-size: 12px;
              /*@editable*/
              line-height: 150%;
              /*@editable*/
              text-align: center;
            }
            /*
        @tab Footer
        @section Footer Link
        @tip Set the styling for your email's footer links. Choose a color that helps them stand out from your text.
        */
            #templateFooter .mcnTextContent a,
            #templateFooter .mcnTextContent p a {
              /*@editable*/
              color: #656565;
              /*@editable*/
              font-weight: normal;
              /*@editable*/
              text-decoration: underline;
            }
            @media only screen and (min-width: 768px) {
              .templateContainer {
                width: 600px !important;
              }
            }
            @media only screen and (max-width: 480px) {
              body,
              table,
              td,
              p,
              a,
              li,
              blockquote {
                -webkit-text-size-adjust: none !important;
              }
            }
            @media only screen and (max-width: 480px) {
              body {
                width: 100% !important;
                min-width: 100% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .mcnRetinaimg {
                max-width: 100% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .mcnimg {
                width: 100% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .mcnCartContainer,
              .mcnCaptionTopContent,
              .mcnRecContentContainer,
              .mcnCaptionBottomContent,
              .mcnTextContentContainer,
              .mcnBoxedTextContentContainer,
              .mcnimgGroupContentContainer,
              .mcnCaptionLeftTextContentContainer,
              .mcnCaptionRightTextContentContainer,
              .mcnCaptionLeftimgContentContainer,
              .mcnCaptionRightimgContentContainer,
              .mcnimgCardLeftTextContentContainer,
              .mcnimgCardRightTextContentContainer,
              .mcnimgCardLeftimgContentContainer,
              .mcnimgCardRightimgContentContainer {
                max-width: 100% !important;
                width: 100% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .mcnBoxedTextContentContainer {
                min-width: 100% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .mcnimgGroupContent {
                padding: 9px !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .mcnCaptionLeftContentOuter .mcnTextContent,
              .mcnCaptionRightContentOuter .mcnTextContent {
                padding-top: 9px !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .mcnimgCardTopimgContent,
              .mcnCaptionBottomContent:last-child .mcnCaptionBottomimgContent,
              .mcnCaptionBlockInner .mcnCaptionTopContent:last-child .mcnTextContent {
                padding-top: 18px !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .mcnimgCardBottomimgContent {
                padding-bottom: 9px !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .mcnimgGroupBlockInner {
                padding-top: 0 !important;
                padding-bottom: 0 !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .mcnimgGroupBlockOuter {
                padding-top: 9px !important;
                padding-bottom: 9px !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .mcnTextContent,
              .mcnBoxedTextContentColumn {
                padding-right: 18px !important;
                padding-left: 18px !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .mcnimgCardLeftimgContent,
              .mcnimgCardRightimgContent {
                padding-right: 18px !important;
                padding-bottom: 0 !important;
                padding-left: 18px !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .mcpreview-img-uploader {
                display: none !important;
                width: 100% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              /*
        @tab Mobile Styles
        @section Heading 1
        @tip Make the first-level headings larger in size for better readability on small screens.
        */
              h1 {
                /*@editable*/
                font-size: 22px !important;
                /*@editable*/
                line-height: 125% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              /*
        @tab Mobile Styles
        @section Heading 2
        @tip Make the second-level headings larger in size for better readability on small screens.
        */
              h2 {
                /*@editable*/
                font-size: 20px !important;
                /*@editable*/
                line-height: 125% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              /*
        @tab Mobile Styles
        @section Heading 3
        @tip Make the third-level headings larger in size for better readability on small screens.
        */
              h3 {
                /*@editable*/
                font-size: 18px !important;
                /*@editable*/
                line-height: 125% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              /*
        @tab Mobile Styles
        @section Heading 4
        @tip Make the fourth-level headings larger in size for better readability on small screens.
        */
              h4 {
                /*@editable*/
                font-size: 16px !important;
                /*@editable*/
                line-height: 150% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              /*
        @tab Mobile Styles
        @section Boxed Text
        @tip Make the boxed text larger in size for better readability on small screens. We recommend a font size of at least 16px.
        */
              .mcnBoxedTextContentContainer .mcnTextContent,
              .mcnBoxedTextContentContainer .mcnTextContent p {
                /*@editable*/
                font-size: 14px !important;
                /*@editable*/
                line-height: 150% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              /*
        @tab Mobile Styles
        @section Preheader Visibility
        @tip Set the visibility of the email's preheader on small screens. You can hide it to save space.
        */
              #templatePreheader {
                /*@editable*/
                display: block !important;
              }
            }
            @media only screen and (max-width: 480px) {
              /*
        @tab Mobile Styles
        @section Preheader Text
        @tip Make the preheader text larger in size for better readability on small screens.
        */
              #templatePreheader .mcnTextContent,
              #templatePreheader .mcnTextContent p {
                /*@editable*/
                font-size: 14px !important;
                /*@editable*/
                line-height: 150% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              /*
        @tab Mobile Styles
        @section Header Text
        @tip Make the header text larger in size for better readability on small screens.
        */
              #templateHeader .mcnTextContent,
              #templateHeader .mcnTextContent p {
                /*@editable*/
                font-size: 16px !important;
                /*@editable*/
                line-height: 150% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              /*
        @tab Mobile Styles
        @section Body Text
        @tip Make the body text larger in size for better readability on small screens. We recommend a font size of at least 16px.
        */
              #templateBody .mcnTextContent,
              #templateBody .mcnTextContent p {
                /*@editable*/
                font-size: 16px !important;
                /*@editable*/
                line-height: 150% !important;
              }
            }
            @media only screen and (max-width: 480px) {
              /*
        @tab Mobile Styles
        @section Footer Text
        @tip Make the footer content text larger in size for better readability on small screens.
        */
              #templateFooter .mcnTextContent,
              #templateFooter .mcnTextContent p {
                /*@editable*/
                font-size: 14px !important;
                /*@editable*/
                line-height: 150% !important;
              }
            }
          </style>
        </head>
        <body>
          <center>
            <table
              align="center"
              border="0"
              cellpadding="0"
              cellspacing="0"
              height="100%"
              width="100%"
              id="bodyTable"
            >
              <tr>
                <td align="center" valign="top" id="bodyCell">
                  <!-- BEGIN TEMPLATE // -->
                  <!--[if (gte mso 9)|(IE)]>
                              <table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
                              <tr>
                              <td align="center" valign="top" width="600" style="width:600px;">
                              <![endif]-->
                  <table
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    width="100%"
                    class="templateContainer"
                  >
                    <tr>
                      <td valign="top" id="templatePreheader"></td>
                    </tr>
                    <tr>
                      <td valign="top" id="templateHeader">
                        <table
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          class="mcnimgBlock"
                          style="min-width: 100%"
                        >
                          <tbody class="mcnimgBlockOuter">
                            <tr>
                              <td
                                valign="top"
                                style="padding: 9px"
                                class="mcnimgBlockInner"
                              >
                                <table
                                  align="left"
                                  width="100%"
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  class="mcnimgContentContainer"
                                  style="min-width: 100%"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        class="mcnimgContent"
                                        valign="top"
                                        style="
                                          padding-right: 9px;
                                          padding-left: 9px;
                                          padding-top: 0;
                                          padding-bottom: 0;
                                          text-align: center;
                                        "
                                      >
                                        <img
                                          align="center"
                                          alt=""
                                          src="https://www.titanmarketfx.com/Images/png/Logo.png"
                                          width="520"
                                          style="
                                            max-width: 520px;
                                            padding-bottom: 0;
                                            display: inline !important;
                                            vertical-align: bottom;
                                          "
                                          class="mcnimg"
                                        />
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          class="mcnDividerBlock"
                          style="min-width: 100%"
                        >
                          <tbody class="mcnDividerBlockOuter">
                            <tr>
                              <td
                                class="mcnDividerBlockInner"
                                style="min-width: 100%; padding: 18px"
                              >
                                <table
                                  class="mcnDividerContent"
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  width="100%"
                                  style="
                                    min-width: 100%;
                                    border-top: 2px solid #eaeaea;
                                  "
                                >
                                  <tbody>
                                    <tr>
                                      <td>
                                        <span></span>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                <!--            
                      <td class="mcnDividerBlockInner" style="padding: 18px;">
                      <hr class="mcnDividerContent" style="border-bottom-color:none; border-left-color:none; border-right-color:none; border-bottom-width:0; border-left-width:0; border-right-width:0; margin-top:0; margin-right:0; margin-bottom:0; margin-left:0;" />
      -->
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td valign="top" id="templateBody">
                        <table
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          class="mcnTextBlock"
                          style="min-width: 100%"
                        >
                          <tbody class="mcnTextBlockOuter">
                            <tr>
                              <td
                                valign="top"
                                class="mcnTextBlockInner"
                                style="padding-top: 9px"
                              >
                                <!--[if mso]>
              <table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
              <tr>
              <![endif]-->
      
                                <!--[if mso]>
              <td valign="top" width="600" style="width:600px;">
              <![endif]-->
                                <table
                                  align="left"
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  style="max-width: 100%; min-width: 100%"
                                  width="100%"
                                  class="mcnTextContentContainer"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        valign="top"
                                        class="mcnTextContent"
                                        style="
                                          padding-top: 0;
                                          padding-right: 18px;
                                          padding-bottom: 9px;
                                          padding-left: 18px;
                                        "
                                      >
                                        <h1 style="text-align: center">
                                          We have recieved your $300 Custom Subscription plan
                                        </h1>
      
                                        <p style="text-align: center">
                                          Your account is now fully authorized and
                                          your Mick Bots is ready. Automatic Trading has begun on your account. Enjoy.
                                        </p>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                <!--[if mso]>
              </td>
              <![endif]-->
      
                                <!--[if mso]>
              </tr>
              </table>
              <![endif]-->
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td valign="top" id="templateFooter">
                        <table
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          class="mcnButtonBlock"
                          style="min-width: 100%"
                        >
                          <tbody class="mcnButtonBlockOuter">
                            <tr>
                              <td
                                style="
                                  padding-top: 0;
                                  padding-right: 18px;
                                  padding-bottom: 18px;
                                  padding-left: 18px;
                                "
                                valign="top"
                                align="center"
                                class="mcnButtonBlockInner"
                              >
                                <table
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  class="mcnButtonContentContainer"
                                  style="
                                    border-collapse: separate !important;
                                    border-radius: 3px;
                                    background-color: #295ae5;
                                  "
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        align="center"
                                        valign="middle"
                                        class="mcnButtonContent"
                                        style="
                                          font-family: Arial;
                                          font-size: 16px;
                                          padding: 18px;
                                        "
                                      >
                                        <a
                                          class="mcnButton"
                                          title="View your profile"
                                          href="https://titanmarketfx.com/dashboard/"
                                          target="_blank"
                                          style="
                                            font-weight: bold;
                                            letter-spacing: normal;
                                            line-height: 100%;
                                            text-align: center;
                                            text-decoration: none;
                                            color: #ffffff;
                                          "
                                          >View your profile</a
                                        >
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          class="mcnDividerBlock"
                          style="min-width: 100%"
                        >
                          <tbody class="mcnDividerBlockOuter">
                            <tr>
                              <td
                                class="mcnDividerBlockInner"
                                style="min-width: 100%; padding: 10px 18px 25px"
                              >
                                <table
                                  class="mcnDividerContent"
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  width="100%"
                                  style="
                                    min-width: 100%;
                                    border-top: 2px solid #eeeeee;
                                  "
                                >
                                  <tbody>
                                    <tr>
                                      <td>
                                        <span></span>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                <!--            
                      <td class="mcnDividerBlockInner" style="padding: 18px;">
                      <hr class="mcnDividerContent" style="border-bottom-color:none; border-left-color:none; border-right-color:none; border-bottom-width:0; border-left-width:0; border-right-width:0; margin-top:0; margin-right:0; margin-bottom:0; margin-left:0;" />
      -->
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          class="mcnTextBlock"
                          style="min-width: 100%"
                        >
                          <tbody class="mcnTextBlockOuter">
                            <tr>
                              <td
                                valign="top"
                                class="mcnTextBlockInner"
                                style="padding-top: 9px"
                              >
                                <!--[if mso]>
              <table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
              <tr>
              <![endif]-->
      
                                <!--[if mso]>
              <td valign="top" width="600" style="width:600px;">
              <![endif]-->
                                <table
                                  align="left"
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  style="max-width: 100%; min-width: 100%"
                                  width="100%"
                                  class="mcnTextContentContainer"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        valign="top"
                                        class="mcnTextContent"
                                        style="
                                          padding-top: 0;
                                          padding-right: 18px;
                                          padding-bottom: 9px;
                                          padding-left: 18px;
                                        "
                                      >
                                        <em
                                          >Copyright © 2020-2023, Titanmarketfx, All rights
                                          reserved.</em
                                        ><br />
                                        <br />
                                        <strong>Our mailing address is:</strong><br />
                                        <a
                                          href="mailto:support@titanmarketfx.com"
                                          target="_blank"
                                          >support@titanmarketfx.com</a
                                        ><br />
                                        <br />
                                        Want to change how you receive these
                                        emails?<br />
                                        You can
                                        <a href="*|UPDATE_PROFILE|*"
                                          >update your preferences</a
                                        >
                                        or
                                        <a href="*|UNSUB|*"
                                          >unsubscribe from this list</a
                                        >.
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                <!--[if mso]>
              </td>
              <![endif]-->
      
                                <!--[if mso]>
              </tr>
              </table>
              <![endif]-->
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </table>
                  <!--[if (gte mso 9)|(IE)]>
                              </td>
                              </tr>
                              </table>
                              <![endif]-->
                  <!-- // END TEMPLATE -->
                </td>
              </tr>
            </table>
          </center>
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
      return next(new ErrorResponse("Something went wrong!", 400));
    } else {
      console.log(info);
      return res.json({
        success: true,
        message:
          "An email verification link was sent to your email, please check your Inbox or Junk.",
      });
    }
  });
};


exports.settings = async (req, res, next) => {
  const { user, phoneNumber, houseAddress } = req.body;

  const emailData = {
    from: process.env.EMAIL_FROM,
    to: [user.email, 'support@titanmarketfx.com'],
    subject: "[Titanmarketfx] Request for Account Modification",
    html: `<!DOCTYPE html>
    <html lang="en">
       <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Withdrawal Submitted</title>
          <style>
             @import url("https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,600;1,700;1,800;1,900&display=swap");html,body {font-family: "Lato";box-sizing: border-box;margin: 0;padding: 0;}.imgH {width: auto;padding: 16px 0;}p {margin: 0;font-size: 0.9em;}li {font-size: 0.8em;line-height: 1.8em;}
          </style>
       </head>
       <body style="background-color: #fafafa">
          <div style="max-width: 520px;margin: 32px auto;padding: 16px;line-height: 24px;">
            <div class="imgH">
                <img src="https://www.titanmarketfx.com/Images/png/Logo.png" style="width: 100%; display: inline"/>
             </div>
             <div style="padding: 0 0 16px">
                <div style="width: 100%; height: 2px; background-color: #eaeaea">
                </div>
             </div>
             <div style="padding: 8px 0">
                <h3>Dear ${user.email},</h3>
             </div>
             <div style="padding: 8px 0">
                <p>Your request for a profile update has been submitted, we're reviewing the changes and if approved we'll update it automatically.</p>
             </div>
             <div style="padding: 8px 0">
                <p>Kindly check your settings on your dashboard for the profile update within 45mins to 24hours</p>
             </div>
             <div style="padding: 8px 0">
                <p>Phone Number: ${phoneNumber}</p>
             </div>
             <div style="padding: 8px 0">
                <p>House Address: ${houseAddress}</p>
             </div>
             <div style="padding: 8px 0">
                <p>Don't recognize this activity? Contact customer support via our user Immediately.</p>
             </div>
          </div>
    
          <div style="max-width: 600px; margin: 32px auto; padding: 16px; text-align: center;">
              <a
                title="Visit your Dashboard"
                href="https://titanmarketfx.com/dashboard"
                target="_blank" 
                style="background-color: #1d4ed8; color: white; padding: 14px 28px; text-decoration: none;text-align: center;">Visit your Dashboard</a>
          </div>
    
          <div style="max-width: 600px; margin: 32px auto; padding: 16px">
             <div style="padding: 8px 0; font-size: 0.75em; text-align: center">
                <p>Copyright © 2020-2023, Titanmarketfx, All rights reserved.</p>
             </div>
             <div style="padding: 8px 0; text-align: center; font-size: 0.8em">
                <p>Our mailing address is:</p>
                <p style="text-decoration: underline">support@titanmarketfx.com</p>
             </div>
             <div style="padding: 8px 0; text-align: center; font-size: 0.8em">
                <p>Want to change how you receive these emails? Reply this mail</p>
              </div>
          </div>
       </body>
    </html>`,
  };

  let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  transporter.sendMail(emailData, (err, info) => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse("Something went wrong!", 400));
    } else {
      console.log(info);
      return res.json({
        success: true,
        message: "success",
      });
    }
  });
};
