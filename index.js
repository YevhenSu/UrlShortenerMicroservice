//to add in short_url

'use strict'

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const MONGODB_URI = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.DB_PORT+'/'+process.env.DB;
const express = require('express');
const app express();
const path = require('path');

app.get('/', (req, res) => {
  console.log(req.url);
  res.sendFile(path.join(__dirname + '/index.html'));
});

const regex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");

app.get('/new/:url(*)', (req, res) => {
  
  MongoClient.connect(MONGODB_URI, (err, db) => {
    if (err) console.log(`Unable to connect to the mongoDB server. Error: ${err}`);
    else {
      console.log("Connection esteblished to mongoDB");
      
      const collection = db.collection('uris');

      const Access = (db, callback) => {
        if (regex.test(req.params.url)) {
          collection.count().then((number) => {
            let newElement = {
              original_url: req.params.url,
              short_url:"https://yevhensu-url-shortener.glitch.me/" + (number + 1) 
            };
            collection.insert([newElement]);
            res.json({
              original_url: req.params.url,
              short_url: "https://yevhensu-url-shortener.glitch.me/" + (number + 1) 
            });
          });
        } else {
          res.json({
            'error': 'Please provide valid URL to order to shorten it'
          });
        }
      }
      
      Access(db, () => db.close());
    }
  });
});

app.get('/:shortid', (req, res) => {
  MonfoClient.connect(MONGODB_URI, (err, db) => {
    if (err) console.log(`Unable to connect to the mongoDB server. Error: ${err}`);
    else {
      const collection = db.collection('uris');
      
      const query = (db, callback) => {
        collection.findOne({
          'short_url': "https://yevhensu-url-shortener.glitch.me/" + req.params.shortid
        }, {
          original_url: 1,
          _id: 0
        }, (err, answer) => {
             if (answer === null){
               res.json({
                 'error': "Provided URL is not found to our database"
               });
             } else {
                 if (answer.original_url.split('')[0] == 'w') {
                   res.redirect(301, 'http://' + answer.original_url);
                 } else {
                   res.redirect(301, answer.original_url);
                 }  
             }
           });
      }
      
      query(db, () => db.close());
    }
  });
});

app.listen(process.env.PORT || 8080);
