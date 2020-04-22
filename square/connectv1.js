/*
*	SQUARE: VERSION 1
*
*	This module works with the square API on all version 1 functions
*/

//define dependcies
var SquareConnect 	= require('square-connect');
var defaultClient 	= SquareConnect.ApiClient.instance;

// Configure OAuth2 access token for authorization: oauth2
var _oauth2 		= defaultClient.authentications['oauth2'];
//_oauth2.accessToken = process.env.SQUARE_SANDBOX_APP_TOKEN
_oauth2.accessToken = process.env.SQUARE_APP_TOKEN;

//define module
var v1 = {
    transactions: {
        list: listTransactions
    },
    orders: {
        search: searchOrders
    },
	items: {
		list: itemsList
	}
};

function listTransactions(locationId, start, end, cursor) {
    //  DEFINE LOCAL VARIALES
    var transactionlist = [];
	var apiInstance = new SquareConnect.TransactionsApi();
    var opts = { 
		'beginTime': start, // String | The beginning of the requested reporting period, in RFC 3339 format.  See [Date ranges](#dateranges) for details on date inclusivity/exclusivity.  Default value: The current time minus one year.
		'endTime': end, // String | The end of the requested reporting period, in RFC 3339 format.  See [Date ranges](#dateranges) for details on date inclusivity/exclusivity.  Default value: The current time.
		//'sortOrder': "sortOrder_example", // String | The order in which results are listed in the response (`ASC` for oldest first, `DESC` for newest first).  Default value: `DESC`
		'cursor': cursor // String | A pagination cursor returned by a previous call to this endpoint. Provide this to retrieve the next set of results for your original query.  See [Pagination](/basics/api101/pagination) for more information.
	};
	
	//	return async work
	return new Promise(function(resolve, reject) {
		apiInstance.listTransactions(locationId, opts).then(function(data) {
			//	CHECK FOR PAGINATION
			if(data.cursor != undefined) {
				listTransactions(locationId, start, end, data.cursor)
				.then(function cursorSuccess(txsList) {
					//iterate over list
					for(var i = data.transactions.length -1; i >= 0; i--) {
						txsList.push(data.transactions[i]);
					}
					
					resolve(txsList);
				}).catch(function cursorError(e) {
					reject(e);
				});
			} else {
				
				//iterate over list
				for(var i = data.transactions.length -1; i >= 0; i--) {
					transactionlist.push(data.transactions[i]);
				}
				resolve(transactionlist);
			}
			//console.log('API called successfully. Returned data: ' + data);
			//resolve(data);
		}, function(error) {
			reject(error);
		});
	});

}


function searchOrders(locations,cursor) {
    //  DEFINE LOCAL VARIALES
    var apiInstance = new SquareConnect.OrdersApi();
    var body = new SquareConnect.SearchOrdersRequest(); // SearchOrdersRequest | An object containing the fields to POST for the request.  See the corresponding object definition for field details.
    body.location_ids=locations;
    body.cursor= cursor;

    //return async work
    return new Promise(function(resolve, reject) {

        //hit the apiInstance
        apiInstance.searchOrders(body).then(function(data) {
            //notify progress
            console.log('API called successfully. ' + data.orders.length + ' records found'/*Cursor', cursor, ' Returned data: ', data.cursor*/);

            //check for a cursor
            if(data.cursor != undefined) {
                //if there is a cursor, we must go deeper
                searchOrders(locations, data.cursor).then(function success(s) {

                    data.forEach(function(customer) {
                        s.push(customer);
                    });

                    resolve(s);

                }).catch(function error(e) {
                    reject(e);
                });

            } else {
                //if no cursor we've reached the end
                console.log('reached the bottom');
                //console.log(data);
                //console.log(data.customers)

                resolve(data.orders);
            };

        }, function(error) {
        console.error(error);
        reject(error);
        });

    });

};


function itemsList(cursor) {
	//define local variables
	var apiInstance = new SquareConnect.V1ItemsApi();

	var locationId = "SJFCY96E7N0RW"; // String | The ID of the location to list items for.

	var opts = { 
	  'batchToken': cursor // String | A pagination cursor to retrieve the next set of results for your original query to the endpoint.
	};

	//return async work
	return new Promise(function(resolve, reject) {

		//hit the apiInstance
		apiInstance.listItems(locationId, opts).then(function(data) {
			//notify progress
			console.log('API called successfully. Cursor', cursor, ' Returned data: ', data.cursor);

		 	//check for a cursor
		 	if(data.cursor != undefined) {
		 		//if there is a cursor, we must go deeper
		 		listCustomers(data.cursor).then(function success(s) {

		 			data.forEach(function(customer) {
		 				s.push(customer);
		 			});

		 			resolve(s);

		 		}).catch(function error(e) {
		 			reject(e);
		 		});

		 	} else {
		 		//if no cursor we've reached the end
		 		console.log('reached the bottom');
		 		//console.log(data);
		 		//console.log(data.customers)

		 		resolve(data);
		 	};

		}, function(error) {
		  console.error(error);
		  reject(error);
		});

	});


}

//export module
module.exports = v1;

