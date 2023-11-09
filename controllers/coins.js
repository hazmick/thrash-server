const clientID = process.env.clientID;
const { Client, resources } = require("coinbase-commerce-node");
Client.init(clientID);
const User = require("../models/User");

const { Charge } = resources;

const cors = require("cors")({ origin: "*" });

exports.createCharge = async (req, res) => {
  const user = req.body;

  cors(req, res, async () => {  
    const chargeData = {
      name: "$20 Membership fee",
      description: "One-Time $20 Membership fee for first time Hazmick members ",
      local_price: {
        amount: 20.0,
        currency: "USD", 
      },
      pricing_type: "fixed_price",  
      metadata: {
        user: `${user.email}`
    }, 
    };
   
    const charge = await Charge.create(chargeData) ;
    
    console.log(charge);
 
    res.json(charge);
  });
};

exports.createChargeAny = async (req, res) => {
  const {user, amount} = req.body;
  console.log(amount);

  cors(req, res, async () => {  
    const chargeData = {
      name: `$${amount} Custom Deposit Subscription plan`,
      description: `$${amount} Custom Deposit Subscription plan`,
      local_price: {
        amount: amount,
        currency: "USD", 
      },
      pricing_type: "fixed_price",  
      metadata: {
        user: `${user.email}`
    },  
    }; 
   
    const charge = await Charge.create(chargeData) ;
    
    console.log(charge);
  
    res.json(charge);
  });
};

//Mini Plans

exports.createCharge100 = async (req, res) => {
  const { user } = req.body;

  cors(req, res, async () => {
    const chargeData = {
      name: "$100 Mini Subscription plan",
      description:
        "Our mini subscription plan for $100 annually with an increase of 41% monthly.",
      local_price: {
        amount: 100.0,
        currency: "USD",
      },
      pricing_type: "fixed_price",
      metadata: {
        user: `${user.email}`,
      },
    };
 
    const charge = await Charge.create(chargeData);   

    console.log(charge);

    res.json(charge);
  });
};

exports.createCharge300 = async (req, res) => {
  const { user } = req.body;

  cors(req, res, async () => {
    const chargeData = {
      name: "$300 Mini Subscription plan",
      description:
        "Our mini subscription plan for $300 annually with an increase of 41% monthly.",
      local_price: {
        amount: 300.0,
        currency: "USD",
      },
      pricing_type: "fixed_price",
      metadata: {
        user: `${user.email}`,
      },
    };

    const charge = await Charge.create(chargeData);

    console.log(charge);

    res.json(charge);
  });
};

exports.createCharge500 = async (req, res) => {
  const { user } = req.body;

  cors(req, res, async () => {
    const chargeData = {
      name: "$500 Mini Subscription plan",
      description:
        "Our mini subscription plan for $500 annually with an increase of 41% monthly.",
      local_price: {
        amount: 500.0,
        currency: "USD",
      },
      pricing_type: "fixed_price",
      metadata: {
        user: `${user.email}`,
      },
    };

    const charge = await Charge.create(chargeData);

    console.log(charge);

    res.json(charge);
  });
};

//Mega Plans

exports.createCharge1000 = async (req, res) => {
  const { user } = req.body;

  cors(req, res, async () => {
    const chargeData = {
      name: "$1000 Mega Subscription plan",
      description:
        "Our Mega subscription plan for $1000 annually with an increase of 41% monthly.",
      local_price: {
        amount: 1000.0,
        currency: "USD",
      },
      pricing_type: "fixed_price",
      metadata: {
        user: `${user.email}`,
      },
    };

    const charge = await Charge.create(chargeData);

    console.log(charge);

    res.json(charge);
  });
};

exports.createCharge5000 = async (req, res) => {
  const { user } = req.body;

  cors(req, res, async () => {
    const chargeData = {
      name: "$5000 Mega Subscription plan",
      description:
        "Our Mega subscription plan for $5000 annually with an increase of 41% monthly.",
      local_price: {
        amount: 5000.0,
        currency: "USD",
      },
      pricing_type: "fixed_price",
      metadata: {
        user: `${user.email}`,
      },
    };

    const charge = await Charge.create(chargeData);

    console.log(charge);

    res.json(charge);
  });
};

exports.createCharge10000 = async (req, res) => {
  const { user } = req.body;

  cors(req, res, async () => {
    const chargeData = {
      name: "$10000 Mega Subscription plan",
      description:
        "Our mini subscription plan for $10000 annually with an increase of 41% monthly.",
      local_price: {
        amount: 10000.0,
        currency: "USD",
      },
      pricing_type: "fixed_price",
      metadata: {
        user: `${user.email}`,
      },
    };

    const charge = await Charge.create(chargeData);

    console.log(charge);

    res.json(charge);
  });
};
