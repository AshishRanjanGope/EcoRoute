import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Share, Leaf, TreeDeciduous, IndianRupee, Flame, Award } from 'lucide-react-native';

export default function ImpactScreen() {
  const router = useRouter();
  const weekData = [
    { day: 'Mon', val: 45, kg: '2.1' },
    { day: 'Tue', val: 75, kg: '3.6' },
    { day: 'Wed', val: 30, kg: '1.4' },
    { day: 'Thu', val: 90, kg: '4.2' },
    { day: 'Fri', val: 60, kg: '2.8' },
    { day: 'Sat', val: 20, kg: '0.9' },
    { day: 'Sun', val: 15, kg: '0.7' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAF8' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Header with Account Avatar */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable
              onPress={() => router.push('/(tabs)/profile' as any)}
              accessibilityRole="button"
              accessibilityLabel="Profile"
              style={{ marginRight: 12 }}
            >
              <Avatar size={40} />
            </Pressable>
            <View>
              <Typography variant="h2">My Impact</Typography>
              <Typography variant="caption" style={{ color: '#218653', fontWeight: '700' }}>Lifetime Savings Tracker</Typography>
            </View>
          </View>
          <Button 
            variant="ghost" 
            size="icon" 
            style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4EAE5' }}
            onPress={() => alert('Shareable Impact Card generated! (Simulation)')}
          >
            <Share size={20} color="#218653" />
          </Button>
        </View>

        {/* Streak banner */}
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 14,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: '#E4EAE5',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: '#FEF6E7',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10
            }}>
              <Flame size={20} color="#C28A24" />
            </View>
            <View>
              <Typography variant="h4">8-Day Green Streak</Typography>
              <Typography variant="caption" style={{ color: '#69766E' }}>Only sustainable commute modes</Typography>
            </View>
          </View>
          <View style={{ backgroundColor: '#E8F5EE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
            <Typography variant="caption" style={{ color: '#218653', fontWeight: '700' }}>Top 5%</Typography>
          </View>
        </View>

        {/* Metrics 3-Card Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 }}>
          <View style={{
            width: '48%',
            backgroundColor: '#FFFFFF',
            borderRadius: 18,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: '#E4EAE5',
            alignItems: 'center'
          }}>
            <View style={{ width: 44, height: 44, backgroundColor: '#E8F5EE', borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <Leaf size={22} color="#218653" />
            </View>
            <Typography variant="h2" style={{ color: '#218653' }}>124.5</Typography>
            <Typography variant="caption" style={{ color: '#69766E' }}>kg CO₂ Prevented</Typography>
          </View>
          
          <View style={{
            width: '48%',
            backgroundColor: '#FFFFFF',
            borderRadius: 18,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: '#E4EAE5',
            alignItems: 'center'
          }}>
            <View style={{ width: 44, height: 44, backgroundColor: '#E8F5EE', borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <TreeDeciduous size={22} color="#218653" />
            </View>
            <Typography variant="h2" style={{ color: '#218653' }}>5.9</Typography>
            <Typography variant="caption" style={{ color: '#69766E' }}>Trees Equivalent</Typography>
          </View>

          <View style={{
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: 18,
            padding: 16,
            borderWidth: 1,
            borderColor: '#E4EAE5',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 44, height: 44, backgroundColor: '#E8F5EE', borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <IndianRupee size={22} color="#218653" />
              </View>
              <View>
                <Typography variant="caption" style={{ color: '#69766E' }}>Money Saved vs Solo Car</Typography>
                <Typography variant="h3" style={{ color: '#18231D' }}>₹3,450</Typography>
              </View>
            </View>
            <Award size={24} color="#C28A24" />
          </View>
        </View>

        {/* Weekly Chart */}
        <Typography variant="h3" style={{ marginBottom: 12 }}>Weekly CO₂ Prevention (kg)</Typography>
        
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: '#E4EAE5',
          height: 200,
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 20
        }}>
          {weekData.map((d, i) => (
            <View key={i} style={{ alignItems: 'center', width: 34 }}>
              <Typography variant="caption" style={{ color: '#218653', fontWeight: '600', marginBottom: 4, fontSize: 10 }}>
                {d.kg}
              </Typography>
              <View 
                style={{
                  width: 22,
                  backgroundColor: '#218653',
                  borderRadius: 6,
                  height: `${d.val}%`,
                  minHeight: 10
                }} 
              />
              <Typography variant="caption" style={{ color: '#69766E', marginTop: 8 }}>{d.day}</Typography>
            </View>
          ))}
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}
