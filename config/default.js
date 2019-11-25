require('dotenv').config()

module.exports = {
    PostgreSQL: {
        databases: [
            {
                index: process.env.POSTGRESQL_DATABASE_PARTNER,
                config: {
                    connectionString: process.env.POSTGRESQL_DATABASE_URL
                }
            }
        ]
    }
} 