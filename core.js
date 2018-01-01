var qPromise       = require ( 'q' );
var activityStream = require ( './activityStream' );

var logMsg = '';
var logToFile;


exports.setLogFileName = function ( logFilePrefix ) {
	logToFile.setLogFileName ( logFilePrefix );
};


exports.initialize = function ( logToFileInit ) {
	var deferred = qPromise.defer ();

	logToFile = logToFileInit;

	activityStream.initialize ( logToFile, handlePromiseReject )
		.then ( activityStream.addInitialValuesToMongoDB )
		.then ( deferred.resolve )
		.fail ( deferred.reject );

	return deferred.promise;
};


function handlePromiseReject ( error ) {
	if ( null !== error ) {
		if ( error.hasOwnProperty ( 'message' ) && error.message !== null ) {
			logMsg = 'Error: 1. Promise rejected: ' + JSON.stringify ( error.message );
			logToFile.log ( logMsg );
		} else {
			logMsg = 'Error 2: Promise rejected: ' + JSON.stringify ( error );
			logToFile.log ( logMsg );
		}
	}

	return null;
}


exports.activityStream = function ( req, res ) {
	activityStream.interpretQuery ( req, res );
};

