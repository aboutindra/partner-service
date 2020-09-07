const {Pool} = require('pg');
const config = require('config');
const connectionPool = [];

const connection = () => {
    return { index: null, config: '', db: null };
};


function addConnectionPool() {
    if (config.has("PostgreSQL.databases")) {
        const databases = config.get("PostgreSQL.databases");
        for (const database of databases) {
            const newConnection = connection();
            newConnection.index = database.index;
            newConnection.config = database.config;
            connectionPool.push(newConnection);
        }
    }
}

async function createConnectionPool() {
    for (const connection of connectionPool) {
        connection.db = new Pool(connection.config);
    }
}

/* istanbul ignore next */
function getConnection(index) {
    for (const connection of connectionPool) {
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
