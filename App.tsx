import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import type { RootStackParamList } from './src/navigation/types';
import AddItemScreen from './src/screens/AddItemScreen';
import EditItemScreen from './src/screens/EditItemScreen';
import HomeScreen from './src/screens/HomeScreen';
import ItemDetailScreen from './src/screens/ItemDetailScreen';
import { AuthProvider, useAuth } from './src/state/AuthContext';
import { ItemsProvider } from './src/state/ItemsContext';
import { colors, spacing, typography } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppShell() {
  const { isLoading, error } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Couldn't start your session.</Text>
        <Text style={styles.errorDetail}>{error}</Text>
      </View>
    );
  }

  return (
    <ItemsProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerTintColor: colors.ink,
            headerStyle: { backgroundColor: colors.paper },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.paper },
          }}
        >
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
            options={{ title: 'Add Item' }}
          />
          <Stack.Screen
            name="EditItem"
            component={EditItemScreen}
            options={{ title: 'Edit Item' }}
          />
        </Stack.Navigator>
        <StatusBar style="dark" />
      </NavigationContainer>
    </ItemsProvider>
  );
}

export default function App() {
  return (
    <KeyboardProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </KeyboardProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.body,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorDetail: {
    ...typography.bodyMuted,
    textAlign: 'center',
  },
});
