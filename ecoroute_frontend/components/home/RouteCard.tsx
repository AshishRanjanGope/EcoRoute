import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Typography } from '../ui/Typography';
import { RouteWithMetrics } from '../../utils/efficiency';
import { Train, Car, Footprints, Bike, Bus, Navigation } from 'lucide-react-native';
import { cn } from '../../lib/utils';
import { useRouter } from 'expo-router';

export function getModeIcon(mode: string, color: string) {
  switch (mode) {
    case 'walking': return <Footprints color={color} size={20} />;
    case 'bicycle': return <Bike color={color} size={20} />;
    case 'metro':
    case 'local-train': return <Train color={color} size={20} />;
    case 'auto-rickshaw': return <Bus color={color} size={20} />;
    case 'taxi':
    case 'carpool': return <Car color={color} size={20} />;
    default: return <Navigation color={color} size={20} />;
  }
}

interface RouteCardProps {
  route: RouteWithMetrics;
  isBest?: boolean;
}

export function RouteCard({ route, isBest }: RouteCardProps) {
  const router = useRouter();

  const statusColorMap = {
    green: '#218653',
    amber: '#C28A24',
    red: '#C94C4C',
  };

  const statusBgMap = {
    green: '#E8F5EE',
    amber: '#FEF6E7',
    red: '#FDECEB',
  };

  return (
    <TouchableOpacity 
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        borderWidth: isBest ? 2 : 1,
        borderColor: isBest ? '#218653' : '#E4EAE5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isBest ? 0.08 : 0.03,
        shadowRadius: 6,
        elevation: isBest ? 3 : 1,
      }}
      className={cn(
        "bg-card rounded-2xl p-4 mb-4 border", 
        isBest ? "border-primary border-2 shadow-sm" : "border-border"
      )}
      onPress={() => router.push(`/routes/${route.id}` as any)}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: '#E8F5EE',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12
          }}>
            {getModeIcon(route.mode, '#218653')}
          </View>
          <View style={{ flex: 1 }}>
            <Typography variant="h4">{route.name}</Typography>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Typography variant="caption" style={{ color: '#69766E' }}>
                {route.durationMins} min • {route.distanceKm} km
              </Typography>
            </View>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Typography variant="h3" style={{ color: '#18231D' }}>₹{route.costINR}</Typography>
        </View>
      </View>
      
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F0F4F1'
      }}>
        <View>
          <Typography variant="caption" style={{ color: '#69766E' }}>Efficiency</Typography>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 3,
            backgroundColor: statusBgMap[route.status],
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 8
          }}>
            <View style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: statusColorMap[route.status],
              marginRight: 5
            }} />
            <Typography variant="caption" style={{ color: statusColorMap[route.status], fontWeight: '600' }}>
              {route.efficiencyScore}/100
            </Typography>
          </View>
        </View>
        
        <View style={{ alignItems: 'flex-end' }}>
          <Typography variant="caption" style={{ color: '#69766E' }}>CO₂ Prevented</Typography>
          <Typography variant="label" style={{ color: '#218653', fontWeight: '700', marginTop: 3 }}>
            🌱 {route.co2Prevented.toFixed(1)} kg
          </Typography>
        </View>
      </View>
    </TouchableOpacity>
  );
}
