import 'react-native-gesture-handler';
import React, { PropsWithChildren, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Link, NavigationContainer, useNavigation, useIsFocused, useFocusEffect, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import CatalogScreen from './screens/CatalogScreen';
import { ColorScheme, Configuration, ShopifyCheckoutSheetProvider, useShopifyCheckoutSheet } from '@shopify/checkout-sheet-kit';
import { ConfigProvider } from './context/Config';
import { ThemeProvider, useTheme } from './context/Theme';
import { Appearance, StatusBar, StyleSheet, Image, TouchableOpacity, View, Text, Alert, Platform, SafeAreaView } from 'react-native';
import { CartProvider, useCart } from './context/Cart';
import CartScreen from './screens/CartScreen';
import ProductDetailsScreen from './screens/ProductDetailsScreen';
import { ProductVariant, ShopifyProduct } from '../@types';
import ErrorBoundary from './ErrorBoundary';
import { CheckoutException } from '@shopify/checkout-sheet-kit';
import { whiteColor, grayColor, redColor } from '../src/constants/Color';
import { PROFILE_ICON, HOME_ICON, SHOPPINGCART_ICON, SELECTEDBAR_ICON, HEART_ICON, ICON_ADDCART } from '../src/assests/images';
import { MY_WISHLIST, HOME, FASHION, CLOTHING, FOOD, DRINKS, BEAUTY, ELECTRONICS, getStoreDomain, getStoreFrontAccessToken, STOREFRONT_DOMAIN, STOREFRONT_ACCESS_TOKEN, ADMINAPI_ACCESS_TOKEN } from '../src/constants/Constants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../src/utils';
import SearchScreen from './screens/SearchScreen';
import SplashScreen from 'react-native-splash-screen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreenFood from './screens/HomeScreenFood';
import CollectionCategory from './screens/CollectionCategory';
import SearchResultScreen from './screens/SearchResultScreen';
import ProfileScreen from './screens/ProfileScreen';
import UserDashboardScreen from './screens/UserDashboardScreen';
import { AuthContext, AuthProvider } from './context/AuthProvider';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../src/redux/store';
import messaging from '@react-native-firebase/messaging';
import { useSelector } from 'react-redux';
import { init, logEvent } from '@amplitude/analytics-react-native';
import Feather from 'react-native-vector-icons/dist/Feather';
import AccountDetails from './screens/AccountDetails';
import ForgetPasswordScreen from './screens/ForgetPasswordScreen';
import HomeScreenDrink from './screens/HomeScreenDrink';
import HomeScreenClothing from './screens/HomeScreenClothing';
import HomeScreenBeauty from './screens/HomeScreenBeauty';
import WebviewScreen from './screens/WebviewScreen';
import HomeScreenElectronic from './screens/HomeScreenElectronic';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProviders } from './context/ThemeContext';
import { useThemes } from '../src/context/ThemeContext';
import { lightColors, darkColors } from '../src/constants/Color';
import HomeScreenAutomotives from './screens/HomeScreenAutomotives';
import HomeScreenSports from './screens/HomeScreenSports';
import CustomSplashScreen from './screens/SplashScreen';
import HomeScreenGrocery from './screens/HomeScreenGrocery';
import HomeScreenHomeDecor from './screens/HomeScreenHomeDecor';
import HomeScreenPet from './screens/HomeScreenPet';
import ShopifyInboxScreen from './screens/ShopifyInboxScreen';
import ShopifyCheckOut from './screens/ShopifyCheckOut';
import PushNotification from 'react-native-push-notification';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
const colorScheme = ColorScheme.web;
const config: Configuration = {
  colorScheme,
  preloading: true,
  colors: {
    ios: {
      backgroundColor: '#f0f0e8',
      tintColor: '#2d2a38',
    },
    android: {
      backgroundColor: '#fff',
      progressIndicator: '#2d2a38',
      headerBackgroundColor: '#f0f0e8',
      headerTextColor: '#2d2a38',
    },
  },
};

