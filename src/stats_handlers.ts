import {
  GetStatsRequest,
  GetStatsResponse,
  GetWorkoutsAndStatsForUserRequest,
  GetWorkoutsAndStatsForUserResponse,
  SaveStatsRequest,
} from './ServiceTypes';
import { getStats, getWorkoutsAndWeeklyStats, saveStats } from './StatsHelpers';
import { lambdaWrap } from './Utils';

async function saveStatsForUser(r: SaveStatsRequest) {
  return saveStats(r.userId, r.stats);
}

async function getStatsForUser(r: GetStatsRequest): Promise<GetStatsResponse> {
  let stats = await getStats(r.userId);
  return { stats: stats };
}

async function getCompletedWorkoutsAndStatsForUser(r: GetWorkoutsAndStatsForUserRequest): Promise<GetWorkoutsAndStatsForUserResponse> {
  let statsPromise = getStats(r.userId);
  let workoutsAndStats = await getWorkoutsAndWeeklyStats(r.userId, r.timezoneOffset)

  return {
    completedWorkouts: workoutsAndStats.completedWorkouts,
    stats: await statsPromise,
    weeklyStats: workoutsAndStats.weeklyStats
  }
}

module.exports = {
  saveStatsForUser: lambdaWrap(saveStatsForUser),
  getStatsForUser: lambdaWrap(getStatsForUser),
  getCompletedWorkoutsAndStatsForUser: lambdaWrap(getCompletedWorkoutsAndStatsForUser)
};
