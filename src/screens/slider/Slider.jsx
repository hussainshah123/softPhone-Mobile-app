import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native'
import React, { useState, useRef } from 'react'

const Slider = ({ navigation }) => {
    const [currentSlide, setCurrentSlide] = useState(0)
    const scrollViewRef = useRef(null)
    const { width } = Dimensions.get('window')

    const slides = [
        {
            image: require('../../assets/images/background.png'),
            title: 'Make Calls Over Internet',
            description: 'Connect instantly with clear audio quality anywhere in the world using your data or Wi-Fi.'
        },
        {
            image: require('../../assets/images/system.png'),
            title: 'Crystal Clear HD Audio',
            description: 'Experience high-definition voice calls with advanced noise cancellation technology.'
        },
        {
            image: require('../../assets/images/system.png'),
            title: 'High Quality Video Calls',
            description: 'Experience crystal clear video calls with your friends and family with minimal data usage.'
        },
    ]

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            const nextSlide = currentSlide + 1
            setCurrentSlide(nextSlide)
            scrollViewRef.current?.scrollTo({ x: nextSlide * width, animated: true })
        }
    }

    const handleLogin = () => {
        navigation.navigate('Login')
    }

    const handleSkip = () => {
        navigation.navigate('Login')
    }

    return (
        <View style={style.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEnabled={false}
                style={style.scrollView}
            >
                {slides.map((slide, index) => (
                    <View key={index} style={style.slide}>
                        <Image source={slide.image} style={style.image} resizeMode='contain' />
                        <Text style={style.text}>{slide.title}</Text>
                        <Text style={style.textsm}>{slide.description}</Text>
                    </View>
                ))}
            </ScrollView>

            <View style={style.bottomContainer}>
                <View style={style.dotsContainer}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                style.dot,
                                currentSlide === index && style.activeDot
                            ]}
                        />
                    ))}
                </View>

                <View style={style.buttonContainer}>
                    {currentSlide < slides.length - 1 ? (
                        <>
                            {/* <TouchableOpacity onPress={handleSkip} style={style.skipButton}>
                                <Text style={style.skipText}>Skip</Text>
                            </TouchableOpacity> */}
                            <TouchableOpacity onPress={handleNext} style={style.nextButton}>
                                <Text style={style.nextText}>Next</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity onPress={handleLogin} style={style.loginButton}>
                            <Text style={style.loginText}>Get Started</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        width: 390,
    },
    image: {
        width: 270,
        height: 270,
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
    },
    textsm: {
        textAlign: 'justify',
        marginHorizontal: 30,
        fontSize: 16,
        textAlign: 'center',
        color: '#5B403E',
        marginVertical: 10,
    },
    bottomContainer: {
        paddingHorizontal: 30,
        paddingBottom: 50,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D3D3D3',
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#B61723',
        width: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    skipButton: {
        flex: 1,
    },
    skipText: {
        fontSize: 16,
        color: '#5B403E',
    },
    nextButton: {
        backgroundColor: '#B61723',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
        flex: 1,
        alignItems: 'center',
        // marginLeft: 20,
    },
    nextText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginButton: {
        backgroundColor: '#B61723',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        width: '100%',
    },
    loginText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default Slider;