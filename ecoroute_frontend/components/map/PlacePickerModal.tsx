import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { MapPin, Navigation, Search, X } from 'lucide-react-native';
import { Typography } from '../ui/Typography';
import { PlaceItem, searchPlaces } from '../../lib/api';

interface Props {
  visible: boolean;
  title: string;
  onSelectPlace: (place: PlaceItem) => void;
  onClose: () => void;
}

export function PlacePickerModal({ visible, title, onSelectPlace, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      searchPlaces(query).then((items) => {
        setResults(items);
        setLoading(false);
      });
    }
  }, [visible, query]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(24,35,29,0.45)', justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close" />
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '85%',
            paddingBottom: 28,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 18,
              borderBottomWidth: 1,
              borderBottomColor: '#E6ECE8',
            }}
          >
            <Typography style={{ fontSize: 16, fontWeight: '700', color: '#18231D' }}>
              {title}
            </Typography>
            <Pressable onPress={onClose} hitSlop={10} style={{ padding: 4 }}>
              <X size={20} color="#69766E" />
            </Pressable>
          </View>

          {/* Search Input */}
          <View style={{ paddingHorizontal: 18, paddingTop: 14 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F5F8F6',
                borderRadius: 14,
                paddingHorizontal: 12,
                height: 46,
                borderWidth: 1,
                borderColor: '#E2EAE5',
              }}
            >
              <Search size={18} color="#69766E" style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Search place, area or landmark..."
                placeholderTextColor="#8C9A91"
                value={query}
                onChangeText={setQuery}
                style={{ flex: 1, fontSize: 14, color: '#18231D' }}
                autoFocus
              />
              {query ? (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <X size={16} color="#69766E" />
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* Results List */}
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 12 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Quick current location option */}
            <Pressable
              onPress={() => {
                onSelectPlace({
                  id: 'curr-loc',
                  name: 'NIT Raipur',
                  address: 'Current location (GE Road, Raipur)',
                  lat: 21.2497,
                  lng: 81.6050,
                });
                onClose();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#F0F4F1',
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: '#E6F5EC',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Navigation size={18} color="#1E6B3F" />
              </View>
              <View style={{ flex: 1 }}>
                <Typography style={{ fontSize: 14, fontWeight: '700', color: '#1E6B3F' }}>
                  Use current location
                </Typography>
                <Typography style={{ fontSize: 11, color: '#69766E' }}>
                  NIT Raipur, GE Road
                </Typography>
              </View>
            </Pressable>

            {results.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => {
                  onSelectPlace(p);
                  onClose();
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: '#F0F4F1',
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: '#F3F6F4',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <MapPin size={18} color="#5A6D61" />
                </View>
                <View style={{ flex: 1 }}>
                  <Typography style={{ fontSize: 14, fontWeight: '600', color: '#18231D' }}>
                    {p.name}
                  </Typography>
                  <Typography style={{ fontSize: 11, color: '#69766E', marginTop: 1 }}>
                    {p.address}
                  </Typography>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
