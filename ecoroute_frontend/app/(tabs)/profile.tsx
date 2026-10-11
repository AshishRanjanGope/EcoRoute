import { View, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Settings, LogOut, Wallet, Moon, Globe, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const systemColorScheme = useColorScheme();
  const [isDarkTheme, setIsDarkTheme] = useState(systemColorScheme === 'dark');
  const [userName, setUserName] = useState('Anish Raj');
  const [userRole, setUserRole] = useState('Pune Commuter • Joined 2026');

  useEffect(() => {
    AsyncStorage.getItem('theme').then((t) => {
      if (t === 'dark') setIsDarkTheme(true);
      else if (t === 'light') setIsDarkTheme(false);
    });
    AsyncStorage.getItem('user_session').then((raw) => {
      if (raw) {
        try {
          const session = JSON.parse(raw);
          if (session.isGuest) {
            setUserName('Guest User');
            setUserRole('Guest Account • EcoRoute Pune');
          } else if (session.name) {
            setUserName(session.name);
          }
        } catch {}
      }
    });
  }, []);

  const toggleTheme = async (value: boolean) => {
    setIsDarkTheme(value);
    const themeStr = value ? 'dark' : 'light';
    await AsyncStorage.setItem('theme', themeStr);
    Alert.alert('Theme Saved', 'Preference saved to storage.');
  };

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('user_session');
    router.replace('/(auth)/welcome' as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAF8' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Typography variant="h2" style={{ marginBottom: 20 }}>Profile & Settings</Typography>

        {/* User Card */}
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          padding: 18,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: '#E4EAE5',
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
          elevation: 1
        }}>
          <Avatar size={56} style={{ marginRight: 14 }} />
          <View style={{ flex: 1 }}>
            <Typography variant="h3">{userName}</Typography>
            <Typography variant="caption" style={{ color: '#69766E', marginTop: 2 }}>{userRole}</Typography>
          </View>
        </View>

        <Typography variant="h4" style={{ marginBottom: 10 }}>Account & Wallet</Typography>
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 18,
          borderWidth: 1,
          borderColor: '#E4EAE5',
          marginBottom: 24,
          overflow: 'hidden'
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#F0F4F1'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Wallet size={20} color="#218653" style={{ marginRight: 12 }} />
              <Typography variant="body" style={{ fontWeight: '500' }}>Karma Points Balance</Typography>
            </View>
            <View style={{ backgroundColor: '#FEF6E7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
              <Typography variant="caption" style={{ color: '#C28A24', fontWeight: '700' }}>100 pts (₹49 starter)</Typography>
            </View>
          </View>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Settings size={20} color="#69766E" style={{ marginRight: 12 }} />
              <Typography variant="body" style={{ fontWeight: '500' }}>Travel Preferences (Max walk, Transit)</Typography>
            </View>
            <ChevronRight size={18} color="#69766E" />
          </View>
        </View>

        <Typography variant="h4" style={{ marginBottom: 10 }}>App Preferences</Typography>
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 18,
          borderWidth: 1,
          borderColor: '#E4EAE5',
          marginBottom: 24,
          overflow: 'hidden'
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#F0F4F1'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Moon size={20} color="#69766E" style={{ marginRight: 12 }} />
              <Typography variant="body" style={{ fontWeight: '500' }}>Dark Theme</Typography>
            </View>
            <Switch 
              value={isDarkTheme}
              onValueChange={toggleTheme}
              trackColor={{ false: '#E4EAE5', true: '#218653' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#F0F4F1'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Globe size={20} color="#69766E" style={{ marginRight: 12 }} />
              <Typography variant="body" style={{ fontWeight: '500' }}>Language</Typography>
            </View>
            <Typography variant="caption" style={{ color: '#69766E', fontWeight: '600' }}>English (Hindi Prototype)</Typography>
          </View>
          <View style={{ padding: 16 }}>
            <Button 
              variant="ghost" 
              style={{ justifyContent: 'flex-start', paddingHorizontal: 0, minHeight: 32 }}
              onPress={handleSignOut}
            >
              <LogOut size={18} color="#C94C4C" style={{ marginRight: 10 }} />
              <Typography variant="body" style={{ color: '#C94C4C', fontWeight: '600' }}>Sign Out (Return to Demo Welcome)</Typography>
            </Button>
          </View>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}
