package com.ultimatum.app

import android.content.Intent
import androidx.activity.result.ActivityResult
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.Record
import androidx.health.connect.client.records.RestingHeartRateRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.WeightRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import java.time.Duration
import java.time.Instant
import java.time.ZoneId
import java.time.temporal.ChronoUnit
import kotlin.reflect.KClass

/**
 * Minimal read-only Health Connect bridge.
 *
 * Health Connect is the Android hub that Fitbit, Samsung Health, Garmin, Wear OS
 * and other writers publish into. This plugin never writes health data; it only
 * requests read access and returns aggregated records to the web layer, which
 * merges them into the existing local-first stores.
 *
 * Data types are granted independently. The user may allow Steps and refuse
 * Sleep, and Health Connect does not read anything back from the permission
 * sheet for categories nobody has data for. So "did it work" is decided per
 * type after the sheet closes (what the platform says is actually granted), and
 * every read asks only for the types it has. Requiring all six to be granted is
 * what made a partial grant look like a total failure.
 */
@CapacitorPlugin(name = "HealthConnect")
class HealthConnectPlugin : Plugin() {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private val permissionContract = PermissionController.createRequestPermissionResultContract()

    /** Every read permission the app declares, in the order they are shown. */
    private val allPermissions: Set<String> by lazy {
        setOf(
            HealthPermission.getReadPermission(StepsRecord::class),
            HealthPermission.getReadPermission(SleepSessionRecord::class),
            HealthPermission.getReadPermission(WeightRecord::class),
            HealthPermission.getReadPermission(ExerciseSessionRecord::class),
            HealthPermission.getReadPermission(HeartRateRecord::class),
            HealthPermission.getReadPermission(RestingHeartRateRecord::class),
        )
    }

    private fun sdkStatus(): Int = HealthConnectClient.getSdkStatus(context)

    private fun isRecordTypeGranted(type: KClass<out Record>, granted: Set<String>): Boolean =
        granted.contains(HealthPermission.getReadPermission(type))

    private fun grantedTypes(granted: Set<String>): JSObject {
        val types = JSObject()
            .put("steps", isRecordTypeGranted(StepsRecord::class, granted))
            .put("sleep", isRecordTypeGranted(SleepSessionRecord::class, granted))
            .put("weight", isRecordTypeGranted(WeightRecord::class, granted))
            .put("exercise", isRecordTypeGranted(ExerciseSessionRecord::class, granted))
            .put("heartRate", isRecordTypeGranted(HeartRateRecord::class, granted))
            .put("restingHeartRate", isRecordTypeGranted(RestingHeartRateRecord::class, granted))
        return types
    }

    private fun typesCount(types: JSObject): Int = types.keys().asSequence().count { types.getBool(it) == true }

    @PluginMethod
    fun status(call: PluginCall) {
        val status = sdkStatus()
        call.resolve(
            JSObject()
                .put("available", status == HealthConnectClient.SDK_AVAILABLE)
                .put("status", status)
                .put("reason", when (status) {
                    HealthConnectClient.SDK_AVAILABLE -> "available"
                    HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> "provider_update_required"
                    else -> "unavailable"
                })
        )
    }

    /** What the platform currently says this app may read. */
    @PluginMethod
    fun getGrantedPermissions(call: PluginCall) {
        if (sdkStatus() != HealthConnectClient.SDK_AVAILABLE) {
            call.resolve(JSObject().put("granted", false).put("types", JSObject()).put("count", 0).put("total", allPermissions.size))
            return
        }
        scope.launch {
            try {
                val client = HealthConnectClient.getOrCreate(context)
                val granted = client.permissionController.getGrantedPermissions()
                val types = grantedTypes(granted)
                val count = typesCount(types)
                call.resolve(JSObject().put("granted", count > 0).put("types", types).put("count", count).put("total", allPermissions.size))
            } catch (error: Exception) {
                call.reject("Could not read Health Connect permissions: ${error.message}")
            }
        }
    }

