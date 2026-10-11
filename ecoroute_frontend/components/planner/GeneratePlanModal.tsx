import React from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { CheckCircle2, Download, Sparkles, X, Share2, Award, ArrowRight } from 'lucide-react-native';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import type { PlanResult } from '../../lib/planner/estimate';
import { C } from './theme';

interface Props {
  visible: boolean;
  monthName: string;
  year: number;
  stats: PlanResult;
  onClose: () => void;
}

export function GeneratePlanModal({ visible, monthName, year, stats, onClose }: Props) {
  const savings = Math.max(0, stats.baselineCost - stats.cost);

  const handleDownload = () => {
    const msg = `Plan PDF Report for ${monthName} ${year} generated with ₹${stats.cost} estimated cost and ${stats.co2Prevented}kg CO₂ offset.`;
    if (Platform.OS === 'web') {
      alert(msg);
    } else {
      Alert.alert('Report Generated', msg);
    }
  };

  const handleShare = () => {
    const msg = `I planned my green commute for ${monthName} ${year} on EcoRoute! Saving ₹${savings} & ${stats.co2Prevented}kg CO₂.`;
    if (Platform.OS === 'web') {
      alert(msg);
    } else {
      Alert.alert('Share Plan', msg);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(24,35,29,0.5)', justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close" />
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: '90%',
            paddingBottom: 24,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 14,
              borderBottomWidth: 1,
              borderBottomColor: C.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: C.tint,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                <Sparkles size={18} color={C.primaryDark} />
              </View>
              <View>
                <Typography style={{ fontSize: 18, fontWeight: '800', color: C.text }}>
                  {monthName} {year} Eco Plan
                </Typography>
                <Typography style={{ fontSize: 12, color: C.primary, fontWeight: '700' }}>
                  Optimal 30-Day Transit Strategy
                </Typography>
              </View>
            </View>

            <Pressable onPress={onClose} hitSlop={10} style={{ padding: 6 }}>
              <X size={22} color={C.muted} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Success banner */}
            <View
              style={{
                backgroundColor: C.tintSoft,
                borderRadius: 16,
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
                borderWidth: 1,
                borderColor: C.tint,
              }}
            >
              <CheckCircle2 size={24} color={C.primary} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Typography style={{ fontSize: 14, fontWeight: '700', color: C.primaryDark }}>
                  Personalized Plan Generated
                </Typography>
                <Typography style={{ fontSize: 12, color: '#3C5045' }}>
                  Tailored for your recurring commutes and weekday schedule.
                </Typography>
              </View>
            </View>

            {/* Impact Highlights Grid */}
            <View
              style={{
                backgroundColor: C.impactCardBg,
                borderRadius: 18,
                padding: 16,
                borderWidth: 1,
                borderColor: C.impactCardBorder,
                marginBottom: 16,
              }}
            >
              <Typography style={{ fontSize: 13, fontWeight: '700', color: C.primaryDark, marginBottom: 12 }}>
                Monthly Impact Summary
              </Typography>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                <StatTile
                  title="Monthly Cost"
                  val={`₹ ${stats.cost.toLocaleString('en-IN')}`}
                  sub={savings > 0 ? `Saves ₹${savings.toLocaleString('en-IN')}` : undefined}
                />
                <StatTile
                  title="CO₂ Offset"
                  val={`${stats.co2Prevented} kg`}
                  sub={`≈ ${stats.trees} Trees planted`}
                  highlight
                />
                <StatTile
                  title="Travel Time Saved"
                  val={`${stats.timeSaved} hrs`}
                  sub="via transit corridors"
                />
                <StatTile
                  title="Planned Trips"
                  val={`${stats.legs} legs`}
                  sub="across commute days"
                />
              </View>
            </View>

            {/* Recommended Pass */}
            <Typography style={{ fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 8 }}>
              Recommended Transit Pass
            </Typography>
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: C.border,
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Typography style={{ fontSize: 16, fontWeight: '700', color: C.primaryDark }}>
                  30-Day Metro & Shuttle Smart Pass
                </Typography>
                <Award size={20} color={C.primary} />
              </View>
              <Typography style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
                Includes unlimited Metro rides on the Vanaz-Ramwadi corridor + EV campus feeder shuttles.
              </Typography>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F4F1', paddingTop: 10 }}>
                <Typography style={{ fontSize: 12, color: C.muted }}>Recommended Monthly Mix:</Typography>
                <Typography style={{ fontSize: 12, fontWeight: '700', color: C.text }}>
                  {stats.mix.map((m) => `${m.pct}% ${m.label}`).join(' + ')}
                </Typography>
              </View>
            </View>

            {/* Action buttons */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
              <Button
                variant="outline"
                style={{ flex: 1 }}
                icon={<Download size={16} color={C.text} style={{ marginRight: 6 }} />}
                title="Download PDF"
                onPress={handleDownload}
              />
              <Button
                variant="outline"
                style={{ flex: 1 }}
                icon={<Share2 size={16} color={C.text} style={{ marginRight: 6 }} />}
                title="Share"
                onPress={handleShare}
              />
            </View>

            <Pressable
              onPress={onClose}
              style={{
                backgroundColor: C.darkGreen,
                height: 48,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 12,
              }}
            >
              <Typography style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>
                Apply Plan & Done
              </Typography>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function StatTile({ title, val, sub, highlight }: { title: string; val: string; sub?: string; highlight?: boolean }) {
  return (
    <View style={{ flex: 1, minWidth: '45%', backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5ECE7' }}>
      <Typography style={{ fontSize: 11, color: C.muted }}>{title}</Typography>
      <Typography style={{ fontSize: 16, fontWeight: '800', color: highlight ? C.primary : C.text, marginTop: 2 }}>
        {val}
      </Typography>
      {sub && <Typography style={{ fontSize: 10, color: C.primaryDark, marginTop: 2 }}>{sub}</Typography>}
    </View>
  );
}
