import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Home from '../screens/home/Home'
import DialPad from '../screens/dialpad/DialPad'
import RecentCall from '../screens/recent/RecentCall'
import Contact from '../screens/contact/Contact'
import Setting from '../screens/setting/Setting'
import { HomeIcon, DialPadIcon, RecentIcon, ContactIcon, SettingIcon, DialIcon, RecentWatchIcon, HomeMainIcon } from '../utils/svgs/CommonSvgs'

const Tab = createBottomTabNavigator()

const Bottom = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#B61723',
                tabBarInactiveTintColor: '#999',
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <HomeMainIcon width={size} height={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="DialPad"
                component={DialPad}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <DialIcon width={size} height={size} fill={'#575F66'} />
                    ),
                }}
            />
            <Tab.Screen
                name="RecentCall"
                component={RecentCall}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <RecentWatchIcon width={size} height={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Contact"
                component={Contact}
                options={{
                    tabBarIcon: ({ color, size ,fill}) => (
                        <ContactIcon width={size} height={size} fill={fill || '#575F66'} />
                    ),
                }}
            />
            <Tab.Screen
                name="Setting"
                component={Setting}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <SettingIcon width={size} height={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    )
}

export default Bottom