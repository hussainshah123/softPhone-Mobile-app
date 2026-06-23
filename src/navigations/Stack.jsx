import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import Splash from '../screens/splashscreen/Splash'
import Slider from '../screens/slider/Slider'
import Login from '../screens/login/Login'
import IncommingCall from '../screens/incomming/IncommingCall'
import VoiceMail from '../screens/voisemail/VoiceMail'
import RecentCallHistory from '../screens/home/RecentCallHistory'
import Bottom from './Bottom'

const StacKNavigation = createNativeStackNavigator()
const Stack = () => {
    return (
        <StacKNavigation.Navigator>
            <StacKNavigation.Screen options={{
                headerShown: false
            }} name="Splash" component={Splash} />
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
            }} name="VoiceMail" component={VoiceMail} />
             <StacKNavigation.Screen options={{
                headerShown: false
            }} name="RecentCallHistory" component={RecentCallHistory} />
            <StacKNavigation.Screen options={{
                headerShown: false
            }} name="BottomTabs" component={Bottom} />
        </StacKNavigation.Navigator>
    )
}

export default Stack