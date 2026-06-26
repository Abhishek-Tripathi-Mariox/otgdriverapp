import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Linking,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenHeader from '../components/ScreenHeader';
import {
  HelpIcon,
  PhoneFilledIcon,
  WhatsappIcon,
  ChevronDownIcon,
} from '../components/DashboardIcons';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { driverApi, HelpSettings } from '../api/client';
import { extractErrorMessage } from '../api/errors';
import { useToast } from '../components/Toast';
import { useAuthStore } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'HelpSupport'>;

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How do I receive new delivery requests?',
    a: 'Turn on your Online status from the home screen. When a new delivery request is available, you will receive a notification and can choose to accept or reject it.',
  },
  {
    q: 'When will I receive my payments?',
    a: 'Payments are credited to your registered bank account within 24 hours of completing a delivery.',
  },
  {
    q: 'What if I face issues during delivery?',
    a: 'You can contact our 24/7 helpline or reach out via WhatsApp for immediate assistance.',
  },
  {
    q: 'How do I update my documents?',
    a: 'Go to Profile → Documents and upload updated copies. Our team will verify them within 24 hours.',
  },
  {
    q: 'What is the delivery OTP for?',
    a: 'The delivery OTP confirms successful handover to the customer. Ask the customer for the OTP before marking the delivery as complete.',
  },
  {
    q: 'Can I reject a delivery request?',
    a: 'Yes, you can reject a request if you are unable to fulfill it. Frequent rejections may affect your rating.',
  },
];

const formatPhoneForDisplay = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  // 10-digit Indian mobile → "+91 XXXXX XXXXX"
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  // 11+ digits already include country code
  if (digits.length > 10) {
    const cc = digits.slice(0, digits.length - 10);
    const ten = digits.slice(-10);
    return `+${cc} ${ten.slice(0, 5)} ${ten.slice(5)}`;
  }
  return raw;
};

