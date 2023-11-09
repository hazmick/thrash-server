const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  email: { type: String },
  txn: [{
    type: { type: String },
    service: { type: String },
    amount: { type: Number },
    date: { type: String },
    status: { type: String },
    address: { type: String },
    coin: { type: String }
  }]
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

module.exports = Transaction;