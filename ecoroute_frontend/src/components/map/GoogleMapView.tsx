import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { ExternalLink, Layers, LocateFixed, MapPin } from 'lucide-react-native';
import { Typography } from '../ui/Typography';
import { GOOGLE_MAPS_API_KEY } from '../../lib/config';

export interface MapCoordinate {
  lat: number;
  lng: number;
  name: string;
}

interface Props {
  origin: MapCoordinate;
  destination: MapCoordinate;
  onSelectCoordinate?: (coord: MapCoordinate) => void;
  onLocatePress?: () => void;
}

export function GoogleMapView({ origin, destination, onSelectCoordinate, onLocatePress }: Props) {
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');

  const isWeb = Platform.OS === 'web';
  const apiKey = GOOGLE_MAPS_API_KEY?.trim() || '';

  // Google Maps Embed URL (Real live Google Maps showing Raipur route & satellite toggle)
  const embedUrl = useMemo(() => {
    const originCoords = `${origin.lat},${origin.lng}`;
    const destCoords = `${destination.lat},${destination.lng}`;
    const layerParam = mapType === 'satellite' ? '&t=k' : '';

    if (apiKey.length > 15) {
      const originQuery = encodeURIComponent(origin.name || originCoords);
      const destQuery = encodeURIComponent(destination.name || destCoords);
      const modeParam = mapType === 'satellite' ? '&maptype=satellite' : '';
      return `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${originQuery}&destination=${destQuery}&mode=driving${modeParam}`;
    }

    return `https://maps.google.com/maps?saddr=${originCoords}&daddr=${destCoords}&z=13${layerParam}&output=embed`;
  }, [origin, destination, apiKey, mapType]);

  // Mobile HTML container to embed real Google Maps inside native WebView cleanly
  const mobileHtml = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <style>
            * { box-sizing: border-box; }
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              overflow: hidden;
              background-color: #E5E3DF;
            }
            iframe {
              width: 100%;
              height: 100%;
              border: 0;
              display: block;
            }
          </style>
        </head>
        <body>
          <iframe
            src="${embedUrl}"
            allowfullscreen
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </body>
      </html>
    `;
  }, [embedUrl]);

  const handleOpenGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.container}>
      {/* 1. Web Platform: Interactive iframe */}
      {isWeb ? (
        <View style={StyleSheet.absoluteFill}>
          {React.createElement('iframe', {
            src: embedUrl,
            style: {
              width: '100%',
              height: '100%',
              border: 0,
            },
            loading: 'lazy',
            allowFullScreen: true,
            referrerPolicy: 'no-referrer-when-downgrade',
            title: 'Google Maps View',
          })}
        </View>
      ) : (
        /* 2. Mobile Platform (Android / iOS): Real Google Maps rendered natively in WebView */
        <View style={StyleSheet.absoluteFill}>
          <WebView
            source={{ html: mobileHtml }}
            style={StyleSheet.absoluteFill}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            nestedScrollEnabled={true}
            originWhitelist={['https://*', 'http://*']}
            userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            setSupportMultipleWindows={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            onShouldStartLoadWithRequest={(request) => {
              // Block intent://, android-app://, geo: schemes from crashing Android WebView
              const url = request.url.toLowerCase();
              if (
                url.startsWith('intent://') ||
                url.startsWith('android-app://') ||
                url.startsWith('geo:') ||
                url.startsWith('market://')
              ) {
                return false;
              }
              return true;
            }}
            onError={(e) => {
              // Gracefully handle any scheme navigation warnings
              const desc = e.nativeEvent?.description || '';
              if (desc.includes('ERR_UNKNOWN_URL_SCHEME')) {
                return;
              }
            }}
            renderLoading={() => (
              <View style={[StyleSheet.absoluteFill, styles.loadingOverlay]}>
                <ActivityIndicator size="small" color="#1E6B3F" />
              </View>
            )}
          />
        </View>
      )}

      {/* Floating Action Controls on Right */}
      <View style={styles.floatingControls}>
        {/* Re-center / Locate Button */}
        <Pressable
          onPress={onLocatePress}
          accessibilityLabel="Re-center location"
          style={styles.controlBtn}
        >
          <LocateFixed size={20} color="#1E6B3F" />
        </Pressable>

        {/* Map style / layer toggle: Satellite vs Standard */}
        <Pressable
          onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
          accessibilityLabel="Toggle satellite or street layers"
          style={[
            styles.controlBtn,
            { marginTop: 10 },
            mapType === 'satellite' && styles.controlBtnActive,
          ]}
        >
          <Layers size={20} color={mapType === 'satellite' ? '#FFFFFF' : '#1E6B3F'} />
        </Pressable>

        {/* Open in external Google Maps application */}
        <Pressable
          onPress={handleOpenGoogleMaps}
          accessibilityLabel="Open in Google Maps App"
          style={[styles.controlBtn, { marginTop: 10 }]}
        >
          <ExternalLink size={18} color="#1E6B3F" />
        </Pressable>
      </View>

      {/* Floating Card: Locate on map */}
      <View style={styles.locateCardWrapper}>
        <Pressable
          onPress={onLocatePress}
          style={styles.locateCard}
          accessibilityRole="button"
          accessibilityLabel="Locate on map. Drop a pin or use your current location."
        >
          <View style={styles.locateIconCircle}>
            <MapPin size={18} color="#1E6B3F" />
          </View>
          <View style={{ flex: 1 }}>
            <Typography style={{ fontSize: 14, fontWeight: '700', color: '#18231D' }}>
              Locate on map
            </Typography>
            <Typography style={{ fontSize: 11, color: '#69766E', marginTop: 1 }}>
              {origin.name} ➔ {destination.name}
            </Typography>
          </View>
          <Typography style={{ fontSize: 16, color: '#69766E', marginLeft: 8 }}>›</Typography>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 330,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#EDF2EC',
  },
  loadingOverlay: {
    backgroundColor: '#EDF2EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingControls: {
    position: 'absolute',
    top: 20,
    right: 16,
    alignItems: 'center',
    zIndex: 10,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E4ECE6',
  },
  controlBtnActive: {
    backgroundColor: '#1E6B3F',
    borderColor: '#1E6B3F',
  },
  locateCardWrapper: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  locateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E6EEE8',
  },
  locateIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E6F5EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
});
