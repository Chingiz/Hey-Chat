var request = require('request');
var querystring = require('querystring');
/**
 * Demo for translating a 'Hello world' from en to uk with help of Bing Translator service
 */
(function() {
    var makeTranslateRequest = function(token) { //I provided you my token at this point
        var opts = {
            text: 'Hello world',
            from: 'en-gb',
            to: 'ru'
        };

        request.get({
            url: "http://api.microsofttranslator.com/v2/Http.svc/Translate?contentType=text/plain&from=" + opts.from + "&to=" + opts.to + "&text=" + opts.text,
            headers: {
                'Authorization': encodeURIComponent('Bearer' + token).replace(/'/g,"%27").replace(/"/g,"%22")
            }
        },function(err,res,body) {
            var translated = body;
            console.log('translated: ' + translated);
        });
    }
    /**
     * Get token and make translate request in a callback
     */
    var requestOpts = querystring.stringify({
        client_id: '3a7a26d9254FFC08', 
        client_secret: 'SuNwPHKH6UbvhyZ34FlqOWJ9z2zN6KS8djzHpf8NvOI=',
        scope: 'http://api.microsofttranslator.com',
        grant_type: 'client_credentials'
    });

    request.post({
        encoding: 'utf8',
        url: "https://datamarket.accesscontrol.windows.net/v2/OAuth2-13",
        body: requestOpts
    }, function(err, res, body) {
        var token = JSON.parse(body).access_token;
        makeTranslateRequest(token);
    });
})();