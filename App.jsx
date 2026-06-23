import { NavigationContainer } from '@react-navigation/native';
import Stack from './src/navigations/Stack';
import { StatusBar } from 'react-native';

const App = () => {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Stack />
    </NavigationContainer>
  );
}

export default App;