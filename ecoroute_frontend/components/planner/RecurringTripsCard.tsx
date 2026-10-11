import React from 'react';
import { Pressable, View } from 'react-native';
import { Briefcase, ChevronRight, Home, MoreVertical, RefreshCw } from 'lucide-react-native';
import { Typography } from '../ui/Typography';
import { formatTripDays } from '../../lib/planner/schedule';
import type { Trip } from '../../lib/planner/types';
import { C, cardStyle } from './theme';

interface Props {
  trips: Trip[];
  onAddOneOff: () => void;
  onEdit: (trip: Trip) => void;
  onOpenActions: (trip: Trip) => void;
}

export function RecurringTripsCard({ trips, onAddOneOff, onEdit, onOpenActions }: Props) {
  // If trips list has recurring trips, show them; otherwise fallback to all trips
  const displayTrips = trips.filter((t) => t.repeat !== 'once');
  const items = displayTrips.length > 0 ? displayTrips : trips;

  return (
    <View style={cardStyle}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <RefreshCw size={18} color={C.text} style={{ marginRight: 8 }} />
          <Typography style={{ fontSize: 15, fontWeight: '700', color: C.text }}>
            Recurring Trips
          </Typography>
        </View>

        <Pressable
          onPress={onAddOneOff}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Add one-off trip"
        >
          <Typography style={{ fontSize: 13, fontWeight: '600', color: C.primary }}>
            + Add one-off trip
          </Typography>
        </Pressable>
      </View>

      {/* Trips list */}
      {items.length === 0 ? (
        <View style={{ paddingVertical: 14, alignItems: 'center' }}>
          <Typography style={{ color: C.muted, fontSize: 13, marginBottom: 8 }}>
            No recurring trips set yet.
          </Typography>
          <Pressable onPress={onAddOneOff} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: C.tintSoft }}>
            <Typography style={{ color: C.primary, fontWeight: '600', fontSize: 13 }}>
              + Add your first commute
            </Typography>
          </Pressable>
        </View>
      ) : (
        items.map((trip, idx) => {
          const isWork =
            trip.icon === 'briefcase' ||
            trip.to.toLowerCase().includes('work') ||
            trip.from.toLowerCase().includes('work');

          return (
            <View
              key={trip.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#FAFCFA',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#EDF2EE',
                padding: 12,
                marginBottom: idx === items.length - 1 ? 0 : 10,
              }}
            >
              {/* Three dots menu */}
              <Pressable
                onPress={() => onOpenActions(trip)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={`Options for trip ${trip.from} to ${trip.to}`}
                style={{ padding: 4, marginRight: 6 }}
              >
                <MoreVertical size={18} color={C.subtle} />
              </Pressable>

              {/* Main content button */}
              <Pressable
                onPress={() => onEdit(trip)}
                accessibilityRole="button"
                accessibilityLabel={`Edit trip ${trip.from} to ${trip.to}`}
                style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
              >
                {/* Circular Icon Badge */}
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: C.tint,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  {isWork ? (
                    <Briefcase size={20} color={C.primaryDark} />
                  ) : (
                    <Home size={20} color={C.primaryDark} />
                  )}
                </View>

                {/* Origin <-> Destination & Days */}
                <View style={{ flex: 1, paddingRight: 6 }}>
                  <Typography style={{ fontSize: 15, fontWeight: '700', color: C.text }} numberOfLines={1}>
                    {trip.from} ↔ {trip.to}
                  </Typography>
                  <Typography style={{ fontSize: 12, color: '#6B7E73', marginTop: 2 }} numberOfLines={1}>
                    {formatTripDays(trip)}
                  </Typography>
                </View>

                {/* Chevron Right */}
                <ChevronRight size={18} color={C.subtle} />
              </Pressable>
            </View>
          );
        })
      )}
    </View>
  );
}
