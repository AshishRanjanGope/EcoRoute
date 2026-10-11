import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { EyeOff, Pencil, Trash2, X } from 'lucide-react-native';
import { Typography } from '../ui/Typography';
import type { Trip } from '../../lib/planner/types';
import { C } from './theme';

interface Props {
  visible: boolean;
  trip: Trip | null;
  onEdit: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
  onClose: () => void;
}

export function TripActionModal({ visible, trip, onEdit, onDelete, onClose }: Props) {
  if (!trip) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(24,35,29,0.4)', justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close menu" />
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            paddingBottom: 32,
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View>
              <Typography style={{ fontSize: 16, fontWeight: '700', color: C.text }}>
                {trip.from} ↔ {trip.to}
              </Typography>
              <Typography style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                Trip Actions & Preferences
              </Typography>
            </View>
            <Pressable onPress={onClose} hitSlop={10} style={{ padding: 4 }}>
              <X size={20} color={C.muted} />
            </Pressable>
          </View>

          {/* Action 1: Edit */}
          <Pressable
            onPress={() => {
              onClose();
              onEdit(trip);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 14,
              borderTopWidth: 1,
              borderTopColor: C.border,
            }}
          >
            <Pencil size={18} color={C.text} style={{ marginRight: 12 }} />
            <Typography style={{ fontSize: 15, fontWeight: '600', color: C.text }}>
              Edit trip details
            </Typography>
          </Pressable>

          {/* Action 2: Delete */}
          <Pressable
            onPress={() => {
              onClose();
              onDelete(trip);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 14,
              borderTopWidth: 1,
              borderTopColor: C.border,
            }}
          >
            <Trash2 size={18} color={C.danger} style={{ marginRight: 12 }} />
            <Typography style={{ fontSize: 15, fontWeight: '600', color: C.danger }}>
              Delete trip
            </Typography>
          </Pressable>

          {/* Cancel */}
          <Pressable
            onPress={onClose}
            style={{
              marginTop: 10,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: '#F0F4F1',
              alignItems: 'center',
            }}
          >
            <Typography style={{ fontSize: 14, fontWeight: '600', color: C.muted }}>
              Cancel
            </Typography>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
