import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

type Props = {
  label: string;
  /** ISO YYYY-MM-DD string, or empty/undefined when no date is selected. */
  value?: string;
  onChange: (isoDate: string) => void;
  placeholder?: string;
  /** Earliest selectable date. Defaults to 1900-01-01. */
  minDate?: Date;
  /** Latest selectable date. Defaults to today + 50 years. */
  maxDate?: Date;
  containerStyle?: StyleProp<ViewStyle>;
  error?: string;
};

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const pad = (n: number) => String(n).padStart(2, '0');
const toIso = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromIso = (s?: string): Date | null => {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d.getTime()) ? null : d;
};
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const stripTime = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const Caret = ({ direction }: { direction: 'left' | 'right' }) => (
  <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
    <Path
      d={direction === 'left' ? 'M9 3L4 7L9 11' : 'M5 3L10 7L5 11'}
      stroke="#404040"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CalendarIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
    <Path
      d="M4 3h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
      stroke="#717182"
      strokeWidth={1.4}
    />
    <Path
      d="M3 7h12M6 1.5v3M12 1.5v3"
      stroke="#717182"
      strokeWidth={1.4}
      strokeLinecap="round"
    />
  </Svg>
);

const buildMonthGrid = (year: number, month: number): (Date | null)[] => {
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= lastDate; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

export const DatePickerField: React.FC<Props> = ({
  label,
  value,
  onChange,
  placeholder = 'Select a date',
  minDate,
  maxDate,
  containerStyle,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const today = stripTime(new Date());
  const min = minDate ? stripTime(minDate) : new Date(1900, 0, 1);
  const max = maxDate
    ? stripTime(maxDate)
    : new Date(today.getFullYear() + 50, 11, 31);

  const selected = fromIso(value);
  const initialView = selected || today;
  const [viewYear, setViewYear] = useState(initialView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialView.getMonth());
  const [yearPickerOpen, setYearPickerOpen] = useState(false);

  const grid = useMemo(
    () => buildMonthGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const years = useMemo(() => {
    const arr: number[] = [];
    for (let y = max.getFullYear(); y >= min.getFullYear(); y--) arr.push(y);
    return arr;
  }, [min, max]);

  const display = (() => {
    if (!selected) return placeholder;
    return `${selected.getDate()} ${MONTHS[selected.getMonth()].slice(0, 3)} ${selected.getFullYear()}`;
  })();

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };
  const goNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const isDisabled = (d: Date) => d < min || d > max;

  const handleSelect = (d: Date) => {
    if (isDisabled(d)) return;
    onChange(toIso(d));
    setOpen(false);
  };

  return (
    <View style={[{ gap: 7.986 }, containerStyle]}>
      <Text
        className="font-poppins-medium"
        style={{ color: '#1E293B', fontSize: 14, lineHeight: 14 }}>
        {label}
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          backgroundColor: '#F3F3F5',
          borderRadius: 14,
          borderWidth: 1.162,
          borderColor: error ? '#DC2626' : 'transparent',
          height: 47.989,
          paddingHorizontal: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text
          className="font-poppins-regular"
          style={{
            color: selected ? '#1E293B' : '#717182',
            fontSize: 16,
          }}>
          {display}
        </Text>
        <CalendarIcon />
      </Pressable>
      {error ? (
        <Text
          className="font-poppins-regular"
          style={{ color: '#DC2626', fontSize: 12 }}>
          {error}
        </Text>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            paddingHorizontal: 24,
          }}>
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 18,
              padding: 16,
              gap: 12,
            }}>
            {/* Header: < Month Year > */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 4,
              }}>
              <Pressable
                onPress={goPrev}
                hitSlop={8}
                style={{ padding: 8 }}>
                <Caret direction="left" />
              </Pressable>

              <Pressable
                onPress={() => setYearPickerOpen(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                }}>
                <Text
                  className="font-poppins-semibold"
                  style={{ color: '#1E293B', fontSize: 16 }}>
                  {MONTHS[viewMonth]} {viewYear}
                </Text>
                <Caret direction="right" />
              </Pressable>

              <Pressable
                onPress={goNext}
                hitSlop={8}
                style={{ padding: 8 }}>
                <Caret direction="right" />
              </Pressable>
            </View>

            {/* Weekday header */}
            <View style={{ flexDirection: 'row' }}>
              {WEEKDAYS.map((w, i) => (
                <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                  <Text
                    className="font-poppins-medium"
                    style={{ color: '#717182', fontSize: 12 }}>
                    {w}
                  </Text>
                </View>
              ))}
            </View>

            {/* Day grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {grid.map((d, idx) => {
                if (!d) {
                  return (
                    <View
                      key={idx}
                      style={{ width: `${100 / 7}%`, height: 40 }}
                    />
                  );
                }
                const disabled = isDisabled(d);
                const isSelected = selected && sameDay(d, selected);
                const isToday = sameDay(d, today);

                return (
                  <Pressable
                    key={idx}
                    onPress={() => handleSelect(d)}
                    disabled={disabled}
                    style={{
                      width: `${100 / 7}%`,
                      height: 40,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isSelected ? '#FFE403' : 'transparent',
                        borderWidth: isToday && !isSelected ? 1 : 0,
                        borderColor: '#FFE403',
                      }}>
                      <Text
                        className={
                          isSelected
                            ? 'font-poppins-semibold'
                            : 'font-poppins-regular'
                        }
                        style={{
                          color: disabled
                            ? '#CCCCCC'
                            : isSelected
                              ? '#1E293B'
                              : '#1E293B',
                          fontSize: 14,
                        }}>
                        {d.getDate()}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Footer */}
            <View
              style={{
                flexDirection: 'row',
                gap: 8,
                marginTop: 4,
              }}>
              <Pressable
                onPress={() => setOpen(false)}
                style={{
                  flex: 1,
                  height: 42,
                  borderRadius: 10,
                  borderWidth: 1.2,
                  borderColor: '#E0E0E0',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  className="font-poppins-semibold"
                  style={{ color: '#757575', fontSize: 14 }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  // Pressing "Today" inside bounds.
                  if (today >= min && today <= max) handleSelect(today);
                }}
                style={{
                  flex: 1,
                  height: 42,
                  borderRadius: 10,
                  backgroundColor: '#FFE403',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  className="font-poppins-semibold"
                  style={{ color: '#1E293B', fontSize: 14 }}>
                  Today
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>

        {/* Year picker overlay */}
        <Modal
          visible={yearPickerOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setYearPickerOpen(false)}>
          <Pressable
            onPress={() => setYearPickerOpen(false)}
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              paddingHorizontal: 48,
            }}>
            <Pressable
              onPress={() => {}}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                maxHeight: '70%',
                paddingVertical: 8,
              }}>
              <ScrollView>
                {years.map(y => {
                  const isActive = y === viewYear;
                  return (
                    <Pressable
                      key={y}
                      onPress={() => {
                        setViewYear(y);
                        setYearPickerOpen(false);
                      }}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 24,
                        backgroundColor: isActive ? '#FFFDE3' : 'transparent',
                      }}>
                      <Text
                        className={
                          isActive
                            ? 'font-poppins-semibold'
                            : 'font-poppins-regular'
                        }
                        style={{
                          color: '#1E293B',
                          fontSize: 16,
                          textAlign: 'center',
                        }}>
                        {y}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      </Modal>
    </View>
  );
};

