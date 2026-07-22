import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { SearchIcon } from '../../../utils/svgs/CommonSvgs';

const SearchBar = ({ onSearch }) => {
    const [searchText, setSearchText] = useState('');

    const handleChangeText = (text) => {
        setSearchText(text);
        onSearch?.(text);
    };

    const handleClear = () => {
        setSearchText('');
        onSearch?.('');
    };

    return (
        <View style={styles.container}>
            <SearchIcon width={18} height={18} />

            <TextInput
                placeholder="Search Contact or Number"
                placeholderTextColor="#A0A0A0"
                style={styles.input}
                value={searchText}
                onChangeText={handleChangeText}
            />
        </View>
    );
};

export default SearchBar;

const styles = StyleSheet.create({
    container: {
        height: 52,
        backgroundColor: '#363636',
        borderRadius: 10,
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