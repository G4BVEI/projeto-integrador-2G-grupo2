const crypto = require('crypto');
const randomBytes = crypto.randomBytes(32);
const base64String = randomBytes.toString('base64');
console.log(base64String);