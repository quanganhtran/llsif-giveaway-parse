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

    checkButtons();

    $('.draft-buttons').click(function() {
        var imgIndex = muse.indexOf(this.id) + 1;
        Parse.Cloud.run("draftLuck1Entry", {choice: this.id}).then(function (code) {
            console.log(code);
            swal({
                title: code,
                text: "Congratulations! Above is the code you won. Please write it down carefully!",
                imageUrl: "img/muse_info/p" + imgIndex + "_full.jpg",
                imageSize: "150x200"
            });
        }, function (error) {
            console.log(error);
            swal({
                title: "Sorry!",
                text: error.message,
                imageUrl: "img/muse_info/p" + imgIndex + "_full.jpg",
                imageSize: "150x200"
            });
            //if (error.message == "Not me! You are eliminated!") {
            //    checkButtons();
            //}
        });
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

function checkButtons() {
    $('.draft-buttons').attr("disabled", true);
    Parse.Cloud.run("queryChoicesLuck1Entry", null).then(function (choiceArray) {
        for (var i = 0; i < choiceArray.length; i++) {
            document.getElementById(choiceArray[i]).removeAttribute("disabled");
        }
    })
}

var muse = ["maki", "rin", "hanayo", "umi", "honoka", "kotori", "eli", "nico", "nozomi"];

function randomIntBothInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function newEntry(code, choice) {
    Parse.Cloud.run("newLuck1Entry", {code: code, choice: choice}).then(function (res) {
        console.log(res);
        console.log("newEntry: Your entry has been submitted.");
    }, function (err) {
        console.log(err);
        console.log("newEntry: There was a problem with your submission.");
    });
}