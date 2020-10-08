import {
  GetStatsRequest,
  GetStatsResponse,
  SaveStatsRequest,
} from './ServiceTypes';
import { getStats, saveStats } from './StatsHelpers';
import { lambdaWrap } from './Utils';

async function saveStatsForUser(r: SaveStatsRequest) {
  return saveStats(r.userId, r.stats);
}

async function getStatsForUser(r: GetStatsRequest): Promise<GetStatsResponse> {
  let stats = await getStats(r.userId);
  return { stats: stats };
}

module.exports = {
  saveStatsForUser: lambdaWrap(saveStatsForUser),
  getStatsForUser: lambdaWrap(getStatsForUser),
};
