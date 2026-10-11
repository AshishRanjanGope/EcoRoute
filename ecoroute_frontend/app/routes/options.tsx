import React, { useEffect, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowUpDown,
  Bike,
  Bus,
  Car,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Footprints,
  Leaf,
  Pencil,
  SlidersHorizontal,
  Train,
  User,
} from 'lucide-react-native';
import { Typography } from '../../components/ui/Typography';
import { fetchRouteOptions, RouteOption } from '../../lib/api';

type FilterMode = 'all' | 'public_transport' | 'carpool' | 'bike' | 'walk';

export default function RouteOptionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const originName = String(params.originName || 'NIT Raipur');
  const destName = String(params.destName || 'Tatibandh, Raipur');
  const initialTravellers = Number(params.travellers || 1);

  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterMode>('all');
  const [sortBy, setSortBy] = useState<'best' | 'time' | 'carbon' | 'cost'>('best');
  const [sortModalOpen, setSortModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchRouteOptions(
      { name: originName, lat: Number(params.originLat), lng: Number(params.originLng) },
      { name: destName, lat: Number(params.destLat), lng: Number(params.destLng) },
      sortBy === 'best' ? 'efficiency' : sortBy
    ).then((res) => {
      setRoutes(res);
      setLoading(false);
    });
  }, [originName, destName, sortBy]);

  // Filter routes based on selected mode pill
  const filteredRoutes = routes.filter((r) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'public_transport') {
      return (
        r.mode === 'public_transport' ||
        r.mode === 'metro' ||
        r.mode === 'local-train' ||
        r.name.toLowerCase().includes('bus') ||
        r.name.toLowerCase().includes('metro')
      );
    }
    if (activeFilter === 'carpool') return r.mode === 'carpool';
    if (activeFilter === 'bike') return r.mode === 'bike' || r.mode === 'bicycle' || r.mode === 'motorbike';
    if (activeFilter === 'walk') return r.mode === 'walking' || r.name.toLowerCase().includes('walk');
    return true;
  });

  const handleSelectRoute = (route: RouteOption) => {
    setSelectedRoute(route);
    setConfirmModalOpen(true);
  };

  const getLegIcon = (mode: string) => {
    switch (mode) {
      case 'bus':
        return <Bus size={18} color="#18231D" />;
      case 'carpool':
        return <Car size={18} color="#18231D" />;
      case 'bike':
        return <Bike size={18} color="#18231D" />;
      case 'metro':
        return <Train size={18} color="#18231D" />;
      default:
        return <Footprints size={18} color="#18231D" />;
    }
  };

  const getHeaderIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('carpool') || n.includes('pool')) return <Car size={22} color="#1E6B3F" />;
    if (n.includes('bike')) return <Bike size={22} color="#1E6B3F" />;
    if (n.includes('metro')) return <Train size={22} color="#1E6B3F" />;
    return <Bus size={22} color="#1E6B3F" />;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAF8' }} edges={['top']}>
      {/* 1. Header matching Screen 2 */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityLabel="Back"
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color="#18231D" />
        </Pressable>

        <Typography style={{ fontSize: 18, fontWeight: '700', color: '#18231D' }}>
          Route Options
        </Typography>

        <View style={styles.headerLeafBadge}>
          <Leaf size={18} color="#218653" />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 10, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Route Summary Card */}
        <View style={styles.summaryCard}>
          <View style={{ flex: 1 }}>
            {/* Origin */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={styles.pinCol}>
                <View style={styles.greenCircle} />
                <View style={styles.summaryDashedLine} />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Typography style={{ fontSize: 15, fontWeight: '700', color: '#18231D' }}>
                  {originName}
                </Typography>
                <Typography style={{ fontSize: 12, color: '#69766E', marginTop: 1 }}>
                  Current location
                </Typography>
              </View>
            </View>

            {/* Destination */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 10 }}>
              <View style={styles.pinCol}>
                <View style={styles.redCircle} />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Typography style={{ fontSize: 15, fontWeight: '700', color: '#18231D' }}>
                  {destName}
                </Typography>
                <Typography style={{ fontSize: 12, color: '#69766E', marginTop: 1 }}>
                  22 min • 7.4 km
                </Typography>
              </View>
            </View>
          </View>

          {/* Edit Button */}
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Edit locations"
            style={styles.editBtn}
          >
            <Pencil size={16} color="#5A6D61" />
          </Pressable>
        </View>

        {/* 3. Traveller & Sort row */}
        <View style={styles.filterRow}>
          {/* Traveller pill */}
          <View style={styles.filterPill}>
            <User size={16} color="#18231D" style={{ marginRight: 6 }} />
            <Typography style={{ fontSize: 13, fontWeight: '600', color: '#18231D' }}>
              {initialTravellers} traveller
            </Typography>
            <ChevronRight size={16} color="#69766E" style={{ marginLeft: 4 }} />
          </View>

          {/* Sort pill */}
          <Pressable
            onPress={() => setSortModalOpen(true)}
            style={styles.filterPill}
          >
            <SlidersHorizontal size={15} color="#18231D" style={{ marginRight: 6 }} />
            <Typography style={{ fontSize: 13, fontWeight: '600', color: '#18231D' }}>
              Sort by {sortBy === 'best' ? 'Best' : sortBy === 'time' ? 'Fastest' : 'Eco'}
            </Typography>
            <ChevronDown size={15} color="#69766E" style={{ marginLeft: 4 }} />
          </Pressable>
        </View>

        {/* 4. Mode Filter Pills (Horizontal Scroll) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 14 }}
        >
          {/* All */}
          <Pressable
            onPress={() => setActiveFilter('all')}
            style={[styles.modePill, activeFilter === 'all' && styles.modePillActive]}
          >
            <Typography
              style={[
                styles.modePillText,
                activeFilter === 'all' && styles.modePillTextActive,
              ]}
            >
              All
            </Typography>
          </Pressable>

          {/* Public Transport */}
          <Pressable
            onPress={() => setActiveFilter('public_transport')}
            style={[styles.modePill, activeFilter === 'public_transport' && styles.modePillActive]}
          >
            <Bus
              size={16}
              color={activeFilter === 'public_transport' ? '#FFFFFF' : '#18231D'}
              style={{ marginRight: 6 }}
            />
            <Typography
              style={[
                styles.modePillText,
                activeFilter === 'public_transport' && styles.modePillTextActive,
              ]}
            >
              Public Transport
            </Typography>
          </Pressable>

          {/* Carpool */}
          <Pressable
            onPress={() => setActiveFilter('carpool')}
            style={[styles.modePill, activeFilter === 'carpool' && styles.modePillActive]}
          >
            <Car
              size={16}
              color={activeFilter === 'carpool' ? '#FFFFFF' : '#18231D'}
              style={{ marginRight: 6 }}
            />
            <Typography
              style={[
                styles.modePillText,
                activeFilter === 'carpool' && styles.modePillTextActive,
              ]}
            >
              Carpool
            </Typography>
          </Pressable>

          {/* Bike */}
          <Pressable
            onPress={() => setActiveFilter('bike')}
            style={[styles.modePill, activeFilter === 'bike' && styles.modePillActive]}
          >
            <Bike
              size={16}
              color={activeFilter === 'bike' ? '#FFFFFF' : '#18231D'}
              style={{ marginRight: 6 }}
            />
            <Typography
              style={[
                styles.modePillText,
                activeFilter === 'bike' && styles.modePillTextActive,
              ]}
            >
              Bike
            </Typography>
          </Pressable>

          {/* Walk */}
          <Pressable
            onPress={() => setActiveFilter('walk')}
            style={[styles.modePill, activeFilter === 'walk' && styles.modePillActive]}
          >
            <Footprints
              size={16}
              color={activeFilter === 'walk' ? '#FFFFFF' : '#18231D'}
              style={{ marginRight: 6 }}
            />
            <Typography
              style={[
                styles.modePillText,
                activeFilter === 'walk' && styles.modePillTextActive,
              ]}
            >
              Walk
            </Typography>
          </Pressable>
        </ScrollView>

        {/* 5. Route Option Cards (Matching mockup exactly) */}
        {filteredRoutes.map((route, idx) => {
          const isRecommended = route.recommended || idx === 0;

          return (
            <View
              key={route.id}
              style={[
                styles.routeCard,
                isRecommended && styles.routeCardRecommended,
              ]}
            >
              {/* Header: Mode Name + Carbon Badge */}
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {getHeaderIcon(route.name)}
                  <Typography style={{ fontSize: 16, fontWeight: '700', color: '#18231D', marginLeft: 8 }}>
                    {route.name}
                  </Typography>
                </View>

                {/* Carbon Badge */}
                <View style={styles.carbonBadge}>
                  <Leaf size={13} color="#218653" style={{ marginRight: 4 }} />
                  <Typography style={{ fontSize: 12, fontWeight: '600', color: '#1E6B3F' }}>
                    {route.carbonBadge}
                  </Typography>
                </View>
              </View>

              {/* Time display */}
              <View style={{ marginTop: 10, marginBottom: 12 }}>
                <Typography style={{ fontSize: 24, fontWeight: '800', color: '#18231D' }}>
                  {route.durationMins} min
                </Typography>
                <Typography style={{ fontSize: 12, color: '#69766E', marginTop: 2 }}>
                  {route.startTime} – {route.endTime}
                </Typography>
              </View>

              {/* Bottom Legs Breakdown & Select Button */}
              <View style={styles.cardFooter}>
                {/* Legs breakdown */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1, flexWrap: 'wrap' }}>
                  {route.legs.map((leg, li) => (
                    <View key={li} style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ marginRight: 6 }}>{getLegIcon(leg.mode)}</View>
                      <View>
                        <Typography style={{ fontSize: 11, fontWeight: '700', color: '#18231D' }}>
                          {leg.durationMins} min
                        </Typography>
                        <Typography style={{ fontSize: 10, color: '#69766E' }}>
                          {leg.label}
                        </Typography>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Select Button */}
                <Pressable
                  onPress={() => handleSelectRoute(route)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${route.name}`}
                  style={[
                    styles.selectBtn,
                    isRecommended ? styles.selectBtnFilled : styles.selectBtnOutline,
                  ]}
                >
                  <Typography
                    style={[
                      styles.selectBtnText,
                      isRecommended ? styles.selectBtnTextFilled : styles.selectBtnTextOutline,
                    ]}
                  >
                    Select
                  </Typography>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Sort selection dialog */}
      <Modal visible={sortModalOpen} transparent animationType="fade">
        <Pressable
          onPress={() => setSortModalOpen(false)}
          style={{ flex: 1, backgroundColor: 'rgba(24,35,29,0.4)', justifyContent: 'center', padding: 24 }}
        >
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20 }}>
            <Typography style={{ fontSize: 16, fontWeight: '700', color: '#18231D', marginBottom: 14 }}>
              Sort Routes By
            </Typography>
            {[
              { key: 'best', label: 'Best (Efficiency Score)' },
              { key: 'time', label: 'Fastest (Shortest Duration)' },
              { key: 'carbon', label: 'Lowest Carbon Emissions' },
              { key: 'cost', label: 'Cheapest Fare (INR)' },
            ].map((s) => (
              <Pressable
                key={s.key}
                onPress={() => {
                  setSortBy(s.key as any);
                  setSortModalOpen(false);
                }}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: '#F0F4F1',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Typography style={{ fontSize: 14, fontWeight: sortBy === s.key ? '700' : '500', color: sortBy === s.key ? '#1E6B3F' : '#18231D' }}>
                  {s.label}
                </Typography>
                {sortBy === s.key && <Typography style={{ color: '#1E6B3F', fontWeight: '700' }}>✓</Typography>}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Booking confirmation modal */}
      {selectedRoute && (
        <Modal visible={confirmModalOpen} transparent animationType="slide">
          <View style={{ flex: 1, backgroundColor: 'rgba(24,35,29,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 }}>
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <CheckCircle2 size={44} color="#218653" />
                <Typography style={{ fontSize: 18, fontWeight: '800', color: '#18231D', marginTop: 10 }}>
                  Route Selected: {selectedRoute.name}
                </Typography>
                <Typography style={{ fontSize: 13, color: '#69766E', marginTop: 4 }}>
                  {originName} ➔ {destName}
                </Typography>
              </View>

              <View style={{ backgroundColor: '#EFF8F2', borderRadius: 16, padding: 14, marginBottom: 18 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Typography style={{ fontSize: 13, color: '#5A6D61' }}>Estimated Duration:</Typography>
                  <Typography style={{ fontSize: 14, fontWeight: '700', color: '#143825' }}>{selectedRoute.durationMins} mins ({selectedRoute.startTime} – {selectedRoute.endTime})</Typography>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Typography style={{ fontSize: 13, color: '#5A6D61' }}>Eco Carbon Rating:</Typography>
                  <Typography style={{ fontSize: 14, fontWeight: '700', color: '#218653' }}>{selectedRoute.carbonBadge}</Typography>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Typography style={{ fontSize: 13, color: '#5A6D61' }}>Estimated Fare:</Typography>
                  <Typography style={{ fontSize: 14, fontWeight: '700', color: '#143825' }}>₹{selectedRoute.costINR}</Typography>
                </View>
              </View>

              <Pressable
                onPress={() => {
                  setConfirmModalOpen(false);
                  router.push('/(tabs)/home' as any);
                }}
                style={{
                  backgroundColor: '#1B5E39',
                  height: 50,
                  borderRadius: 25,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
                  Start Trip Navigation
                </Typography>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
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
  },
  backBtn: {
    padding: 6,
    marginLeft: -6,
  },
  headerLeafBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6EEE8',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 12,
  },
  pinCol: {
    width: 14,
    alignItems: 'center',
    marginTop: 3,
  },
  greenCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#218653',
  },
  redCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E63946',
  },
  summaryDashedLine: {
    width: 1.5,
    height: 18,
    backgroundColor: '#B5C4BB',
    marginTop: 3,
  },
  editBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F6F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  filterPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6EEE8',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6EEE8',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  modePillActive: {
    backgroundColor: '#1B5E39',
    borderColor: '#1B5E39',
  },
  modePillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#18231D',
  },
  modePillTextActive: {
    color: '#FFFFFF',
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6EEE8',
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  routeCardRecommended: {
    borderWidth: 1.5,
    borderColor: '#218653',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  carbonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF6EE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F4F1',
    paddingTop: 12,
  },
  selectBtn: {
    paddingHorizontal: 22,
    paddingVertical: 9,
    borderRadius: 20,
  },
  selectBtnFilled: {
    backgroundColor: '#1B5E39',
  },
  selectBtnOutline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#1B5E39',
  },
  selectBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  selectBtnTextFilled: {
    color: '#FFFFFF',
  },
  selectBtnTextOutline: {
    color: '#1B5E39',
  },
});
