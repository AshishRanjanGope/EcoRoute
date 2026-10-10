import { Tabs } from 'expo-router';
import { Home, Calendar, Car, Leaf, User } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { Typography } from '../../components/ui/Typography';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#218653',
        tabBarInactiveTintColor: '#69766E',
        tabBarStyle: {
          backgroundColor: isDark ? '#18231D' : '#FFFFFF',
          borderTopColor: isDark ? '#2D3B34' : '#E4EAE5',
          elevation: 0,
          shadowOpacity: 0,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: 'Planner',
          tabBarIcon: ({ color }) => <Calendar color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="carpool"
        options={{
          title: 'Carpool',
          tabBarIcon: ({ color }) => <Car color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="impact"
        options={{
          title: 'Impact',
          tabBarIcon: ({ color }) => <Leaf color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
