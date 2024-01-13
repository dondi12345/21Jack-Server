import * as redis from 'redis';
import { database_config } from '../Database/DatabaseConfig';
import { Util } from './Utils';



const client = redis.createClient({
    host: database_config.Redis.Host,
    port: Util.strToNumber(database_config.Redis.Port),
    password: database_config.Redis.Pass,
});

export const Keys = {
  KEY_WORLD_BOSS: 'NewWorldBoss:',
  KEY_BOSS_CONFIG: 'NewWorldBoss:Config',
};

export class RankingData {
  RankNumber: number;
  RocketId: string;
  Score?: number;
  Elo?: number;
  PlayerData: Object;
}

//for test save details
interface dataUser {
  RocketId: string;
  DisplayName: string;
  Avatar: string;
  CountryCode: string;
}

class DataHelper {
  mapTopRanking = new Map<string, any>();


  KEY_PVP_DAILY = 'Jackal:PVP:Daily:';
  KEY_PVP_MATCH = 'Jackal:PVP:Match:';
  KEY_PVP_ENDGAME = 'Jackal:PVP:EndGame:';
  KEY_PVP_DISCONNECT = 'Jackal:PVP:Disconnect:';


  KEY_GOA_ONLINEUSER = 'GOA:ONLINEUSER';
  KEY_GOA_SOCKET_USERID_MAP = 'GOA:UserMap';

  //TuDT update PVP
  GetCoefficientKElo(elo: number) {
    var k = 25;

    if (elo > 2400) {
      k = 10;
    } else if (elo > 2000) {
      k = 15;
    } else if (elo > 1600) {
      k = 20;
    }
    else {
      k = 25;
    }

    return k;
  }

  GetEloBonus(yourElo: number, opponentElo: number, actual: number) {
    let expected = 1 / (1 + Math.pow(10, (opponentElo - yourElo) / 400));
    let k = this.GetCoefficientKElo(yourElo);
    return Math.ceil(k * (actual - expected));
  }

  //lấy hạng của user dựa vào BattlePoint
  // GetUserRankByBP(bp: number) {
  //   for (let index = 0; index < JackalPVP_RankRewards.length; index++) {
  //     const element = JackalPVP_RankRewards[index];
  //     if (bp < element.MinBP) {
  //       return index;
  //     }

  //   }
  // }

  // GetBPBonus(yourElo: number, opponentElo: number, actual: number) {
  //   let yourRank = this.GetUserRankByBP(yourElo);
  //   let OppRank = this.GetUserRankByBP(opponentElo);

  //   let bonusRank = 0;

  //   if (yourRank > OppRank) {
  //     if (actual == 1)
  //       bonusRank = -1 * (Math.floor((yourRank - OppRank) / 2));
  //     else if (actual == 0)
  //       bonusRank = -1 * Math.floor((yourRank - OppRank) / 2);
  //   }
  //   else if (yourRank < OppRank) {
  //     if (actual == 1)
  //       bonusRank = OppRank - yourRank;
  //     else if (actual == 0)
  //       bonusRank = Math.floor((OppRank - yourRank) / 2);
  //   }

  //   let BP_Point = 0;
  //   if (actual == 1) {
  //     BP_Point = JackalPVP_BonusBP.Win + bonusRank
  //   }
  //   else if (actual == 0) {
  //     BP_Point = JackalPVP_BonusBP.Lose + bonusRank
  //   }

  //   return BP_Point;


  // }

  async checkUserOnline(userID: string, deviceID: string, socketId: string, callback: any) {
    client.hsetnx(this.KEY_GOA_ONLINEUSER, userID, deviceID + "#" + socketId, (error: Error, reply: number) => {
      if (error) {
        console.log(error);
        callback(false);
      } else {
        if (reply == 0)
          callback(false);
        else
        {
          client.hsetnx(this.KEY_GOA_SOCKET_USERID_MAP, socketId, userID, (err: Error, replyMap: number)=>{

          })
          callback(true);
        }
          
      }
    })
  }

