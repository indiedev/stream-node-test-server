var fs       = require ( 'fs' );
//noinspection NpmUsedModulesInstalled
var moment   = require ( 'moment' );
var mv       = require ( 'mv' );
var qPromise = require ( 'q' );

var logFilePath  = null;
var startingTime = moment ().format ( 'YYYY-MM-DD-HH-mm-ss-SSS-a' );
var suffix       = 'logFile-' + startingTime + '.txt';

exports.setLogFileName = function ( prefix ) {
	logFilePath = prefix + '-' + suffix;
};

exports.log = function ( logMsg ) {
	if ( logMsg ) {
		//console.log ( logMsg );
		this.logTime ();

		try {
			fs.appendFileSync ( logFilePath, logMsg + '\r\n' );
		} catch ( error ) {
			logMsg = 'Error: logToFile.log : Could not append item to file : ' + JSON.stringify ( error );
			console.log ( logMsg );
		}
	}
};

exports.logTime = function () {
	try {
		fs.appendFileSync ( logFilePath, '\r\n' + moment ().format ( 'YYYY-MM-DD HH:mm:ss:SSS a' ) + '\r\n' );
	} catch ( error ) {
		var logMsg = 'Error: logToFile.logTime : Could not append item to file : ' + JSON.stringify ( error );
		console.log ( logMsg );
	}
};

exports.deleteLogFile = function () {
	fs.unlink ( logFilePath, function ( error ) {
		if ( error ) {
			var logMsg = 'Error in deleting Log file: ' + JSON.stringify ( error );
			this.log ( logMsg );

			console.log ( logMsg );
		}
	} );
};

exports.moveLogFile = function ( prefix ) {
	var deferred = qPromise.defer ();

	var newLogFilePath = prefix + '-success-' + suffix;

	mv ( logFilePath, newLogFilePath, function ( error ) {
		if ( error !== null && error !== undefined ) {
			var logMsg = 'Error: logToFile.moveLogFile : Error in moving Log file to logs-success folder: ' + JSON.stringify ( error );
			this.log ( logMsg );

			console.log ( logMsg );

			deferred.reject ( logMsg );
		}

		deferred.resolve ();
	} );

	return deferred.promise;
};
