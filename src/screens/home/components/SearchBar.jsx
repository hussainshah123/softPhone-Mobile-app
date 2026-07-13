import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { SearchIcon } from '../../../utils/svgs/CommonSvgs';

const SearchBar = () => {
    return (
        <View style={styles.container}>
            <SearchIcon width={18} height={18} />

            <TextInput
                placeholder="Search Contact or Number"
                placeholderTextColor="#A0A0A0"
                style={styles.input}
            />
        </View>
    );
};

export default SearchBar;

const styles = StyleSheet.create({
    container: {
        height: 52,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginBottom: 20,

        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 3,
        },

        elevation: 3,
    },

    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: '#222',
    },
});