import {
  BowlbyOne_400Regular,
  useFonts as useBowlbyOneFonts,
} from '@expo-google-fonts/bowlby-one';
import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,
  useFonts as useInstrumentSansFonts,
} from '@expo-google-fonts/instrument-sans';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import BrandMark from './src/components/BrandMark';
import type { RootStackParamList } from './src/navigation/types';
import AddItemScreen from './src/screens/AddItemScreen';
import CustomizeQuickAddScreen from './src/screens/CustomizeQuickAddScreen';
import EditItemScreen from './src/screens/EditItemScreen';
import HomeScreen from './src/screens/HomeScreen';
import ItemDetailScreen from './src/screens/ItemDetailScreen';
import ManageTypesScreen from './src/screens/ManageTypesScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { AuthProvider, useAuth } from './src/state/AuthContext';
import { BuiltInTypePreferencesProvider } from './src/state/BuiltInTypePreferencesContext';
import { ItemsProvider } from './src/state/ItemsContext';
import { QuickAddPreferencesProvider } from './src/state/QuickAddPreferencesContext';
import { colors, fontFamily, spacing, typography } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Keeps the native splash screen up while fonts load, instead of flashing
// unstyled/system-font content for a frame — hidden once fonts are ready
// (or have failed) in AppShell below.
SplashScreen.preventAutoHideAsync().catch(() => {});

function AppShell() {
  const { isLoading: isAuthLoading, error } = useAuth();
  const [bowlbyOneLoaded, bowlbyOneError] = useBowlbyOneFonts({
    BowlbyOne_400Regular,
  });
  const [instrumentSansLoaded, instrumentSansError] = useInstrumentSansFonts({
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
    InstrumentSans_700Bold,
  });
  // Proceed even on a font load error rather than hanging forever — text
  // just falls back to the platform default system font in that case.
  const fontsReady =
    (bowlbyOneLoaded || Boolean(bowlbyOneError)) &&
    (instrumentSansLoaded || Boolean(instrumentSansError));

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsReady]);

  if (!fontsReady || isAuthLoading) {
    return (
      <View style={styles.centered}>
        <BrandMark size={48} />
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
      <BuiltInTypePreferencesProvider>
        <QuickAddPreferencesProvider>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerTintColor: colors.textPrimary,
                headerStyle: { backgroundColor: colors.background },
                headerShadowVisible: false,
                contentStyle: { backgroundColor: colors.background },
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
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="AddItem"
                component={AddItemScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="EditItem"
                component={EditItemScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ManageTypes"
                component={ManageTypesScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="CustomizeQuickAdd"
                component={CustomizeQuickAddScreen}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
            <StatusBar style="dark" />
          </NavigationContainer>
        </QuickAddPreferencesProvider>
      </BuiltInTypePreferencesProvider>
    </ItemsProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <KeyboardProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.body,
    fontFamily: fontFamily.bodyBold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorDetail: {
    ...typography.bodyMuted,
    textAlign: 'center',
  },
});
