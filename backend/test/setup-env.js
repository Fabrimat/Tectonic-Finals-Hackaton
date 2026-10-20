const { randomBytes } = require('crypto');

process.env.PARTNER_API_KEY = randomBytes(24).toString('hex');