    @PluginMethod
    fun requestReadPermissions(call: PluginCall) {
        if (sdkStatus() != HealthConnectClient.SDK_AVAILABLE) {
            call.reject("Health Connect is not available on this device.")
            return
        }
        try {
            val intent: Intent = permissionContract.createIntent(context, allPermissions)
            startActivityForResult(call, intent, "permissionsCallback")
        } catch (error: Exception) {
            call.reject("Could not open the Health Connect permission screen: ${error.message}")
        }
    }

    @ActivityCallback
    fun permissionsCallback(call: PluginCall?, result: ActivityResult) {
        if (call == null) return
        // Read the authoritative grant list instead of trusting the result
        // payload: the platform may return an empty set for a successful
        // request (types with no data yet), and a cancel for "nothing new".
        scope.launch {
            try {
                val client = HealthConnectClient.getOrCreate(context)
                val granted = client.permissionController.getGrantedPermissions()
                val types = grantedTypes(granted)
                val count = typesCount(types)
                call.resolve(
                    JSObject()
                        // `granted` is "any type allowed", which is the question
                        // the UI answers. `types` carries the per-type detail.
                        .put("granted", count > 0)
                        .put("types", types)
                        .put("count", count)
                        .put("total", allPermissions.size)
                        .put("cancelled", result.resultCode == android.app.Activity.RESULT_CANCELED)
                )
            } catch (error: Exception) {
                call.reject("Could not read the permission result: ${error.message}")
            }
        }
    }

