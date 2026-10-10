import { View, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { mockRoutes } from '../../data/mock-routes';
import { evaluateRoutes } from '../../utils/efficiency';
import { ArrowLeft, Clock, MapPin, IndianRupee, Leaf } from 'lucide-react-native';
import { getModeIcon } from '../../components/home/RouteCard';
import { useColorScheme } from 'react-native';

export default function RouteDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const color = isDark ? '#FFFFFF' : '#18231D';
  
  const routes = evaluateRoutes(mockRoutes);
  const route = routes.find(r => r.id === id);

  if (!route) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAF8', justifyContent: 'center', alignItems: 'center' }}>
        <Typography>Route not found</Typography>
        <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAF8' }} edges={['top']}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E4EAE5'
      }}>
        <Button variant="ghost" size="icon" onPress={() => router.back()} style={{ marginRight: 8 }}>
          <ArrowLeft size={22} color={color} />
        </Button>
        <Typography variant="h3">Route Details</Typography>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Summary Card */}
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          padding: 24,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: '#E4EAE5',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2
        }}>
          <View style={{
            width: 64,
            height: 64,
            backgroundColor: '#E8F5EE',
            borderRadius: 32,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12
          }}>
            {getModeIcon(route.mode, '#218653')}
          </View>
          <Typography variant="h2" style={{ marginBottom: 4, textAlign: 'center' }}>{route.name}</Typography>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#E8F5EE',
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
            marginTop: 6
          }}>
            <Typography variant="label" style={{ color: '#218653', fontWeight: '700' }}>
              Efficiency: {route.efficiencyScore}/100
            </Typography>
          </View>
        </View>

        {/* Metrics Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 }}>
          <View style={{
            width: '48%',
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 14,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: '#E4EAE5'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Clock size={16} color="#69766E" />
              <Typography variant="caption" style={{ color: '#69766E', marginLeft: 6 }}>Time</Typography>
            </View>
            <Typography variant="h3">{route.durationMins} mins</Typography>
          </View>
          
          <View style={{
            width: '48%',
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 14,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: '#E4EAE5'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <MapPin size={16} color="#69766E" />
              <Typography variant="caption" style={{ color: '#69766E', marginLeft: 6 }}>Distance</Typography>
            </View>
            <Typography variant="h3">{route.distanceKm} km</Typography>
          </View>

          <View style={{
            width: '48%',
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: '#E4EAE5'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <IndianRupee size={16} color="#69766E" />
              <Typography variant="caption" style={{ color: '#69766E', marginLeft: 6 }}>Est. Cost</Typography>
            </View>
            <Typography variant="h3">₹{route.costINR}</Typography>
          </View>

          <View style={{
            width: '48%',
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: '#E4EAE5'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Leaf size={16} color="#218653" />
              <Typography variant="caption" style={{ color: '#69766E', marginLeft: 6 }}>CO₂ Prevented</Typography>
            </View>
            <Typography variant="h3" style={{ color: '#218653' }}>{route.co2Prevented.toFixed(1)} kg</Typography>
          </View>
        </View>

        {/* Segments if combined */}
        {route.isCombined && route.segments && (
          <View style={{ marginBottom: 24 }}>
            <Typography variant="h3" style={{ marginBottom: 12 }}>Journey Segments</Typography>
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#E4EAE5'
            }}>
              {route.segments.map((seg, i) => (
                <View key={i} style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: i === route.segments!.length - 1 ? 0 : 14,
                  paddingBottom: i === route.segments!.length - 1 ? 0 : 14,
                  borderBottomWidth: i === route.segments!.length - 1 ? 0 : 1,
                  borderBottomColor: '#F0F4F1'
                }}>
                  <View style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: '#F0F4F1',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12
                  }}>
                    {getModeIcon(seg.mode, '#69766E')}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Typography variant="body" style={{ fontWeight: '600', textTransform: 'capitalize' }}>{seg.mode.replace('-', ' ')}</Typography>
                    <Typography variant="caption" style={{ color: '#69766E', marginTop: 2 }}>
                      {seg.durationMins} mins • {seg.distanceKm} km
                    </Typography>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <Button 
          title="Choose this route (Simulated)" 
          onPress={() => {
            alert('Route chosen! Journey logged.');
            router.back();
          }} 
          style={{ marginBottom: 20 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
