import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Search, Plus, ShieldCheck, Car, Coins } from 'lucide-react-native';

export default function CarpoolScreen() {
  const router = useRouter();
  const rides = [
    {
      id: '1',
      driver: 'Rohit Sharma',
      rating: '4.9 ★',
      vehicle: 'Honda City (CNG)',
      route: 'Aundh → Hinjewadi Phase 2',
      time: 'Today, 08:45 AM',
      seats: 2,
      points: 15,
      co2: '4.2 kg'
    },
    {
      id: '2',
      driver: 'Pooja Kulkarni',
      rating: '4.8 ★',
      vehicle: 'Tata Nexon EV',
      route: 'Kothrud → Magarpatta City',
      time: 'Today, 09:15 AM',
      seats: 3,
      points: 20,
      co2: '5.8 kg'
    },
    {
      id: '3',
      driver: 'Aditya Patil',
      rating: '5.0 ★',
      vehicle: 'Maruti Baleno',
      route: 'Baner → Viman Nagar',
      time: 'Today, 09:30 AM',
      seats: 1,
      points: 18,
      co2: '4.9 kg'
    }
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
            <Typography variant="h2">
              <Typography variant="h2" style={{ color: '#279A57', fontWeight: '800' }}>Eco</Typography>
              <Typography variant="h2" style={{ color: '#0D4822', fontWeight: '800' }}>Pool</Typography>
            </Typography>
          </View>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FEF6E7',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#F9E1B7'
          }}>
            <Coins size={16} color="#C28A24" style={{ marginRight: 6 }} />
            <Typography variant="caption" style={{ color: '#C28A24', fontWeight: '700' }}>100 Karma Pts</Typography>
          </View>
        </View>

        <Typography variant="body" style={{ color: '#69766E', marginBottom: 20 }}>
          Carpool with verified colleagues in Pune. Save fuel, cut carbon, and earn or spend Karma.
        </Typography>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <Button 
            style={{ flex: 1 }} 
            title="Find a Ride" 
            icon={<Search size={16} color="#FFF" style={{ marginRight: 6 }} />} 
          />
          <Button 
            style={{ flex: 1 }} 
            variant="outline" 
            title="Offer a Ride" 
            icon={<Plus size={16} color="#18231D" style={{ marginRight: 6 }} />} 
            onPress={() => alert('Offer a Ride: Post departure time and empty seats.')}
          />
        </View>

        <Typography variant="h3" style={{ marginBottom: 14 }}>Available Pune Matches</Typography>
        
        {rides.map(ride => (
          <View key={ride.id} style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 18,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#E4EAE5',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 6,
            elevation: 1
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: '#E8F5EE',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12
                }}>
                  <Car size={22} color="#218653" />
                </View>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Typography variant="h4" style={{ marginRight: 6 }}>{ride.driver}</Typography>
                    <ShieldCheck size={16} color="#218653" />
                  </View>
                  <Typography variant="caption" style={{ color: '#69766E' }}>
                    {ride.rating} • {ride.vehicle}
                  </Typography>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Typography variant="h3" style={{ color: '#218653' }}>{ride.points} Karma</Typography>
                <Typography variant="caption" style={{ color: '#69766E' }}>per seat</Typography>
              </View>
            </View>
            
            <View style={{
              backgroundColor: '#F8FAF8',
              borderRadius: 12,
              padding: 12,
              marginBottom: 14,
              borderWidth: 1,
              borderColor: '#E4EAE5'
            }}>
              <Typography variant="caption" style={{ color: '#69766E', marginBottom: 2 }}>Route</Typography>
              <Typography variant="body" style={{ fontWeight: '600', marginBottom: 6 }}>{ride.route}</Typography>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Typography variant="caption" style={{ color: '#69766E' }}>{ride.time}</Typography>
                <Typography variant="caption" style={{ color: '#218653', fontWeight: '700' }}>{ride.seats} seats left • -{ride.co2} CO₂</Typography>
              </View>
            </View>
            
            <Button 
              title="Request Seat (Hold Points)" 
              size="sm"
              onPress={() => alert(`Seat requested with ${ride.driver}! ${ride.points} Karma held in escrow.`)}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
