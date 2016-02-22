/**
 * Created by Anh on 3/10/2015.
 */

// Initialize Parse
Parse.initialize("zCl7jdOfCYEHvfsPgePtdxDVVq6keW1CB3NAtEHh", "H3v1naF3SwQSSzKT5gkOPaEWk8OIvcqE7a1COjq3");
var GiveAway = Parse.Object.extend("GiveAway");

window.fbAsyncInit = function () {
    Parse.FacebookUtils.init({ // this line replaces FB.init({
        appId: '804534999625543', // Facebook App ID
        status: false,  // check Facebook Login status
        cookie: true,  // enable cookies to allow Parse to access the session
        xfbml: true,  // initialize Facebook social plugins on the page
        version: 'v2.2' // point to the latest Facebook Graph API version
    });

    // Run code after the Facebook SDK is loaded.
    var queryUserObject = parseQueryString(window.location.search.substring(1));

    (new Parse.Query(Parse.User)).get(queryUserObject.id, {
        success: function (user) {
            refreshProfile(user);
        },
        error: function (error) {
            console.log(error);
            activityLog("A profile with this ID could not be displayed.")
        }
    });

    document.getElementById('confirm-assign').addEventListener("click", function () {
        if (document.getElementById('assign-role').value) {
            assignRole(queryUserObject.id, document.getElementById('assign-role').value);
        } else {
            activityLog("Please select an action on this user!");
        }
    });
};

(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function parseQueryString(queryString) {
    var params = {}, queries, temp, i, l;
    // Split into key/value pairs
    queries = queryString.split("&");
    // Convert the array of strings into an object
    for (i = 0, l = queries.length; i < l; i++) {
        temp = queries[i].split('=');
        params[temp[0]] = temp[1];
    }
    return params;
}

function refreshProfile(user) {
    $(".user-name").html(user.get('facebookName'));
    document.getElementById("user-id").innerHTML = user.id;
    (new Parse.Query(Parse.Role)).equalTo("users", user).first().then(function (role) {
        document.getElementById("user-role").innerHTML = role ? role.get("interfaceName") : "User";
    }, function (error) {
        console.log(error);
        document.getElementById("user-role").innerHTML = "unknown";
    });
}

function activityLog(str) {
    document.getElementById('log').innerHTML = str;
}

function assignRole(userID, roleString) {
    Parse.Cloud.run("assignRole", {userID: userID, role: roleString}, {
        success: function (user) {
            if (typeof user == "string") {
                activityLog(user);
            } else {
                refreshProfile(user);
                activityLog("The role for this user has been reassigned.");
            }
            swal({
                title: "Action completed!",
                text: "The role for this user has been reassigned.",
                imageUrl: "../img" + randomMuse()
            });
        },
        error: function (error) {
            console.log(error);
            activityLog("Error: This action could not be completed.");
            swal("Error", "This action could not be completed.", "error");
        }
    })
}

function randomMuse() {
    function randomIntBothInclusive(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    var muse = ["honoka", "umi", "kotori", "rin", "maki", "hanayo", "nico", "eli", "nozomi"];
    var oneMuse = muse[randomIntBothInclusive(0, 8)];
    return "/muse/" + oneMuse + ".png";
}