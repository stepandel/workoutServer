import { DynamoDB } from 'aws-sdk';
import { CompletedWorkout, ScheduledWorkout, Stats, WeeklyStats } from './ServiceTypes';
import { getWorkoutLogItemsForUser } from './workoutLogHelpers';

const dynamoDB = new DynamoDB.DocumentClient();

const userStatsTable = process.env.USER_STATS_TABLE;

export async function saveStats(userId: string, stats: Stats) {
  let statsTableEntry = { ...stats, ...{userId: userId} };

  console.log({statsTableEntry});

  let putRequest: DynamoDB.DocumentClient.PutItemInput = {
    TableName: userStatsTable,
    Item: statsTableEntry,
  };
  return dynamoDB.put(putRequest).promise();
}

export async function getStats(userId: string): Promise<Stats> {
  let getRequest: DynamoDB.DocumentClient.GetItemInput = {
    TableName: userStatsTable,
    Key: {
      userId: userId,
    },
  };
  let getResult = await dynamoDB.get(getRequest).promise();

  return getResult.Item as Stats;
}

export async function getWorkoutsAndWeeklyStats(userId: string, timezoneOffset: number): Promise<{ weeklyStats: WeeklyStats, completedWorkouts: CompletedWorkout[], scheduledWorkouts: ScheduledWorkout[] }> {
  let workoutLogItems = await getWorkoutLogItemsForUser(userId)
  let completedWorkouts = workoutLogItems.completedWorkouts
  let scheduledWorkouts = workoutLogItems.scheduledWorkouts
  let clientDate = Date.now() + (timezoneOffset * 60000)
  let weekStart = getMonday(new Date(clientDate)).getTime() / 1000

  let stats: WeeklyStats = {
    workoutsCompleted: 0,
    timeWorkingout: 0,
    setsCompleted: 0,
    repsCompleted: 0,
    weightLifted: 0
  }

  let workoutsThisWeek = completedWorkouts.filter( workout => workout.startTS > weekStart )

  workoutsThisWeek.forEach( workout => {
    stats.workoutsCompleted += 1
    stats.timeWorkingout += workout.time
    workout.workout.rounds.forEach( round => {
      round.sets.forEach( sets => {
        sets.forEach( set => {
          stats.setsCompleted += 1
          stats.repsCompleted += set.reps || 0
          stats.weightLifted += set.weight || 0
        })
      })
    })
  })

  return {
    weeklyStats: stats,
    completedWorkouts: completedWorkouts,
    scheduledWorkouts: scheduledWorkouts
  }
}

function getMonday(d: Date) {
  let day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday

  d = new Date(d.setDate(diff))
  d.setHours(0)
  d.setMinutes(0)
  d.setSeconds(0)
  return d;
}

export async function deleteUserFromStats(userId: string) {
  let deleteRequest: DynamoDB.DocumentClient.DeleteItemInput = {
    TableName: userStatsTable,
    Key: {
      userId: userId
    }
  }

  return dynamoDB.delete(deleteRequest).promise()
}
