import { Image, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '../../components/ui/Button';
import { Typography } from '../../components/ui/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAF8', paddingHorizontal: 24, justifyContent: 'space-between' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={{ width: 110, height: 110, marginBottom: 14 }}
          resizeMode="contain"
        />
        <Typography variant="h1" style={{ textAlign: 'center', marginBottom: 6 }}>
          <Typography variant="h1" style={{ color: '#279A57', fontWeight: '800' }}>Eco</Typography>
          <Typography variant="h1" style={{ color: '#0D4822', fontWeight: '800' }}>Route</Typography>
        </Typography>

        <Typography variant="body" style={{ textAlign: 'center', color: '#69766E', marginBottom: 28, paddingHorizontal: 20 }}>
          Smarter, greener, and cheaper commute for Pune.
        </Typography>
      </View>
      
      <View style={{ paddingBottom: 32, gap: 12 }}>
        <Button 
          title="Log In" 
          onPress={() => router.push('/(auth)/login' as any)} 
        />
        <Button 
          title="Sign Up" 
          variant="outline"
          onPress={() => router.push('/(auth)/signup' as any)} 
        />
        <Button 
          title="Explore as Guest" 
          variant="ghost" 
          onPress={async () => {
            await AsyncStorage.setItem('user_session', JSON.stringify({ isGuest: true, name: 'Guest User' }));
            router.replace('/(tabs)/home' as any);
          }} 
        />
      </View>
    </SafeAreaView>
  );
}
