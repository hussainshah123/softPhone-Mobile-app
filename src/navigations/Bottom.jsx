import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Home from '../screens/home/Home'
import DialPad from '../screens/dialpad/DialPad'
import RecentCallHistory from '../screens/home/RecentCallHistory'
import Contact from '../screens/contact/Contact'
import Setting from '../screens/setting/Setting'
import { HomeIcon, DialPadIcon, RecentIcon, ContactIcon, SettingIcon, DialIcon, RecentWatchIcon, HomeMainIcon, PhoneAcceptIcon, ProfileIcon } from '../utils/svgs/CommonSvgs'
import { StyleSheet, TouchableOpacity } from 'react-native'

const Tab = createBottomTabNavigator()

const Bottom = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: '#006E1C',
                tabBarInactiveTintColor: '#7A7A7A',
                tabBarStyle: {
                    height: 70,
                    backgroundColor:'#1F1F1F',
                    paddingBottom: 8,
                    paddingTop: 8,
                    borderTopWidth: 0,
                    elevation: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                },
            }}>
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarLabelStyle: {
                        color: '#8A8A8A',
                    },
                    tabBarIcon: ({ focused, size }) => (
                        <HomeMainIcon
                            width={size}
                            height={size}
                            fill={focused ? '#006E1C' : '#8A8A8A'}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Contact"
                component={Contact}
                options={{
                    tabBarLabelStyle: {
                        color: '#8A8A8A',
                    },
                    tabBarIcon: ({ focused, size }) => (
                        <ContactIcon
                            width={size}
                            height={size}
                            fill={focused ? '#006E1C' : '#8A8A8A'}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Dial"
                component={DialPad}
                options={{
                    tabBarLabel: 'Dial',
                    tabBarButton: props => (
                        <TouchableOpacity
                            {...props}
                            style={styles.floatingButton}>
                            <PhoneAcceptIcon width={28} height={28} fill="#fff" />
                        </TouchableOpacity>
                    ),
                }}
            />
            <Tab.Screen
                name="Recent"
                component={RecentCallHistory}
                options={{
                    tabBarLabelStyle: {
                        color: '#8A8A8A',
                    },
                    tabBarLabel: 'History',
                    tabBarIcon: ({ focused, size }) => (
                        <RecentWatchIcon
                            width={size}
                            height={size}
                            fill={focused ? '#006E1C' : '#8A8A8A'}
                        />
                    ),
                }}
            />



            <Tab.Screen
                name="Profile"
                component={Setting}
                options={{
                    tabBarLabelStyle: {
                        color: '#8A8A8A',
                    },
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ focused, size }) => (
                        <ProfileIcon
                            width={size}
                            height={size}
                            fill={focused ? '#006E1C' : '#8A8A8A'}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    )
}

export default Bottom
const styles = StyleSheet.create({
    floatingButton: {
        top: -30,
        justifyContent: 'center',
        alignItems: 'center',
        width: 64,
        height: 64,
        left:5,
        borderRadius: 32,
        backgroundColor: '#006E1C',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
});