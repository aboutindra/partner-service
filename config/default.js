require('dotenv').config()

module.exports = {
    PostgreSQL: {
        dbConfig: {
            host: process.env.POSTGRE_DB_HOST,
            port: process.env.POSTGRE_DB_PORT,
            database: process.env.POSTGRE_DB_DATABASE_NAME,
            user: process.env.POSTGRE_DB_USERNAME,
            password: process.env.POSTGRE_DB_PASSWORD
        }
    }
} 