const { ensureAuthenticated } = require("../modules/auth/auth.middleware");

module.exports = ensureAuthenticated;
