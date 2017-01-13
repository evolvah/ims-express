// Identity Management Service prototype
var express     = require("express");
var bodyParser  = require("body-parser");

var imsCore     = require("./ImsCore.js");
var config      = require("./ConfigDefaults.js");
imsCore.configure(config.defaults.ims);

// Express application object
var app = express();

// parse application/json
app.use(bodyParser.json());

// POST method to authenticate a user given tenant, login, and password
// It is assumed that the TCP connection is SSL-protected and transmission
// of the password over this channel is secure. In future implementation,
// it is possible to implement a challenge-response mechanism that is
// resilient to traffic capture and reconstruction.
app.post("/session/start", function (req, res) {
    var args = {
        "tenant"   : req.body.tenant,
        "login"    : req.body.login,
        "password" : req.body.password
    };

    res.json(imsCore.session_start(args));
});

// Evict/logout a session
app.post("/session/end", function (req, res) {
    var args = { "jwt" : req.body.jwt };

    res.json(imsCore.session_end(args));
});

// Check session's JWT state
app.get("/session/state/:jwtToCheck", function (req, res) {
    var args = { "jwtToCheck" : req.params.jwtToCheck };

    res.json(imsCore.session_state(args));
});

// Debug function that dumps out the currently evicted JWT
app.get("/session/debug/evictedJwt", function (req, res) {
    res.json(imsCore.getEvictedJwt());
});

// Debug function that clears the collection of evicted JWT
app.delete("/session/debug/evictedJwt", function (req, res) {
    res.json(imsCore.clearEvictedJwt());
});

// Decode the JWT
app.get("/session/debug/decode/:jwtToDecode", function (req, res) {
    var args = { "jwtToDecode" : req.params.jwtToDecode };

    res.json(imsCore.decodeJwt(args));
});

// Let's fire it up
app.listen(config.defaults.server.defaultTcpPort, function () {
    console.log(`Authentication server is up on port ${config.defaults.server.defaultTcpPort}`);
});

