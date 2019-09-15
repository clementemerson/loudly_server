// mongo
const MongoClient = require('mongodb').MongoClient;
let mdb;
let dbClient;

const user = 'loudlyadmin';
const password = 'jdkbsDdjgfbJjkw45498pK357243tTRbemfnbsdjlfJwer98t43twKngfjsdnfgFDGjksjk'

const clientUser = 'mongoclient';
const pass = 'knvf532R85HF02SFD4G3YkjJlsFdvnKJeL9847F4F39fnjLi;kzcDvFsd96gPdsPfhRchgsdrfJte5tyGnTdfkgbd4f5nghdGfGjio62tj';
const dbName = 'loudly';

module.exports = {
  getDbConnection: () => {
    return mdb;
  },
  initDbConnection: async () => {
    const connectionUrl = 'mongodb://loudly.loudspeakerdev.net:27017';
    // Create the database connection
    dbClient = await MongoClient.connect(connectionUrl, {
      poolSize: 10,
      useNewUrlParser: true,
      auth: {
          user: clientUser,
          password: pass
      }
      // other options can go here
    });
    mdb = dbClient.db(dbName);
  },
  getDbClient: () => {
    return dbClient;
  },
};
