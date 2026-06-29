package com.newapp.sip

import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.concurrent.Executors

class SipRegistrationModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val executor = Executors.newSingleThreadExecutor()

    override fun getName(): String = "SipRegistration"

    @ReactMethod
    fun getVersion(promise: Promise) {
        promise.resolve(SipRegistrationClient.VERSION)
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
            "registerSIP v${SipRegistrationClient.VERSION} user=$username server=$server port=$port",
        )

        executor.execute {
            try {
                val portNumber = port.toIntOrNull() ?: 5060
                val result = SipRegistrationClient.register(username, password, server, portNumber)
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
}
