// Identity Management Service prototype
var express     = require("express")
var bodyParser  = require("body-parser")
var crypto      = require("crypto")
var jwt         = require("jsonwebtoken")
var userDb      = require("./UserDbMock.js")

// Configuration defaults
var config = {
    "server" : {
        "defaultTcpPort"            : "4321"
    },
    "jwt" : {
        "defaultExpirationPeriod"   : "1h",
        "symmetricSignature"        : "secret123"
    }
}

var evictedJwt = {}

// Express application object
var app = express()

// parse application/json
app.use(bodyParser.json())

// POST method to authenticate a user given tenant, login, and password
// It is assumed that the TCP connection is SSL-protected and transmission
// of the password over this channel is secure. In future implementation,
// it is possible to implement a challenge-response mechanism that is
// resilient to traffic capture and reconstruction.
app.post("/session/start", function (req, res) {
    var claims = { "authenticated" : false }
    // Attempt a lookup of the user in the underlying database. Modifies the fourth arg!
    userDb.getUserClaims(
        req.body.tenant,
        req.body.login,
        req.body.password,
        claims
    )

    var responseBody = {}
    // Decorate the response if user was authenticated sucessfully
    if (claims.authenticated) {
        // Append the JWT and fill in a few more fields
        responseBody.jwt = jwt.sign(
            claims,
            config.jwt.symmetricSignature,
            { "expiresIn" : config.jwt.defaultExpirationPeriod }
        )
        responseBody.message = "OK"
    } else {
        // Report an error if no user was found or authentication failed
        var clientIpAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        responseBody.message = `Authentication failed for ${req.body.login}@${req.body.tenant}. Client address ${clientIpAddr}`
    }

    // Ship the response out
    res.json(responseBody)
})

function isJwtValid(jwtToValidate) {
    var found = true
    try {
        jwt.verify(jwtToValidate, config.jwt.symmetricSignature)
    } catch (err) {
        found = false
    }
    return found
}

// Evict/logout a session
app.post("/session/end", function (req, res) {
    var responseBody = {}

    var jwtToEvict = req.body.jwt

    if (isJwtValid(jwtToEvict)) {
        evictedJwt[jwtToEvict] = Date.now()
        responseBody.message = "OK"
    } else {
        responseBody.message = "JWT is not valid and cannot be evicted"
    }

    // Ship the response out
    res.json(responseBody)
})

// Evict/logout a session
app.get("/session/state/:jwtToCheck", function (req, res) {
    var jwtToCheck = req.params.jwtToCheck

    var responseBody = {}

    // If the JWT is still valid and it has not been evicted, it is ok
    if (isJwtValid(jwtToCheck) && !evictedJwt.hasOwnProperty(jwtToCheck)) {
        responseBody.message = "OK"
    } else {
        responseBody.message = "JWT is not valid"
    }

    // Ship the response out
    res.json(responseBody)
})

// Debug function that dumps out the currently evicted JWT
app.get("/session/debug/evictedJwt", function (req, res) {
    res.json(evictedJwt)
})

// Debug function that clears the collection of evicted JWT
app.delete("/session/debug/evictedJwt", function (req, res) {
    evictedJwt = {}
    res.json({"message" : "OK"})
})

// Let's fire it up
app.listen(config.server.defaultTcpPort, function () {
    console.log(`Authentication server is up on port ${config.server.defaultTcpPort}`)
})

