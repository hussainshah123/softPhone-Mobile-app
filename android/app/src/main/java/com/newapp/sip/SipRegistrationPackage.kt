package com.newapp.sip

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class SipRegistrationPackage : ReactPackage {
    @Deprecated("Overriding deprecated member")
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
        listOf(SipRegistrationModule(reactContext))

    @Deprecated("Overriding deprecated member")
    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
        emptyList()
}
