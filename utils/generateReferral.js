const { nanoid } = require('nanoid');
const User = require('../models/User');

const generateUniqueReferral = async () => {
  let code = nanoid(8);
  while(await User.findOne({ referralCode: code })) {
    code = nanoid(8);
  }
  return code;
};

module.exports = generateUniqueReferral;
