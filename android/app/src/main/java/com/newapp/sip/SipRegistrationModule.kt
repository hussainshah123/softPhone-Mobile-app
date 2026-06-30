package com.newapp.sip

import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.concurrent.Executors

class SipRegistrationModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val executor = Executors.newSingleThreadExecutor()

    init {
        SipSession.setReactContext(reactContext)
    }

    override fun getName(): String = "SipRegistration"

    override fun invalidate() {
        SipSession.setReactContext(null)
        super.invalidate()
    }

    @ReactMethod
    fun getVersion(promise: Promise) {
        promise.resolve(SipSession.VERSION)
    }

    @ReactMethod
    fun registerSIP(
        username: String,
        password: String,
        server: String,
        port: String,
        promise: Promise,
    ) {
        Log.i(
            "SIP",
            "registerSIP v${SipSession.VERSION} user=$username server=$server port=$port",
        )

        executor.execute {
            try {
                val portNumber = port.toIntOrNull() ?: 5060
                val result = SipSession.register(username, password, server, portNumber)
                promise.resolve(result)
            } catch (error: Exception) {
                Log.e("SIP", "registerSIP failed", error)
                promise.reject(
                    "SIP_REGISTRATION_FAILED",
                    error.message ?: "Registration failed",
                    error,
                )
            }
        }
    }

    @ReactMethod
    fun unregisterSIP(promise: Promise) {
        executor.execute {
            try {
                SipSession.unregister()
                promise.resolve("Unregistered")
            } catch (error: Exception) {
                promise.reject("SIP_UNREGISTER_FAILED", error.message ?: "Unregister failed", error)
            }
        }
    }

    @ReactMethod
    fun makeCall(
        username: String,
        password: String,
        server: String,
        port: String,
        destination: String,
        promise: Promise,
    ) {
        Log.i(
            "SIP",
            "makeCall v${SipSession.VERSION} user=$username dest=$destination server=$server port=$port",
        )

        executor.execute {
            try {
                val result = SipSession.makeCall(destination)
                promise.resolve(result)
            } catch (error: Exception) {
                Log.e("SIP", "makeCall failed", error)
                promise.reject(
                    "SIP_CALL_FAILED",
                    error.message ?: "Call failed",
                    error,
                )
            }
        }
    }

    @ReactMethod
    fun hangupCall(promise: Promise) {
        executor.execute {
            try {
                SipSession.hangupCall()
                promise.resolve("Call ended")
            } catch (error: Exception) {
                promise.reject("SIP_HANGUP_FAILED", error.message ?: "Hangup failed", error)
            }
        }
    }

    @ReactMethod
    fun answerCall(promise: Promise) {
        executor.execute {
            try {
                val result = SipSession.answerIncomingCall()
                promise.resolve(result)
            } catch (error: Exception) {
                promise.reject("SIP_ANSWER_FAILED", error.message ?: "Answer failed", error)
            }
        }
    }

    @ReactMethod
    fun declineCall(promise: Promise) {
        executor.execute {
            try {
                SipSession.declineIncomingCall()
                promise.resolve("Call declined")
            } catch (error: Exception) {
                promise.reject("SIP_DECLINE_FAILED", error.message ?: "Decline failed", error)
            }
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for NativeEventEmitter on Android
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for NativeEventEmitter on Android
    }
}
