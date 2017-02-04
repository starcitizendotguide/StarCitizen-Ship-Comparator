var web = require('webpage');
var page = web.create();

page.open('https://robertsspaceindustries.com/pledge/ships', function(status) {

    for (var i = 0; i < 10; i++) {
        // Scroll the page (not sure if this is the best way to do so...)
        page.evaluate(function(a, b, c) {
            console.log(window.document.body.scrollTop);
            window.document.body.scrollTop += document.body.scrollHeight;
            /*
            page.scrollPosition = {
                top: page.scrollPosition + 1920,
                left: 0
            };*/
        });
    }

    //console.log(page.content);
    phantom.exit();

});
