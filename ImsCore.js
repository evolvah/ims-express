"use strict";

var jwt         = require("jsonwebtoken");
var userDb      = require("./UserDbMock.js");

function ImsCore() {
    this.config     = {};
    this.evictedJwt = {};
};

ImsCore.prototype.isJwtValid = function(jwtToValidate, sig) {
    var found = true;
    try {
        jwt.verify(jwtToValidate, sig)
    } catch (err) {
        found = false;
    }
    return found;
};

ImsCore.prototype.configure = function(config) {
    this.config = config;
};

ImsCore.prototype.session_start = function(args) {
    var claims = { "authenticated" : false };
    // Attempt a lookup of the user in the underlying database. Modifies the fourth arg!
    userDb.getUserClaims(
        args.tenant,
        args.login,
        args.password,
        claims
    );

    var ret = {};
    // Decorate the response if user was authenticated sucessfully
    if (claims.authenticated) {
        // Append the JWT and fill in a few more fields
        ret.jwt = jwt.sign(
            claims,
            this.config.jwtSymmetricSignature,
            { "expiresIn" : this.config.jwtDefaultExpirationPeriod }
        );
        ret.message = "OK";
    } else {
        // Report an error if no user was found or authentication failed
        var clientIpAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        ret.message = `Authentication failed for ${req.body.login}@${req.body.tenant}. Client address ${clientIpAddr}`;
    }

    return ret;
};

ImsCore.prototype.session_end = function(args) {
    var ret = {};

    var jwtToEvict = args.jwt;

    if (this.isJwtValid(jwtToEvict, this.config.jwtSymmetricSignature)) {
        this.evictedJwt[jwtToEvict] = Date.now();
        ret.message = "OK";
    } else {
        ret.message = "JWT is not valid and cannot be evicted";
    }

    return ret;
};

ImsCore.prototype.session_state = function (args) {
    var jwtToCheck = args.jwtToCheck;

    var ret = {};

    // If the JWT is still valid and it has not been evicted, it is ok
    if (this.isJwtValid(jwtToCheck, this.config.jwtSymmetricSignature) && !this.evictedJwt.hasOwnProperty(jwtToCheck)) {
        ret.message = "OK";
    } else {
        ret.message = "JWT is not valid";
    }

    return ret;
};

ImsCore.prototype.getEvictedJwt = function(args) {
    return {
        "message"    : "OK",
        "evictedJwt" : this.evictedJwt
    };
};

ImsCore.prototype.clearEvictedJwt = function(args) {
    this.evictedJwt = {};
    return { "message" : "OK" };
};

ImsCore.prototype.decodeJwt = function (args) {
    var ret = {};

    var decodedJwt = jwt.decode(args.jwtToDecode);
    if (decodedJwt) {
        ret.message = "OK";
        ret.decodedJwt = decodedJwt;
    } else {
        ret.message = "Failed to decode the JWT";
    }

    return ret;
};

// export the ImsCore object
module.exports = new ImsCore();
