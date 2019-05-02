/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;



module.exports = function (app,db) {
  app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      db.collection('books').find(/*{}*/).toArray((err,result)=>{
        if(err){
          res.send('Error at find.toArray: '+err+'')
        }
        else if(result){
          res.send(result)
        }
        else{
          res.send('Couldn\'t found any books in library')
        }
      })
    })
    
    .post(function (req, res){
      var title = req.body.title;
      let id = new ObjectId();
      //response will contain new book object including atleast _id and title
      if(title==''){
        res.send('Please enter book title')
      }
      else{
        db.collection('books').findOne({_id:id},(err,result)=>{
        if(err){
          res.send('Error at route.post findOne: '+err+'');
        }
        else if(result){
          res.send('This book already added: '+title+'')
        }
        else{
          db.collection('books').insertOne({_id:id,"title":title,"commentcount":0,"comments":[]});
          res.send({_id:id,"title":title,"commentcount":0});
        }
       })
      }
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      db.collection('books').deleteMany({},(err,result)=>{
        if(err){
          res.send('Error: termination attempt failed');
        }
        else{
          res.send('complete delete successful');
        }
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      db.collection('books').findOne({_id:ObjectId(bookid)},(err,result)=>{
        if(err){
          res.send('Error at route.get(id) findOne');
        }
        else if(result){
          res.send(result);
        }
        else{
          res.send('Couldn\'t found book with provided id');
        }
      })
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
      db.collection('books').findOne({_id:ObjectId(bookid)},(err,result)=>{
        if(err){
          res.send('Error at route.post(id,comment) findOneAndUpdate');
        }
        else if(result){
          let comArr = result.comments;
          comArr.push(comment);
          db.collection('books').findOneAndUpdate({_id:ObjectId(bookid)},{$set:{"comments":comArr},$inc:{"commentcount":1}});
          res.send('Comment sended');
        }
        else{
          res.send('Couldn\'t found book with provided id')
        }
      })
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      db.collection('books').deleteOne({_id:ObjectId(bookid)},(err,result)=>{
        if(err){
          res.send('Error at route.delete(id) deleteOne');
        }
        else{
          res.send('delete successful');
        }
      })
    });
  
};
