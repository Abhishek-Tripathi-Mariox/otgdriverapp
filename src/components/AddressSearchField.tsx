import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from 'react-native';

// Free, no-API-key address search via OpenStreetMap Nominatim — the same
// provider the customer app uses for geocoding. Google Places can replace this
// later without touching the callers (they just receive an address string).
type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  // Optional: receive coordinates when a suggestion is picked (for later map use).
  onSelectLocation?: (loc: { latitude: number; longitude: number }) => void;
  placeholder?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

const MIN_QUERY = 3;
// Nominatim asks for <=1 request/sec; debounce keeps us well under that.
const DEBOUNCE_MS = 600;

const AddressSearchField: React.FC<Props> = ({
  label,
  value,
  onChangeText,
  onSelectLocation,
  placeholder = 'Search address',
  error,
  containerStyle,
}) => {
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Skip the search on the first run (mount) and right after a pick, so a
  // pre-filled / auto-filled value doesn't fire an immediate query.
  const skipNextSearch = useRef(true);

  const runSearch = async (q: string) => {
    setLoading(true);
    try {
      const url =
        'https://nominatim.openstreetmap.org/search?format=jsonv2' +
        '&addressdetails=1&limit=6&countrycodes=in&q=' +
        encodeURIComponent(q);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'OTGDriverApp/1.0 (support@otg.app)',
          'Accept-Language': 'en',
        },
      });
      if (!res.ok) {
        setResults([]);
        return;
      }
      const data = (await res.json()) as NominatimResult[];
      setResults(Array.isArray(data) ? data : []);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce searches off the current value.
  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    const q = value.trim();
    if (q.length < MIN_QUERY) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    timer.current = setTimeout(() => runSearch(q), DEBOUNCE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value]);

  const handleSelect = (item: NominatimResult) => {
    skipNextSearch.current = true;
    onChangeText(item.display_name);
    onSelectLocation?.({
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    });
    setResults([]);
    setOpen(false);
  };

  return (
    <View style={[{ gap: 7.986 }, containerStyle]}>
      <Text
        className="font-poppins-medium"
        style={{ color: '#1E293B', fontSize: 14, lineHeight: 14 }}>
        {label}
      </Text>
      <View
        style={{
          backgroundColor: '#F3F3F5',
          borderRadius: 14,
          borderWidth: 1.162,
          borderColor: error ? '#DC2626' : 'transparent',
          minHeight: 47.989,
          paddingHorizontal: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}>
        <TextInput
          className="font-poppins-regular"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          placeholderTextColor="#717182"
          multiline
          style={{
            flex: 1,
            color: '#1E293B',
            fontSize: 16,
            paddingVertical: 12,
            padding: 0,
          }}
        />
        {loading ? <ActivityIndicator size="small" color="#717182" /> : null}
      </View>

      {open && results.length > 0 ? (
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            overflow: 'hidden',
          }}>
          {results.map((item, idx) => (
            <Pressable
              key={item.place_id}
              onPress={() => handleSelect(item)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 11,
                borderTopWidth: idx === 0 ? 0 : 1,
                borderTopColor: '#F0F0F0',
              }}>
              <Text
                className="font-poppins-regular"
                numberOfLines={2}
                style={{ color: '#1E293B', fontSize: 13, lineHeight: 18 }}>
                {item.display_name}
              </Text>
            </Pressable>
          ))}
          <Text
            className="font-poppins-regular"
            style={{
              color: '#9CA3AF',
              fontSize: 10,
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: '#FAFAFA',
            }}>
            Powered by OpenStreetMap
          </Text>
        </View>
      ) : null}

      {error ? (
        <Text
          className="font-poppins-regular"
          style={{ color: '#DC2626', fontSize: 12 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

export default AddressSearchField;
