import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Bike,
  Bus,
  Calendar,
  Car,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Footprints,
  Info,
  Leaf,
  MapPin,
  Pencil,
  Search,
  SlidersHorizontal,
  Train,
  User,
  X,
} from 'lucide-react-native';
import { Typography } from '../../components/ui/Typography';
import {
  calculateDistanceKm,
  fetchRouteOptions,
  fetchTrainsBetween,
  fetchTrainSchedule,
  formatDuration,
  RouteOption,
  TrainBetweenStations,
  TrainSchedule,
} from '../../lib/api';

type FilterMode = 'all' | 'train' | 'public_transport' | 'carpool' | 'bike' | 'walk';

export default function RouteOptionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const originName = String(params.originName || 'NIT Raipur');
  const destName = String(params.destName || 'Tatibandh, Raipur');
  const initialTravellers = Number(params.travellers || 1);

  const originLat = Number(params.originLat) || 21.2497;
  const originLng = Number(params.originLng) || 81.6050;
  const destLat = Number(params.destLat) || 21.2581;
  const destLng = Number(params.destLng) || 81.5645;

  // Accurate dynamic distance & duration calculation
  const { distanceKm: calculatedDist, drivingDurationMins: calculatedDur } = calculateDistanceKm(
    { lat: originLat, lng: originLng },
    { lat: destLat, lng: destLng }
  );

  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterMode>('all');
  const [sortBy, setSortBy] = useState<'best' | 'time' | 'carbon' | 'cost'>('best');
  const [sortModalOpen, setSortModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Train Explorer Modal states
  const [trainModalOpen, setTrainModalOpen] = useState(false);
  const [trainQuery, setTrainQuery] = useState('17005');
  const [selectedTrainSchedule, setSelectedTrainSchedule] = useState<TrainSchedule | null>(null);
  const [trainScheduleLoading, setTrainScheduleLoading] = useState(false);
  const [trainsBetweenList, setTrainsBetweenList] = useState<TrainBetweenStations[]>([]);
  const [trainTab, setTrainTab] = useState<'between' | 'schedule'>('between');

  useEffect(() => {
    setLoading(true);
    fetchRouteOptions(
      { name: originName, lat: originLat, lng: originLng },
      { name: destName, lat: destLat, lng: destLng },
      sortBy === 'best' ? 'efficiency' : sortBy
    ).then((res) => {
      setRoutes(res);
      setLoading(false);
    });
  }, [originName, destName, originLat, originLng, destLat, destLng, sortBy]);

  // Load trains between stations when train modal opens
  useEffect(() => {
    if (trainModalOpen) {
      fetchTrainsBetween(originName, destName).then((t) => {
        setTrainsBetweenList(t);
        if (t.length > 0 && !selectedTrainSchedule) {
          handleLoadTrainSchedule(t[0].trainNumber);
        }
      });
    }
  }, [trainModalOpen, originName, destName]);

  const handleLoadTrainSchedule = async (num: string) => {
    setTrainScheduleLoading(true);
    const sched = await fetchTrainSchedule(num);
    setSelectedTrainSchedule(sched);
    setTrainScheduleLoading(false);
  };

  // Filter routes based on selected mode pill
  const filteredRoutes = routes.filter((r) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'train') {
      return (
        r.mode === 'train' ||
        r.mode === 'local-train' ||
        r.name.toLowerCase().includes('train') ||
        r.name.toLowerCase().includes('exp')
      );
    }
    if (activeFilter === 'public_transport') {
      return (
        r.mode === 'public_transport' ||
        r.mode === 'metro' ||
        r.mode === 'bus' ||
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
      case 'train':
        return <Train size={18} color="#1E6B3F" />;
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

  const getHeaderIcon = (mode: string, name: string) => {
    const n = name.toLowerCase();
    if (mode === 'train' || n.includes('train') || n.includes('exp')) {
      return <Train size={22} color="#1E6B3F" />;
    }
    if (n.includes('carpool') || n.includes('pool')) return <Car size={22} color="#1E6B3F" />;
    if (n.includes('bike')) return <Bike size={22} color="#1E6B3F" />;
    if (n.includes('metro')) return <Train size={22} color="#1E6B3F" />;
    return <Bus size={22} color="#1E6B3F" />;
  };

  // Dynamic header metrics: derived from active routes or accurate road distance
  const displayedDist = routes.length > 0 ? routes[0].distanceKm : calculatedDist;
  const displayedDur = routes.length > 0 ? routes[0].durationMins : calculatedDur;
  const durationText = formatDuration(displayedDur);
  const distanceText = displayedDist >= 1 ? `${displayedDist} km` : `${Math.round(displayedDist * 1000)} m`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAF8' }} edges={['top']}>
      {/* 1. Top Header */}
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
        {/* 2. Route Summary Card (Dynamic Accurate Distance & Duration) */}
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
                {/* Dynamically calculated accurate duration & distance */}
                <Typography style={{ fontSize: 13, color: '#1E6B3F', fontWeight: '700', marginTop: 2 }}>
                  {durationText} • {distanceText}
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

        {/* 3. Indian Railways Live Schedule Quick Banner */}
        <Pressable
          onPress={() => setTrainModalOpen(true)}
          style={styles.trainScheduleBanner}
        >
          <View style={styles.trainIconBubble}>
            <Train size={18} color="#1E6B3F" />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Typography style={{ fontSize: 13, fontWeight: '700', color: '#143825' }}>
              Indian Railways Train Schedules
            </Typography>
            <Typography style={{ fontSize: 11, color: '#4E6A58', marginTop: 1 }}>
              View all trains across India, timetables & stops
            </Typography>
          </View>
          <View style={styles.viewSchedulePill}>
            <Typography style={{ fontSize: 11, fontWeight: '700', color: '#FFFFFF' }}>
              Search
            </Typography>
            <ChevronRight size={13} color="#FFFFFF" style={{ marginLeft: 2 }} />
          </View>
        </Pressable>

        {/* 4. Traveller & Sort row */}
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

        {/* 5. Mode Filter Pills (Includes Train, Public Transport, Carpool, Bike, Walk) */}
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

          {/* Train */}
          <Pressable
            onPress={() => setActiveFilter('train')}
            style={[styles.modePill, activeFilter === 'train' && styles.modePillActive]}
          >
            <Train
              size={16}
              color={activeFilter === 'train' ? '#FFFFFF' : '#18231D'}
              style={{ marginRight: 6 }}
            />
            <Typography
              style={[
                styles.modePillText,
                activeFilter === 'train' && styles.modePillTextActive,
              ]}
            >
              Train
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

        {/* Loading Indicator */}
        {loading && (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#1E6B3F" />
            <Typography style={{ fontSize: 13, color: '#69766E', marginTop: 8 }}>
              Finding best eco-routes & train schedules...
            </Typography>
          </View>
        )}

        {/* 6. Route Option Cards */}
        {!loading && filteredRoutes.length === 0 && (
          <View style={{ padding: 24, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20 }}>
            <Info size={28} color="#69766E" />
            <Typography style={{ fontSize: 15, fontWeight: '700', color: '#18231D', marginTop: 8 }}>
              No routes found for this mode
            </Typography>
            <Typography style={{ fontSize: 13, color: '#69766E', marginTop: 4, textAlign: 'center' }}>
              Try selecting "All" or "Train" for intercity connections.
            </Typography>
          </View>
        )}

        {filteredRoutes.map((route, idx) => {
          const isRecommended = route.recommended || idx === 0;
          const formattedDuration = formatDuration(route.durationMins);
          const isTrainRoute =
            route.mode === 'train' ||
            route.mode === 'local-train' ||
            route.name.toLowerCase().includes('train');

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
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 }}>
                  {getHeaderIcon(route.mode, route.name)}
                  <Typography
                    style={{ fontSize: 16, fontWeight: '700', color: '#18231D', marginLeft: 8, flex: 1 }}
                    numberOfLines={1}
                  >
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

              {/* Time display & distance badge */}
              <View style={{ marginTop: 10, marginBottom: 12, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <View>
                  <Typography style={{ fontSize: 24, fontWeight: '800', color: '#18231D' }}>
                    {formattedDuration}
                  </Typography>
                  <Typography style={{ fontSize: 12, color: '#69766E', marginTop: 2 }}>
                    {route.startTime} – {route.endTime}
                  </Typography>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Typography style={{ fontSize: 14, fontWeight: '700', color: '#1E6B3F' }}>
                    {route.distanceKm} km
                  </Typography>
                  <Typography style={{ fontSize: 13, fontWeight: '600', color: '#18231D', marginTop: 2 }}>
                    ₹{route.costINR}
                  </Typography>
                </View>
              </View>

              {/* View Timetable button if Train */}
              {isTrainRoute && (
                <Pressable
                  onPress={() => {
                    const match = route.name.match(/\b\d{5}\b/);
                    const trainNum = match ? match[0] : '17005';
                    handleLoadTrainSchedule(trainNum);
                    setTrainTab('schedule');
                    setTrainModalOpen(true);
                  }}
                  style={styles.trainTimetableBtn}
                >
                  <Clock size={13} color="#1E6B3F" style={{ marginRight: 5 }} />
                  <Typography style={{ fontSize: 12, fontWeight: '700', color: '#1E6B3F' }}>
                    View Train Halts & Timetable
                  </Typography>
                </Pressable>
              )}

              {/* Bottom Legs Breakdown & Select Button */}
              <View style={styles.cardFooter}>
                {/* Legs breakdown */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1, flexWrap: 'wrap' }}>
                  {route.legs.map((leg, li) => (
                    <View key={li} style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ marginRight: 6 }}>{getLegIcon(leg.mode)}</View>
                      <View>
                        <Typography style={{ fontSize: 11, fontWeight: '700', color: '#18231D' }}>
                          {formatDuration(leg.durationMins)}
                        </Typography>
                        <Typography style={{ fontSize: 10, color: '#69766E' }} numberOfLines={1}>
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

      {/* 7. Indian Railways Schedule & Timetable Explorer Modal */}
      <Modal visible={trainModalOpen} transparent animationType="slide" onRequestClose={() => setTrainModalOpen(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(24,35,29,0.5)', justifyContent: 'flex-end' }}>
          <View style={styles.trainModalSheet}>
            {/* Modal Header */}
            <View style={styles.trainModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Train size={22} color="#1E6B3F" />
                <Typography style={{ fontSize: 17, fontWeight: '800', color: '#18231D', marginLeft: 8 }}>
                  Indian Railways Schedule
                </Typography>
              </View>
              <Pressable onPress={() => setTrainModalOpen(false)} hitSlop={10}>
                <X size={20} color="#69766E" />
              </Pressable>
            </View>

            {/* Modal Tabs */}
            <View style={styles.trainTabRow}>
              <Pressable
                onPress={() => setTrainTab('between')}
                style={[styles.trainTabBtn, trainTab === 'between' && styles.trainTabBtnActive]}
              >
                <Typography style={[styles.trainTabText, trainTab === 'between' && styles.trainTabTextActive]}>
                  Trains on Route
                </Typography>
              </Pressable>
              <Pressable
                onPress={() => setTrainTab('schedule')}
                style={[styles.trainTabBtn, trainTab === 'schedule' && styles.trainTabBtnActive]}
              >
                <Typography style={[styles.trainTabText, trainTab === 'schedule' && styles.trainTabTextActive]}>
                  Search Any Train
                </Typography>
              </Pressable>
            </View>

            {/* Tab 1: Trains on this route (Raipur -> Bokaro etc.) */}
            {trainTab === 'between' && (
              <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                <Typography style={{ fontSize: 13, fontWeight: '700', color: '#143825', marginBottom: 8 }}>
                  Trains connecting {originName} ➔ {destName} ({displayedDist} km):
                </Typography>

                {trainsBetweenList.length === 0 ? (
                  <View style={{ padding: 16, alignItems: 'center' }}>
                    <Typography style={{ fontSize: 13, color: '#69766E' }}>
                      Finding direct trains between stations...
                    </Typography>
                  </View>
                ) : (
                  trainsBetweenList.map((t) => (
                    <View key={t.trainNumber} style={styles.trainItemCard}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                          <Typography style={{ fontSize: 15, fontWeight: '800', color: '#18231D' }}>
                            {t.trainNumber} - {t.trainName}
                          </Typography>
                          <Typography style={{ fontSize: 12, color: '#69766E', marginTop: 2 }}>
                            {t.fromStationName} ({t.departureTime}) ➔ {t.toStationName} ({t.arrivalTime})
                          </Typography>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Typography style={{ fontSize: 14, fontWeight: '700', color: '#1E6B3F' }}>
                            {t.durationFormatted}
                          </Typography>
                          <Typography style={{ fontSize: 11, color: '#69766E' }}>
                            {t.distanceKm} km
                          </Typography>
                        </View>
                      </View>

                      {/* Days & Fare */}
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#EFF3F0' }}>
                        <Typography style={{ fontSize: 11, color: '#4E6A58' }}>
                          Runs: {t.runningDays.join(', ')}
                        </Typography>
                        <Typography style={{ fontSize: 12, fontWeight: '700', color: '#143825' }}>
                          ₹{t.fares.sleeper || 395} (SL) • ₹{t.fares.thirdAc || 1060} (3AC)
                        </Typography>
                      </View>

                      {/* Timetable view button */}
                      <Pressable
                        onPress={() => {
                          handleLoadTrainSchedule(t.trainNumber);
                          setTrainTab('schedule');
                        }}
                        style={{ marginTop: 8, alignSelf: 'flex-start' }}
                      >
                        <Typography style={{ fontSize: 12, fontWeight: '700', color: '#1E6B3F' }}>
                          View Timetable Halts ➔
                        </Typography>
                      </Pressable>
                    </View>
                  ))
                )}
              </ScrollView>
            )}

            {/* Tab 2: Search Any Train across India by Number */}
            {trainTab === 'schedule' && (
              <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                {/* Search Bar */}
                <View style={styles.trainSearchBox}>
                  <Search size={16} color="#69766E" style={{ marginRight: 8 }} />
                  <TextInput
                    placeholder="Enter any Train No. (e.g. 17005, 17321, 12001)"
                    placeholderTextColor="#8C9A91"
                    value={trainQuery}
                    onChangeText={setTrainQuery}
                    style={{ flex: 1, fontSize: 14, color: '#18231D' }}
                    keyboardType="number-pad"
                  />
                  <Pressable
                    onPress={() => handleLoadTrainSchedule(trainQuery)}
                    style={styles.searchTrainSubmitBtn}
                  >
                    <Typography style={{ fontSize: 12, fontWeight: '700', color: '#FFFFFF' }}>
                      Get Stops
                    </Typography>
                  </Pressable>
                </View>

                {trainScheduleLoading && (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#1E6B3F" />
                    <Typography style={{ fontSize: 13, color: '#69766E', marginTop: 6 }}>
                      Fetching Indian Railways timetable...
                    </Typography>
                  </View>
                )}

                {selectedTrainSchedule && !trainScheduleLoading && (
                  <View style={{ marginTop: 10 }}>
                    {/* Train Info Card */}
                    <View style={styles.trainSummaryBanner}>
                      <Typography style={{ fontSize: 16, fontWeight: '800', color: '#143825' }}>
                        {selectedTrainSchedule.trainNumber} - {selectedTrainSchedule.trainName}
                      </Typography>
                      <Typography style={{ fontSize: 12, color: '#3A5243', marginTop: 2 }}>
                        {selectedTrainSchedule.fromStationName} ➔ {selectedTrainSchedule.toStationName}
                      </Typography>
                      <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
                        <Typography style={{ fontSize: 11, fontWeight: '600', color: '#1E6B3F' }}>
                          Distance: {selectedTrainSchedule.totalDistanceKm} km
                        </Typography>
                        <Typography style={{ fontSize: 11, fontWeight: '600', color: '#1E6B3F' }}>
                          Duration: {formatDuration(selectedTrainSchedule.totalDurationMins)}
                        </Typography>
                        <Typography style={{ fontSize: 11, fontWeight: '600', color: '#1E6B3F' }}>
                          Type: {selectedTrainSchedule.trainType}
                        </Typography>
                      </View>
                    </View>

                    {/* Timeline stops */}
                    <Typography style={{ fontSize: 13, fontWeight: '700', color: '#18231D', marginTop: 12, marginBottom: 8 }}>
                      Route Stops ({selectedTrainSchedule.stops.length} stations):
                    </Typography>

                    {selectedTrainSchedule.stops.map((stop, sIdx) => (
                      <View key={sIdx} style={styles.stopRow}>
                        <View style={styles.stopNumberCircle}>
                          <Typography style={{ fontSize: 10, fontWeight: '700', color: '#1E6B3F' }}>
                            {stop.stopNumber}
                          </Typography>
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Typography style={{ fontSize: 13, fontWeight: '700', color: '#18231D' }}>
                            {stop.stationName} ({stop.stationCode})
                          </Typography>
                          <Typography style={{ fontSize: 11, color: '#69766E' }}>
                            Arr: {stop.arrivalTime} | Dep: {stop.departureTime} ({stop.haltMinutes}m halt)
                          </Typography>
                        </View>
                        <Typography style={{ fontSize: 11, fontWeight: '600', color: '#5A6D61' }}>
                          {stop.distanceKm} km
                        </Typography>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* 8. Sort selection dialog */}
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

      {/* 9. Booking confirmation modal */}
      {selectedRoute && (
        <Modal visible={confirmModalOpen} transparent animationType="slide">
          <View style={{ flex: 1, backgroundColor: 'rgba(24,35,29,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 }}>
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <CheckCircle2 size={44} color="#218653" />
                <Typography style={{ fontSize: 18, fontWeight: '800', color: '#18231D', marginTop: 10, textAlign: 'center' }}>
                  Route Selected: {selectedRoute.name}
                </Typography>
                <Typography style={{ fontSize: 13, color: '#69766E', marginTop: 4 }}>
                  {originName} ➔ {destName}
                </Typography>
              </View>

              <View style={{ backgroundColor: '#EFF8F2', borderRadius: 16, padding: 14, marginBottom: 18 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Typography style={{ fontSize: 13, color: '#5A6D61' }}>Journey Distance:</Typography>
                  <Typography style={{ fontSize: 14, fontWeight: '700', color: '#143825' }}>{selectedRoute.distanceKm} km</Typography>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Typography style={{ fontSize: 13, color: '#5A6D61' }}>Estimated Duration:</Typography>
                  <Typography style={{ fontSize: 14, fontWeight: '700', color: '#143825' }}>{formatDuration(selectedRoute.durationMins)} ({selectedRoute.startTime} – {selectedRoute.endTime})</Typography>
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
    marginBottom: 10,
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
  trainScheduleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF6EE',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4EAD9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  trainIconBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewSchedulePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E6B3F',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
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
  trainTimetableBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8F3',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 10,
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
  trainModalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  trainModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E6ECE8',
    paddingBottom: 14,
  },
  trainTabRow: {
    flexDirection: 'row',
    backgroundColor: '#F0F5F2',
    borderRadius: 12,
    padding: 3,
    marginVertical: 12,
  },
  trainTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  trainTabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  trainTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#69766E',
  },
  trainTabTextActive: {
    color: '#143825',
    fontWeight: '700',
  },
  trainItemCard: {
    backgroundColor: '#F8FAF9',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5EDE7',
    padding: 12,
    marginBottom: 10,
  },
  trainSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8F6',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: '#E2EAE5',
    marginBottom: 12,
  },
  searchTrainSubmitBtn: {
    backgroundColor: '#1E6B3F',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  trainSummaryBanner: {
    backgroundColor: '#EFF8F2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D4EAD9',
    padding: 12,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
  },
  stopNumberCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EAF6EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
