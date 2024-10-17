import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Image, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Pressable, KeyboardAvoidingView, ActivityIndicator, Alert, Dimensions, Animated } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { whiteColor, blackColor, grayColor, redColor, lightGrayOpacityColor } from '../constants/Color'
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import Carousal from '../components/Carousal'
import Header from '../components/Header'
import Product from '../components/ProductVertical';
import ChatButton from '../components/ChatButton';
import { MORE_DOTS_IMAGE } from '../assests/images'
import { ADMINAPI_ACCESS_TOKEN, STOREFRONT_DOMAIN, getStoreDomain, getAdminAccessToken, STOREFRONT_ACCESS_TOKEN, LOADER_NAME } from '../constants/Constants'
import useShopify from '../hooks/useShopify';
import { useCart } from '../context/Cart';
import type { ShopifyProduct } from '../../@types';
import Toast from 'react-native-simple-toast';
import { logEvent } from '@amplitude/analytics-react-native';
import FastImage from 'react-native-fast-image';
import axios from 'axios';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import { useDispatch, useSelector } from 'react-redux';
import { selectMenuItem } from '../redux/actions/menuActions';
import { clearWishlist } from '../redux/actions/wishListActions';
import { useFocusEffect } from '@react-navigation/native';
import LoaderKit from 'react-native-loader-kit'
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
import { scheduleNotification } from '../notifications';
const { flex, alignJustifyCenter, flexDirectionRow, resizeModeContain, resizeModeCover, justifyContentSpaceBetween, borderRadius10, alignItemsCenter,
  textAlign, overflowHidden, positionRelative, positionAbsolute } = BaseStyle;

