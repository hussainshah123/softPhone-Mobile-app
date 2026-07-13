import { NavigationContainer } from '@react-navigation/native';
import { createNavigationContainerRef } from '@react-navigation/native';
import React, { useEffect } from 'react';
import Stack from './src/navigations/Stack';
import { StatusBar } from 'react-native';
import { onIncomingCall } from './src/services/sipService';

export const navigationRef = createNavigationContainerRef();

const App = () => {
  useEffect(() => {
    const unsubscribe = onIncomingCall((event) => {
      if (!navigationRef.isReady()) {
        return;
      }

      navigationRef.navigate('IncommingCall', {
        phoneNumber: event?.remoteNumber,
        callerName: event?.displayName || event?.remoteNumber,
        destination: event?.remoteNumber,
      });
    });

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar barStyle="dark-content" backgroundColor="#7ED957" />
      <Stack />
    </NavigationContainer>
  );
}

export default App;
