package com.spadacostura

import android.app.Activity
import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * Saves and reads the backup file through the Storage Access Framework: the
 * seamstress picks the document, so no storage permission is needed.
 * Closing the picker resolves with null instead of failing.
 */
class BackupFileModule(private val context: ReactApplicationContext) :
  ReactContextBaseJavaModule(context), ActivityEventListener {

  private class Request(val code: Int, val promise: Promise, val text: String?)

  private var pending: Request? = null

  init {
    context.addActivityEventListener(this)
  }

  override fun getName() = "BackupFile"

  /** Resolves with true once written, or null when the picker is closed. */
  @ReactMethod
  fun save(fileName: String, text: String, promise: Promise) {
    val intent =
      Intent(Intent.ACTION_CREATE_DOCUMENT)
        .addCategory(Intent.CATEGORY_OPENABLE)
        .setType(JSON)
        .putExtra(Intent.EXTRA_TITLE, fileName)
    pick(Request(SAVE, promise, text), intent)
  }

  /** Resolves with the file text, or null when the picker is closed. */
  @ReactMethod
  fun open(promise: Promise) {
    val intent =
      Intent(Intent.ACTION_OPEN_DOCUMENT)
        .addCategory(Intent.CATEGORY_OPENABLE)
        .setType("*/*")
    pick(Request(OPEN, promise, null), intent)
  }

  private fun pick(request: Request, intent: Intent) {
    val activity = context.currentActivity
    if (activity == null || pending != null) {
      request.promise.reject("unavailable", "File picker is not available now")
      return
    }
    pending = request
    activity.startActivityForResult(intent, request.code)
  }

  override fun onActivityResult(
    activity: Activity,
    requestCode: Int,
    resultCode: Int,
    data: Intent?,
  ) {
    val request = pending?.takeIf { it.code == requestCode } ?: return
    pending = null
    val uri = data?.data
    if (resultCode != Activity.RESULT_OK || uri == null) {
      request.promise.resolve(null)
      return
    }
    try {
      if (request.code == SAVE) {
        write(uri, request.text.orEmpty())
        request.promise.resolve(true)
      } else {
        request.promise.resolve(read(uri))
      }
    } catch (error: Exception) {
      request.promise.reject("io", error)
    }
  }

  override fun onNewIntent(intent: Intent) = Unit

  private fun write(uri: Uri, text: String) {
    val stream =
      context.contentResolver.openOutputStream(uri, "wt")
        ?: error("Cannot write $uri")
    stream.use { it.write(text.toByteArray(Charsets.UTF_8)) }
  }

  private fun read(uri: Uri): String {
    val stream =
      context.contentResolver.openInputStream(uri) ?: error("Cannot read $uri")
    return stream.bufferedReader(Charsets.UTF_8).use { it.readText() }
  }

  private companion object {
    const val SAVE = 4101
    const val OPEN = 4102
    const val JSON = "application/json"
  }
}
