import { mongoDBService } from "./MongoDBService";
import { redisService } from "./RedisService";

class DatabaseService {
  async Init() {
    await redisService.Init();
    await mongoDBService.Init();
  }
}

export const databaseService = new DatabaseService();