  async getUserID(socketID:string)
  {
    return new Promise<any>((resolve, reject) => {
      client.hget(this.KEY_GOA_SOCKET_USERID_MAP,socketID,(userID)=>{
        resolve(userID) ;
      })
    });
   
  }
  deleteOnlineStatus(socketID: string) {
    
    

    client.hget(this.KEY_GOA_SOCKET_USERID_MAP,socketID,(err,userID)=>{
      console.log('hget socket',socketID,err,userID);
      if(userID != null)
      {
        client.hdel(this.KEY_GOA_SOCKET_USERID_MAP, socketID);
        client.hdel(this.KEY_GOA_ONLINEUSER, userID);
      }
      
    })

  }



  async GetEloPVP(userWin: dataUser, userWinElo: number, userLost: dataUser, userLostElo: number) {
    let newUserWinElo = userWinElo + this.GetEloBonus(userWinElo, userLostElo, 1);
    let newUserLostElo = userLostElo + this.GetEloBonus(userLostElo, userWinElo, 0);
    let EloBoardName = 'JACKAL:PVP:EloUser';
    client.ZADD(EloBoardName, newUserWinElo, userWin.RocketId, newUserLostElo, userLost.RocketId, function (err, res) {
      if (err) console.log(err);
      else console.log('Add UserWin: ', userWin.RocketId + ' & UserLost: ', userLost.RocketId);
    });
    // Add Detail Userrs
    client.HMSET(EloBoardName + 'Detail', userWin.RocketId, JSON.stringify(userWin), userLost.RocketId, JSON.stringify(userLost), function (err, res) {
      if (err) console.log(err);
      else console.log('Add Detail:', userWin.RocketId + ':' + userLost.RocketId);
    });
  }
  // getLevelByAttack(attackUser1: number, attackUser2: number): { zoneId: number; level: number } {
  //   let attackList = JackalPVP_attackLevel;
  //   let attack = (attackUser1 + attackUser2) / 2;
  //   let zone = { zoneId: attackList[0].zoneId, level: attackList[0].levelMin };
  //   for (let i = 0; i < attackList.length; i++) {
  //     if (attack <= attackList[i].attackMax && attack >= attackList[i].attackMin) {
  //       zone.zoneId = attackList[i].zoneId;
  //       let range = attackList[i].levelMax - attackList[i].levelMin;
  //       zone.level = attackList[i].levelMin + Math.round(Math.random() * range);

  //       if (zone.level == 5)//bỏ level 5 do có mini boss
  //         zone.level = 9
  //     }
  //   }
  //   console.log(zone);
  //   return zone;
  // }

  // getRewardsByElo(elo: number) {
  //   for (let index = 0; index < JackalPVP_RankRewards.length; index++) {
  //     const element = JackalPVP_RankRewards[index];
  //     console.log(elo, element);
  //     if (elo < element.MinBP) {
  //       console.log('rewards:', index, element.MinBP, element.Rewards);
  //       return element.Rewards;
  //     }

  //   }
  // }
  getYYYYMMDD(date: Date) {
    let mm = date.getMonth() + 1; // getMonth() bắt đầu từ 0
    let dd = date.getDate();
    return Number.parseInt([
      date.getFullYear(),
      (mm > 9 ? '' : '0') + mm,
      (dd > 9 ? '' : '0') + dd,
    ].join(''));
  }

  setPVPStat() {
    // client.SADD("PVP:" + utils.getYYYYMMDD(new Date()), newUser._id.toString(), (error: Error, reply: number) => {

    // });

  }

