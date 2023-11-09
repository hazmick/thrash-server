const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AccountInfoSchema = new Schema({
  email: { type: String },
  info: {
    general: {
      information : {type: String},
      warning : {type: String},
      show : {type: String},
    },
    staking: {
      information : {type: String},
      warning : {type: String},
      show : {type: String},
    },
    mining: {
      information : {type: String},
      warning : {type: String},
      show : {type: String},
    },
    trading: {
      information : {type: String},
      warning : {type: String},
      show : {type: String},
    }
  }
});

const AccountInfo = mongoose.model('AccountInfo', AccountInfoSchema);

module.exports = AccountInfo;