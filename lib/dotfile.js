"use strict";

const path = require('path');
const fs   = require('fs');
const e    = process.env;

let root = e.USERPROFILE || e.APPDATA || e.TMP || e.TEMP;

function Config() {
    if (!(this instanceof Config)) {
        return new Config('.electron-windows-store');
    }

    this.path = path.join(root, '.electron-windows-store');
}

Config.prototype.get = function () {
    try {
        return JSON.parse(fs.readFileSync(this.path, 'utf8'));
    } catch (err) {
        return {};
    }
};

Config.prototype.set = function (config) {
    if (e.USER === 'root') {
        return;
    }

    try {
        fs.writeFileSync(this.path, JSON.stringify(config, null, 2) + '\n');
    } catch (err) {
        return;
    }
};

module.exports = Config;
