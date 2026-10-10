import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Calendar, Settings2, Download, CheckCircle2 } from 'lucide-react-native';

export default function PlannerScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAF8' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Typography variant="h2">30-Day Planner</Typography>
          <Button variant="ghost" size="icon">
            <Settings2 size={22} color="#69766E" />
          </Button>
        </View>

        <Typography variant="body" style={{ color: '#69766E', marginBottom: 20 }}>
          Set your recurring Pune commute (Home ↔ Work / College) and get an optimized monthly mode mix.
        </Typography>

        {/* Current Recommended Plan Card */}
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          padding: 20,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: '#E4EAE5',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{
              width: 52,
              height: 52,
              backgroundColor: '#E8F5EE',
              borderRadius: 26,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14
            }}>
              <Calendar size={28} color="#218653" />
            </View>
            <View style={{ flex: 1 }}>
              <Typography variant="h3">October 2026 Plan</Typography>
              <Typography variant="caption" style={{ color: '#218653', fontWeight: '700' }}>Active Monthly Simulation</Typography>
            </View>
          </View>

          <View style={{
            backgroundColor: '#F8FAF8',
            borderRadius: 14,
            padding: 14,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#E4EAE5'
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Typography variant="caption" style={{ color: '#69766E' }}>Est. Monthly Cost</Typography>
              <Typography variant="body" style={{ fontWeight: '700' }}>₹1,650 <Typography variant="caption" style={{ color: '#69766E', textDecorationLine: 'line-through' }}>₹3,200</Typography></Typography>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Typography variant="caption" style={{ color: '#69766E' }}>Est. CO₂ Prevented</Typography>
              <Typography variant="body" style={{ color: '#218653', fontWeight: '700' }}>38.4 kg (≈ 1.8 trees)</Typography>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Typography variant="caption" style={{ color: '#69766E' }}>Recommended Mix</Typography>
              <Typography variant="caption" style={{ fontWeight: '600' }}>60% Metro + 25% Pool + 15% Walk</Typography>
            </View>
          </View>

          <Button 
            title="Regenerate Plan (Simulation)" 
            onPress={() => alert('Plan optimized with Pune transit schedule!')}
          />
        </View>

        <Typography variant="h3" style={{ marginBottom: 12 }}>Past Plans</Typography>
        
        {/* Past Plan Card */}
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: '#E4EAE5'
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Typography variant="h4">September 2026</Typography>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CheckCircle2 size={14} color="#218653" style={{ marginRight: 4 }} />
              <Typography variant="caption" style={{ color: '#218653', fontWeight: '700' }}>COMPLETED</Typography>
            </View>
          </View>
          <Typography variant="body" style={{ color: '#69766E', marginBottom: 12 }}>
            Home ↔ Hinjewadi Phase 1 • Saved ₹1,420 and 42kg CO₂
          </Typography>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button 
              variant="outline" 
              size="sm" 
              style={{ flex: 1 }} 
              title="View Breakdown" 
              onPress={() => alert('Daily Breakdown: 22 Days Metro pass used.')}
            />
            <Button 
              variant="outline" 
              size="sm" 
              style={{ flex: 1 }} 
              icon={<Download size={15} color="#18231D" style={{ marginRight: 6 }} />} 
              title="PDF Report" 
              onPress={() => alert('Download PDF Report (Simulated)')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
