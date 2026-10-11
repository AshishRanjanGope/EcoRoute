import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Sparkles, Sprout, User } from 'lucide-react-native';

import { Typography } from '../../components/ui/Typography';
import { EcoLeafLogo } from '../../components/planner/EcoLeafLogo';
import { MonthCalendar } from '../../components/planner/MonthCalendar';
import { MonthYearPicker } from '../../components/planner/MonthYearPicker';
import { PatternCard } from '../../components/planner/PatternCard';
import { PatternPresetModal } from '../../components/planner/PatternPresetModal';
import { RecurringTripsCard } from '../../components/planner/RecurringTripsCard';
import { ImpactCard } from '../../components/planner/ImpactCard';
import { GeneratePlanModal } from '../../components/planner/GeneratePlanModal';
import { TripActionModal } from '../../components/planner/TripActionModal';
import { DayDetailModal } from '../../components/planner/DayDetailModal';
import { TripSheet } from '../../components/planner/TripSheet';
import { C } from '../../components/planner/theme';

import { MONTH_NAMES, parseKey, shiftMonth, toKey } from '../../lib/planner/dates';
import { describeRepeat, monthCounts, tripsForDay } from '../../lib/planner/schedule';
import { simulatePlan } from '../../lib/planner/estimate';
import { usePlannerTrips } from '../../lib/planner/storage';
import type { Trip } from '../../lib/planner/types';

function confirm(title: string, message: string, onYes: () => void) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) onYes();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onYes },
  ]);
}

