require('dotenv').config();

export const database_config = {
    Mongo: {
        Host: process.env.MONGO_HOST,
        Port: process.env.MONGO_PORT,
        Username: process.env.MONGO_USERNAME,
        Password: process.env.MONGO_PASSWORD,
        DbName: process.env.MONGO_DBNAME
    },
    Redis: {
        Host: process.env.REDIS_HOST,
        Port: process.env.REDIS_PORT,
        Pass: process.env.REDIS_PASS,
    },
}