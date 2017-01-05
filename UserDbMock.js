// Sample UserDb class
"use strict"

function UserDb() {
    // precanned map of user entries
    this.myUserDatabase = {
        "microsoft" : {
            "root" : {
                "fullname" : "System Account",
                "email" : "root@microsoft.com",
                "roles" : [ "admin" ],
                "password" : "secretMS"
            },
            "bill" : {
                "fullname" : "William Gates II",
                "email" : "bill.gates@microsoft.com",
                "roles" : [ "user" ],
                "password" : "640K"
            },
            "tigran" : {
                "fullname" : "Frunzik Mkrtchan",
                "email" : "frunzik.mkrtchan@microsoft.com",
                "roles" : [ "user" ],
                "password" : "vonces"
            },
            "dmitri" : {
                "fullname" : "Dmitri Bilan",
                "email" : "dmitri.bilan@microsoft.com",
                "roles" : [ "user", "admin" ],
                "password" : "znayu"
            },
        },

        "viavi" : {
            "root" : {
                "fullname" : "System Account",
                "email" : "root@viavisolutions.com",
                "roles" : [ "admin" ],
                "password" : "secretVS"
            },
            "bill" : {
                "fullname" : "William Gates Jr.",
                "email" : "bill.gates@viavisolutions.com",
                "roles" : [ "user" ],
                "password" : "640K"
            },
            "joe" : {
                "fullname" : "Jorge Martinez",
                "email" : "jorge.martinez@viavisolutions.com",
                "roles" : [ "user" ],
                "password" : "qwerty"
            },
            "wayne" : {
                "fullname" : "Clint Eastwood",
                "email" : "clint.eastwood@viavisolutions.com",
                "roles" : [ "user", "admin" ],
                "password" : "scotch"
            },
        },
    };
}

// Retrieve user claims if the user exists and is authenticated
UserDb.prototype.getUserClaims = function(tenant, login, password, retVal) {
    var userRecord = this.myUserDatabase[tenant] && this.myUserDatabase[tenant][login] || {}
    if (userRecord.password == password) {
        // Password matches
        Object.assign(retVal, userRecord)
        // Decorate the return value
        delete retVal.password  // remove password from the record
        retVal.tenant = tenant  // append tenant name
        retVal.login  = login   // append user login name
    } else {
        // Authentication failed (no matching triplet)
        Object.assign(retVal, {})
    }
}

// export the UserDb object
module.exports = new UserDb();
