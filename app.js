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
    var claims = {}
    // Attempt a lookup of the user in the underlying database. Overwrites the fourth arg!
    userDb.getUserClaims(
        req.body.tenant,
        req.body.login,
        req.body.password,
        claims
    )

    var responseBody = {}
    // Decorate the response if userInfo is not empty
    if (Object.keys(claims).length > 0) {
        // Append the JWT and fill in a few more fields
        responseBody.jwt = jwt.sign(
            claims,
            config.jwt.symmetricSignature,
            { "expiresIn" : config.jwt.defaultExpirationPeriod }
        )
    } else {
        // Report an error if no user was found or authentication failed
        var clientIpAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        responseBody.message = `Authentication failed for ${login}@${tenant}. Client address ${clientIpAddr}`
    }

    // Ship the response out
    res.json(responseBody)
})

// Let's fire it up
app.listen(config.server.defaultTcpPort, function () {
    console.log(`Authentication server is up on port ${config.server.defaultTcpPort}`)
})

