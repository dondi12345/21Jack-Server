import { RedisClient, createClient } from "redis";
import { DataModel } from "../Utils/DataModel";
import { database_config } from "./DatabaseConfig";
import { logCtrl } from "../Utils/LogCtrl";
import { Util } from "../Utils/Utils";

class RedisService {
    redisClient: RedisClient
    redisPub
    redisSub

    async Init() {
        this.redisClient = await createClient({
            host: database_config.Redis.Host,
            port: Util.strToNumber(database_config.Redis.Port),
            password: database_config.Redis.Pass,
        });
        this.redisClient.on("error", function (err) {
            console.log(err)
        });
        this.redisClient.on("connect", () => {
            console.log("redisClient connected")
        });

        this.redisPub = await createClient({
            host: database_config.Redis.Host,
            port: Util.strToNumber(database_config.Redis.Port),
            password: database_config.Redis.Pass,
        });
        this.redisPub.on("error", function (err) {
            console.log(err)
        });
        this.redisPub.on("connect", () => {
            console.log("redisPub connected")
        });

        this.redisSub = await createClient({
            host: database_config.Redis.Host,
            port: Util.strToNumber(database_config.Redis.Port),
            password: database_config.Redis.Pass,
        });
        this.redisSub.on("error", function (err) {
            console.log(err)
        });
        this.redisSub.on("connect", () => {
            console.log("redisSub connected")
        });
        this.redisSub.on("message", (channel, data) => {
            console.log("Redis recieve" + ":" + data);
        });
    }

    PubMessage(channel: string, data: string) {
        this.redisPub.publish(channel, data);
    }

    Set(key: string, value: string) {
        this.redisClient.set(key, value, (error, result) => {
            if (error) {
                logCtrl.LogError("Set",key, value,error)
            } else {
                logCtrl.LogMessage("Set",key, value,result)
            }
        })
    }

    async Get(key: string) {
        var value = await new Promise(async (resolve, reject) => {
            await this.redisClient.get(key, (error, result) => {
                if (error) {
                    logCtrl.LogError("Get",key, error)
                    resolve(null);
                } else {
                    resolve(result)
                }
            });
        });
        if (value == null || value == undefined) {
            logCtrl.LogMessage("Get",key, value)
            return null;
        }
        logCtrl.LogMessage("Get",key, value)
        return value;
    }

    Expire(key: string, second: number) {
        this.redisClient.EXPIRE(key, second, (error, result) => {
            if (error) {
                logCtrl.LogError("Expire",key, error)
            } else {
                logCtrl.LogMessage("Expire",key, result)
            }
        })
    }

    SAdd(key: string, value: string) {
        this.redisClient.SADD(key, value, (error, result) => {
            if (error) {
                logCtrl.LogError("SAdd",key, error)
            } else {
                logCtrl.LogMessage("SAdd",key, result)
            }
        })
    }

    async Smembers(key: string) {
        var value: string[] = await new Promise(async (resolve, reject) => {
            await this.redisClient.SMEMBERS(key, (error, result) => {
                if (error) {
                    logCtrl.LogError("Smembers",key, error)
                    resolve([]);
                } else {
                    var data: string[] = []
                    for (let index = 0; index < result.length; index++) {
                        const element = result[index];
                        data.push(element);
                    }
                    resolve(data)
                }
            });
        });
        if (value == null || value == undefined) {
            logCtrl.LogMessage("Smembers",key, value)
            return [];
        }
        logCtrl.LogMessage("Smembers",key, value)
        return value;
    }

    async Hset(key1: string, key2: string, value: string) {
        this.redisClient.HSET(key1, key2, value, (error, result) => {
            if (error) {
                logCtrl.LogError("Hset",key1,key2, error)
            } else {
                logCtrl.LogMessage("Hset",key1,key2, result)
            }
        })
    }

    async Hget(key1: string, key2: string) {
        var value = await new Promise(async (resolve, reject) => {
            await this.redisClient.hget(key1, key2, (error, result) => {
                if (error) {
                    logCtrl.LogError("Hget",key1,key2, error)
                    resolve(null);
                } else {
                    resolve(result)
                }
            });
        });
        if (value == null || value == undefined) {
            logCtrl.LogMessage("Hget",key1,key2, value)
            return null;
        }
        logCtrl.LogMessage("Hget",key1,key2, value)
        return value;
    }
    async Hgetall(key1: string,){
        var value = await new Promise(async (resolve, reject) => {
            await this.redisClient.hgetall(key1, (error, result) => {
                if (error) {
                    logCtrl.LogError("Hgetall",key1, error)
                    resolve([]);
                } else {
                    resolve(result)
                }
            });
        });
        if (value == null || value == undefined) {
            logCtrl.LogMessage("Hgetall",key1, value)
            return [];
        }
        logCtrl.LogMessage("Hgetall",key1, value)
        return value;
    }

