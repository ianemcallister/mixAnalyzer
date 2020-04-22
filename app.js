
//  DEFINE DEPENDENCIES
var squareV1    = require('./square/connectv1.js');


//  NOTIFY PROGRES
console.log('running the mixing program');

/*squareV1.transactions.list('M53KQT35YKE5C', '2018-08-18T00:00:00Z', '2018-08-19T23:59:59Z')
.then(function success(s) {
    Object.keys(s).forEach(function(id) {
        console.log(s[id]);
    });
}).catch(function error(e) {
    console.error(e);
})*/

squareV1.orders.search(['BAWEK61MYMN00'])