const stripCountryCode = (raw: string): string => {
  // For tel:/wa.me links we want a clean E.164-ish form
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

const ContactCard: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  disabled?: boolean;
}> = ({ icon, iconBg, title, subtitle, onPress, disabled }) => (
  <Pressable
    onPress={disabled ? undefined : onPress}
    style={{
      flex: 1,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.14,
      shadowRadius: 5,
      elevation: 2,
      opacity: disabled ? 0.5 : 1,
    }}>
    <View
      style={{
        width: 59.986,
        height: 59.986,
        borderRadius: 29.993,
        backgroundColor: iconBg,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {icon}
    </View>
    <Text
      className="font-poppins-semibold"
      style={{
        color: '#404040',
        fontSize: 18,
        lineHeight: 26,
        textAlign: 'center',
        marginTop: 11.98,
      }}>
      {title}
    </Text>
    <Text
      className="font-poppins-regular"
      style={{
        color: '#757575',
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        marginTop: 4,
      }}>
      {subtitle}
    </Text>
  </Pressable>
);

const FaqItem: React.FC<{
  question: string;
  answer: string;
  expanded: boolean;
  onToggle: () => void;
}> = ({ question, answer, expanded, onToggle }) => (
  <View
    style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.14,
      shadowRadius: 5,
      elevation: 2,
    }}>
    <Pressable
      onPress={onToggle}
      style={{
        backgroundColor: expanded ? '#FFF3E0' : '#FFFFFF',
        minHeight: 48.007,
        paddingHorizontal: 13,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
      <Text
        className="font-poppins-semibold"
        style={{ color: '#404040', fontSize: 16, lineHeight: 24, flex: 1 }}>
        {question}
      </Text>
      <View style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}>
        <ChevronDownIcon size={23.994} color="#757575" />
      </View>
    </Pressable>
    {expanded && (
      <View style={{ backgroundColor: '#FAFAFA', paddingHorizontal: 13, paddingVertical: 12 }}>
        <Text
          className="font-poppins-regular"
          style={{ color: '#404040', fontSize: 14, lineHeight: 25.2 }}>
          {answer}
        </Text>
      </View>
    )}
  </View>
);

const HelpSupportScreen: React.FC<Props> = ({ navigation }) => {
  const driver = useAuthStore(s => s.driver);
  const toast = useToast();
  const [expanded, setExpanded] = useState<number | null>(0);
  const [settings, setSettings] = useState<HelpSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Contact form
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    driverApi
      .helpSettings()
      .then(res => {
        if (cancelled) return;
        if (res.data?.success) setSettings(res.data.data);
      })
      .catch(err => {
        if (cancelled) return;
        toast.error(
          'Could not load contact info',
          extractErrorMessage(err, 'Pull down to retry.'),
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const phone = settings?.mobile?.trim() || '';
  const whatsapp = settings?.whatsappNumber?.trim() || '';
  const email = settings?.email?.trim() || '';
  const address = settings?.address?.trim() || '';

  const handleCall = () => {
    if (!phone) return;
    Linking.openURL(`tel:+${stripCountryCode(phone)}`).catch(() => {});
  };
  const handleWhatsapp = () => {
    if (!whatsapp) return;
    Linking.openURL(`https://wa.me/${stripCountryCode(whatsapp)}`).catch(() => {});
  };
  const handleEmail = () => {
    if (!email) return;
    Linking.openURL(`mailto:${email}`).catch(() => {});
  };

  const handleSubmitTicket = async () => {
    if (!message.trim()) {
      toast.error('Message required', 'Please describe your issue.');
      return;
    }
    const cleanMobile = (driver?.mobile || '').replace(/^\+91/, '').replace(/\s+/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      toast.error('Mobile missing', 'Your registered mobile number is invalid.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await driverApi.submitSupportTicket({
        name: driver?.name?.trim() || 'Driver',
        mobile: cleanMobile,
        email: driver?.email || undefined,
        message: message.trim(),
      });
      setSubmittedCode(res.data?.data?.ticketCode || null);
      setMessage('');
      setShowForm(false);
      toast.success('Message sent', 'Our team will reach out to you shortly.');
    } catch (err: any) {
      toast.error(
        'Could not send',
        extractErrorMessage(err, 'Please try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const hasPhone = phone.length > 0;
  const hasWhatsapp = whatsapp.length > 0;
  const hasEmail = email.length > 0;
  const hasAddress = address.length > 0;

  const phoneDisplay = useMemo(() => (hasPhone ? formatPhoneForDisplay(phone) : ''), [phone, hasPhone]);
  const whatsappDisplay = useMemo(() => (hasWhatsapp ? formatPhoneForDisplay(whatsapp) : ''), [whatsapp, hasWhatsapp]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFE403' }}>
        <ScreenHeader title="Help & Support" onBack={() => navigation.goBack()} />
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 13,
          paddingTop: 39.98,
          paddingBottom: 32,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', gap: 12 }}>
          <View
            style={{
              width: 79.987,
              height: 79.987,
              borderRadius: 39.994,
              backgroundColor: '#E48714',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#E48714',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 6,
            }}>
            <HelpIcon size={39.985} color="#FFFFFF" />
          </View>
          <View style={{ alignItems: 'center', gap: 3.993 }}>
            <Text
              className="font-poppins-bold"
              style={{ color: '#404040', fontSize: 18, lineHeight: 26 }}>
              We're Here to Help
            </Text>
            <Text
              className="font-poppins-regular"
              style={{ color: '#757575', fontSize: 14, lineHeight: 20 }}>
              Contact us anytime for assistance
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <ActivityIndicator color="#E48714" />
          </View>
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <ContactCard
                iconBg="#4CAF50"
                icon={<PhoneFilledIcon size={31.999} color="#FFFFFF" />}
                title="Call Support"
                subtitle={hasPhone ? '24/7 Available' : 'Not available'}
                onPress={handleCall}
                disabled={!hasPhone}
              />
              <ContactCard
                iconBg="#25D366"
                icon={<WhatsappIcon size={31.999} color="#FFFFFF" />}
                title="WhatsApp"
                subtitle={hasWhatsapp ? 'Quick Response' : 'Not available'}
                onPress={handleWhatsapp}
                disabled={!hasWhatsapp}
              />
            </View>

            {(hasPhone || hasWhatsapp || hasEmail || hasAddress) && (
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  padding: 16,
                  gap: 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.14,
                  shadowRadius: 5,
                  elevation: 2,
                }}>
                <Text
                  className="font-poppins-bold"
                  style={{ color: '#404040', fontSize: 18, lineHeight: 26 }}>
                  Contact Numbers
                </Text>
                {hasPhone && (
                  <Pressable onPress={handleCall} style={{ gap: 3.993 }}>
                    <Text
                      className="font-poppins-regular"
                      style={{ color: '#757575', fontSize: 12, lineHeight: 19.92 }}>
                      Helpline (24/7)
                    </Text>
                    <Text
                      className="font-poppins-semibold"
                      style={{ color: '#4CAF50', fontSize: 18, lineHeight: 26 }}>
                      {phoneDisplay}
                    </Text>
                  </Pressable>
                )}
                {hasWhatsapp && (
                  <Pressable onPress={handleWhatsapp} style={{ gap: 3.993 }}>
                    <Text
                      className="font-poppins-regular"
                      style={{ color: '#757575', fontSize: 12, lineHeight: 19.92 }}>
                      WhatsApp Support
                    </Text>
                    <Text
                      className="font-poppins-semibold"
                      style={{ color: '#25D366', fontSize: 18, lineHeight: 26 }}>
                      {whatsappDisplay}
                    </Text>
                  </Pressable>
                )}
                {hasEmail && (
                  <Pressable onPress={handleEmail} style={{ gap: 3.993 }}>
                    <Text
                      className="font-poppins-regular"
                      style={{ color: '#757575', fontSize: 12, lineHeight: 19.92 }}>
                      Email
                    </Text>
                    <Text
                      className="font-poppins-semibold"
                      style={{ color: '#1976D2', fontSize: 16, lineHeight: 24 }}>
                      {email}
                    </Text>
                  </Pressable>
                )}
                {hasAddress && (
                  <View style={{ gap: 3.993 }}>
                    <Text
                      className="font-poppins-regular"
                      style={{ color: '#757575', fontSize: 12, lineHeight: 19.92 }}>
                      Office Address
                    </Text>
                    <Text
                      className="font-poppins-regular"
                      style={{ color: '#404040', fontSize: 14, lineHeight: 22 }}>
                      {address}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}

        <Pressable
          onPress={() => setShowForm(true)}
          style={{
            backgroundColor: '#E48714',
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: 'center',
            shadowColor: '#E48714',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 4,
          }}>
          <Text
            className="font-poppins-semibold"
            style={{ color: '#FFFFFF', fontSize: 16, lineHeight: 24 }}>
            Send Us a Message
          </Text>
        </Pressable>

        <Text
          className="font-poppins-bold"
          style={{ color: '#404040', fontSize: 18, lineHeight: 26 }}>
          Frequently Asked Questions
        </Text>

        <View style={{ gap: 7.99, marginTop: -15.99 }}>
          {FAQS.map((faq, i) => (
            <FaqItem
              key={i}
              question={faq.q}
              answer={faq.a}
              expanded={expanded === i}
              onToggle={() => setExpanded(expanded === i ? null : i)}
            />
          ))}
        </View>

        <View
          style={{
            backgroundColor: '#E3F2FD',
            borderRadius: 12,
            padding: 16,
            gap: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.14,
            shadowRadius: 5,
            elevation: 2,
          }}>
          <Text
            className="font-poppins-bold"
            style={{ color: '#404040', fontSize: 18, lineHeight: 26 }}>
            Need More Help?
          </Text>
          <Text
            className="font-poppins-regular"
            style={{ color: '#404040', fontSize: 14, lineHeight: 25.2 }}>
            Can't find what you're looking for? Our support team is available 24/7 to assist you with any queries or issues. Feel free to reach out via call or WhatsApp.
          </Text>
          {submittedCode && (
            <Text
              className="font-poppins-regular"
              style={{ color: '#757575', fontSize: 12, lineHeight: 20 }}>
              Last ticket: {submittedCode}
            </Text>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showForm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowForm(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.45)',
            justifyContent: 'flex-end',
          }}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 16,
              gap: 12,
            }}>
            <Text
              className="font-poppins-bold"
              style={{ color: '#404040', fontSize: 18, lineHeight: 26 }}>
              Send Us a Message
            </Text>
            <Text
              className="font-poppins-regular"
              style={{ color: '#757575', fontSize: 13, lineHeight: 20 }}>
              We'll respond on your registered mobile {driver?.mobile || ''}.
            </Text>
            <View
              style={{
                backgroundColor: '#F5F5F5',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E0E0E0',
                padding: 12,
                minHeight: 120,
              }}>
              <TextInput
                style={{
                  fontSize: 14,
                  color: '#404040',
                  padding: 0,
                  textAlignVertical: 'top',
                  minHeight: 100,
                }}
                placeholder="Describe your issue..."
                placeholderTextColor="#A0A0A0"
                multiline
                value={message}
                onChangeText={setMessage}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => {
                  setShowForm(false);
                  setMessage('');
                }}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  alignItems: 'center',
                }}>
                <Text
                  className="font-poppins-semibold"
                  style={{ color: '#404040', fontSize: 14 }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={submitting ? undefined : handleSubmitTicket}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: '#E48714',
                  alignItems: 'center',
                  opacity: submitting ? 0.6 : 1,
                }}>
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text
                    className="font-poppins-semibold"
                    style={{ color: '#FFFFFF', fontSize: 14 }}>
                    Send
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HelpSupportScreen;
