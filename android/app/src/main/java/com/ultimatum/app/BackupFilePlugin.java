package com.ultimatum.app;

import android.content.Context;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.provider.DocumentsContract;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Saves the JSON backup with the Storage Access Framework, the Android way to
 * write a file into Downloads (or any folder the user picks) without storage
 * permissions and on every API level from 23 to 35.
 *
 * Why not the share sheet: for an application/json attachment Android offers
 * "Save to Files" first, and on phones whose Files app does not register JSON,
 * a third-party file manager is the only target left. Its share receiver is
 * what wrote a web page named "ultimatum_backup_....js...". Why not the
 * filesystem plugin: on Android 11+ it may not create files in public
 * Documents, so the backup ended up in app-private storage only.
 *
 * The launcher is registered in load(), before the Activity reaches STARTED,
 * as ActivityResultContracts requires.
 */
@CapacitorPlugin(name = "BackupFile")
public class BackupFilePlugin extends Plugin {

    private ActivityResultLauncher<String> createDocumentLauncher;
    private ActivityResultLauncher<String[]> openDocumentLauncher;
    private PluginCall pendingCall;
    private PluginCall pendingRead;
    /** The JSON waiting for the user to pick a destination. */
    private String storedData;

    @Override
    public void load() {
        createDocumentLauncher = getBridge().registerForActivityResult(
                new ActivityResultContracts.CreateDocument("application/json"),
                this::finishSave);
        openDocumentLauncher = getBridge().registerForActivityResult(
                new ActivityResultContracts.OpenDocument(),
                this::finishRead);
    }

    /**
     * Show the system "save as" sheet for {@code fileName}, then write
     * {@code data} (UTF-8) once the user confirms.
     *
     * Resolves { cancelled: true } when the sheet is dismissed, otherwise
     * { uri, name } for the created document. Rejects with the platform's
     * message when the document could not be written.
     */
    @PluginMethod
    public void saveJson(PluginCall call) {
        String fileName = call.getString("fileName");
        String data = call.getString("data");
        if (fileName == null || fileName.isEmpty() || data == null) {
            call.reject("fileName and data are required");
            return;
        }
        if (pendingCall != null) {
            call.reject("Another backup is already being saved");
            return;
        }

        String suggested = fileName;
        if (!suggested.toLowerCase().endsWith(".json")) suggested = suggested + ".json";

        pendingCall = call;
        storedData = data;
        try {
            createDocumentLauncher.launch(suggested);
        } catch (Exception e) {
            pendingCall = null;
            storedData = null;
            call.reject("Could not open the save dialog: " + e.getMessage());
        }
    }

    private void finishSave(Uri uri) {
        final PluginCall call = pendingCall;
        final String data = storedData;
        pendingCall = null;
        storedData = null;
        if (call == null) return;
        if (uri == null) {
            // The user backed out of the save sheet: not an error.
            JSObject result = new JSObject();
            result.put("cancelled", true);
            call.resolve(result);
            return;
        }

        final Context context = getContext().getApplicationContext();
        new Thread(() -> {
            String error = null;
            String name = uri.getLastPathSegment();
            try {
                name = queryDisplayName(context, uri, name);
                writeDocument(context, uri, data);
            } catch (Exception e) {
                error = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            }
            final String finalError = error;
            final String finalName = name;
            new Handler(Looper.getMainLooper()).post(() -> {
                if (finalError != null) {
                    call.reject("The backup could not be written: " + finalError);
                    return;
                }
                JSObject result = new JSObject();
                result.put("cancelled", false);
                result.put("uri", uri.toString());
                result.put("name", finalName);
                call.resolve(result);
            });
        }, "backup-save").start();
    }

    /**
     * Open the system "open file" sheet and return the chosen document's text.
     * Resolves { cancelled: true } when dismissed, otherwise
     * { name, text, size } with the file decoded as UTF-8 in Java, so no
     * content:// URL ever passes through the WebView.
     */
    @PluginMethod
    public void readJson(PluginCall call) {
        if (pendingRead != null) {
            call.reject("Another file is already being opened");
            return;
        }
        pendingRead = call;
        try {
            // No type filter: a .json must stay selectable whatever MIME type
            // the document provider reports for it. The import validates the
            // content and says what the file actually was when it is wrong.
            openDocumentLauncher.launch(new String[] { "*/*" });
        } catch (Exception e) {
            pendingRead = null;
            call.reject("Could not open the file picker: " + e.getMessage());
        }
    }

    private void finishRead(Uri uri) {
        final PluginCall call = pendingRead;
        pendingRead = null;
        if (call == null) return;
        if (uri == null) {
            JSObject result = new JSObject();
            result.put("cancelled", true);
            call.resolve(result);
            return;
        }
        final Context context = getContext().getApplicationContext();
        new Thread(() -> {
            String text = null;
            String name = queryDisplayName(context, uri, uri.getLastPathSegment());
            int size = 0;
            String error = null;
            try {
                byte[] bytes = readAll(context, uri);
                size = bytes.length;
                text = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
            } catch (Exception e) {
                error = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            }
            final String finalText = text;
            final String finalName = name;
            final int finalSize = size;
            final String finalError = error;
            new Handler(Looper.getMainLooper()).post(() -> {
                if (finalError != null || finalText == null) {
                    call.reject("The file could not be read: " + finalError);
                    return;
                }
                JSObject result = new JSObject();
                result.put("cancelled", false);
                result.put("name", finalName);
                result.put("text", finalText);
                result.put("size", finalSize);
                call.resolve(result);
            });
        }, "backup-read").start();
    }

    // ---------------------------------------------------------------------
    // File helpers
    // ---------------------------------------------------------------------

    private static void writeDocument(Context context, Uri uri, String data) throws Exception {
        OutputStream out = context.getContentResolver().openOutputStream(uri, "wt");
        if (out == null) {
            // Some providers ignore "wt"; retry with the default mode.
            out = context.getContentResolver().openOutputStream(uri);
        }
        if (out == null) throw new Exception("the destination could not be opened");
        try {
            out.write(data.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            out.flush();
        } finally {
            try {
                out.close();
            } catch (Exception ignored) {
            }
        }
    }

    private static byte[] readAll(Context context, Uri uri) throws Exception {
        InputStream in = context.getContentResolver().openInputStream(uri);
        if (in == null) throw new Exception("the file could not be opened");
        try {
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            byte[] chunk = new byte[16 * 1024];
            int read;
            while ((read = in.read(chunk)) > 0) {
                buffer.write(chunk, 0, read);
                // A backup never reaches this size; stop a runaway stream.
                if (buffer.size() > 64 * 1024 * 1024) throw new Exception("the file is too large to be a backup");
            }
            return buffer.toByteArray();
        } finally {
            try {
                in.close();
            } catch (Exception ignored) {
            }
        }
    }

    private static String queryDisplayName(Context context, Uri uri, String fallback) {
        String name = fallback != null ? fallback : "backup.json";
        try {
            if ("content".equals(uri.getScheme())) {
                String[] projection = { DocumentsContract.Document.COLUMN_DISPLAY_NAME };
                try (android.database.Cursor cursor = context.getContentResolver().query(uri, projection, null, null, null)) {
                    if (cursor != null && cursor.moveToFirst()) {
                        String value = cursor.getString(0);
                        if (value != null && !value.isEmpty()) name = value;
                    }
                }
            }
        } catch (Exception ignored) {
        }
        return name;
    }
}
