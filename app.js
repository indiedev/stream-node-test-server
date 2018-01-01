var express    = require ( 'express' );
var bodyParser = require ( 'body-parser' );
var helmet     = require ( 'helmet' );

var logToFile = require ( './logToFile' );
var core      = require ( './core' );


exports.CORE = (function () {
	var app    = express ();
	var logMsg = '';

	function isInArray ( value, array ) {
		return (array.indexOf ( value ) > -1);
	}

	function appCore () {
		appCore.logFilePrefix = 'stream-node-demo';
		appCore.usePublicDNS  = !(null === process.env.OS || undefined === process.env.OS) && isInArray ( 'windows', process.env.OS.toLowerCase () );

		logToFile.setLogFileName ( appCore.logFilePrefix );

		core.initialize ( logToFile )
			.then ( function () {
				//noinspection JSCheckFunctionSignatures
				app.use ( bodyParser.json () );                                         // use default options for parsing application/json
				app.use ( bodyParser.raw ( { type : 'audio/wav', limit : '2mb' } ) );   // options for wav file
				app.use ( helmet () );

				app.get ( '/', function ( req, res ) {
					res.send ( 'You\'re probably at the wrong place!' );
				} );

				var regexActivityStream = /activity-stream/;

				app.post ( regexActivityStream, core.activityStream );

				app.listen ( 3000, function () {
					logMsg = 'API Server listening on port 3000...';

					console.log ( logMsg );
					logToFile.log ( logMsg );
				} );
			} )
			.fail ( function ( error ) {
				logMsg = 'Unhandled Error in Initializing application: ' + JSON.stringify ( error );
				console.log ( logMsg );
				logToFile.log ( logMsg );
			} );
	}

	try {
		appCore ();
	} catch ( error ) {
		logMsg = 'Unhandled Exception: ' + JSON.stringify ( error );
		console.log ( logMsg );
		logToFile.log ( logMsg );
	}
} ());
