const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = () => {
  MongoClient.connect(
    `mongodb+srv://${process.env.mongoUsername}:${process.env.password}@cluster0.h6rvj.mongodb.net/qube?retryWrites=true&w=majority`
  )
    .then((client) => {
      console.log("Connected to Database");
      _db = client.db();
    })
    .catch((error) => {
      console.log(error);
      throw error;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No database found";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;