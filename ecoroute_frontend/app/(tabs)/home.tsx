import React, { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowUpDown, Bell, ChevronDown, ChevronRight, Leaf, Map, Minus, Plus, Search, User } from 'lucide-react-native';
import { Typography } from '../../components/ui/Typography';
import { GoogleMapView, MapCoordinate } from '../../components/map/GoogleMapView';
import { PlacePickerModal } from '../../components/map/PlacePickerModal';
import { PlaceItem } from '../../lib/api';

export default function HomeScreen() {
  const router = useRouter();

  // Selected Origin & Destination (defaults matching design: NIT Raipur -> Tatibandh, Raipur)
  const [origin, setOrigin] = useState<MapCoordinate>({
    lat: 21.2497,
    lng: 81.6050,
    name: 'NIT Raipur',
  });

  const [destination, setDestination] = useState<MapCoordinate>({
    lat: 21.2581,
    lng: 81.5645,
    name: 'Tatibandh, Raipur',
  });

  const [travellers, setTravellers] = useState(1);
  const [travellerModalOpen, setTravellerModalOpen] = useState(false);
  const [placePicker, setPlacePicker] = useState<{ open: boolean; target: 'origin' | 'destination' }>({
    open: false,
    target: 'origin',
  });

  const handleSelectPlace = (place: PlaceItem) => {
    if (placePicker.target === 'origin') {
      setOrigin({ lat: place.lat, lng: place.lng, name: place.name });
    } else {
      setDestination({ lat: place.lat, lng: place.lng, name: place.name });
    }
  };

  const handleFindRoutes = () => {
    router.push({
      pathname: '/routes/options' as any,
      params: {
        originName: origin.name,
        originLat: String(origin.lat),
        originLng: String(origin.lng),
        destName: destination.name,
        destLat: String(destination.lat),
        destLng: String(destination.lng),
        travellers: String(travellers),
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header matching Screen 1 */}
        <View style={styles.header}>
          {/* User profile avatar on left (green circle with 'A' / user icon) */}
          <Pressable
            onPress={() => router.push('/(tabs)/profile' as any)}
            accessibilityRole="button"
            accessibilityLabel="Profile"
            style={styles.avatarBtn}
          >
            <Typography style={{ fontSize: 16, fontWeight: '800', color: '#1E6B3F' }}>
              A
            </Typography>
          </Pressable>

          {/* Title in center with leaf icon */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Typography style={{ fontSize: 20, fontWeight: '800', color: '#18231D' }}>
              EcoRoute
            </Typography>
            <View style={{ marginLeft: 6 }}>
              <Leaf size={18} color="#218653" />
            </View>
          </View>

          {/* Notification bell on right with green dot badge */}
          <Pressable
            onPress={() => router.push('/(tabs)/impact' as any)}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            style={styles.bellBtn}
          >
            <Bell size={20} color="#18231D" />
            <View style={styles.unreadDot} />
          </Pressable>
        </View>

        {/* 2. Interactive Google Map Section with Raipur landmarks & GPS */}
        <GoogleMapView
          origin={origin}
          destination={destination}
          onLocatePress={() => {
            setOrigin({ lat: 21.2497, lng: 81.6050, name: 'NIT Raipur (Current location)' });
          }}
          onSelectCoordinate={(coord) => {
            setDestination(coord);
          }}
        />

        {/* 3. Bottom Route & Booking Sheet */}
        <View style={styles.sheetContainer}>
          {/* Top Sheet Drag Indicator Pill */}
          <View style={styles.sheetHandle} />

          {/* Plan Your Journey Heading */}
          <Typography style={{ fontSize: 18, fontWeight: '800', color: '#18231D', marginBottom: 14 }}>
            Plan Your Journey
          </Typography>

          {/* Location Inputs (From & To with dashed connector line and Swap button) */}
          <View style={styles.locationsContainer}>
            {/* Origin row */}
            <Pressable
              onPress={() => setPlacePicker({ open: true, target: 'origin' })}
              style={styles.locationRow}
            >
              <View style={styles.pinIndicatorContainer}>
                <View style={styles.greenDot} />
                <View style={styles.dashedLine} />
              </View>
              <View style={{ flex: 1, paddingLeft: 10 }}>
                <Typography style={{ fontSize: 11, color: '#69766E', fontWeight: '500' }}>
                  From
                </Typography>
                <Typography style={{ fontSize: 14, color: '#18231D', fontWeight: '600', marginTop: 2 }}>
                  {origin.name || 'Select location'}
                </Typography>
              </View>
              <Pressable
                onPress={() => setPlacePicker({ open: true, target: 'origin' })}
                hitSlop={8}
                style={styles.mapIconBtn}
              >
                <Map size={18} color="#69766E" />
              </Pressable>
            </Pressable>

            {/* Swap Button (between From & To) */}
            <View style={styles.swapBtnContainer}>
              <Pressable
                onPress={() => {
                  const temp = origin;
                  setOrigin(destination);
                  setDestination(temp);
                }}
                style={styles.swapBtn}
                accessibilityRole="button"
                accessibilityLabel="Swap origin and destination"
              >
                <ArrowUpDown size={15} color="#1E6B3F" />
              </Pressable>
            </View>

            {/* Destination row */}
            <Pressable
              onPress={() => setPlacePicker({ open: true, target: 'destination' })}
              style={styles.locationRow}
            >
              <View style={styles.pinIndicatorContainer}>
                <View style={styles.redDot} />
              </View>
              <View style={{ flex: 1, paddingLeft: 10 }}>
                <Typography style={{ fontSize: 11, color: '#69766E', fontWeight: '500' }}>
                  To
                </Typography>
                <Typography style={{ fontSize: 14, color: '#18231D', fontWeight: '600', marginTop: 2 }}>
                  {destination.name || 'Select location'}
                </Typography>
              </View>
              <Pressable
                onPress={() => setPlacePicker({ open: true, target: 'destination' })}
                hitSlop={8}
                style={styles.mapIconBtn}
              >
                <Map size={18} color="#69766E" />
              </Pressable>
            </Pressable>
          </View>

          {/* Number of travellers row with Stepper */}
          <View style={styles.travellersRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <User size={18} color="#69766E" style={{ marginRight: 8 }} />
              <Typography style={{ fontSize: 14, color: '#18231D', fontWeight: '500' }}>
                Travellers
              </Typography>
            </View>

            <View style={styles.stepperContainer}>
              <Pressable
                onPress={() => setTravellers((prev) => Math.max(1, prev - 1))}
                hitSlop={8}
                style={styles.stepperBtn}
                disabled={travellers <= 1}
              >
                <Minus size={16} color={travellers <= 1 ? '#B5C4BB' : '#18231D'} />
              </Pressable>

              <Typography style={{ fontSize: 14, fontWeight: '700', color: '#18231D', marginHorizontal: 12 }}>
                {travellers} {travellers === 1 ? 'Traveller' : 'Travellers'}
              </Typography>

              <Pressable
                onPress={() => setTravellers((prev) => Math.min(6, prev + 1))}
                hitSlop={8}
                style={styles.stepperBtn}
                disabled={travellers >= 6}
              >
                <Plus size={16} color={travellers >= 6 ? '#B5C4BB' : '#18231D'} />
              </Pressable>
            </View>
          </View>

          {/* Find Routes Button */}
          <Pressable
            onPress={handleFindRoutes}
            accessibilityRole="button"
            accessibilityLabel="Find Routes"
            style={styles.findRoutesBtn}
          >
            <Search size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Typography style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
              Find Routes
            </Typography>
          </Pressable>

          {/* Eco Banner at bottom matching mockup */}
          <View style={styles.ecoBanner}>
            <View style={styles.ecoBannerIconCircle}>
              <Leaf size={18} color="#1E6B3F" />
            </View>
            <View style={{ flex: 1 }}>
              <Typography style={{ fontSize: 12, color: '#3A5243', lineHeight: 17, fontWeight: '500' }}>
                Choosing eco-routes can save up to <Typography style={{ fontWeight: '700', color: '#1B5E39' }}>40% CO2</Typography> emissions per trip.
              </Typography>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Place Picker Modal */}
      <PlacePickerModal
        visible={placePicker.open}
        title={placePicker.target === 'origin' ? 'Select Starting Location' : 'Select Destination'}
        onSelectPlace={handleSelectPlace}
        onClose={() => setPlacePicker({ ...placePicker, open: false })}
      />

      {/* Traveller count picker dialog */}
      <Modal visible={travellerModalOpen} transparent animationType="fade">
        <Pressable
          onPress={() => setTravellerModalOpen(false)}
          style={{ flex: 1, backgroundColor: 'rgba(24,35,29,0.4)', justifyContent: 'center', padding: 24 }}
        >
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20 }}>
            <Typography style={{ fontSize: 16, fontWeight: '700', color: '#18231D', marginBottom: 14 }}>
              Select Number of Travellers
            </Typography>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                onPress={() => {
                  setTravellers(n);
                  setTravellerModalOpen(false);
                }}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: '#F0F4F1',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Typography style={{ fontSize: 15, fontWeight: travellers === n ? '700' : '500', color: travellers === n ? '#1E6B3F' : '#18231D' }}>
                  {n} {n === 1 ? 'Traveller' : 'Travellers'}
                </Typography>
                {travellers === n && <Typography style={{ color: '#1E6B3F', fontWeight: '700' }}>✓</Typography>}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D4E8DC',
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F6F4',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#218653',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingHorizontal: 18,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DCE4DF',
    alignSelf: 'center',
    marginBottom: 16,
  },
  locationsContainer: {
    backgroundColor: '#F7FAF8',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6EEE8',
    padding: 14,
    marginBottom: 14,
    position: 'relative',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swapBtnContainer: {
    alignItems: 'flex-end',
    paddingRight: 8,
    marginVertical: -6,
    zIndex: 5,
  },
  swapBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D4E8DC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  pinIndicatorContainer: {
    width: 18,
    alignItems: 'center',
  },
  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#218653',
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E63946',
  },
  dashedLine: {
    width: 1.5,
    height: 24,
    backgroundColor: '#B5C4BB',
    marginTop: 4,
  },
  mapIconBtn: {
    padding: 6,
  },
  travellersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7FAF8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6EEE8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0EAE3',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F5F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  findRoutesBtn: {
    backgroundColor: '#1B5E39',
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1B5E39',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 14,
  },
  ecoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF8F2',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DBEBE0',
    padding: 14,
  },
  ecoBannerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D9EFE2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
});