type YearProps = {
  label: string;
  value?: string; // 4-digit year string
  onChange: (year: string) => void;
  minYear?: number;
  maxYear?: number;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
  error?: string;
};

export const YearPickerField: React.FC<YearProps> = ({
  label,
  value,
  onChange,
  minYear = 1980,
  maxYear,
  placeholder = 'Select year',
  containerStyle,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const top = maxYear ?? new Date().getFullYear() + 1;
  const years = useMemo(() => {
    const arr: number[] = [];
    for (let y = top; y >= minYear; y--) arr.push(y);
    return arr;
  }, [top, minYear]);

  return (
    <View style={[{ gap: 7.986 }, containerStyle]}>
      <Text
        className="font-poppins-medium"
        style={{ color: '#1E293B', fontSize: 14, lineHeight: 14 }}>
        {label}
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          backgroundColor: '#F3F3F5',
          borderRadius: 14,
          borderWidth: 1.162,
          borderColor: error ? '#DC2626' : 'transparent',
          height: 47.989,
          paddingHorizontal: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text
          className="font-poppins-regular"
          style={{
            color: value ? '#1E293B' : '#717182',
            fontSize: 16,
          }}>
          {value || placeholder}
        </Text>
        <CalendarIcon />
      </Pressable>
      {error ? (
        <Text
          className="font-poppins-regular"
          style={{ color: '#DC2626', fontSize: 12 }}>
          {error}
        </Text>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            paddingHorizontal: 48,
          }}>
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              maxHeight: '70%',
              paddingVertical: 8,
            }}>
            <ScrollView>
              {years.map(y => {
                const isActive = String(y) === value;
                return (
                  <Pressable
                    key={y}
                    onPress={() => {
                      onChange(String(y));
                      setOpen(false);
                    }}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 24,
                      backgroundColor: isActive ? '#FFFDE3' : 'transparent',
                    }}>
                    <Text
                      className={
                        isActive
                          ? 'font-poppins-semibold'
                          : 'font-poppins-regular'
                      }
                      style={{
                        color: '#1E293B',
                        fontSize: 16,
                        textAlign: 'center',
                      }}>
                      {y}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};
