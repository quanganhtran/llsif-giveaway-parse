/**
 * Created by Anh on 3/10/2015.
 */

// Initialize Parse
Parse.initialize("zCl7jdOfCYEHvfsPgePtdxDVVq6keW1CB3NAtEHh", "H3v1naF3SwQSSzKT5gkOPaEWk8OIvcqE7a1COjq3");

window.fbAsyncInit = function () {
    Parse.FacebookUtils.init({ // this line replaces FB.init({
        appId: '804534999625543', // Facebook App ID
        status: false,  // check Facebook Login status
        cookie: true,  // enable cookies to allow Parse to access the session
        xfbml: true,  // initialize Facebook social plugins on the page
        version: 'v2.2' // point to the latest Facebook Graph API version
    });

    // Run code after the Facebook SDK is loaded.

    // Check if the current user is logged in and has authorized the app
    FB.getLoginStatus(function (response) {
        if (response && response.status === 'connected') {
            console.log('User is logged into Facebook, authenticating usage right...');
            facebookAuth(response);
        } else {
            Parse.User.logOut();
            activityLog("Please log into Facebook before using the application.");
            refreshStatus();
            setToDefaultCover();
        }
    });

    // Login button for user to authorize manually.
    $('#login').click(function () {
        FB.login(function (response) {
            if (response.status == 'connected') {
                facebookAuth(response);
            }
        });
    });

    $('button.claim-giveaway').click(function () {
        claimAuth($("#claim-code").val());
        $("#claim-code").val("");
    });

    $('button.new-giveaway').click(function () {
        if ($("#new-code").val() !== "") {
            submitAuth($("#new-code").val());
            $("#new-code").val("");
        } else {
            activityLog("The code field cannot be empty.");
        }
    });

    $('#unclaimed').click(function () {
        queryUnclaimed();
    });

    $('#claimed').click(function () {
        queryClaimed();
    });

    $('#list-members').click(function () {
        queryMembers($('#member-name').val());
    });

    //$('#submit-cover').click(function() {
    //    setCover($("#cover-file")[0]);
    //});

    $("ul#tabs li").click(function (e) {
        if (!$(this).hasClass("active")) {
            var tabNum = $(this).index();
            var nthChild = tabNum + 1;
            $("ul#tabs li.active").removeClass("active");
            $(this).addClass("active");
            $("ul#tab li.active").removeClass("active");
            $("ul#tab li:nth-child(" + nthChild + ")").addClass("active");
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

// FUNCTION DECLARATIONS

function isAlphaNumeric(str) {
    var code, i, len;
    for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)) { // lower alpha (a-z)
            return false;
        }
    }
    return true;
}

// Functionality
function facebookAuth(fbResponse) {
    console.log("facebookAuth: Authentication started.");
    activityLog("Facebook authentication is running, please hold on...");
    Parse.Cloud.run("facebookAuth", fbResponse.authResponse, {
        success: function (response) {
            console.log("User logged in through Facebook!");
            Parse.User.become(response.sessionToken).then(function (loggedUser) {
                // The current user is now set to user.
                console.log("facebookAuth: Authentication completed.");
                activityLog("User logged in through Facebook!");
                refreshStatus();

                //FB.api('/348965238597534?fields=cover', function (response) {
                //    if (response.cover) {
                //        document.getElementById('cover-photo').src = response.cover.source;
                //    } else {
                //        setToDefaultCover();
                //    }
                //});

                setToDefaultCover();

            }, function (error) {
                // The token could not be validated.
                console.log("The token could not be validated.");
                activityLog("An error has occurred: " + error);
                setToDefaultCover();
            });
        },
        error: function (error) {
            console.log(error);
            activityLog("You need to be a group member to use the application!");
            Parse.User.logOut();
            refreshStatus();
            setToDefaultCover();
        }
    });
}

function claimAuth(giveAwayId) {
    console.log("claimAuth: Authentication started.");
    activityLog("Please wait...");
    Parse.Cloud.run("claimAuth", {input: giveAwayId}).then(function (code) {
        console.log("claimAuth: Authentication completed.");
        activityLog("Your giveaway code is: <br><h2 style=\"text-align: center;\">" + code + "</h2><br>" +
        "Please make sure you write down this code as it cannot be viewed here again.");
        alertCode(code);
    }, function (error) {
        console.log(error);
        activityLog(error.message);
        swal("Error", error.message, "error");
    });
}

function submitAuth(giveAwayCode) {
    console.log("submitAuth: Authentication started.");
    activityLog("Please wait...");
    Parse.Cloud.run("submitAuth", {value: giveAwayCode}).then(function (giveAway) {
        console.log("submitAuth: Authentication completed.");
        activityLog("Your new Giveaway ID is: " + giveAway.id);
        swal({
            title: giveAway.id,
            text: "This is your new Giveaway ID. You can view this again later by using the \"View Giveaways\" functions below.",
            imageUrl: "img/" + randomMuse()
        });
    }, function (error) {
        console.log(error);
        activityLog("Error: Your new giveaway couldn't be submitted.");
        swal("Error", "Your new giveaway couldn't be submitted. Not yet a contributor? Contact a group admin!", "error");
    });
}

function setToDefaultCover() {
    document.getElementById('cover-photo').src = "img/cover.png";
}

function queryClaimed() {
    console.log("queryClaimed: Query started.");
    activityLog("Please wait...");
    Parse.Cloud.run("queryClaimed", null).then(function (results) {
        activityLog("Successfully retrieved " + results.length + " entries.");
        var r = [], j = -1;
        r[++j] = '<tr><td>';
        r[++j] = 'ID';
        r[++j] = '</td><td>';
        r[++j] = 'Submitted by';
        r[++j] = '</td><td>';
        r[++j] = 'Claimed By';
        r[++j] = '</td><td>';
        r[++j] = 'Date';
        r[++j] = '</td></tr>';
        // Do something with the returned Parse.Object values
        for (var i = 0; i < results.length; i++) {
            var object = results[i];
            //console.log(object.get('postedBy'));
            r[++j] = '<tr><td>';
            r[++j] = object.id;
            r[++j] = '</td><td>';
            r[++j] = (Parse.User.current().id === object.get('postedBy').id) ? "you" : object.get('posterName');
            r[++j] = '</td><td>';
            r[++j] = (Parse.User.current().id === object.get('claimedBy').id) ? "you" : object.get('claimerName');
            r[++j] = '</td><td>';
            r[++j] = object.updatedAt;
            r[++j] = '</td></tr>';
        }
        document.getElementById('entryTable').innerHTML = r.join('');
    }, function (error) {
        console.log(error);
        activityLog("Error: This action could not be completed.");
    });
}

function queryUnclaimed() {
    console.log("queryUnclaimed: Query started.");
    activityLog("Please wait...");
    Parse.Cloud.run("queryUnclaimed", null).then(function (results) {
        activityLog("Successfully retrieved " + results.length + " entries.");
        var r = [], j = -1;
        r[++j] = '<tr><td>';
        r[++j] = 'ID';
        r[++j] = '</td><td>';
        r[++j] = 'Submitted by';
        r[++j] = '</td><td>';
        r[++j] = 'Code';
        r[++j] = '</td><td>';
        r[++j] = 'Date';
        r[++j] = '</td></tr>';
        // Do something with the returned Parse.Object values
        for (var i = 0; i < results.length; i++) {
            var object = results[i];
            r[++j] = '<tr><td>';
            r[++j] = object.id;
            r[++j] = '</td><td>';
            r[++j] = (Parse.User.current().id === object.get('postedBy').id) ? "you" : object.get('posterName');
            r[++j] = '</td><td>';
            r[++j] = object.get('code') ? object.get('code').get('value') : "&lt;not visible&gt;";
            r[++j] = '</td><td>';
            r[++j] = object.updatedAt;
            r[++j] = '</td></tr>';
        }
        document.getElementById('entryTable').innerHTML = r.join('');
    }, function (error) {
        console.log(error);
        activityLog("Error: This action could not be completed.");
        swal("Error", "This action could not be completed.", "error");
    });
}

function queryMembers(keyword) {
    console.log("queryMembers: Query started.");
    activityLog("Please wait...");
    Parse.Cloud.run("queryMembers", {keyword: keyword}).then(function (results) {
        activityLog("Successfully retrieved " + results.length + " users.");
        var r = [], j = -1;
        r[++j] = '<tr><td>';
        r[++j] = 'ID';
        r[++j] = '</td><td>';
        r[++j] = 'Name';
        r[++j] = '</td><td>';
        //r[++j] = '';
        //r[++j] = '</td><td>';
        r[++j] = 'Joined';
        r[++j] = '</td></tr>';
        // Do something with the returned Parse.Object values
        for (var i = 0; i < results.length; i++) {
            var object = results[i];
            r[++j] = '<tr><td>';
            r[++j] = object.id;
            r[++j] = '</td><td>';
            r[++j] = '<a href="user/?id=' + object.id + '">' + object.get('facebookName') + '</a>';
            r[++j] = '</td><td>';
            //r[++j] = "";
            //r[++j] = '</td><td>';
            r[++j] = object.createdAt;
            r[++j] = '</td></tr>';
        }
        document.getElementById('userTable').innerHTML = r.join('');
    }, function (error) {
        console.log(error);
        activityLog("Error: This action could not be completed.");
        swal("Error", "This action could not be completed.", "error");
    });
}

//function setCover(coverControl) {
//    if (coverControl.files.length > 0) {
//        var file = coverControl.files[0];
//        var name = "cover.jpg";
//        var parseFile = new Parse.File(name, file);
//        parseFile.save().then(function() {
//            // The file has been saved to Parse.
//            var query = new Parse.Query("Global");
//            query.equalTo("var", "coverPhoto");
//            return query.first();
//        }, function(error) {
//            // The file either could not be read, or could not be saved to Parse.
//        });
//    }
//}

// User Interface
function refreshStatus() {
    if (Parse.User.current() == null) {
        document.getElementById('level').innerHTML = "not logged in";
    } else {
        var nameString = Parse.User.current().get('facebookName');
        document.getElementById('level').innerHTML = "<a href='user/?id=" + Parse.User.current().id + "'>" + nameString + "</a>";
    }
}

function activityLog(str) {
    document.getElementById('log').innerHTML = str;
    var logs = document.getElementsByClassName('logs');
    for (var i = 0; i < logs.length; i++) {
            logs[i].innerHTML = str;
    }
}

function alertCode(code) {
    swal({
        title: code,
        text: "Please make sure you write down this code as it cannot be viewed here again.",
        imageUrl: "img/" + randomMuse()
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