Appearance.setColorScheme('light');

export type RootStackParamList = {
  Catalog: undefined;
  CatalogScreen: undefined;
  ProductDetails: { product: ShopifyProduct; variant?: ProductVariant };
  Cart: { userId: string };
  CartModal: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootStackParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

export const cache = new InMemoryCache();

function AppWithTheme({ children }: PropsWithChildren) {
  return <ThemeProvider defaultValue={colorScheme}>{children}</ThemeProvider>;
}
function AppWithContext({ children }: PropsWithChildren) {
  const selectedItem = useSelector((state) => state.menu.selectedItem);
  const shopify = useShopifyCheckoutSheet();
  // const storeDomain = getStoreDomain(selectedItem)
  // const storeFrontAccessToken = getStoreFrontAccessToken(selectedItem)
  const storeDomain = STOREFRONT_DOMAIN
  const storeFrontAccessToken = STOREFRONT_ACCESS_TOKEN
  useEffect(() => {
    const close = shopify.addEventListener('close', () => {
      // console.log('[CheckoutClose]');
    });

    const pixel = shopify.addEventListener('pixel', event => {
      // console.log('[CheckoutPixelEvent]', event.name, event);
    });

    const completed = shopify.addEventListener('completed', event => {
      // console.log('[CheckoutCompletedEvent]', event.orderDetails.id);
      // console.log('[CheckoutCompletedEvent]', event);
    });

    const error = shopify.addEventListener(
      'error',
      (error: CheckoutException) => {
        console.log('[CheckoutError]', error);
      },
    );
    return () => {
      pixel?.remove();
      completed?.remove();
      close?.remove();
      error?.remove();
    };
  }, [shopify]);
  const client = useMemo(() => {
    return new ApolloClient({
      uri: `https://${storeDomain}/api/2023-10/graphql.json`,
      cache,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storeFrontAccessToken,
      },
    });
  }, [storeDomain, storeFrontAccessToken, shopify]);
  return (
    <ConfigProvider>
      <ApolloProvider client={client}>
        <CartProvider>
          <StatusBar barStyle="default" />
          {children}
        </CartProvider>
      </ApolloProvider>
    </ConfigProvider>
  );
}
function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ForgetPasswordScreen" component={ForgetPasswordScreen} options={{ headerShown: false }} />
      <Stack.Screen name="WebViewScreen" component={WebviewScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="AppWithNavigation"
        component={AppWithNavigation}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
function HomeStack() {
  const selectedItem = useSelector((state) => state.menu.selectedItem);
  // console.log(selectedItem)
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitleVisible: true,
        headerRight: CartIcon,
      }}
    >
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreenElectronic}
        // component={selectedItem === FOOD ? HomeScreenFood : selectedItem === DRINKS ? HomeScreenDrink : selectedItem === CLOTHING ? HomeScreenClothing : selectedItem === BEAUTY ? HomeScreenBeauty : selectedItem === "Electronics" ? HomeScreenElectronic : selectedItem === "AutoMotives" ? HomeScreenAutomotives : selectedItem === "Sports" ? HomeScreenSports : selectedItem === "Grocery" ? HomeScreenGrocery : selectedItem === "HomeDecor" ? HomeScreenHomeDecor : selectedItem === "PetGrocery" ? HomeScreenPet : HomeScreenFood}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Collections"
        component={CollectionCategory}
        options={() => ({
          headerShown: false,
          headerBackVisible: false,
        })}
      />
      <Stack.Screen
        name="CatalogScreen"
        component={CatalogScreen}
        options={{ headerShown: false, headerTitle: 'Catalog' }}
      />
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
        options={({ route }) => ({
          headerTitle: route.params.product.title,
          headerShown: false,
          headerBackVisible: true,
          headerBackTitle: 'Back',
        })}
      />
      <Stack.Screen
        name="CartModal"
        component={CartScreen}
        options={{
          title: 'Cart',
          headerShown: false,
          presentation: 'modal',
          headerRight: undefined,
        }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={() => ({
          headerShown: false,
          headerBackVisible: true,
          headerRight: undefined,
        })}
      />
      <Stack.Screen
        name="SearchResultScreen"
        component={SearchResultScreen}
        options={({ route }) => ({
          headerTitle: route.params.title,
          headerShown: false,
          headerBackVisible: true,
          headerRight: undefined,
        })}
      />
      <Stack.Screen
        name="UserDashboardScreen"
        component={UserDashboardScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="CatalogStack"
        component={CatalogStack}
        options={() => ({
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="ShopifyInboxScreen"
        component={ShopifyInboxScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="ShopifyCheckOut"
        component={ShopifyCheckOut}
        options={() => ({
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="ForgetPasswordScreen"
        component={ForgetPasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WebViewScreen"
        component={WebviewScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileStack}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
function HomeWithAuthStack() {
  const selectedItem = useSelector((state) => state.menu.selectedItem);

  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitleVisible: true,
        headerRight: CartIcon,
      }}
    >
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreenElectronic}
        // component={selectedItem === FOOD ? HomeScreenFood : selectedItem === DRINKS ? HomeScreenDrink : selectedItem === CLOTHING ? HomeScreenClothing : selectedItem === BEAUTY ? HomeScreenBeauty : selectedItem === "Electronics" ? HomeScreenElectronic : selectedItem === "AutoMotives" ? HomeScreenAutomotives : selectedItem === "Sports" ? HomeScreenSports : selectedItem === "Grocery" ? HomeScreenGrocery : selectedItem === "HomeDecor" ? HomeScreenHomeDecor : selectedItem === "PetGrocery" ? HomeScreenPet : HomeScreenFood}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Collections"
        component={CollectionCategory}
        options={() => ({
          headerShown: false,
          headerBackVisible: false,
        })}
      />
      <Stack.Screen
        name="CatalogScreen"
        component={CatalogScreen}
        options={{ headerShown: false, headerTitle: 'Catalog' }}
      />
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
        options={({ route }) => ({
          headerTitle: route.params.product.title,
          headerShown: false,
          headerBackVisible: true,
          headerBackTitle: 'Back',
        })}
      />
      <Stack.Screen
        name="CartModal"
        component={CartScreen}
        options={{
          title: 'Cart',
          headerShown: false,
          presentation: 'modal',
          headerRight: undefined,
        }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={() => ({
          headerShown: false,
          headerBackVisible: true,
          headerRight: undefined,
        })}
      />
      <Stack.Screen
        name="SearchResultScreen"
        component={SearchResultScreen}
        options={({ route }) => ({
          headerTitle: route.params.title,
          headerShown: false,
          headerBackVisible: true,
          headerRight: undefined,
        })}
      />
      <Stack.Screen
        name="UserDashboardScreen"
        component={UserDashboardScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="CatalogStack"
        component={CatalogStack}
        options={() => ({
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="AuthStack"
        component={AuthStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ShopifyInboxScreen"
        component={ShopifyInboxScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="ShopifyCheckOut"
        component={ShopifyCheckOut}
        options={() => ({
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="ForgetPasswordScreen"
        component={ForgetPasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WebViewScreen"
        component={WebviewScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
function WishListStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitleVisible: true,
        headerRight: CartIcon,
      }}
    >
      <Stack.Screen
        name="UserDashboardScreen"
        component={UserDashboardScreen}
        initialParams={{ from: "Saved" }}
        options={({ route }) => ({
          headerShown: false,
        })}
      />

      <Stack.Screen
        name="CartModal"
        component={CartScreen}
        options={{
          title: 'Cart',
          headerShown: false,
          presentation: 'modal',
          headerRight: undefined,
        }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={() => ({
          headerShown: false,
          headerBackVisible: true,
          headerRight: undefined,
        })}
      />
      <Stack.Screen
        name="SearchResultScreen"
        component={SearchResultScreen}
        options={({ route }) => ({
          headerTitle: route.params.title,
          headerShown: false,
          headerBackVisible: true,
          headerRight: undefined,
        })}
      />
      <Stack.Screen
        name="ShopifyCheckOut"
        component={ShopifyCheckOut}
        options={() => ({
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="ForgetPasswordScreen"
        component={ForgetPasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WebViewScreen"
        component={WebviewScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
function CatalogStack() {
  const selectedItem = useSelector((state) => state.menu.selectedItem);
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitleVisible: true,
        headerRight: CartIcon,
      }}
    >
      <Stack.Screen
        name="CatalogScreen"
        component={CatalogScreen}
        options={{ headerShown: false, headerTitle: 'Catalog' }}
      />
      <Stack.Screen
        name="Collections"
        component={CollectionCategory}
        options={() => ({
          headerShown: false,
          headerBackVisible: false,
        })}
      />
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
        options={({ route }) => ({
          headerTitle: route.params.product.title,
          headerShown: false,
          headerBackVisible: true,
          headerBackTitle: 'Back',
        })}
      />
      <Stack.Screen
        name="CartModal"
        component={CartScreen}
        options={{
          title: 'Cart',
          headerShown: false,
          presentation: 'modal',
          headerRight: undefined,
        }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={() => ({
          headerShown: false,
          headerBackVisible: false,
        })}
      />
      <Stack.Screen
        name="SearchResultScreen"
        component={SearchResultScreen}
        options={({ route }) => ({
          headerTitle: route.params.title,
          headerShown: false,
          headerBackVisible: true,
          headerRight: undefined,
        })}
      />
      <Stack.Screen
        name="ShopifyInboxScreen"
        component={ShopifyInboxScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="ShopifyCheckOut"
        component={ShopifyCheckOut}
        options={() => ({
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="ForgetPasswordScreen"
        component={ForgetPasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WebViewScreen"
        component={WebviewScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitleVisible: true,
        headerRight: CartIcon,
      }}
    >
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={({ route }) => ({
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="CartModal"
        component={CartScreen}
        options={{
          title: 'Cart',
          headerShown: false,
          presentation: 'modal',
          headerRight: undefined,
        }}
      />

      <Stack.Screen
        name="UserDashboardScreen"
        component={UserDashboardScreen}
        options={({ route }) => ({
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="AuthStack"
        component={AuthStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AppWithNavigation"
        component={AppWithNavigation}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="AccountDetails"
        component={AccountDetails}
        options={() => ({
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="ShopifyInboxScreen"
        component={ShopifyInboxScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="ShopifyCheckOut"
        component={ShopifyCheckOut}
        options={() => ({
          headerShown: false,
        })}
      />
    </Stack.Navigator>
  );
}

function CartStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitleVisible: true,
        // headerRight: CartIcon,
      }}
    >
      <Stack.Screen
        name="CartModal"
        component={CartScreen}
        options={{
          title: 'Cart',
          headerShown: false,
          presentation: 'modal',
          headerRight: undefined,
        }}
      />
      <Stack.Screen
        name="ForgetPasswordScreen"
        component={ForgetPasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WebViewScreen"
        component={WebviewScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
function CartIcon() {
  const theme = useTheme();
  return (
    <Link to="/CartModal">
      <Feather name={"shopping-cart"} size={25} color={'black'} />
    </Link>
  );
}
function AppWithNavigation() {
  const { totalQuantity } = useCart();
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  const { isLoggedIn } = useContext(AuthContext)
  const userLoggedIn = useSelector(state => state.auth.isAuthenticated);
  // console.log("userLoggedInFromRedux::::::::::::::::::", userLoggedIn)
  return (
    <Tab.Navigator
      tabBarOptions={{
        style: styles.footerContainer,
        labelStyle: [styles.tabLabel],
        tabStyle: styles.tabStyle,
        activeTintColor: redColor,
        inactiveTintColor: grayColor,
      }}
      backBehavior='history'
    >
      <Tab.Screen
        name="Home"
        component={isLoggedIn || userLoggedIn ? HomeStack : HomeWithAuthStack}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route);
          console.log("routeName",routeName)
          return {
            headerShown: false,
            tabBarStyle: { display: routeName === 'Search' || routeName === "AuthStack" || routeName === 'CartModal' || routeName === 'ShopifyCheckOut' ? 'none' : 'flex', backgroundColor: colors.whiteColor },
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <View style={{ height: 10, width: 50, alignItems: "center", justifyContent: "center" }}>
                  {focused && (
                    <Image
                      source={SELECTEDBAR_ICON}
                      style={{ position: 'absolute', top: 1, width: 50, height: 8, tintColor: redColor, resizeMode: "contain" }}
                    />
                  )}
                </View>
                <Image
                  source={HOME_ICON}
                  style={{ width: 24, height: 24, resizeMode: "contain", tintColor: focused ? redColor : isDarkMode ? whiteColor : grayColor }}
                />
              </View>
            ),
          }
        }}
      />
      <Tab.Screen
        name="Saved"
        component={WishListStack}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route);
          return {
            tabBarStyle: { display: routeName == 'Search' ? 'none' : 'flex', backgroundColor: colors.whiteColor },
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <View style={{ height: 10, width: 50, alignItems: "center", justifyContent: "center" }}>
                  {focused && (
                    <Image
                      source={SELECTEDBAR_ICON}
                      style={{ position: 'absolute', top: 1, width: 50, height: 8, tintColor: redColor, resizeMode: "contain" }}
                    />
                  )}
                </View>
                <Image
                  source={HEART_ICON}
                  style={{ width: 24, height: 24, resizeMode: "contain", tintColor: focused ? redColor : isDarkMode ? whiteColor : grayColor }}
                />
              </View>
            ),
          }
        }}
      />
      <Tab.Screen
        name="Category"
        component={CatalogStack}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route);
          return {
            tabBarStyle: { display: routeName == 'Search' ? 'none' : 'flex', backgroundColor: colors.whiteColor },
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <View style={{ height: 10, width: 50, alignItems: "center", justifyContent: "center" }}>
                  {focused && (
                    <Image
                      source={SELECTEDBAR_ICON}
                      style={{ position: 'absolute', top: 1, width: 50, height: 8, tintColor: redColor, resizeMode: "contain" }}
                    />
                  )}
                </View>
                <Image
                  source={SHOPPINGCART_ICON}
                  style={{ width: 24, height: 24, resizeMode: "contain", tintColor: focused ? redColor : isDarkMode ? whiteColor : grayColor }}
                />
              </View>
            ),
          }
        }}
      />
      {/* <Tab.Screen
        name="Profile"
        component={isLoggedIn || userLoggedIn ? ProfileStack : AuthStack}
        options={{
          tabBarStyle: { display: isLoggedIn || userLoggedIn ? 'flex' : 'none', backgroundColor: colors.whiteColor },
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <View style={{ height: 10, width: 50, alignItems: "center", justifyContent: "center" }}>
                {focused && (
                  <Image
                    source={SELECTEDBAR_ICON}
                    style={{ position: 'absolute', top: 1, width: 50, height: 8, tintColor: redColor, resizeMode: "contain" }}
                  />
                )}
              </View>
              <Image
                source={PROFILE_ICON}
                style={{ width: 24, height: 24, resizeMode: "contain", tintColor: focused ? redColor : isDarkMode ? whiteColor : grayColor }}
              />
            </View>
          ),
        }}
      /> */}
      <Tab.Screen
        name="Cart"
        component={CartStack}
        options={{
          tabBarStyle: { display: 'none', backgroundColor: colors.whiteColor },
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <View style={{ height: 10, width: 50, alignItems: "center", justifyContent: "center" ,zIndex:1}}>
                {totalQuantity > 0 && (
                  <View style={{
                    position: 'absolute',
                    top: 4,
                    right: 10,
                    backgroundColor: redColor,
                    borderRadius: wp(2),
                    width: wp(4),
                    height: wp(4),
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 999
                  }}>
                    <Text style={{
                      color: whiteColor,
                      fontSize: wp(2.5),
                      fontWeight: 'bold',
                    }}>{totalQuantity}</Text>
                  </View>
                )}
                {focused && (
                  <Image
                    source={SELECTEDBAR_ICON}
                    style={{ position: 'absolute', top: 1, width: 50, height: 8, tintColor: redColor, resizeMode: "contain" }}
                  />
                )}
              </View>
              <Image
                source={ICON_ADDCART}
                style={{ width: 24, height: 24, resizeMode: "contain", tintColor: focused ? redColor : isDarkMode ? whiteColor : grayColor }}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
function App({ navigation }: { navigation: any }) {
  const [showSplash, setShowSplash] = useState(true);

  const requestPermissionAndToken = async () => {
    try {
      if (Platform.OS === 'ios') {
        // Request permission for notifications (iOS)
        await messaging().requestPermission();
      } else if (Platform.OS === 'android') {
        // Check and request notification permission (Android)
        const result = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);

        if (result === RESULTS.GRANTED) {
          console.log('Notification permission granted.');
        } else if (result === RESULTS.DENIED) {
          console.log('Notification permission denied.');
        } else if (result === RESULTS.BLOCKED) {
          console.log('Notification permission blocked.');
        }
      }

      // Get the FCM token
      const fcmToken = await messaging().getToken();
      console.log('FCM Token:', fcmToken);

      // Send this token to your server for later use
      // YourServer.sendTokenToServer(fcmToken);
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
  }

  const fetchAndStoreShopCurrency = async () => {
    const shopifyGraphQLUrl = `https://${STOREFRONT_DOMAIN}/admin/api/2024-04/graphql.json`; // Replace with your shop name and API version

    const headers = {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
    };

    const getShopDetailsQuery = `
      query {
        shop {
          currencyCode
        }
      }
    `;

    try {
      const response = await axios.post(
        shopifyGraphQLUrl,
        { query: getShopDetailsQuery },
        { headers }
      );

      if (response.data.data && response.data.data.shop) {
        const currencyCode = response.data.data.shop.currencyCode;
        // console.log(currencyCode)
        await AsyncStorage.setItem('shopCurrency', currencyCode);
        return currencyCode;
      } else {
        throw new Error('Failed to fetch shop details');
      }
    } catch (error) {
      console.error('Error fetching shop details:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchAndStoreShopCurrency();
    requestPermissionAndToken();
    init('c210f949fcb8b3256e123986e05fc2c4')
    logEvent('App Started');

    // SplashScreen.hide();
    const timeout = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <ErrorBoundary>
      <ShopifyCheckoutSheetProvider configuration={config}>
        <AppWithTheme>
          <NavigationContainer>
            <Provider store={store}>
              <AppWithContext>
                <ThemeProviders>
                  <AuthProvider>
                    <PersistGate loading={null} persistor={persistor}>
                      <SafeAreaView style={{ flex: 1 }}>
                        {showSplash ? <CustomSplashScreen /> : <AppWithNavigation />}
                      </SafeAreaView>
                    </PersistGate>
                  </AuthProvider>
                </ThemeProviders>
              </AppWithContext>
            </Provider>
          </NavigationContainer>
        </AppWithTheme>
      </ShopifyCheckoutSheetProvider>
    </ErrorBoundary>
  );
}

export default App;
const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: hp(10),
    backgroundColor: "red",
  },
  tabLabel: {
    fontSize: 12,
  },
  tabStyle: {
    justifyContent: 'center',
  },
  tabIcon: {
    width: wp(7),
    height: hp(3),
  },
  roundFooterBtn: {
    width: wp(16),
    height: hp(8),
    alignItems: 'center',
    position: 'relative',
    bottom: 11,
    backgroundColor: redColor,
    borderRadius: 50,
    justifyContent: 'center',

  },
  icon: {
    width: wp(7),
    height: hp(3),
    resizeMode: 'contain',
  },
});
