
const mongo = require('../db/mongo');

const testUser = 'testUser';
const pwdTestUser = 'dnsdjfjh243852nmwefqSNha798867bjah87NU7YIUJBH&FHHLKJDIOFKLJkdsjg435j4kjvhsd9uewnkdjfisdjrjgjGTYjubn35jnhsdksaf';
const testDb = 'loudlyTest';
const connectionUrl = 'mongodb://loudly.loudspeakerdev.net:27017';

module.exports = {
    getDbConnection: () => mongo.getDbConnection(),
    initDbConnection: async () => await
        mongo.initDbConnection(connectionUrl, testUser, pwdTestUser, testDb),
    getDbClient: () => mongo.getDbClient(),
}
