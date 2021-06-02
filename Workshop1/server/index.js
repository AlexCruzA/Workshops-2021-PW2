const express = require('express');
const cors = require("cors");
const mongoose = require("mongoose");
const db = mongoose.connect("mongodb://127.0.0.1:27017/tasks-api");
const bodyParser = require("body-parser");
const Task = require("./tasksModel");

const app = express();
app.use(bodyParser.json());

// check for cors
app.use(cors({
  domains: '*',
  methods: "*"
}));



app.get('/tipocambio', function (req, res) {
  res.send(`{
    "TipoCompraDolares" : "608",
    "TipoVentaDolares" : "621",
    "TipoCompraEuros" : "731.85",
    "TipoVentaEuros" : "761.9"
  }`);
});

app.post('/tasks', function (req, res) {

  const task = new Task();

  const title = req.body.title;
  const description = req.body.description;

  if (task.title && task.description) {
    task.save(function (err){
      if (err) {
        res.status(422);
        console.log('error while saving the task', err)
        res.json({
          error: 'There was an error saving the task'
        });
      }
      res.status(201);//CREATED
      res.header({
        'location': 'http://localhost:3000/api/tasks/?id=$(task.id)'
      });
      res.json(task);
    });
  } else {
    res.status(422);
    console.log('error while saving the task')
    res.json({
      error: 'No valid data provided for task'
    });
  }

	// respond
  res.send(`{
  	"title": "${title}",
    "description": "${description}"
  }`);
});

app.delete('/tasks', function (req, res){

  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb://localhost:27017/";

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("tasks-api");
    var myquery = { title: 'Task 1' };
    dbo.collection("task").deleteOne(myquery, function(err, obj) {
      if (err) throw err;
      console.log("1 task deleted");
      db.close();
    });
  });

});


app.get('/tasks', function (req, res){

  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb://localhost:27017/";

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("tasks-api");
    dbo.collection("tasks").findOne({}, function(err, result) {
      if (err) throw err;
      console.log(result.name);
      db.close();
    });
  });

});

app.patch('/tasks', function (req, res){
  // get task by id
  if (req.query && req.query.id) {
    Task.findById(req.query.id, function (err, task) {
      if (err) {
        res.status(404);
        console.log('error while queryting the task', err)
        res.json({ error: "Task doesnt exist" })
      }

      // update the task object (patch)
      task.title = req.body.title ? req.body.title : task.title;
      task.detail = req.body.detail ? req.body.detail : task.detail;
      // update the task object (put)
      // task.title = req.body.title
      // task.detail = req.body.detail

      task.save(function (err) {
        if (err) {
          res.status(422);
          console.log('error while saving the task', err)
          res.json({
            error: 'There was an error saving the task'
          });
        }
        res.status(200); // OK
        res.json(task);
      });
    });
  } else {
    res.status(404);
    res.json({ error: "Task doesnt exist" })
  }
};



app.listen(3000, () => console.log(`Example app listening on port 3000!`))
