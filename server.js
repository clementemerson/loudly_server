var express = require('express');
var app = express();
const https = require('https');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

app.get('/getOTP/:phonenumber', function (req, res) {
   console.log('came here');
   if(req.params.phonenumber) {


        // Result from isPossibleNumber().
        const number = phoneUtil.parseAndKeepRawInput(req.params.phonenumber);
        if(phoneUtil.isPossibleNumber(number) && phoneUtil.isValidNumber(number) &&
            phoneUtil.isValidNumberForRegion(number, 'IN')) {
                var otpRequestUrl = 'https://2factor.in/API/V1/66b88c13-ed3c-11e8-a895-0200cd936042/SMS/' + req.params.phonenumber + '/AUTOGEN/PhoneAuthLoudSpeaker';
                console.log(otpRequestUrl);
                https.get(otpRequestUrl, (resp) => {
                    let data = '';

                    // A chunk of data has been recieved.
                    resp.on('data', (chunk) => {
                        data += chunk;
                        console.log(data);
                    });

                    // The whole response has been received. Print out the result.
                    resp.on('end', () => {
                        var response = JSON.parse(data);
                        res.end(response.Details);
                    });
                }).on("error", (err) => {
                    console.log("Error: " + err.message);
                });

        } else {
            res.end('{"error":"invalid phone number"}');
        }
    } else {
        res.end('{"error":"invalid phone number"}');
    }
});

app.get('/Users/:id', function (req, res) {
    console.log(req.params.id);
    res.end('<h1>Some Title<h1>');
 });

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})