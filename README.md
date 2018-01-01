# Stream Node Test Server

- Add getstream.io app credentials to ./appConfig.json
    - apiKey
    - apiSecret
    - apiAppId

- Add MongoDB URI in ./appConfig.json

- Run app.js
    - It first adds/updates initial values in MongoDB
    - Then runs server locally at port number 3000

- Send the following sample query:

^

    POST Request
    
    URI: http://localhost:3000/activity-stream
    
    Body:
    
    {
    	"user_mongo_id" : "5a219f404fdd1f5dc7b540da",
    	"activity" : "Expense",
    	"data" : {
    		"verb" : "add",
    		"object_mongo_id" : "5a43d3cb46224c612c2644cd"
    	}
    }


- Application crashes. Check debugger log.
    - 'docP' undefined in ./node_modules/getstream-node/src/backends/mongoose.js line no. 104, 105
    - Debugger log:
    
^

    events.js:182
          throw er; // Unhandled 'error' event
          ^   
    
    TypeError: Cannot read property 'wasNew' of undefined
        at D:\streams-test\node_modules\getstream-node\src\backends\mongoose.js:105:13
        at D:\streams-test\node_modules\mongoose\lib\model.js:4056:16
        at next (D:\streams-test\node_modules\mongoose\lib\model.js:3175:14)
        at Immediate._onImmediate (D:\streams-test\node_modules\mongoose\lib\model.js:3205:7)
        at runCallback (timers.js:785:20)
        at tryOnImmediate (timers.js:747:5)
        at processImmediate [as _immediateCallback] (timers.js:718:5)

