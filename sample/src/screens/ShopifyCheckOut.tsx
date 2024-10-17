
import React, { useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import LoaderKit from 'react-native-loader-kit';
import { LOADER_NAME } from '../constants/Constants';
import { logEvent } from '@amplitude/analytics-react-native';
const ShopifyCheckOut = ({ route }) => {
  const { url } = route.params;
  useEffect(() => {
    logEvent('Shopify checkout WebView Initialized');
  }, [])
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: url }}
        style={styles.webview}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <LoaderKit
              style={{ width: 50, height: 50 }}
              name={LOADER_NAME}
              color={"black"}
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});

export default ShopifyCheckOut;
