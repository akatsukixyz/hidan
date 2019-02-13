const { Client } = require('discord.js');
module.exports = class BaseClient extends Client {
    constructor(token, options = null) { super(options); this.token = token; };
    async start() { this.login(this.token); };
};