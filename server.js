'use strict';

var express     = require('express');
var bodyParser  = require('body-parser');
var cors        = require('cors');

var apiRoutes         = require('./routes/api.js');
var fccTestingRoutes  = require('./routes/fcctesting.js');
var runner            = require('./test-runner');
var MongoClient       = require('mongodb').MongoClient;
var ObjectId          = require('mongodb').ObjectId;


var helmet            = require('helmet');

var app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //USED FOR FCC TESTING PURPOSES ONLY!

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet.hidePoweredBy({setTo:'PHP 4.2.0'}));
app.use(helmet.noCache());
app.use(helmet.xssFilter());

const MONGODB_CONNECTION_STRING = process.env.DB;

//Index page (static HTML)


//For FCC testing purposes
fccTestingRoutes(app);

MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, client) {
  if(err){
    console.log('Mongo connection error');
    console.log(err);
  }
  else{
    console.log('Connected to mongo');
  }
  var db = client.db('cluster0')
  
  //Routing for API 
  apiRoutes(app,db);
    
  //404 Not Found Middleware

  app.use(function(req, res, next) {
    res.status(404)
      .type('text')
      .send('Not Found');
  });

  //Start our server and tests!
  app.listen(process.env.PORT || 3000, function () {
    console.log("Listening on port " + process.env.PORT);
    if(process.env.NODE_ENV==='test') {
      console.log('Running Tests...');
      setTimeout(function () {
        try {
          runner.run();
        } catch(e) {
          var error = e;
            console.log('Tests are not valid:');
            console.log(error);
        }
      }, 1500);
    }
  });

});


module.exports = app; //for unit/functional testing
