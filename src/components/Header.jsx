// components/Header.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Header = ({
    title,
    leftComponent,
    rightComponent,
    titleAlign = 'left',
    containerStyle,
    titleStyle,
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            <View style={styles.side}>
                {leftComponent}
            </View>

            <View
                style={[
                    styles.titleContainer,
                    titleAlign === 'center' && styles.centerTitle,
                ]}
            >
                <Text style={[styles.title, titleStyle]}>
                    {title}
                </Text>
            </View>

            <View style={[styles.side, styles.rightSide]}>
                {rightComponent}
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        paddingHorizontal: 16,
        // backgroundColor: '#fff',
        // borderBottomWidth: 1,
        // borderBottomColor: '#f0f0f0',
    },
    side: {
        width: 60,
        justifyContent: 'center',
    },
    rightSide: {
        alignItems: 'flex-end',
    },
    titleContainer: {
        flex: 1,
    },
    centerTitle: {
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
    },
});

export default Header;
