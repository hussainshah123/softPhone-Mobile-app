import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import Splash from '../screens/splashscreen/Splash'
import Slider from '../screens/slider/Slider'
import Login from '../screens/login/Login'
import IncommingCall from '../screens/incomming/IncommingCall'
import OutgoingCall from '../screens/outgoing/OutgoingCall'
import VoiceMail from '../screens/voisemail/VoiceMail'
import RecentCallHistory from '../screens/home/RecentCallHistory'
import Onboarding from '../screens/splashscreen/Onboarding'
import Bottom from './Bottom'
import UpgradeToPremium from '../screens/home/UpgradeToPremium'
import SipAccountScreen from '../screens/setting/SipAccountScreen'
import CallQualityScreen from '../screens/setting/CallQualityScreen'
import HelpAndSupportScreen from '../screens/setting/HelpAndSupportScreen'

const StacKNavigation = createNativeStackNavigator()
const Stack = () => {
    return (
        <StacKNavigation.Navigator>
            <StacKNavigation.Screen options={{
                headerShown: false
            }} name="Splash" component={Splash} />
             <StacKNavigation.Screen options={{
                headerShown: false
            }} name="Onboarding" component={Onboarding} />
            <StacKNavigation.Screen options={{
                headerShown: false
            }} name="Slider" component={Slider} />
            <StacKNavigation.Screen options={{
                headerShown: false
            }} name="Login" component={Login} />
            <StacKNavigation.Screen options={{
                headerShown: false
            }} name="IncommingCall" component={IncommingCall} />
            <StacKNavigation.Screen options={{
                headerShown: false
            }} name="OutgoingCall" component={OutgoingCall} />
            <StacKNavigation.Screen options={{
                headerShown: false
            }} name="VoiceMail" component={VoiceMail} />
             <StacKNavigation.Screen options={{
                headerShown: false
            }} name="RecentCallHistory" component={RecentCallHistory} />
            <StacKNavigation.Screen options={{
                headerShown: false
            }} name="UpgradeToPremium" component={UpgradeToPremium} />
            <StacKNavigation.Screen options={{
                headerShown: false
            }} name="BottomTabs" component={Bottom} />
            <StacKNavigation.Screen options={{
                headerShown: false
            }} name="SipAccountScreen" component={SipAccountScreen} />
            <StacKNavigation.Screen options={{
                headerShown: false
            }} name="CallQualityScreen" component={CallQualityScreen} />
            <StacKNavigation.Screen options={{
                headerShown: false
            }} name="HelpAndSupportScreen" component={HelpAndSupportScreen} />
        </StacKNavigation.Navigator>
    )
}

export default Stack