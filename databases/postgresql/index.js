const {Client, Pool} = require('pg');
const config = require('config');
const connectionPool = [];

const connection = () => {
  const connectionState = { index: null, config: '', db: null };
  return connectionState;
};


function addConnectionPool() {
    if (config.has("PostgreSQL.databases")) {
        let databases = config.get("PostgreSQL.databases");
        for (let database of databases) {
            let newConnection = connection();
            newConnection.index = database.index;
            newConnection.config = database.config;
            connectionPool.push(newConnection);
        }
    }
}

async function createConnectionPool() {
    for (let connection of connectionPool) {
        connection.db = new Pool(connection.config);
    }
}

/* istanbul ignore next */
function getConnection(index) {
    for (let connection of connectionPool) {
        if (connection.index === index) {
            if (connection.db !== null) {
                return connection.db;
            }
            else {
                connection.db = new Pool(connection.config);
                return connection.db;
            }
        }
    }
    return null;
}

function init() {
    addConnectionPool();
    createConnectionPool();
}

module.exports = {
    init,
    getConnection
}
