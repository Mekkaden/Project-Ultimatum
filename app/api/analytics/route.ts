export const dynamic = 'force-static';
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/getServerUser";
import { adminDb } from "@/lib/firebaseAdmin";
import { getMusclesForExercise, Muscle } from "@/lib/muscleMapping";

export async function GET(req: Request) {
  try {
    const user = await getServerUser(req);
    const userId = user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // Fetch workout logs from Firestore
    const workoutLogsSnapshot = await adminDb
      .collection("workoutLogs")
      .where("userId", "==", userId)
      .where("completedAt", ">=", threeMonthsAgo)
      .orderBy("completedAt", "asc")
      .get();

    // Fetch weight logs from Firestore
    const weightLogsSnapshot = await adminDb
      .collection("weightLogs")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(14)
      .get();

    // Fetch user document for diet plan
    const userDoc = await adminDb.collection("users").doc(userId).get();
    const userData = userDoc.data();

    // Initialize data structures
    const volumeData: Record<Muscle, number> = {
      "chest": 0, "front-delts": 0, "side-delts": 0, "rear-delts": 0,
      "lats": 0, "traps": 0, "lower-back": 0, "abs": 0,
      "biceps": 0, "triceps": 0, "forearms": 0, "quads": 0,
      "hamstrings": 0, "glutes": 0, "calves": 0,
    };

    const weeklySetHistory: Record<string, number> = {};
    const exerciseHistory: Record<string, any[]> = {};
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    for (const logDoc of workoutLogsSnapshot.docs) {
      const log = logDoc.data();
      const completedAt = log.completedAt?.toDate?.() || new Date(log.completedAt);
      const weekLabel = `${completedAt.toLocaleString("default", { month: "short" })} ${completedAt.getDate()}`;
      const isRecentWeek = completedAt >= oneWeekAgo;

      if (!weeklySetHistory[weekLabel]) weeklySetHistory[weekLabel] = 0;

      // Fetch exercise logs for this workout
      const exerciseLogsSnapshot = await adminDb
        .collection("exerciseLogs")
        .where("workoutLogId", "==", logDoc.id)
        .get();

      exerciseLogsSnapshot.docs.forEach((exDoc) => {
        const ex = exDoc.data();
        weeklySetHistory[weekLabel] += 1;

        if (isRecentWeek) {
          const muscles = getMusclesForExercise(ex.slotName || "unknown");
          muscles.forEach((m) => { volumeData[m] += 1; });
        }

        const exName = ex.slotName || "Unknown Exercise";
        if (!exerciseHistory[exName]) exerciseHistory[exName] = [];
        exerciseHistory[exName].push({
          date: completedAt,
          weight: ex.weight || 0,
          reps: ex.reps || 0,
          rir: ex.rir || 0,
        });
      });
    }

    // Format Chart Data
    const chartData = Object.keys(weeklySetHistory).map((key) => ({
      date: key,
      sets: weeklySetHistory[key],
    }));

    // Calculate Insights
    const insights = Object.keys(exerciseHistory).map((exName) => {
      const history = exerciseHistory[exName];
      if (history.length < 2) return null;

      const recent = history[history.length - 1];
      const previous = history[history.length - 2];

      let progression = "";
      let isPositive = false;
      let isNegative = false;
      let action = "Stay consistent";

      if (recent.weight > previous.weight) {
        progression = `+${recent.weight - previous.weight} lbs`;
        isPositive = true;
        action = "Hold progression";
      } else if (recent.reps > previous.reps) {
        progression = `+${recent.reps - previous.reps} reps`;
        isPositive = true;
        action = "Hold progression";
      } else if (recent.reps < previous.reps && recent.weight === previous.weight) {
        progression = `${recent.reps - previous.reps} reps`;
        isNegative = true;
        action = "Tighten execution";
      }

      return {
        exerciseName: exName,
        progression,
        isPositive,
        isNegative,
        rpe: recent.rir ? 10 - recent.rir : undefined,
        action,
        isPR: recent.weight > previous.weight,
      };
    }).filter(Boolean);

    // Diet & Weight Alignment Analysis
    const dietPlan = userData?.dietPlan as any;
    const goal = dietPlan?.goal || "Maintain";
    const weightLogsDb = weightLogsSnapshot.docs.map((d) => d.data());
    let dietAlignment = null;

    if (weightLogsDb.length >= 2) {
      const newest = weightLogsDb[0].weight;
      const oldest = weightLogsDb[weightLogsDb.length - 1].weight;
      const diff = newest - oldest;

      let status = "neutral";
      let message = "Weight is stable.";

      if (goal === "Lean Bulk" || goal === "Mass Bulk") {
        if (diff > 1.5) { status = "warning"; message = "Dirty Bulk Detected. Gaining tissue too fast."; }
        else if (diff > 0 && diff <= 1.5) { status = "success"; message = "Optimal Bulking. Clean tissue accrual."; }
        else if (diff <= 0) { status = "warning"; message = "Failing to Bulk. Increase calories."; }
      } else if (goal === "Cut") {
        if (diff < 0) { status = "success"; message = "Deficit Confirmed. Fat loss progressing."; }
        else { status = "warning"; message = "Diet Failure. Drop calories or increase output."; }
      }
      dietAlignment = { goal, diff: parseFloat(diff.toFixed(2)), status, message, daysMeasured: weightLogsDb.length };
    }

    // Muscle Recovery Analysis
    const muscleRecovery: Record<string, { status: string; netScore: number }> = {};
    const ALL_MUSCLES = ["chest","front-delts","side-delts","rear-delts","lats","traps","lower-back","abs","biceps","triceps","forearms","quads","hamstrings","glutes","calves"];
    ALL_MUSCLES.forEach((m) => { muscleRecovery[m] = { status: "maintenance", netScore: 0 }; });

    insights.forEach((insight) => {
      if (!insight) return;
      const muscles = getMusclesForExercise(insight.exerciseName);
      muscles.forEach((m) => {
        if (insight.isPositive) muscleRecovery[m].netScore += 1;
        if (insight.isNegative) muscleRecovery[m].netScore -= 1;
      });
    });

    Object.keys(muscleRecovery).forEach((m) => {
      const score = muscleRecovery[m].netScore;
      if (score > 0) muscleRecovery[m].status = "recovering";
      else if (score < 0) muscleRecovery[m].status = "under-recovering";
    });

    if (chartData.length === 0) {
      chartData.push({ date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }), sets: 0 });
    }

    return NextResponse.json({ volumeData, chartData, insights: insights.slice(-10), dietAlignment, muscleRecovery });
  } catch (error) {
    console.error("Analytics API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
