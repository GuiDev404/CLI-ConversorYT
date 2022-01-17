const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const DB_NAME = 'db.json';

let db;

function createConnection() {
  const adapter = new FileSync(DB_NAME);
  db = low(adapter);
  db.defaults({ last_downloads: [] }).write();
}

const getConnection = ()=> db;

module.exports = {
  createConnection,
  getConnection
}