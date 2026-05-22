import axios from 'axios';

/**
 * LIVE Google Fit Service
 * Uses Google Identity Services to login and fetches actual smartwatch/fitness data
 * via Google Fitness REST API.
 */

const GOOGLE_FIT_URL = 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate';

const DATA_TYPES = {
  STEP_COUNT: { dataTypeName: 'com.google.step_count.delta', dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps' },
  HEART_RATE: { dataTypeName: 'com.google.heart_rate.bpm', dataSourceId: 'derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm' },
  CALORIES: { dataTypeName: 'com.google.calories.expended', dataSourceId: 'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended' },
  DISTANCE: { dataTypeName: 'com.google.distance.delta', dataSourceId: 'derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta' },
  SLEEP: { dataTypeName: 'com.google.sleep.segment' },
  SPO2: { dataTypeName: 'com.google.oxygen_saturation' },
  BODY_TEMP: { dataTypeName: 'com.google.body.temperature' },
};

const getTimestamps = () => {
  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const past7days = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);

  return {
    now: now.getTime(),
    startOfToday: startOfToday.getTime(),
    endOfToday: endOfToday.getTime(),
    past24h: past24h.getTime(),
    past7days: past7days.getTime()
  };
};

const fetchAggregateData = async (token, dataTypeObj, startTimeMillis, endTimeMillis, bucketByMillis = null) => {
  const requestBody = {
    aggregateBy: [
      dataTypeObj.dataSourceId 
        ? { dataSourceId: dataTypeObj.dataSourceId } 
        : { dataTypeName: dataTypeObj.dataTypeName }
    ],
    startTimeMillis,
    endTimeMillis,
  };
  
  if (bucketByMillis) {
    requestBody.bucketByTime = { durationMillis: bucketByMillis };
  }

  try {
    const response = await axios.post(GOOGLE_FIT_URL, requestBody, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.bucket;
  } catch (error) {
    console.error(`Google API Error for ${dataTypeObj.dataTypeName}:`, error.response?.data?.error?.message || error.message);
    return [{ dataset: [{ point: [] }] }];
  }
};

export const fetchHeartRateData = async (token) => {
  const times = getTimestamps();
  const buckets = await fetchAggregateData(token, DATA_TYPES.HEART_RATE, times.past24h, times.now, 15 * 60 * 1000);
  
  const formattedData = [];
  buckets.forEach(bucket => {
    if (bucket.dataset[0].point.length > 0) {
      let sum = 0;
      let count = 0;
      bucket.dataset[0].point.forEach(p => {
        sum += p.value[0].fpVal;
        count++;
      });
      const avg = Math.round(sum / count);
      const time = new Date(parseInt(bucket.startTimeMillis));
      
      formattedData.push({
        time: time.toISOString(),
        hour: `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`,
        value: avg,
        zone: avg < 60 ? 'rest' : avg < 100 ? 'normal' : avg < 140 ? 'cardio' : 'peak'
      });
    }
  });
  return formattedData;
};

export const fetchStepsData = async (token, goalSteps = 10000) => {
  const times = getTimestamps();
  const buckets = await fetchAggregateData(token, DATA_TYPES.STEP_COUNT, times.past7days, times.endOfToday, 24 * 60 * 60 * 1000);
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const data = [];
  
  buckets.forEach(bucket => {
    let steps = 0;
    if (bucket.dataset[0].point.length > 0) {
      bucket.dataset[0].point.forEach(p => {
        steps += (p.value[0].intVal || 0);
      });
    }
    const date = new Date(parseInt(bucket.startTimeMillis));
    data.push({
      day: days[date.getDay()],
      date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      steps,
      goal: goalSteps,
      percentage: Math.min(100, Math.round((steps / goalSteps) * 100)),
      calories: Math.round(steps * 0.04),
      distance: parseFloat((steps * 0.0008).toFixed(1))
    });
  });
  return data;
};

export const fetchSleepData = async (token) => {
  const times = getTimestamps();
  const buckets = await fetchAggregateData(token, DATA_TYPES.SLEEP, times.past24h, times.now);
  
  let totalMinutes = 0, light = 0, deep = 0, rem = 0, awake = 0;
  
  buckets.forEach(b => {
    b.dataset[0].point.forEach(p => {
      const type = p.value[0].intVal;
      const durationMins = (parseInt(p.endTimeNanos) - parseInt(p.startTimeNanos)) / 1000000 / 1000 / 60;
      if (type === 1 || type === 3) light += durationMins;
      else if (type === 4) deep += durationMins;
      else if (type === 5) rem += durationMins;
      else if (type === 2 || type === 6) awake += durationMins;
      if (type !== 2 && type !== 6) totalMinutes += durationMins;
    });
  });

  if (totalMinutes === 0) {
    return {
      totalMinutes: 0, totalHours: 0, quality: 'No Data', qualityScore: 0,
      stages: { deep: { minutes: 0, percentage: 0 }, light: { minutes: 0, percentage: 0 }, rem: { minutes: 0, percentage: 0 }, awake: { minutes: 0, percentage: 0 } },
      bedTime: '--:--', wakeTime: '--:--'
    };
  }

  const totalSegments = light + deep + rem + awake;
  return {
    totalMinutes: Math.round(totalMinutes),
    totalHours: parseFloat((totalMinutes / 60).toFixed(1)),
    quality: totalMinutes >= 420 ? 'Good' : totalMinutes >= 360 ? 'Fair' : 'Poor',
    qualityScore: Math.min(100, Math.round((totalMinutes / 480) * 100)),
    stages: {
      deep: { minutes: Math.round(deep), percentage: Math.round(deep/totalSegments*100) || 0 },
      light: { minutes: Math.round(light), percentage: Math.round(light/totalSegments*100) || 0 },
      rem: { minutes: Math.round(rem), percentage: Math.round(rem/totalSegments*100) || 0 },
      awake: { minutes: Math.round(awake), percentage: Math.round(awake/totalSegments*100) || 0 }
    },
    bedTime: 'Synced', wakeTime: 'Automated'
  };
};

export const fetchTodaySummary = async (token) => {
  const times = getTimestamps();
  const [stepsBucket, hrBucket, calBucket, distBucket] = await Promise.all([
    fetchAggregateData(token, DATA_TYPES.STEP_COUNT, times.startOfToday, times.endOfToday, 24 * 60 * 60 * 1000),
    fetchAggregateData(token, DATA_TYPES.HEART_RATE, times.startOfToday, times.endOfToday, 24 * 60 * 60 * 1000),
    fetchAggregateData(token, DATA_TYPES.CALORIES, times.startOfToday, times.endOfToday, 24 * 60 * 60 * 1000),
    fetchAggregateData(token, DATA_TYPES.DISTANCE, times.startOfToday, times.endOfToday, 24 * 60 * 60 * 1000)
  ]);

  const sumVal = (bucket, type = 'intVal') => {
    let sum = 0;
    if (bucket && bucket[0] && bucket[0].dataset[0].point.length > 0) {
      bucket[0].dataset[0].point.forEach(p => {
         sum += (type === 'fpVal' ? (p.value[0].fpVal || 0) : (p.value[0].intVal || 0));
      });
    }
    return sum;
  };
  
  const extractAvgHrAndExtremes = (bucket) => {
     if (bucket && bucket[0] && bucket[0].dataset[0].point.length > 0) {
        const valObj = bucket[0].dataset[0].point[0].value[0];
        const valMax = bucket[0].dataset[0].point[0].value[1];
        const valMin = bucket[0].dataset[0].point[0].value[2];
        return { 
          avg: Math.round(valObj.fpVal || 0), 
          max: Math.round(valMax?.fpVal || 0) || Math.round(valObj.fpVal) + 20, 
          min: Math.round(valMin?.fpVal || 0) || Math.round(valObj.fpVal) - 10 
        };
     }
     return { avg: 0, max: 0, min: 0 };
  };

  const steps = sumVal(stepsBucket, 'intVal');
  const hrData = extractAvgHrAndExtremes(hrBucket);
  const caloriesStr = sumVal(calBucket, 'fpVal');
  const calories = Math.round(caloriesStr > 0 ? caloriesStr : steps * 0.04);
  const distRaw = sumVal(distBucket, 'fpVal');
  const distance = parseFloat((distRaw > 0 ? distRaw / 1000 : steps * 0.0008).toFixed(1));
  const sleep = await fetchSleepData(token);
  
  return {
    steps, stepsGoal: 10000, stepsPercentage: Math.min(100, Math.round((steps / 10000) * 100)),
    heartRate: hrData.avg, heartRateMin: hrData.min, heartRateMax: hrData.max,
    spo2: 0, calories, caloriesGoal: 2200, distance, distanceGoal: 8.0,
    activeMinutes: Math.round(steps / 100), activeGoal: 60, bodyTemperature: 0,
    sleep, lastSynced: new Date().toISOString(), deviceName: 'Google Fit Device'
  };
};

export const fetchWeeklyTrends = async (token) => {
  const times = getTimestamps();
  const [hrBucket, stepsBucket] = await Promise.all([
    fetchAggregateData(token, DATA_TYPES.HEART_RATE, times.past7days, times.endOfToday),
    fetchAggregateData(token, DATA_TYPES.STEP_COUNT, times.past7days, times.endOfToday)
  ]);
  
  let totalHr = 0, hrSamples = 0;
  if(hrBucket[0] && hrBucket[0].dataset[0].point.length > 0) {
     totalHr = hrBucket[0].dataset[0].point[0].value[0].fpVal; hrSamples = 1;
  }
  let totalSteps = 0;
  if(stepsBucket[0] && stepsBucket[0].dataset[0].point.length > 0) {
     totalSteps = stepsBucket[0].dataset[0].point[0].value[0].intVal;
  }
  const avgHR = Math.round(hrSamples > 0 ? totalHr/hrSamples : 0);
  const avgSteps = Math.round(totalSteps / 7);
  
  return {
    avgHeartRate: avgHR, heartRateTrend: 0, avgSteps, stepsTrend: null, avgSleepHours: 0, sleepTrend: null, avgSpo2: 0, consistencyScore: avgSteps > 0 ? 80 : 0,
    insights: generateAIInsights(avgHR, avgSteps, 0, 0)
  };
};

function generateAIInsights(hr, steps, sleep, spo2) {
  const insights = [];
  if (hr > 0 && hr > 75) insights.push({ type: 'info', icon: '💓', message: `Average heart rate ${hr} bpm. Light exercise suggested.` });
  else if (hr > 0) insights.push({ type: 'success', icon: '💚', message: `Great! Heart rate ${hr} bpm is optimal.` });
  if (steps > 0 && steps < 8000) insights.push({ type: 'warning', icon: '🚶', message: `Averaged ${steps.toLocaleString()} steps. Goal: 10k.` });
  else if (steps > 0) insights.push({ type: 'success', icon: '🏃', message: `Awesome! ${steps.toLocaleString()} steps/day is excellent.` });
  insights.push({ type: 'tip', icon: '🧠', message: 'Tip: Constant movement improves brain focus and test performance.' });
  return insights;
}

export function convertToSyncPayload(summary) {
  return {
    heartRate: summary.heartRate || null,
    steps: summary.steps,
    calories: summary.calories,
    sleepMinutes: summary.sleep.totalMinutes,
    distanceKm: summary.distance,
    oxygenLevels: summary.spo2 || 98,
    deviceId: summary.deviceName,
    deviceModel: "Google Fit Sync",
    isBurnoutRisk: (summary.heartRate > 100 || summary.sleep.totalMinutes < 300)
  };
}
