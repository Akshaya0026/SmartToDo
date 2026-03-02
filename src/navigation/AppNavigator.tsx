import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { AddTaskScreen } from '../screens/AddTaskScreen';
import { TaskDetailScreen } from '../screens/TaskDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useAuth } from '../context/AuthContext';
import { TaskProvider } from '../context/TaskContext';
import { View, ActivityIndicator } from 'react-native';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  AddTask: undefined;
  Settings: undefined;
  TaskDetail: { taskId: string };
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AuthStack() {
  return (
    <TaskProvider userId={null}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    </TaskProvider>
  );
}

export function MainStack({ userId }: { userId: string }) {
  return (
    <TaskProvider userId={userId}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddTask" component={AddTaskScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </TaskProvider>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  console.log('[AppNavigator] State:', { user: user?.uid, loading });

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainStack userId={user.uid} /> : <AuthStack />}
    </NavigationContainer>
  );
}
