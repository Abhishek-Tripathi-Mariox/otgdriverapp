import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';

type TabKey = 'daily' | 'weekly' | 'monthly';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
];

type PeriodData = { trips: number; earnings: string };

type Props = {
  // Per-period data for the Daily / Weekly / Monthly tabs.
  periods: Record<TabKey, PeriodData>;
  pendingPayout: string;
};

const EarningsSnapshotCard: React.FC<Props> = ({ periods, pendingPayout }) => {
  const [active, setActive] = useState<TabKey>('daily');
  const current = periods[active];

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.14,
        shadowRadius: 5,
        elevation: 3,
      }}>
      <Text
        className="font-poppins-bold"
        style={{ color: '#404040', fontSize: 18, lineHeight: 26 }}>
        Earnings Snapshot
      </Text>

      <View
        style={{
          flexDirection: 'row',
          height: 41.473,
          borderBottomWidth: 1.997,
          borderBottomColor: 'rgba(0,0,0,0.05)',
        }}>
        {TABS.map(tab => {
          const isActive = tab.key === active;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActive(tab.key)}
              style={{
                width: 89.988,
                alignItems: 'center',
                justifyContent: 'center',
                borderBottomWidth: isActive ? 1.997 : 0,
                borderBottomColor: '#FFE403',
              }}>
              <Text
                className="font-poppins-semibold"
                style={{
                  color: isActive ? '#FFE403' : '#757575',
                  fontSize: 14,
                  lineHeight: 17.5,
                  textAlign: 'center',
                }}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <View style={{ gap: 3.993 }}>
          <Text
            className="font-poppins-regular"
            style={{ color: '#757575', fontSize: 14, lineHeight: 20 }}>
            Total Trips
          </Text>
          <Text
            className="font-poppins-bold"
            style={{ color: '#404040', fontSize: 18, lineHeight: 26 }}>
            {current.trips}
          </Text>
        </View>
        <View style={{ gap: 3.993, alignItems: 'flex-end' }}>
          <Text
            className="font-poppins-regular"
            style={{ color: '#757575', fontSize: 14, lineHeight: 20 }}>
            Total Earnings
          </Text>
          <Text
            className="font-poppins-bold"
            style={{ color: '#4caf50', fontSize: 18, lineHeight: 26 }}>
            {current.earnings}
          </Text>
        </View>
      </View>

      <View style={{ height: 1.162, backgroundColor: 'rgba(0,0,0,0.12)' }} />

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Text
          className="font-poppins-regular"
          style={{ color: '#757575', fontSize: 14, lineHeight: 20 }}>
          Pending Payout
        </Text>
        <Text
          className="font-poppins-semibold"
          style={{ color: '#E48714', fontSize: 16, lineHeight: 24 }}>
          {pendingPayout}
        </Text>
      </View>
    </View>
  );
};

export default EarningsSnapshotCard;
