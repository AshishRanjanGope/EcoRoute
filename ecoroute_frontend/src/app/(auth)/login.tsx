import { Image, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Typography } from '../../components/ui/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('demo@ecoroute.app');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)/home' as any);
    }, 800);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAF8' }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'space-between' }}>
          <View>
            <Button 
              variant="ghost" 
              size="icon" 
              style={{ marginBottom: 20, marginLeft: -8 }}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#18231D" />
            </Button>
            
            <Image
              source={require('../../../assets/images/logo.png')}
              style={{ width: 56, height: 56, marginBottom: 16 }}
              resizeMode="contain"
            />

            <Typography variant="h1" style={{ marginBottom: 6 }}>Welcome Back</Typography>
            <Typography variant="body" style={{ color: '#69766E', marginBottom: 28 }}>
              Log in to continue your green journey in Pune.
            </Typography>

            <View style={{ marginBottom: 24 }}>
              <Input 
                label="Email" 
                placeholder="Enter your email" 
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input 
                label="Password" 
                placeholder="Enter your password" 
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <View style={{ gap: 12, paddingBottom: 16 }}>
            <Button 
              title="Log In" 
              onPress={handleLogin} 
              loading={loading}
            />
            
            <Button 
              title="Continue with Google (Simulated Demo)" 
              variant="outline"
              onPress={handleLogin} 
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
