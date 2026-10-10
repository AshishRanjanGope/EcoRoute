import { useState, useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { RouteCard } from '../../components/home/RouteCard';
import { mockRoutes } from '../../data/mock-routes';
import { evaluateRoutes } from '../../utils/efficiency';
import { ArrowUpDown, MapPin, Search } from 'lucide-react-native';
import { useColorScheme } from 'react-native';

export default function HomeScreen() {
  const isDark = useColorScheme() === 'dark';
  const color = isDark ? '#FFFFFF' : '#18231D';
  
  const [origin, setOrigin] = useState('Home (Shivajinagar)');
  const [destination, setDestination] = useState('Office (Kalyani Nagar)');
  const [sortBy, setSortBy] = useState<'efficiency' | 'cost' | 'time'>('efficiency');
  
  // Evaluate and rank routes
  const rankedRoutes = useMemo(() => {
    const evaluated = evaluateRoutes(mockRoutes);
    if (sortBy === 'cost') {
      return [...evaluated].sort((a, b) => a.costINR - b.costINR);
    } else if (sortBy === 'time') {
      return [...evaluated].sort((a, b) => a.durationMins - b.durationMins);
    }
    return [...evaluated].sort((a, b) => b.efficiencyScore - a.efficiencyScore);
  }, [sortBy]);
  
  const bestRoute = useMemo(() => evaluateRoutes(mockRoutes)[0], []);

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAF8' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={{ marginBottom: 20 }}>
          <Typography variant="label" style={{ color: '#218653', fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 }}>
            PUNE COMMUTE
          </Typography>
          <Typography variant="h1">Good morning, Anish</Typography>
        </View>
        
        {/* Search Card */}
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          padding: 18,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: '#E4EAE5',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 2,
          position: 'relative'
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <View style={{ width: 32, alignItems: 'center' }}>
              <MapPin size={20} color="#218653" />
            </View>
            <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: '#F0F4F1', paddingBottom: 8, marginLeft: 8 }}>
              <Typography variant="caption" style={{ color: '#69766E' }}>From</Typography>
              <Typography variant="body" style={{ fontWeight: '600', color: '#18231D' }}>{origin}</Typography>
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 32, alignItems: 'center' }}>
              <MapPin size={20} color="#C94C4C" />
            </View>
            <View style={{ flex: 1, marginLeft: 8, paddingTop: 4 }}>
              <Typography variant="caption" style={{ color: '#69766E' }}>To</Typography>
              <Typography variant="body" style={{ fontWeight: '600', color: '#18231D' }}>{destination}</Typography>
            </View>
          </View>
          
          <Button 
            variant="ghost" 
            size="icon" 
            style={{
              position: 'absolute',
              right: 18,
              top: '32%',
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#E4EAE5',
              borderRadius: 20,
              width: 36,
              height: 36,
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2
            }}
            onPress={handleSwap}
          >
            <ArrowUpDown size={16} color={color} />
          </Button>
          
          <Button 
            style={{ marginTop: 20 }} 
            title="Find Best Route" 
            icon={<Search size={18} color="#FFF" style={{ marginRight: 8 }} />} 
          />
        </View>

        {/* Best Option Banner */}
        {bestRoute && (
          <View style={{
            backgroundColor: '#E8F5EE',
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: '#C3E6D2'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Typography variant="caption" style={{ color: '#218653', fontWeight: '800', letterSpacing: 0.5 }}>
                RECOMMENDED ROUTE
              </Typography>
            </View>
            <Typography variant="body" style={{ color: '#18231D' }}>
              <Typography variant="body" style={{ color: '#218653', fontWeight: '700' }}>{bestRoute.name}</Typography> saves{' '}
              <Typography variant="body" style={{ fontWeight: '700' }}>{bestRoute.co2Prevented.toFixed(1)} kg CO₂</Typography>{' '}
              (≈ {bestRoute.treesEquivalent.toFixed(2)} trees/yr) and ₹65 versus driving alone.
            </Typography>
          </View>
        )}

        <View style={{ marginBottom: 12 }}>
          <Typography variant="h3">Compare Routes</Typography>
        </View>
        
        {/* Sort Controls */}
        <View style={{ flexDirection: 'row', marginBottom: 16, gap: 8 }}>
          <Button 
            variant={sortBy === 'efficiency' ? 'default' : 'outline'} 
            size="sm" 
            title="Most Efficient" 
            style={{ flex: 1 }}
            onPress={() => setSortBy('efficiency')}
          />
          <Button 
            variant={sortBy === 'cost' ? 'default' : 'outline'} 
            size="sm" 
            title="Cheapest" 
            style={{ flex: 1 }}
            onPress={() => setSortBy('cost')}
          />
          <Button 
            variant={sortBy === 'time' ? 'default' : 'outline'} 
            size="sm" 
            title="Fastest" 
            style={{ flex: 1 }}
            onPress={() => setSortBy('time')}
          />
        </View>

        {rankedRoutes.map((route, index) => (
          <RouteCard key={route.id} route={route} isBest={index === 0 && sortBy === 'efficiency'} />
        ))}
        
      </ScrollView>
    </SafeAreaView>
  );
}
