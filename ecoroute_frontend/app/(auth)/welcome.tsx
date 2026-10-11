import { Image, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Typography } from '../../components/ui/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheck, Zap, TrendingDown } from 'lucide-react-native';

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
        <Typography variant="h1" style={{ textAlign: 'center', marginBottom: 6 }}>EcoRoute</Typography>

        <Typography variant="body" style={{ textAlign: 'center', color: '#69766E', marginBottom: 28, paddingHorizontal: 20 }}>
          Smarter, greener, and cheaper commute for Pune.
        </Typography>

        {/* Feature Pills */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, maxWidth: 300 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#E4EAE5' }}>
            <Zap size={14} color="#218653" style={{ marginRight: 6 }} />
            <Typography variant="caption" style={{ color: '#18231D', fontWeight: '600' }}>Multimodal Routing</Typography>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#E4EAE5' }}>
            <TrendingDown size={14} color="#218653" style={{ marginRight: 6 }} />
            <Typography variant="caption" style={{ color: '#18231D', fontWeight: '600' }}>Save CO₂ & Money</Typography>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#E4EAE5' }}>
            <ShieldCheck size={14} color="#218653" style={{ marginRight: 6 }} />
            <Typography variant="caption" style={{ color: '#18231D', fontWeight: '600' }}>Verified Carpools</Typography>
          </View>
        </View>
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
          onPress={() => router.replace('/(tabs)/home' as any)} 
        />
      </View>
    </SafeAreaView>
  );
}