export default function PlannerScreen() {
  const router = useRouter();
  const {
    trips,
    patternDays,
    setPatternDays,
    togglePatternDay,
    upsertTrip,
    deleteTrip,
    toggleSkip,
  } = usePlannerTrips();

  // Initialize view to October 2025 to match mockup specifications
  const [view, setView] = useState({ y: 2025, m: 9 });
  const [selectedKey, setSelectedKey] = useState('2025-10-06');

  // Modal states
  const [pickerOpen, setPickerOpen] = useState(false);
  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [generatePlanModalOpen, setGeneratePlanModalOpen] = useState(false);
  const [actionTrip, setActionTrip] = useState<Trip | null>(null);
  const [sheet, setSheet] = useState<{ open: boolean; trip?: Trip; preset?: 'once' | 'weekdays' }>({ open: false });

  const { y, m } = view;

  // Schedule, counts & impact metrics
  const counts = useMemo(() => monthCounts(trips, y, m), [trips, y, m]);
  const dayEntries = useMemo(() => tripsForDay(trips, selectedKey), [trips, selectedKey]);
  const stats = useMemo(() => simulatePlan(trips, y, m), [trips, y, m]);
  const recurring = useMemo(() => trips.filter((t) => t.repeat !== 'once'), [trips]);
  const recentPlaces = useMemo(
    () => Array.from(new Set(trips.flatMap((t) => [t.from, t.to]))),
    [trips],
  );

  const goToMonth = useCallback((ny: number, nm: number) => {
    setView({ y: ny, m: nm });
    setSelectedKey(toKey(ny, nm, 1));
  }, []);

  const step = (n: number) => {
    const next = shiftMonth(y, m, n);
    goToMonth(next.y, next.m);
  };

  const openNew = (preset: 'once' | 'weekdays') => setSheet({ open: true, preset });
  const closeSheet = () => setSheet((s) => ({ ...s, open: false }));

  const handleSave = (trip: Trip) => {
    upsertTrip(trip);
    closeSheet();
    const start = parseKey(trip.startDate);
    if (start.y !== y || start.m !== m) goToMonth(start.y, start.m);
    setSelectedKey(trip.startDate);
  };

  const handleDelete = (trip: Trip) =>
    confirm(
      trip.repeat === 'once' ? 'Delete trip?' : 'Delete whole series?',
      trip.repeat === 'once'
        ? `${trip.from} ↔ ${trip.to}`
        : `${trip.from} ↔ ${trip.to} (${describeRepeat(trip)}) will be removed.`,
      () => deleteTrip(trip.id),
    );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const selectedIsOtherMonth = parseKey(selectedKey).m !== m;
  const sheetDateKey = selectedIsOtherMonth ? toKey(y, m, 1) : selectedKey;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: 56 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header matching exact mockup */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          {/* Back button */}
          <Pressable
            onPress={handleBack}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={{ padding: 6, marginLeft: -6 }}
          >
            <ArrowLeft size={24} color={C.text} />
          </Pressable>

          {/* Logo + Title + Subtitle */}
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={{ width: 34, height: 34, borderRadius: 8, marginRight: 10 }}
              resizeMode="contain"
            />
            <View>
              <Typography style={{ fontSize: 18, fontWeight: '800', color: C.text }}>
                30-Day Planner
              </Typography>
              <Typography style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>
                Plan your trips for a greener tomorrow.
              </Typography>
            </View>
          </View>



          {/* Profile Avatar icon in light green circle */}
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            accessibilityRole="button"
            accessibilityLabel="Go to Profile"
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: C.tintSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <User size={20} color={C.primary} />
          </Pressable>
        </View>

        {/* Card 1: Month Calendar */}
        <View style={{ marginBottom: 14 }}>
          <MonthCalendar
            year={y}
            month={m}
            selectedKey={selectedKey}
            counts={counts}
            onSelect={(key) => {
              setSelectedKey(key);
              setDayModalOpen(true);
            }}
            onPrev={() => step(-1)}
            onNext={() => step(1)}
            onTitlePress={() => setPickerOpen(true)}
          />
        </View>

        {/* Card 2: Weekday / Weekend Pattern */}
        <View style={{ marginBottom: 14 }}>
          <PatternCard
            patternDays={patternDays}
            onToggleDay={togglePatternDay}
            onOpenPresets={() => setPresetModalOpen(true)}
          />
        </View>

        {/* Card 3: Recurring Trips */}
        <View style={{ marginBottom: 14 }}>
          <RecurringTripsCard
            trips={recurring}
            onAddOneOff={() => openNew('once')}
            onEdit={(trip) => setSheet({ open: true, trip })}
            onOpenActions={(trip) => setActionTrip(trip)}
          />
        </View>

        {/* Card 4: Estimated Impact (per 30 days) */}
        <View style={{ marginBottom: 16 }}>
          <ImpactCard stats={stats} />
        </View>

        {/* Bottom CTA: Generate my plan */}
        <Pressable
          onPress={() => setGeneratePlanModalOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Generate my plan"
          style={{
            backgroundColor: C.darkGreen,
            height: 52,
            borderRadius: 26,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: C.darkGreen,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Sparkles size={18} color="#A3E8B8" style={{ marginRight: 8 }} />
          <Typography style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
            Generate my plan
          </Typography>
        </Pressable>
      </ScrollView>

      {/* Month Year Picker Dialog */}
      <MonthYearPicker
        visible={pickerOpen}
        year={y}
        month={m}
        onClose={() => setPickerOpen(false)}
        onPick={(ny, nm) => {
          setPickerOpen(false);
          goToMonth(ny, nm);
        }}
      />

      {/* Pattern Preset Picker */}
      <PatternPresetModal
        visible={presetModalOpen}
        activeDays={patternDays}
        onSelectPreset={setPatternDays}
        onClose={() => setPresetModalOpen(false)}
      />

      {/* Day Details Modal */}
      <DayDetailModal
        visible={dayModalOpen}
        dateKey={selectedKey}
        entries={dayEntries}
        onAdd={() => openNew('once')}
        onEdit={(trip) => setSheet({ open: true, trip })}
        onToggleSkip={(trip) => toggleSkip(trip.id, selectedKey)}
        onDelete={handleDelete}
        onClose={() => setDayModalOpen(false)}
      />

      {/* Trip Actions Menu (3-dots) */}
      <TripActionModal
        visible={!!actionTrip}
        trip={actionTrip}
        onEdit={(trip) => {
          setActionTrip(null);
          setSheet({ open: true, trip });
        }}
        onDelete={(trip) => {
          setActionTrip(null);
          handleDelete(trip);
        }}
        onClose={() => setActionTrip(null)}
      />

      {/* Trip Edit & Create Sheet */}
      <TripSheet
        visible={sheet.open}
        dateKey={sheetDateKey}
        initial={sheet.trip}
        defaultPreset={sheet.preset}
        recentPlaces={recentPlaces}
        onSave={handleSave}
        onClose={closeSheet}
      />

      {/* Generated 30-Day Plan Modal */}
      <GeneratePlanModal
        visible={generatePlanModalOpen}
        monthName={MONTH_NAMES[m]}
        year={y}
        stats={stats}
        onClose={() => setGeneratePlanModalOpen(false)}
      />
    </SafeAreaView>
  );
}
