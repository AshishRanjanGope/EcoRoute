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
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Typography>Route not found</Typography>
        <Button title="Go Back" onPress={() => router.back()} className="mt-4" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center p-4 border-b border-border">
        <Button variant="ghost" size="icon" onPress={() => router.back()} className="-ml-2 mr-2">
          <ArrowLeft size={24} color={color} />
        </Button>
        <Typography variant="h3">Route Details</Typography>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Summary Card */}
        <View className="bg-card rounded-2xl p-6 mb-6 border border-border shadow-sm items-center">
          <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-4">
            {getModeIcon(route.mode, '#218653')}
          </View>
          <Typography variant="h2" className="mb-1">{route.name}</Typography>
          <View className="flex-row items-center bg-[#218653]/10 px-3 py-1 rounded-full mt-2">
            <Typography variant="label" className="text-primary">Efficiency: {route.efficiencyScore}/100</Typography>
          </View>
        </View>

        {/* Metrics Grid */}
        <View className="flex-row flex-wrap justify-between mb-6">
          <View className="w-[48%] bg-card rounded-2xl p-4 mb-4 border border-border">
            <View className="flex-row items-center mb-2">
              <Clock size={16} color="#69766E" />
              <Typography variant="caption" className="text-secondary-foreground ml-2">Time</Typography>
            </View>
            <Typography variant="h4">{route.durationMins} mins</Typography>
          </View>
          
          <View className="w-[48%] bg-card rounded-2xl p-4 mb-4 border border-border">
            <View className="flex-row items-center mb-2">
              <MapPin size={16} color="#69766E" />
              <Typography variant="caption" className="text-secondary-foreground ml-2">Distance</Typography>
            </View>
            <Typography variant="h4">{route.distanceKm} km</Typography>
          </View>

          <View className="w-[48%] bg-card rounded-2xl p-4 mb-4 border border-border">
            <View className="flex-row items-center mb-2">
              <IndianRupee size={16} color="#69766E" />
              <Typography variant="caption" className="text-secondary-foreground ml-2">Est. Cost</Typography>
            </View>
            <Typography variant="h4">₹{route.costINR}</Typography>
          </View>

          <View className="w-[48%] bg-card rounded-2xl p-4 mb-4 border border-border">
            <View className="flex-row items-center mb-2">
              <Leaf size={16} color="#218653" />
              <Typography variant="caption" className="text-secondary-foreground ml-2">CO₂ Prevented</Typography>
            </View>
            <Typography variant="h4" className="text-primary">{route.co2Prevented.toFixed(1)} kg</Typography>
          </View>
        </View>

        {/* Segments if combined */}
        {route.isCombined && route.segments && (
          <View className="mb-6">
            <Typography variant="h4" className="mb-4">Journey Segments</Typography>
            <View className="bg-card rounded-2xl p-4 border border-border">
              {route.segments.map((seg, i) => (
                <View key={i} className="flex-row items-center mb-4 last:mb-0">
                  <View className="w-8 items-center justify-center mr-3">
                    {getModeIcon(seg.mode, '#69766E')}
                  </View>
                  <View className="flex-1">
                    <Typography variant="body" className="capitalize">{seg.mode}</Typography>
                    <Typography variant="caption" className="text-secondary-foreground">
                      {seg.durationMins} mins • {seg.distanceKm} km
                    </Typography>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <Button 
          title="Choose this route" 
          onPress={() => {
            alert('Route chosen! (Simulation)');
            router.back();
          }} 
          className="mb-8"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
