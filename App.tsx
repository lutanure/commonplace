import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import type { RootStackParamList } from './src/navigation/types';
import AddItemScreen from './src/screens/AddItemScreen';
import EditItemScreen from './src/screens/EditItemScreen';
import HomeScreen from './src/screens/HomeScreen';
import ItemDetailScreen from './src/screens/ItemDetailScreen';
import { ItemsProvider } from './src/state/ItemsContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <KeyboardProvider>
      <ItemsProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerTintColor: '#1A1A1A' }}>
            <Stack.Screen
              name="Library"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ItemDetail"
              component={ItemDetailScreen}
              options={{ title: 'Item' }}
            />
            <Stack.Screen
              name="AddItem"
              component={AddItemScreen}
              options={{ title: 'Add' }}
            />
            <Stack.Screen
              name="EditItem"
              component={EditItemScreen}
              options={{ title: 'Edit' }}
            />
          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
      </ItemsProvider>
    </KeyboardProvider>
  );
}
