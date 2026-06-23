import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { HeadphoneIcon } from '../../utils/svgs/CommonSvgs'

const Splash = ({ navigation }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace('Slider')
        }, 3000)
        return () => clearTimeout(timer)
    }, [navigation])

    return (
        <View style={styles.container}>
            <HeadphoneIcon height={150} width={150} />
            <Text style={styles.heading}>Softphone</Text>
            <Text style={styles.subheading}>Crystal Clear Calls, Anywhere</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heading: {
        fontSize: 30,
        fontWeight: 'bold',
    },
    subheading: {
        fontSize: 16,
        fontWeight: 'normal',
        color: '#575F66'
    },
})

export default Splash