  async GetEloBoardWithHash() {
    let EloBoardName = 'JACKAL:PVP:EloUser';
    return new Promise<any>((resolve, reject) => {
      if (!this.mapTopRanking.has(EloBoardName) || (this.mapTopRanking.has(EloBoardName) && Date.now() - this.mapTopRanking.get(EloBoardName).TimeLoad > 30000)) {
        client.ZREVRANGE(EloBoardName, 0, 19, 'WITHSCORES', (err, lsMember) => {
          if (!err) {
            let lsUserId: string[] = [];
            let lsElo: string[] = [];
            for (let i = 0; i < lsMember.length; i++) {
              if (i % 2 === 0) lsUserId.push(lsMember[i]);
              else lsElo.push(lsMember[i]);
            }

            if (lsUserId.length > 0)
              client.HMGET(EloBoardName + 'Detail', lsUserId, (errDt, lsDetails) => {
                // console.log(lsUserId);
                if (errDt) reject(errDt);
                else {
                  let topUser = lsUserId.map((item, index) => {
                    var rs = new RankingData();
                    rs.RankNumber = index + 1;
                    rs.RocketId = item;
                    rs.Elo = Math.floor(Number(lsElo[index]));
                    //  console.log(lsDetails[index]);
                    rs.PlayerData = JSON.parse(lsDetails[index]);
                    return rs;
                  });
                  this.mapTopRanking.set(EloBoardName, {
                    TimeLoad: Date.now(),
                    TopUser: topUser,
                  });
                  resolve(topUser);
                }
              });
            else resolve([]);
          } else {
            console.log(err);
            reject(err);
          }
        });
      } else {
        resolve(this.mapTopRanking.get(EloBoardName).TopUser);
      }
    });
  }

  async GetUserRank(LeaderBoardName: string, rocketID: string) {
    return new Promise<any>((resolve, reject) => {
      let transaction;
      transaction = client.multi();
      transaction.zscore(LeaderBoardName, rocketID);
      transaction.zrevrank(LeaderBoardName, rocketID);
      transaction.exec((err, replies) => {
        //console.log(err, replies);
        if (err) {
          let scoreAndRankData = new RankingData();
          scoreAndRankData.Score = -1;
          scoreAndRankData.RankNumber = -1;
          resolve(scoreAndRankData);
        } else {
          let scoreAndRankData = new RankingData();
          if (replies) {
            if (replies[0] != null) {
              scoreAndRankData.Score = Number(replies[0]);
            } else {
              scoreAndRankData.Score = -1;
            }
            if (replies[1] != null) {
              scoreAndRankData.RankNumber = replies[1] + 1;
            } else {
              scoreAndRankData.RankNumber = -1;
            }
            resolve(scoreAndRankData);
          }
        }
      });
    });
  }

  async GetLeaderBoardWithHash(LeaderBoardName: string) {
    return new Promise<any>((resolve, reject) => {
      if (!this.mapTopRanking.has(LeaderBoardName) || (this.mapTopRanking.has(LeaderBoardName) && Date.now() - this.mapTopRanking.get(LeaderBoardName).TimeLoad > 30000)) {
        client.ZREVRANGE(LeaderBoardName, 0, 19, 'WITHSCORES', (err, lsMember) => {
          if (!err) {
            let lsUserId: string[] = [];
            let lsScore: string[] = [];
            for (let i = 0; i < lsMember.length; i++) {
              if (i % 2 === 0) lsUserId.push(lsMember[i]);
              else lsScore.push(lsMember[i]);
            }

            if (lsUserId.length > 0)
              client.HMGET(LeaderBoardName + 'Details', lsUserId, (errDt, lsDetails) => {
                if (errDt) reject(errDt);
                else {
                  let topUser = lsUserId.map((item, index) => {
                    var rs = new RankingData();
                    rs.RankNumber = index + 1;
                    rs.RocketId = item;
                    rs.Score = Math.floor(Number(lsScore[index]));
                    rs.PlayerData = JSON.parse(lsDetails[index]);
                    return rs;
                  });
                  this.mapTopRanking.set(LeaderBoardName, {
                    TimeLoad: Date.now(),
                    TopUser: topUser,
                  });
                  resolve(topUser);
                }
              });
            else resolve([]);
          } else {
            console.log(err);
            reject(err);
          }
        });
      } else {
        resolve(this.mapTopRanking.get(LeaderBoardName).TopUser);
      }
    });
  }
}

export const dataHelper = new DataHelper();
