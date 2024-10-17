// import React, { useState } from 'react';
// import { View, TouchableOpacity, StyleSheet } from 'react-native';
// import { WebView } from 'react-native-webview';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { useThemes } from '../context/ThemeContext';
// import { lightColors, darkColors } from '../constants/Color';
// import LoadingModal from '../components/Modal/LoadingModal';
// const ShopifyInboxScreen = ({ navigation }) => {
//   const [webViewLoaded, setWebViewLoaded] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const { isDarkMode } = useThemes();
//   const colors = isDarkMode ? darkColors : lightColors;
//   return (
//     <View style={styles.container}>
//       {/* <WebView
//         source={{ uri: 'https://loot-burger-mobile-app.myshopify.com' }}
//         style={styles.webView}
//         injectedJavaScript={`
//           (function() {
//             function openChatWidget() {
//               var chatButton = document.querySelector("#ShopifyChat").shadowRoot.querySelector("div > button");
//               if (chatButton) {
//                 chatButton.click();
//                 window.ReactNativeWebView.postMessage('Chat widget opened');
//               } else {
//                 window.ReactNativeWebView.postMessage('Chat widget not found, retrying...');
//                 setTimeout(openChatWidget, 3000);
//               }
//             }
//             setTimeout(openChatWidget, 1000);
//           })();
//         `}
//         onMessage={(event) => {
//           console.log(event.nativeEvent.data);
//         }}
//         onLoad={() => setWebViewLoaded(true)}
//       /> */}

//       <WebView
//         source={{ uri: 'https://loot-burger-mobile-app.myshopify.com' }}
//         style={styles.webView}
//         injectedJavaScript={`
//               (function() {
//            function openChatWidget() {
//                 var chatButton = document.querySelector("#ShopifyChat").shadowRoot.querySelector("div > button");
//                 if (chatButton) {
//                   chatButton.click();
//                   window.ReactNativeWebView.postMessage('Chat widget opened');
//                 } else {
//                  window.ReactNativeWebView.postMessage('Chat widget not found, retrying...');
//                  setTimeout(openChatWidget, 3000);
//                }
//              }
//             setTimeout(openChatWidget, 3000);
//             })();
//           `}
//         onMessage={(event) => {
//           console.log(event.nativeEvent.data);
//           if (event.nativeEvent.data === 'Chat widget opened') {
//             setLoading(false);
//           }
//         }}
//         onError={(syntheticEvent) => {
//           const { nativeEvent } = syntheticEvent;
//           console.error('WebView error: ', nativeEvent);
//         }}
//         onLoad={() => setWebViewLoaded(true)}
//       />

//       {webViewLoaded && (
//         <TouchableOpacity
//           style={[styles.closeButton]}
//           onPress={() => navigation.goBack()}
//         >
//           <Icon name="close" size={24} color="#fff" />
//         </TouchableOpacity>
//       )}
//       {loading &&
//         <LoadingModal visible={loading} />
//       }
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     position: 'relative',
//   },
//   webView: {
//     flex: 1,
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     backgroundColor: 'black',
//     padding: 10,
//     borderRadius: 25,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 3.5,
//   },
// });

// export default ShopifyInboxScreen;



import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
import LoadingModal from '../components/Modal/LoadingModal';
import { logEvent } from '@amplitude/analytics-react-native';

const ShopifyInboxScreen = ({ navigation }) => {
  const [webViewLoaded, setWebViewLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef(null);
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;

  useEffect(() => {
    logEvent('ShopifyInboxScreen Initialized');
  }, [])

  const closeChatWidget = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        (function() {
          var chatButton = document.querySelector("#ShopifyChat");
          if (chatButton) {
            var closeButton = chatButton.shadowRoot.querySelector("div > button");
            if (closeButton) {
              closeButton.click();
            }
          }
        })();
      `);
    }
    logEvent('Close button clicked from Shopify-Inbox Screen');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://loot-burger-mobile-app.myshopify.com' }}
        style={styles.webView}
        injectedJavaScript={`
          (function() {
            function openChatWidget() {
              var chatButton = document.querySelector("#ShopifyChat").shadowRoot.querySelector("div > button");
              if (chatButton) {
                chatButton.click();
                window.ReactNativeWebView.postMessage('Chat widget opened');
              } else {
                window.ReactNativeWebView.postMessage('Chat widget not found, retrying...');
                setTimeout(openChatWidget, 3000);
              }
            }
            setTimeout(openChatWidget, 3000);
          })();
        `}
        onMessage={(event) => {
          console.log(event.nativeEvent.data);
          if (event.nativeEvent.data === 'Chat widget opened') {
            setLoading(false);
          }
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error: ', nativeEvent);
        }}
        onLoad={() => setWebViewLoaded(true)}
      />

      {webViewLoaded && (
        <TouchableOpacity
          style={[styles.closeButton]}
          onPress={closeChatWidget}
        >
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
      )}
      {loading && <LoadingModal visible={loading} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
  },
});

export default ShopifyInboxScreen;

