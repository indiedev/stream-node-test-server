/**
 * Newsfeed API
 */

var fs         = require ( 'fs' );
var qPromise   = require ( 'q' );
var streamNode = require ( 'getstream-node' );
var moment     = require ( 'moment' );

var mongoose = require ( 'mongoose' );

var Schema       = mongoose.Schema;
mongoose.Promise = require ( 'q' ).Promise;

var logMsg = '';
var logToFile, handlePromiseReject, streamClient;

var appConfig  = JSON.parse ( fs.readFileSync ( './appConfig.json' ) );
var uriMongoDB = encodeURI ( appConfig.mongodbURI );

var feedManager, streamMongoose, streamBackend;
var User, Expense;
var expenseAddSchema, ExpenseAdd;

function expenseModel () {
	expenseAddSchema = Schema ( {
		user   : { type : Schema.Types.ObjectId, required : true, ref : 'users' },
		object : { type : Schema.Types.ObjectId, required : true, ref : 'expenses' }
	}, {
		collection : 'ExpenseAdd'
	} );

	expenseAddSchema.plugin ( streamMongoose.activity );

	expenseAddSchema.statics.pathsToPopulate = function () {
		return [ 'user', 'object' ];
	};

	expenseAddSchema.methods.activityVerb = function () {
		return 'add';
	};

	expenseAddSchema.methods.activityTime = function () {
		return moment ().format ( 'YYYY-MM-DDTHH:mm:ss.SSS' );
	};

	expenseAddSchema.methods.activityForeignId = function () {
		return this.user._id + ':' + this.object._id;
	};

	/*
	expenseAddSchema.post ( 'save', function ( doc ) {
		if ( doc.wasNew ) {
			var userId   = doc.user._id || doc.user;
			var objectId = doc.object._id || doc.object;

			//feedManager.activityCreated ( doc );
		}
	} );

	expenseAddSchema.post ( 'remove', function ( doc ) {
		console.log ( 'Do something to remove doc: ' + JSON.stringify ( doc ) );
	} );
	*/

	ExpenseAdd = mongoose.model ( 'ExpenseAdd', expenseAddSchema );
}

function setupModels () {
	var userSchema = new Schema (
		{
			name : { type : String, required : true }
		}, {
			collection : 'users'
		}
	);

	User = mongoose.model ( 'user', userSchema );

	var expenseSchema = new Schema (
		{
			createdBy   : { type : String, required : true },
			desc        : { type : String, required : true },
			totalAmount : { type : Number, required : true }
		}, {
			collection : 'expenses'
		}
	);

	Expense = mongoose.model ( 'expense', expenseSchema );

	expenseModel ();
}

exports.initialize = function ( logToFileInit, handlePromiseRejectInit ) {
	var deferred = qPromise.defer ();

	logToFile           = logToFileInit;
	handlePromiseReject = handlePromiseRejectInit;

	mongoose.connect ( uriMongoDB, { useMongoClient : true } )
		.then ( function () {
			logMsg = 'Connected to MongoDB';
			logToFile.log ( logMsg );

			feedManager    = streamNode.FeedManager;
			streamMongoose = streamNode.mongoose;
			streamBackend  = new streamMongoose.Backend ();

			// Instantiate a new client (server side)
			//streamClient = streamNode.connect ( streamKEY, streamSECRET, '32416' );

			setupModels ();

			// Register mongoose connection with stream after registering models
			streamNode.mongoose.setupMongoose ( mongoose );

			deferred.resolve ( true );
		} )
		.fail ( function ( err ) {
			logMsg = 'Error in connecting to MongoDB: ' + JSON.stringify ( err );
			logToFile.log ( logMsg );

			deferred.reject ( err );
		} );

	return deferred.promise;
};

exports.interpretQuery = function ( req, res ) {
	var query    = req.body;
	var activity = query[ 'activity' ];

	switch ( activity ) {
		case 'Expense':
			handleExpenseActivity ( req, res );
			break;
		default:
			break;
	}
};

function handleExpenseActivity ( req, res ) {
	var query = req.body;

	var user   = query[ 'user_mongo_id' ];
	var object = query[ 'data' ][ 'object_mongo_id' ];
	var verb   = query[ 'data' ][ 'verb' ];

	switch ( verb ) {
		case 'add':
			var activityDataExpense = {
				user   : user,
				object : object
			};

			var expenseAddActivity = new ExpenseAdd ( activityDataExpense );

			expenseAddActivity.save ()
				.then ( function () {
					res.json ( { status : 'Saved actvity. Check application debugger log.' } );
				} )
				.fail ( function ( err ) {
					console.log ( 'FAILED to save activity: ' + JSON.stringify ( err ) );
					res.status ( 500 ).send ( 'Error: ' + JSON.stringify ( err ) );
				} );
			break;
		case 'edit':
			break;
		case 'delete':
			break;
		case 'tag':
			break;
		case 'like':
			break;
		case 'comment':
			break;
	}
}

exports.addInitialValuesToMongoDB = function ( flag ) {
	var deferred = qPromise.defer ();

	if ( flag ) {
		// Add users
		User.update (
			{ _id : '5a219f404fdd1f5dc7b540da' },
			{ name : 'John Doe' },
			{ upsert : true } )
			.then ( function ( res ) {
				console.log ( 'Added/Updated User' );

				// Add Expense
				Expense.update (
					{ _id : '5a43d3cb46224c612c2644cd' },
					{
						createdBy   : '5a219f404fdd1f5dc7b540da',
						desc        : 'Dinner',
						totalAmount : 1500
					},
					{ upsert : true } )
					.then ( function ( res ) {
						console.log ( 'Added/Updated Expense' );

						deferred.resolve ( true );
					} )
					.fail ( deferred.reject );
			} )
			.fail ( deferred.reject );
	} else {
		deferred.reject ( 'Mongoose, Streams could not be initialized correctly' );
	}

	return deferred.promise;
};
