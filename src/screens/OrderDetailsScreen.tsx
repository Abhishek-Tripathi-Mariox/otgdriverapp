import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Rect } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  BoxIcon,
} from '../components/DashboardIcons';
import { Pressable } from 'react-native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { driverApi, type OrderSummary } from '../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetails'>;

// ISO date -> "12 Jun 2026, 11:45 AM"
const formatOrderDate = (iso?: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const date = d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${date}, ${time}`;
};

const DELIVERED = { start: '#4CAF50', end: '#8BC34A', label: 'Delivered Successfully' };
const REJECTED = { start: '#F44336', end: '#FF5722', label: 'Order Rejected' };
const ACTIVE = { start: '#2196F3', end: '#42A5F5', label: 'Out for Delivery' };

const GradientHeader: React.FC<{
  variant: 'delivered' | 'rejected' | 'active';
  onBack: () => void;
  orderId: string;
  date: string;
}> = ({ variant, onBack, orderId, date }) => {
  const palette =
    variant === 'delivered' ? DELIVERED : variant === 'active' ? ACTIVE : REJECTED;
  return (
    <View style={{ position: 'relative' }}>
      <Svg
        width="100%"
        height={191.955}
        style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        <Defs>
          <SvgGradient id="hdr" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={palette.start} />
            <Stop offset="1" stopColor={palette.end} />
          </SvgGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#hdr)" />
      </Svg>
      <View style={{ paddingHorizontal: 13, paddingTop: 12, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={onBack}
            style={{
              width: 39.966,
              height: 39.966,
              borderRadius: 19.983,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <ArrowLeftIcon size={23.994} color="#FFFFFF" />
          </Pressable>
          <Text
            className="font-poppins-bold"
            style={{ color: '#FFFFFF', fontSize: 18, lineHeight: 26, marginLeft: 15.99 }}>
            Order Details
          </Text>
        </View>

        <View style={{ alignItems: 'center', marginTop: 15.99, gap: 7.99 }}>
          {variant === 'delivered' ? (
            <CheckCircleIcon size={59.986} />
          ) : variant === 'active' ? (
            <BoxIcon size={59.986} color="#FFFFFF" />
          ) : (
            <XCircleIcon size={59.986} color="#FFFFFF" />
          )}
          <Text
            className="font-poppins-bold"
            style={{ color: '#FFFFFF', fontSize: 18, lineHeight: 28 }}>
            {palette.label}
          </Text>
          <Text
            className="font-poppins-regular"
            style={{ color: '#FFFFFF', fontSize: 14, lineHeight: 20, opacity: 0.9 }}>
            #{orderId} • {date}
          </Text>
        </View>
      </View>
    </View>
  );
};

const InfoCard: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  title: string;
  subtitle?: string;
}> = ({ icon, iconBg, label, title, subtitle }) => (
  <View
    style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 12,
      flexDirection: 'row',
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.14,
      shadowRadius: 5,
      elevation: 2,
    }}>
    <View
      style={{
        width: 47.995,
        height: 47.995,
        borderRadius: 23.994,
        backgroundColor: iconBg,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {icon}
    </View>
    <View style={{ flex: 1, gap: 3.993 }}>
      <Text
        className="font-poppins-regular"
        style={{ color: '#757575', fontSize: 12, lineHeight: 19.92 }}>
        {label}
      </Text>
      <Text
        className="font-poppins-semibold"
        style={{ color: '#404040', fontSize: 16, lineHeight: 24 }}>
        {title}
      </Text>
      {subtitle && (
        <Text
          className="font-poppins-regular"
          style={{ color: '#757575', fontSize: 14, lineHeight: 20 }}>
          {subtitle}
        </Text>
      )}
    </View>
  </View>
);

const OrderDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { orderId, variant, order: initialOrder } = route.params;
  const isDelivered = variant === 'delivered';
  const isRejected = variant === 'rejected';
  const accent = isDelivered ? '#4CAF50' : variant === 'active' ? '#2196F3' : '#F44336';

  const [order, setOrder] = useState<OrderSummary | null>(initialOrder ?? null);

  // Fetch the live order so pickup/drop/material/earnings are real, not mock.
  // Falls back to the order passed in via navigation if the fetch fails.
  useEffect(() => {
    let cancelled = false;
    driverApi
      .getOrder(orderId)
      .then(res => {
        if (!cancelled && res.data?.data) setOrder(res.data.data);
      })
      .catch(() => {
        /* keep the order passed from the list */
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const dateLabel = formatOrderDate(order?.date);
  const materialTitle = order?.material
    ? `${order.material}${
        order.quantity ? ` (${order.quantity}${order.unit ? ` ${order.unit}` : ''})` : ''
      }`
    : 'Material details unavailable';
  const earningsLabel = `₹${(order?.earnings ?? 0).toLocaleString('en-IN')}`;

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: accent }} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}>
        <GradientHeader
          variant={variant}
          onBack={() => navigation.goBack()}
          orderId={orderId}
          date={dateLabel}
        />

        <View style={{ paddingHorizontal: 13, paddingTop: 16, gap: 12 }}>
          <InfoCard
            icon={<MapPinIcon size={23.994} color="#FFFFFF" />}
            iconBg="#2196F3"
            label="Pickup Location"
            title={order?.pickup || 'Pickup location unavailable'}
          />
          <InfoCard
            icon={<MapPinIcon size={23.994} color="#FFFFFF" />}
            iconBg="#E48714"
            label="Drop Location"
            title={order?.drop || 'Drop location unavailable'}
          />
          <InfoCard
            icon={<BoxIcon size={23.994} color="#FFFFFF" />}
            iconBg="#E48714"
            label="Material Details"
            title={materialTitle}
          />

          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.14,
              shadowRadius: 5,
              elevation: 2,
              gap: 9,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text
                className="font-poppins-regular"
                style={{ color: '#757575', fontSize: 14, lineHeight: 22.4 }}>
                Total Earnings
              </Text>
              <Text
                className="font-poppins-bold"
                style={{
                  color: accent,
                  fontSize: 18,
                  lineHeight: 28,
                }}>
                {earningsLabel}
              </Text>
            </View>
          </View>

          {isRejected && (
            <View
              style={{
                backgroundColor: '#FFEBEE',
                borderRadius: 12,
                padding: 12,
                gap: 7.99,
                borderLeftWidth: 4,
                borderLeftColor: '#F44336',
              }}>
              <Text
                className="font-poppins-bold"
                style={{ color: '#F44336', fontSize: 16, lineHeight: 24 }}>
                Order Not Completed
              </Text>
              <Text
                className="font-poppins-regular"
                style={{ color: '#404040', fontSize: 14, lineHeight: 22.4 }}>
                This order was cancelled and is no longer assigned to you.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default OrderDetailsScreen;
