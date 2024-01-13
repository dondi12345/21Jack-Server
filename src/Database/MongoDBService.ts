import mongoose, { ConnectOptions } from 'mongoose';
import { database_config } from './DatabaseConfig';

class MongoDBService {

    async Init() {
        const options: ConnectOptions = {
            dbName: database_config.Mongo.DbName,
        };

        mongoose.connection.on('error', (err) => {
            console.log(err);
        });
        try {
            var uri = "mongodb://" + database_config.Mongo.Username + ":" + database_config.Mongo.Password +
                "@" + database_config.Mongo.Host + ":" + database_config.Mongo.Port + "/?authMechanism=DEFAULT";
            if (database_config.Mongo.Username!.length == 0) {
                uri = "mongodb://" + database_config.Mongo.Host + ":" + database_config.Mongo.Port + "/?authMechanism=DEFAULT";
            }
            await mongoose.connect(uri, options);
            console.log("MongoBD connected!")
        } catch (err) {
            console.log("MongoBD fail!", err)
        }
    }
}

export const mongoDBService = new MongoDBService();