    @PluginMethod
    fun readData(call: PluginCall) {
        if (sdkStatus() != HealthConnectClient.SDK_AVAILABLE) {
            call.reject("Health Connect is not available on this device.")
            return
        }
        val days = (call.getInt("days") ?: 30).coerceIn(1, 90)
        val end = Instant.now()
        val start = end.minus(days.toLong(), ChronoUnit.DAYS)

        scope.launch {
            try {
                val client = HealthConnectClient.getOrCreate(context)
                val granted = client.permissionController.getGrantedPermissions()
                if (granted.isEmpty()) {
                    call.reject("NO_PERMISSIONS")
                    return@launch
                }

                val zone = ZoneId.systemDefault()
                // A phone and a watch can both publish the same day's steps or
                // sleep. Summing across origins double-counts. Keep a per-source
                // total, then take the largest source for each day.
                val stepsByOrigin = mutableMapOf<String, MutableMap<String, Long>>()
                val sleepByOrigin = mutableMapOf<String, MutableMap<String, Double>>()
                val exerciseByOrigin = mutableMapOf<String, MutableMap<String, Double>>()
                val weight = linkedMapOf<String, Double>()
                val heart = linkedMapOf<String, MutableList<Double>>()
                val restingHeart = linkedMapOf<String, MutableList<Double>>()
                val skipped = JSArray()
                val readTypes = linkedSetOf<String>()

                // Each type is read on its own and independently guarded: one
                // refused type (or one provider that throws) must not blank out
                // the types that were granted.
                suspend fun attempt(type: String, recordType: KClass<out Record>, block: suspend () -> Unit) {
                    if (!isRecordTypeGranted(recordType, granted)) {
                        skipped.put(type)
                        return
                    }
                    try {
                        block()
                        readTypes.add(type)
                    } catch (error: Exception) {
                        // One type failing (no data, provider error) must not
                        // blank out the types that did return records.
                        skipped.put(type)
                    }
                }

                attempt("steps", StepsRecord::class) {
                    client.readRecords(
                        ReadRecordsRequest(StepsRecord::class, timeRangeFilter = TimeRangeFilter.between(start, end))
                    ).records.forEach { record ->
                        val date = record.startTime.atZone(zone).toLocalDate().toString()
                        val origin = record.metadata.dataOrigin.packageName
                        val byDate = stepsByOrigin.getOrPut(origin) { mutableMapOf() }
                        byDate[date] = (byDate[date] ?: 0L) + record.count
                    }
                }

                attempt("sleep", SleepSessionRecord::class) {
                    client.readRecords(
                        ReadRecordsRequest(SleepSessionRecord::class, timeRangeFilter = TimeRangeFilter.between(start, end))
                    ).records.forEach { record ->
                        // A night that ends after midnight belongs to the day the
                        // athlete woke up, so it lands on the same date as the rest
                        // of that day's metrics.
                        val date = record.endTime.atZone(zone).toLocalDate().toString()
                        val origin = record.metadata.dataOrigin.packageName
                        val minutes = Duration.between(record.startTime, record.endTime).toMinutes().toDouble()
                        val byDate = sleepByOrigin.getOrPut(origin) { mutableMapOf() }
                        byDate[date] = (byDate[date] ?: 0.0) + minutes
                    }
                }

                attempt("weight", WeightRecord::class) {
                    client.readRecords(
                        ReadRecordsRequest(WeightRecord::class, timeRangeFilter = TimeRangeFilter.between(start, end))
                    ).records
                        .sortedBy { it.time }
                        .forEach { record ->
                            // Later reading of the same day wins.
                            val date = record.time.atZone(zone).toLocalDate().toString()
                            weight[date] = record.weight.inKilograms
                        }
                }

                attempt("exercise", ExerciseSessionRecord::class) {
                    client.readRecords(
                        ReadRecordsRequest(ExerciseSessionRecord::class, timeRangeFilter = TimeRangeFilter.between(start, end))
                    ).records.forEach { record ->
                        val date = record.startTime.atZone(zone).toLocalDate().toString()
                        val origin = record.metadata.dataOrigin.packageName
                        val minutes = Duration.between(record.startTime, record.endTime).toMinutes().toDouble()
                        val byDate = exerciseByOrigin.getOrPut(origin) { mutableMapOf() }
                        byDate[date] = (byDate[date] ?: 0.0) + minutes
                    }
                }

                attempt("heartRate", HeartRateRecord::class) {
                    client.readRecords(
                        ReadRecordsRequest(HeartRateRecord::class, timeRangeFilter = TimeRangeFilter.between(start, end))
                    ).records.forEach { record ->
                        val date = record.startTime.atZone(zone).toLocalDate().toString()
                        val bucket = heart.getOrPut(date) { mutableListOf() }
                        record.samples.forEach { sample -> bucket.add(sample.beatsPerMinute.toDouble()) }
                    }
                }

                attempt("restingHeartRate", RestingHeartRateRecord::class) {
                    client.readRecords(
                        ReadRecordsRequest(RestingHeartRateRecord::class, timeRangeFilter = TimeRangeFilter.between(start, end))
                    ).records.forEach { record ->
                        val date = record.time.atZone(zone).toLocalDate().toString()
                        restingHeart.getOrPut(date) { mutableListOf() }.add(record.beatsPerMinute.toDouble())
                    }
                }

                val steps = maxAcrossOrigins(stepsByOrigin)
                val sleep = maxAcrossOrigins(sleepByOrigin)
                val exercise = maxAcrossOrigins(exerciseByOrigin)

                call.resolve(
                    JSObject()
                        .put("steps", recordsToArray(steps.mapValues { it.value.toDouble() }))
                        .put("sleepMinutes", recordsToArray(sleep))
                        .put("weightKg", recordsToArray(weight))
                        .put("exerciseMinutes", recordsToArray(exercise))
                        .put("heartRate", recordsToArray(heart.mapValues { it.value.average() }))
                        .put("restingHeartRate", recordsToArray(restingHeart.mapValues { it.value.average() }))
                        .put("readTypes", JSArray.from(readTypes.toTypedArray()))
                        .put("skippedTypes", skipped)
                )
            } catch (error: Exception) {
                call.reject("Health Connect read failed: ${error.message}")
            }
        }
    }

    private fun <T : Comparable<T>> maxAcrossOrigins(
        byOrigin: Map<String, Map<String, T>>,
    ): Map<String, T> {
        val merged = mutableMapOf<String, T>()
        byOrigin.values.forEach { byDate ->
            byDate.forEach { (date, value) ->
                val current = merged[date]
                if (current == null || value > current) merged[date] = value
            }
        }
        return merged
    }

    private fun recordsToArray(values: Map<String, Double>): JSArray {
        val array = JSArray()
        values.toSortedMap().forEach { (date, value) ->
            array.put(JSObject().put("date", date).put("value", value))
        }
        return array
    }
}