    async Keys(key) {
        var value: string[] = await new Promise(async (resolve, reject) => {
            await this.redisClient.keys(key, (error, result) => {
                if (error) {
                    logCtrl.LogError("Keys",key, error)
                    resolve([]);
                } else {
                    logCtrl.LogMessage("Keys",key, result)
                    resolve(result)
                }
            });
        });
        return value;
    }

    async DelKey(key: string) {
        this.redisClient.keys(key, (error, result) => {
            if (error) {
                logCtrl.LogError("DelKey",key, error)
            } else {
                for (let index = 0; index < result.length; index++) {
                    const element = result[index];
                    this.redisClient.del(element, (error, result) => {
                        if (error) {
                            logCtrl.LogError("DelKey",key, error)
                        } else {
                            logCtrl.LogMessage("DelKey",key, result)
                            console.log(result)
                        }
                    })
                }
            }
        })
    }

    async Zincrby(key1: string, num: number, key2: string) {
        var value = await new Promise(async (resolve, reject) => {
            await this.redisClient.zincrby(key1, num, key2, (error, result) => {
                if (error) {
                    logCtrl.LogError("Zincrby",key1,key2, error)
                    resolve(null);
                } else {
                    logCtrl.LogMessage("Zincrby",key1,key2, result)
                    resolve(result)
                }
            });
        });
    }

    async Incrby(key: string, num: number) {
        var value = await new Promise(async (resolve, reject) => {
            await this.redisClient.incrby(key, num, (error, result) => {
                if (error) {
                    logCtrl.LogError("Incrby",key, error)
                    resolve(null);
                } else {
                    logCtrl.LogMessage("Incrby",key, result)
                    resolve(result)
                }
            });
        });
    }

    async Zrevrank(key1: string, key2: string) : Promise<number|null> {
        return new Promise((reslove, rejects) => {
            this.redisClient.zrevrank(key1, key2, (error, result) => {
                if (error) {
                    logCtrl.LogError("Zrevrank",key1,key2, error)
                    rejects(null)
                } else {
                    logCtrl.LogMessage("Zrevrank",key1,key2, result)
                    reslove(result);
                }
            });
        })
    }

    async Zscore(key1: string, key2: string) : Promise<string> {
        return new Promise((reslove, rejects) => {
            this.redisClient.zscore(key1, key2, (error, result) => {
                if (error) {
                    logCtrl.LogError("Zscore",key1,key2, error)
                    rejects(null)
                } else {
                    logCtrl.LogMessage("Zscore",key1,key2, result)
                    reslove(result);
                }
            });
        })
    }

    async Zadd(key1: string, score: number, key2: string) {
        return new Promise((reslove, rejects) => {
            this.redisClient.zadd(key1, score, key2, (error, result) => {
                if (error) {
                    logCtrl.LogError(key1,key2, error)
                    reslove(0)
                } else {
                    logCtrl.LogMessage("Zadd",key1,key2, result)
                    reslove(result);
                }
            });
        })
    }

    async Zcount(key: string) : Promise<number> {
        return new Promise((reslove, rejects) => {
            this.redisClient.zcount(key, 0, 999, (error, result) => {
                if (error) {
                    logCtrl.LogError(key, error)
                    reslove(0)
                } else {
                    logCtrl.LogMessage("Zcount",key, result)
                    reslove(result);
                }
            });
        })
    }

    async ZrevrangeWithScore(key: string, min: number, max: number)  : Promise<string[]>{
        return new Promise((reslove, rejects) => {
            this.redisClient.zrevrange(key, min, max, 'withscores', (error, result) => {
                if (error) {
                    logCtrl.LogError(key, error)
                    reslove([])
                } else {
                    logCtrl.LogMessage("ZrevrangeWithScore",key, result)
                    reslove(result);
                }
            });
        })
    }

}

export const redisService = new RedisService();