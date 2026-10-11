import React from 'react';
import { View } from 'react-native';
import { Clock, Coins, Cloud, Leaf, TreePine } from 'lucide-react-native';
import { Typography } from '../ui/Typography';
import type { PlanResult } from '../../lib/planner/estimate';
import { C } from './theme';

interface Props {
  stats: PlanResult;
}

export function ImpactCard({ stats }: Props) {
  return (
    <View
      style={{
        backgroundColor: C.impactCardBg,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: C.impactCardBorder,
        padding: 16,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative leaf motifs in top right */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -6,
          right: -4,
          opacity: 0.18,
          transform: [{ rotate: '25deg' }],
        }}
      >
        <Leaf size={58} color="#218653" />
      </View>

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
        <Leaf size={16} color={C.primaryDark} style={{ marginRight: 6 }} />
        <Typography style={{ fontSize: 13, fontWeight: '700', color: '#1E5C38' }}>
          Estimated impact (per 30 days)
        </Typography>
      </View>

      {/* 4 Stats Columns */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Metric 1: Total Cost */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Coins size={20} color={C.primaryDark} />
          <Typography style={{ fontSize: 15, fontWeight: '800', color: C.text, marginTop: 6 }}>
            ₹ {stats.cost.toLocaleString('en-IN')}
          </Typography>
          <Typography style={{ fontSize: 11, color: '#5E7166', marginTop: 2 }}>
            Total cost
          </Typography>
        </View>

        {/* Metric 2: CO2 Prevented */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Cloud size={20} color={C.primaryDark} />
            <Typography
              style={{
                position: 'absolute',
                fontSize: 7,
                fontWeight: '800',
                color: C.primaryDark,
                top: 6,
              }}
            >
              co₂
            </Typography>
          </View>
          <Typography style={{ fontSize: 15, fontWeight: '800', color: C.text, marginTop: 6 }}>
            {stats.co2Prevented} kg
          </Typography>
          <Typography style={{ fontSize: 11, color: '#5E7166', marginTop: 2 }}>
            CO₂ prevented
          </Typography>
        </View>

        {/* Metric 3: Time Saved */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Clock size={20} color={C.primaryDark} />
          <Typography style={{ fontSize: 15, fontWeight: '800', color: C.text, marginTop: 6 }}>
            {stats.timeSaved} hrs
          </Typography>
          <Typography style={{ fontSize: 11, color: '#5E7166', marginTop: 2 }}>
            Time saved
          </Typography>
        </View>

        {/* Metric 4: Trees Equivalent */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <TreePine size={20} color={C.primaryDark} />
          <Typography style={{ fontSize: 15, fontWeight: '800', color: C.text, marginTop: 6 }}>
            {stats.trees}
          </Typography>
          <Typography style={{ fontSize: 11, color: '#5E7166', marginTop: 2 }}>
            Trees equivalent
          </Typography>
        </View>
      </View>
    </View>
  );
}
