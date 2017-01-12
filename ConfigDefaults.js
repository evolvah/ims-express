"use strict"

function ConfigDefaults() {
    // Configuration defaults
    this.defaults = {
        "server" : {
            "defaultTcpPort"                : "4321"
        },
        "ims" : {
            "jwtDefaultExpirationPeriod"    : "1h",
            "jwtSymmetricSignature"         : "secret123"
        }
    }
}

// export the ConfigDefaults object
module.exports = new ConfigDefaults();