const HomeScreenFood = ({ navigation }: { navigation: any }) => {
  const selectedItem = useSelector((state) => state?.menu?.selectedItem);
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;

  const { addToCart, addingToCart, clearCart } = useCart();
  const [lineHeights, setLineHeights] = useState({});
  const [inventoryQuantities, setInventoryQuantities] = useState('');
  const [tags, setTags] = useState<string[][]>([]);
  const [options, setOptions] = useState([]);
  const [productVariantsIDS, setProductVariantsIDS] = useState([]);
  const [bestDealInventoryQuantities, setBestDealInventoryQuantities] = useState('');
  const [bestDealoptions, setBestDealOptions] = useState([]);
  const [bestDealProductVariantsIDS, setBestDealProductVariantsIDS] = useState([]);
  const [bestDealTags, setbestDealTags] = useState<string[][]>([]);
  const [products, setProducts] = useState([]);
  const { queries } = useShopify();
  const [fetchCollections, { data: collectionData }] = queries.collections;
  const [fetchProducts, { data }] = queries.products;
  const dispatch = useDispatch();
  const [menuItems, setMenuItems] = useState([]);
  const [shopifyCollection, setShopifyCollection] = useState([])
  const [collectionsFetched, setCollectionsFetched] = useState(false);

  //dummy Gif
  const GIF = { id: 1, gif: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/d969801a-9c5b-4cf3-8eb3-340f8ad5f4d5.gif?alt=media&token=7778bc3e-d9ed-4a0a-912f-e47d8d69073f", title: "Indian Whiskey" };

  // const collections = collectionData?.collections?.edges || [];
  const collections = shopifyCollection || [];
  const customItem = { id: 'more', title: 'More', image: MORE_DOTS_IMAGE };
  const catagory = [...collections.slice(0, 4), customItem];

  const carouselData = [
    { id: 1, image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/bannerimages%2FFood%2FFoodbanner1.png?alt=media&token=2b39f851-9882-48b7-8eeb-fc1f20fe3259" },
    { id: 2, image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/bannerimages%2FFood%2FFoodbanner2.png?alt=media&token=a443a96a-f43b-4c45-a0f9-e85b09319f45" },
    { id: 3, image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/bannerimages%2FFood%2FFoodbanner2.png?alt=media&token=a443a96a-f43b-4c45-a0f9-e85b09319f45" },
  ];

  const screenWidth = Dimensions.get('window').width;
  const translateX = useRef(new Animated.Value(screenWidth)).current;

  useEffect(() => {
    logEvent('Home Screen Food Initialized')
  }, [])

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: -screenWidth,
        duration: 5000,
        useNativeDriver: true,
      })
    ).start();
  }, [translateX]);

  //AllDeliciousProduct
  useEffect(() => {
    const fetchproduct = () => {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("X-Shopify-Access-Token", ADMINAPI_ACCESS_TOKEN);
      const graphql = JSON.stringify({
        query: `query getProducts {
        products(first: 10) {
          edges {
            node {
              id
              title
              tags
              options(first:10){
                id
                name
                values
              }
              variants(first: 10) {
                nodes {
                  id
                  title
                  inventoryQuantity
                  image {
                    originalSrc
                  }
                }
              }
            }
          }
        }
      }`,
        variables: {}
      });
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: graphql,
        redirect: "follow"
      };
      fetch(`https://${STOREFRONT_DOMAIN}/admin/api/2024-04/graphql.json`, requestOptions)
        .then((response) => response.json())
        .then((result) => {
          const fetchedProducts = result?.data?.products?.edges;
          const fetchedTags = fetchedProducts?.map(productEdge => productEdge?.node?.tags);
          const inventoryQuantities = fetchedProducts?.map((productEdge) => {
            return productEdge?.node?.variants?.nodes?.map((variant) => variant?.inventoryQuantity);
          });
          const fetchedOptions = fetchedProducts?.map(product => product?.node?.options);
          const productVariantData = fetchedProducts?.map(productEdge =>
            productEdge?.node?.variants?.nodes?.map(variant => ({
              id: variant?.id,
              title: variant?.title,
              inventoryQty: variant?.inventoryQuantity,
              image: variant?.image
            }))
          );
          setOptions(fetchedOptions)
          setInventoryQuantities(inventoryQuantities);
          setTags(fetchedTags);
          setProductVariantsIDS(productVariantData)
        })
        .catch((error) => console.log(error));
    }
    fetchproduct()
  }, [])

  //bestdealProduct
  useEffect(() => {
    const fetchproduct = () => {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("X-Shopify-Access-Token", ADMINAPI_ACCESS_TOKEN);
      const graphql = JSON.stringify({
        query: `query MyQuery {
        collection(id: "gid://shopify/Collection/331148394649") {
          products(first: 4) {
            nodes {
              id
              images(first: 4) {
                nodes {
                  src
                  url
                }
              }
              title
              tags
              options(first:4){
                id
                name
                values
              }
              variants(first: 4) {
                nodes {
                  price
                  inventoryQuantity
                  id
                  title
                  image {
                    originalSrc
                  }
                }
              }
            }
          }
        }
      }`,
        variables: {}
      });
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: graphql,
        redirect: "follow"
      };
      fetch(`https://${STOREFRONT_DOMAIN}/admin/api/2024-04/graphql.json`, requestOptions)
        .then((response) => response.text())
        .then((result) => {
          const fetchedProducts = JSON.parse(result);
          setProducts(fetchedProducts?.data?.collection?.products?.nodes);
          const inventoryQuantities = fetchedProducts?.data?.collection?.products?.nodes?.map((productEdge) => {
            return productEdge?.variants?.nodes?.map((variants) => variants?.inventoryQuantity);
          });
          setBestDealInventoryQuantities(inventoryQuantities)
          const fetchedOptions = fetchedProducts?.data?.collection?.products?.nodes?.map((product) => product?.options);
          setBestDealOptions(fetchedOptions);

          const productVariantData = fetchedProducts?.data?.collection?.products?.nodes.map((product) =>
            product?.variants?.nodes?.map((variant) => ({
              id: variant?.id,
              title: variant?.title,
              inventoryQty: variant?.inventoryQuantity,
              image: variant?.image
            }))
          );
          setBestDealProductVariantsIDS(productVariantData);

          const fetchedTags = fetchedProducts?.data?.collection?.products?.nodes?.map(productEdge => productEdge?.tags);

          setbestDealTags(fetchedTags)
        })
        .catch((error) => console.log(error));
    }
    fetchproduct();
  }, [])

  //handel deep Links
  useEffect(() => {
    const handleInitialLink = async () => {
      const initialLink = await dynamicLinks().getInitialLink();
      if (initialLink) {
        handleDynamicLinks(initialLink);
      }
    };
    handleInitialLink();
    const unsubscribe = dynamicLinks().onLink(handleDynamicLinks);
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchCollections({
        variables: {
          first: 100,
        },
      });
      await fetchProducts({
        variables: {
          first: 10,
        },
      });
      setCollectionsFetched(true);
    };

    fetchInitialData();
  }, [fetchCollections, fetchProducts]);

  useFocusEffect(
    useCallback(() => {
      if (collectionsFetched) {
        fetchMainMenu();
      }
    }, [collectionsFetched])
  );

  const handleMenuPress = (item) => {
    logEvent(`Change theme from Food to Themename :${item}`);
    dispatch(selectMenuItem(item));
    dispatch(clearWishlist());
    clearCart()
  };

  const fetchMainMenu = async () => {
    try {
      const response = await axios.post(
        `https://${STOREFRONT_DOMAIN}/api/2023-04/graphql.json`,
        {
          query: `
          {
            menu(handle: "main-menu") {
              items {
                title
                url
                type
                items {
                  title
                  id
                }
              }
            }
          }
        `,
        },
        {
          headers: {
            'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
            'Content-Type': 'application/json',
          },
        }
      );
      setMenuItems(response?.data?.data?.menu?.items);
      const filteredItems = response?.data?.data?.menu?.items?.filter(item =>
        item?.title.toLowerCase() === selectedItem.toLowerCase()
      );
      filteredItems.forEach((item) => {


        let matchedCollectionsArray = [];
        item?.items?.forEach(selectedItem => {


          if (collectionData && collectionData?.collections && collectionData?.collections?.edges) {
            let matchedCollection = collectionData?.collections?.edges?.find(collection => {
              return collection?.node?.title === selectedItem?.title;
            });
            if (matchedCollection) {
              matchedCollectionsArray.push(matchedCollection?.node);
            }
          }
        });

        setShopifyCollection(matchedCollectionsArray);
      });
    } catch (error) {
      console.log('Error fetching main menu:', error);
    }
  };


  //handel handleDynamicDeepLinks
  const handleDynamicLinks = async (link) => {
    try {
      if (link && link.url) {
        let productId = link?.url?.split('=').pop();
        const productData = await fetchProductDetails(productId);
        navigation.navigate('ProductDetails', {
          product: productData?.product,
          variant: productData?.variants,
          inventoryQuantity: productData?.inventoryQuantities,
          tags: productData?.tags,
          option: productData?.options,
          ids: productData?.ids
        });
      } else {
      }
    } catch (error) {
      console.error('Error handling dynamic link:', error);
    }
  }

  //fatch product exit in deeplink
  const fetchProductDetails = async (productId) => {
    const parts = productId.split('/');
    const lastValue = parts[parts.length - 1];
    try {
      const response = await axios.get(`https://${STOREFRONT_DOMAIN}/admin/api/2024-01/products/${lastValue}.json`, {
        headers: {
          'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      });
      const product = response?.data?.product;
      const ids = product?.variants?.map((variant) => ({
        id: variant?.admin_graphql_api_id,
        title: variant?.title,
        inventoryQty: variant?.inventory_quantity,
        image: variant?.image
      }));
      return {
        product: product,
        variants: product?.variants?.map((variant) => ({
          id: variant?.id,
          title: variant?.title,
          inventoryQuantity: variant?.inventory_quantity,
          options: variant?.option_values,
        })),
        inventoryQuantities: product?.variants?.map((variant) => variant?.inventory_quantity),
        tags: product?.tags?.split(','),
        options: product?.options?.map((option) => ({
          name: option?.name,
          values: option?.values,
        })),
        ids: ids,
      };

    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  const handleTextLayout = (title: any) => (event) => {
    const { lines } = event.nativeEvent;
    const newLineHeights = { ...lineHeights };
    newLineHeights[title] = lines.length > 1 ? 13 : 16;
    setLineHeights(newLineHeights);
  };

  //move to catalog page
  const onPressShopAll = () => {
    logEvent('SeeAll Button Pressed from HomeScreenFood');
    navigation.navigate('CatalogStack')
  }

  //move to collection page
  const onPressCollection = (id: any, heading: any) => {
    logEvent(`See All our product Collection Button Pressed from HomeScreenFood CollectionID: ${id} CollectionName: ${heading}`);
    navigation.navigate('Collections', {
      id: id, headingText: heading
    })
  }

  //get product variant
  const getVariant = (product: ShopifyProduct) => {
    if (product.variants.edges?.length > 0) {
      return product?.variants?.edges[0]?.node;
    } else if (product?.variants?.nodes?.length > 0) {
      return product?.variants?.nodes[0];
    } else {
      return null;
    }
  };

  //Add to Cart Product
  const addToCartProduct = async (variantId: any, quantity: any) => {
    logEvent(`Add To Cart Pressed variantId:${variantId} Qty:${quantity}`);
    await addToCart(variantId, quantity);
    Toast.show(`${quantity} item${quantity !== 1 ? 's' : ''} added to cart`);
    scheduleNotification();
  };

  const handleChatButtonPress = () => {
    logEvent('Chat button clicked in Food Home Screen');
    navigation.navigate("ShopifyInboxScreen")
  };

  return (
    <KeyboardAvoidingView style={[flex, { backgroundColor: colors.whiteColor }]} behavior="padding" enabled>
      <Header
        navigation={navigation}
        textinput={true}
        image={true}
        menuImage={true}
        shoppingCart={true}
        onPressShopByCatagory={onPressShopAll}
      />
      <View style={[styles.container, flex, { backgroundColor: colors.whiteColor }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.title}
              style={[
                styles.menuItem,
                selectedItem === item?.title && styles.selectedMenuItem,
              ]}
              onPress={() => handleMenuPress(item.title)}
            >
              <Text style={[styles.menuText, { color: colors.blackColor }]}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView showsVerticalScrollIndicator={false} >
          <View style={[alignJustifyCenter, { width: wp(100), height: hp(4.5), backgroundColor: colors.blackColor, marginTop: 5 }]}>
            <Animated.Text
              style={[
                styles.marqueeText,
                {
                  transform: [{ translateX }],
                  color: colors.whiteColor,
                  fontWeight: '300',
                  fontSize: 14,
                },
              ]}
            >
              Free Shipping on All Orders
            </Animated.Text>

          </View>
          <View style={[{ width: wp(100), height: "auto", marginTop: 5, paddingHorizontal: spacings.large }, flexDirectionRow]}>
            <FlatList
              data={catagory}
              renderItem={({ item }) => {
                return (
                  <View style={[{ width: wp(24), height: hp(14) }, alignItemsCenter]}>
                    <Pressable
                      style={[styles.categoryCard, overflowHidden, alignJustifyCenter, { backgroundColor: whiteColor, borderColor: isDarkMode ? whiteColor : "", borderWidth: isDarkMode ? 1 : .5 }]}
                      onPress={() =>
                        item.id === 'more'
                          ? onPressShopAll()
                          : onPressCollection(item?.id, item?.title)
                      }
                    >
                      <Image
                        source={
                          item.id === 'more' ? item.image : { uri: item.image.url }
                        }
                        style={
                          item.id === 'more'
                            ? { width: wp(10), height: wp(10) }
                            : [styles.categoryImage, resizeModeCover]
                        }
                      />
                    </Pressable>
                    <Text
                      style={[
                        styles.categoryName,
                        textAlign,
                        {
                          lineHeight: lineHeights[item?.title] || 10,
                          color: colors.blackColor,
                          paddingVertical: spacings.large,
                          fontWeight: style.fontWeightBold.fontWeight,
                          fontSize: style.fontSizeSmall.fontSize
                        },
                      ]}
                      onTextLayout={handleTextLayout(item?.title)}
                    >
                      {item?.title}
                    </Text>
                  </View>
                );
              }}
              showsHorizontalScrollIndicator={false}
              horizontal
              keyExtractor={(item) => item?.id}
            />
          </View>
          <View style={{ paddingHorizontal: spacings.large }}>
            <Carousal
              data={carouselData.slice(0, 3)}
              dostsShow={true}
              renderItem={item => (
                <Image source={{ uri: item?.image }} style={[{ width: wp(91.8), height: hp(20) }, borderRadius10, resizeModeCover]} />
              )}
            />
          </View>
          <View style={[{ width: wp(100), height: "auto", marginTop: 5, paddingHorizontal: spacings.large }, flexDirectionRow]}>
            <FlatList
              data={shopifyCollection.slice(5, 10)}
              renderItem={({ item }) => (
                <View style={[{ width: wp(35), height: hp(20), borderWidth: 0.5, borderColor: lightGrayOpacityColor, paddingVertical: spacings.small, margin: spacings.small }, alignJustifyCenter]}>
                  <Pressable style={[styles.categoryCollectionCard, overflowHidden, alignJustifyCenter]} onPress={() => onPressCollection(item?.id, item.title)}>
                    <Image source={{ uri: item?.image?.url }} style={[styles.categoryCollectionImage, resizeModeContain]} />
                  </Pressable>
                  <Text
                    style={[
                      styles.categoryName,
                      textAlign,
                      {
                        lineHeight: lineHeights[item?.title] || 10,
                        color: colors.blackColor,
                        paddingVertical: spacings.large,
                        fontWeight: style.fontWeightBold.fontWeight,
                      }
                    ]}
                    onTextLayout={handleTextLayout(item?.title)}>{item?.title}</Text>
                </View>
              )}
              showsHorizontalScrollIndicator={false}
              horizontal
              keyExtractor={(item) => item.id}
            />
          </View>
          <Text style={[styles.text, textAlign, { paddingVertical: spacings.xxLarge, fontSize: style.fontSizeMedium2x.fontSize, color: colors.blackColor }]}>
            Discover Exciting {'\n'}
            Food Selections
          </Text>
          <View style={[{ height: hp(30) }, alignJustifyCenter]}>
            {products?.length > 0 ? <FlatList
              data={products}
              renderItem={({ item, index }) => {
                return (
                  <Product
                    product={item}
                    onAddToCart={addToCartProduct}
                    loading={addingToCart?.has(getVariant(item)?.id ?? '')}
                    inventoryQuantity={bestDealInventoryQuantities[index]}
                    option={bestDealoptions[index]}
                    ids={bestDealProductVariantsIDS[index]}
                    width={wp(36)}
                    onPress={() => {
                      navigation.navigate('ProductDetails', {
                        product: item,
                        variant: getVariant(item),
                        inventoryQuantity: bestDealInventoryQuantities[index],
                        tags: bestDealTags[index],
                        option: bestDealoptions[index],
                        ids: bestDealProductVariantsIDS[index]
                      });
                    }}
                  />
                );
              }}
              showsHorizontalScrollIndicator={false}
              horizontal
            /> :
              <LoaderKit
                style={{ width: 50, height: 50 }}
                name={LOADER_NAME}
                color={colors.blackColor}
              />
            }
          </View>
          <FastImage
            source={{ uri: GIF.gif }}
            style={[
              { width: wp(100), height: hp(30), marginVertical: spacings.large },
            ]}
          />
          <View style={[styles.Box, flexDirectionRow, justifyContentSpaceBetween]}>
            <View style={[styles.catagoryBox]}>
              <FlatList
                data={shopifyCollection.slice(8, 10)}
                renderItem={({ item }) => (
                  <Pressable
                    style={[{ width: "100%", height: hp(14.5), marginVertical: spacings.small }, alignJustifyCenter]}
                    onPress={() => onPressCollection(item?.id, item?.title)}
                  >
                    <View style={{ width: "100%", height: hp(15), position: 'relative' }}>
                      <Image
                        source={{ uri: item?.image?.url }}
                        style={[{ width: "100%", height: "100%" }, resizeModeCover]}
                      />
                      <View style={styles.textContainer}>
                        <Text style={styles.categoryName}>{item?.title}</Text>
                      </View>
                    </View>
                  </Pressable>
                )}
                keyExtractor={(item) => item?.id}
              />
            </View>
            <FlatList
              data={shopifyCollection.slice(6, 7)}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.singleCatagoryBox]}
                  onPress={() => onPressCollection(item?.id, item?.title)}
                >
                  <View style={{ width: wp(60), height: hp(30), position: 'relative' }}>
                    <Image
                      source={{ uri: item?.image?.url }}
                      style={[{ width: '100%', height: '100%' }, resizeModeCover]}
                    />
                    <View style={styles.textContainer}>
                      <Text style={styles.categoryName}>{item?.title}</Text>
                    </View>
                  </View>
                </Pressable>
              )}
              keyExtractor={(item) => item?.id}
            />
          </View>
          <Text style={[styles.text, textAlign, { paddingVertical: spacings.xxLarge, fontSize: style.fontSizeMedium2x.fontSize, color: colors.blackColor, }]}>
            Explore Delicious {'\n'}
            Food Choices
          </Text>
          <View style={[{ width: wp(100), height: "auto", marginTop: 5, paddingHorizontal: spacings.large }, flexDirectionRow]}>
            <FlatList
              data={shopifyCollection.slice(5, 10)}
              renderItem={({ item }) => (
                <View style={[{ width: wp(35), height: hp(20), borderWidth: 0.5, borderColor: lightGrayOpacityColor, paddingVertical: spacings.small, margin: spacings.small }, alignJustifyCenter]}>
                  <Pressable style={[styles.categoryCollectionCard, overflowHidden, alignJustifyCenter]} onPress={() => onPressCollection(item?.id, item?.title)}>
                    <Image source={{ uri: item?.image?.url }} style={[styles.categoryCollectionImage, resizeModeContain]} />
                  </Pressable>
                  <Text
                    style={[
                      styles.categoryName,
                      textAlign,
                      {
                        lineHeight: lineHeights[item?.title] || 10,
                        color: colors.blackColor,
                        paddingVertical: spacings.large,
                        fontWeight: style.fontWeightBold.fontWeight
                      }
                    ]}
                    onTextLayout={handleTextLayout(item?.title)}>{item?.title}</Text>
                </View>
              )}
              showsHorizontalScrollIndicator={false}
              horizontal
              keyExtractor={(item) => item.id}
            />
          </View>
          <View style={[{ padding: spacings.large }]}>
            <Image source={{ uri: "https://appinventiv.com/wp-content/themes/twentynineteen-child/new-images/restaurant-banner-new.webp" }}
              style={{ width: "100%", height: hp(25), resizeMode: "cover" }} />
          </View>
          <Text style={[styles.text, textAlign, { paddingVertical: spacings.xxLarge, fontSize: style.fontSizeMedium2x.fontSize, color: colors.blackColor, }]}>
            Discover New {'\n'}
            Culinary Experiences
          </Text>
          <View style={{ alignItems: 'center', justifyContent: "center" }} >
            <FlatList
              data={data?.products?.edges.slice(0, 6)}
              renderItem={({ item, index }) => {
                const { node } = item;
                return (
                  <Product
                    key={node.id}
                    product={node}
                    onAddToCart={addToCartProduct}
                    loading={addingToCart?.has(getVariant(node)?.id ?? '')}
                    inventoryQuantity={inventoryQuantities[index]}
                    option={options[index]}
                    ids={productVariantsIDS[index]}
                    width={isDarkMode ? wp(32.5) : wp(33.2)}
                    onPress={() => {
                      navigation.navigate('ProductDetails', {
                        product: node,
                        variant: getVariant(node),
                        inventoryQuantity: inventoryQuantities[index],
                        tags: tags[index],
                        option: options[index],
                        ids: productVariantsIDS[index]
                      });
                    }}
                  />
                );
              }}
              numColumns={3}
              keyExtractor={(item) => item.node.id}
            />
          </View>
        </ScrollView>
        <ChatButton onPress={handleChatButtonPress} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: whiteColor,
    paddingVertical: spacings.xxsmall
  },
  menuContainer: {
    paddingVertical: spacings.large,
    height: hp(8),
  },
  menuItem: {
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.xxsmall,
    marginRight: spacings.large,
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  selectedMenuItem: {
    borderBottomColor: redColor,
    borderBottomWidth: 2,
    paddingVertical: spacings.xxsmall,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "500",
    color: blackColor,
  },
  text: {
    fontSize: style.fontSizeNormal2x.fontSize,
    fontWeight: style.fontWeightMedium.fontWeight,
    color: blackColor,
    fontFamily: 'GeneralSans-Variable'
  },
  categoryCard: {
    width: wp(20),
    height: wp(20),
    borderRadius: 100,
    borderWidth: 0.5,
    paddingVertical: spacings.small,
  },

  categoryImage: {
    width: "100%",
    height: "110%",
    borderRadius: 10,
  },
  categoryName: {
    fontSize: style.fontSizeNormal.fontSize,
    color: whiteColor,
    fontWeight: style.fontWeightThin1x.fontWeight,
  },
  categoryCollectionCard: {
    width: wp(30),
    height: wp(33),
  },
  categoryCollectionImage: {
    width: wp(28),
    height: hp(15),
    borderRadius: 10,
  },
  Box: {
    paddingHorizontal: spacings.large,
    width: wp(100),
    height: hp(30),
  },
  catagoryBox: {
    width: wp(40),
    height: hp(30),
  },
  singleCatagoryBox: {
    width: wp(60),
    height: hp(30.4),
    marginLeft: spacings.large
  },
  textContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    padding: 10,
  },
  marqueeText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
  },

});

export default HomeScreenFood;
