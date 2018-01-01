var fs        = require ( 'fs' );
var appConfig = JSON.parse ( fs.readFileSync ( './appConfig.json' ) );

exports.config = {
	/**
	 * GetStream.io API key
	 */
	apiKey : appConfig.apiKey,

	/**
	 * GetStream.io API Secret
	 */
	apiSecret : appConfig.apiSecret,

	/**
	 * GetStream.io API App ID
	 */
	apiAppId : appConfig.apiAppId,

	/**
	 * GetStream.io API Location
	 */
	apiLocation : "",

	/**
	 * GetStream.io User Feed slug
	 */
	userFeed : "user",

	/**
	 * GetStream.io Notification Feed slug
	 */
	notificationFeed : "notification",

	newsFeeds : {

		/**
		 * GetStream.io Flat Feed slug
		 */
		flat : "timeline",

		/**
		 * GetStream.io Aggregated Feed slug
		 */
		aggregated : "timeline_aggregated"
	}
};
