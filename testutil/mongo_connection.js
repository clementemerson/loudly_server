
const mongo = require('../db/mongo');

module.exports = {
    getDbConnection: () => mongo.getDbConnection(),
    initDbConnection: async () => await
        mongo.initDbConnection(
            'mongodb://loudly.loudspeakerdev.net:27017',
            'testUser',
            'dnsdjfjh243852nmwefqSNha798867bjah87NU7YIUJBH&FHHLKJDIOFKLJkdsjg435j4kjvhsd9uewnkdjfisdjrjgjGTYjubn35jnhsdksaf',
            'loudlyTest'),
    getDbClient: () => mongo.getDbClient(),
}
