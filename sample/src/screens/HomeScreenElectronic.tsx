import React, { useCallback, useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Pressable, KeyboardAvoidingView, ImageBackground } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { whiteColor, blackColor, redColor, } from '../constants/Color'
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import Carousal from '../components/Carousal'
import Header from '../components/Header'
import Product from '../components/ProductVertical';
import ChatButton from '../components/ChatButton';
import { BACKGROUND_IMAGE, WARLEY_SEARCH } from '../assests/images';
import {
  SHOP_BY, BRANDS, SEARCH, BEST_SELLING, OUR_PRODUCT, STOREFRONT_DOMAIN, ADMINAPI_ACCESS_TOKEN, ELECTRONIC_OUR_PRODUCT_COLLECTION_ID,
  STOREFRONT_ACCESS_TOKEN, LOADER_NAME, SHOW_ALL, BEST_DEALS, CATEGORIES
} from '../constants/Constants'
import useShopify from '../hooks/useShopify';
import { useCart } from '../context/Cart';
import type { ShopifyProduct } from '../../@types';
import Toast from 'react-native-simple-toast';
import { logEvent } from '@amplitude/analytics-react-native';
import axios from 'axios';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import { useDispatch, useSelector } from 'react-redux';
import { selectMenuItem } from '../redux/actions/menuActions';
import { useFocusEffect } from '@react-navigation/native';
import LoaderKit from 'react-native-loader-kit';
import { clearWishlist } from '../redux/actions/wishListActions';
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
import { scheduleNotification } from '../notifications';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
const { flex, alignJustifyCenter, flexDirectionRow, resizeModeCover, justifyContentSpaceBetween, borderRadius10, alignItemsCenter,
  textAlign, overflowHidden } = BaseStyle;

const HomeScreenElectronic = ({ navigation }: { navigation: any }) => {
  const selectedItem = useSelector((state) => state.menu.selectedItem);
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
  const [bestDealProducts, setBestDealProducts] = useState([]);
  const { queries } = useShopify();
  const [fetchCollections, { data: collectionData }] = queries.collections;
  const [fetchProducts, { data }] = queries.products;
  const [menuItems, setMenuItems] = useState([]);
  const [shopifyCollection, setShopifyCollection] = useState([])
  const [collectionsFetched, setCollectionsFetched] = useState(false);

  const dispatch = useDispatch();
  const borderColors = ['#53b175', '#d2b969', '#ed2027', '#a476b6', '#ed2027', '#a476b6', , '#d2b969', , '#a476b6',];
  const collections = shopifyCollection || [];
  const catagory = [...collections.slice(0, 5)];

  const productsBest = [
    {
      id: '1',
      image: 'https://s3-alpha-sig.figma.com/img/578d/2ba4/c3a8dc433f0e3983c2d4e9dcb8d03d9b?Expires=1730073600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=JruJINvGSEgSjhvmvBJGzgEeCm1u5U7w0GEjlY6GztUaZVJ1b6C0lDndz7vXfwwBX~p3WGH7Hix-fYxfZeE3baQg6tbKy4OMthE7zXGCFaaP-bBkU78nJjiB2CgssMedeEsjFcwbbOWZELxP2UCViFHNQtoLu2EhN5FQQaaJglxKeuvWfsHivx5wpUqw70ePDD48FKOermOXyXaqwn2lWCNSfo5CrqkQ6YdCUHH3LE0SEjAhOzNgsdhZXp7nOIJk80toU3RR0XaM~-UljovGMWRJbMrWQM5-SvnG0c~Dr4F5XigoHCulOolLojzumlFQIN5kocNBoxmv6j6K0DA7FQ__',
    },
    {
      id: '2',
      image: "https://s3-alpha-sig.figma.com/img/3510/5699/8c766d0c9fa02396676cba1395f67713?Expires=1730073600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=kF23ZrSXKIjsnL9SaFY3284Jt14LM1HF-U-E4FyoIeqkSR~hbU9gXoK3kbVjUJaIhhfHIA1jjouMiw7jGPqf-2AJd3ywyhZI5qZrCN13UqDUQEODZLfWHEpayrsd1S5cEPMkOJtTfR01~58J18Unow8rye9kgifPyMGDWepTuwxwpFLaGHJTi0oeajkQEtnLkpa0RbH2Hjt3sdmFRM8-GaTDMdO-ggYeeGEIRXEeRNjKzUl1HLKeA7jDtS~MdeV7Z28f~7FKHqg51dRhp4hBSvWD7kIHRUgrVuZ82YMjUYK8gOcTVvKDP74oNTBxGuMVzDt9mtAm4a5siGougc0v1A__",
    },
  ];

  const carouselData = [
    { id: 1, image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/bannerimages%2FElectronics%2FelectronicsBanner.png?alt=media&token=84b75ba9-326a-4ae1-b24b-03a83e042fe9" },
    { id: 2, image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/bannerimages%2FElectronics%2FelectronicBanner1.png?alt=media&token=970f5567-1bfc-4781-a743-da6e06992d02" },
    { id: 3, image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/bannerimages%2FElectronics%2FelctronicBanner2.png?alt=media&token=374ce619-3807-4c7d-9a23-95c3bdb0181b" },
    { id: 4, image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/bannerimages%2FElectronics%2FelectronicBanner3.png?alt=media&token=92760afb-8bb1-407b-b387-c7e8acb90691" },
    { id: 5, image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/bannerimages%2FElectronics%2Felectronicbanner4.png?alt=media&token=077fc9b2-d191-4027-b5d4-4ed7cddb991a" },
  ];

  useEffect(() => {
    logEvent('Home Screen Electronic Initialized');
  }, [])

  //best selling
  useEffect(() => {
    const fetchproduct = () => {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("X-Shopify-Access-Token", ADMINAPI_ACCESS_TOKEN);
      const graphql = JSON.stringify({
        query: `query MyQuery {
      collection(id: "gid://shopify/Collection/633133924694") {
        products(first: 10) {
          nodes {
            id
            images(first: 10) {
              nodes {
                src
                url
              }
            }
            title
            tags
            options(first:10){
              id
              name
              values
            }
            variants(first: 10) {
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
          setBestDealProducts(fetchedProducts?.data?.collection?.products?.nodes);
          const inventoryQuantities = fetchedProducts?.data?.collection?.products?.nodes?.map((productEdge) => {
            return productEdge?.variants?.nodes?.map((variants) => variants?.inventoryQuantity);
          });
          setBestDealInventoryQuantities(inventoryQuantities)
          const fetchedOptions = fetchedProducts?.data?.collection?.products?.nodes.map((product) => product.options);
          setBestDealOptions(fetchedOptions);

          const productVariantData = fetchedProducts?.data?.collection?.products?.nodes.map((product) =>
            product.variants.nodes.map((variant) => ({
              id: variant?.id,
              title: variant?.title,
              inventoryQty: variant?.inventoryQuantity,
              image: variant?.image
            }))
          );
          setBestDealProductVariantsIDS(productVariantData);

          const fetchedTags = fetchedProducts?.data?.collection?.products?.nodes.map(productEdge => productEdge?.tags);
          setbestDealTags(fetchedTags)
        })
        .catch((error) => console.log(error));
    }
    fetchproduct();
  }, [])

  //our product
  useEffect(() => {
    const fetchproduct = () => {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("X-Shopify-Access-Token", ADMINAPI_ACCESS_TOKEN);
      const graphql = JSON.stringify({
        query: `query MyQuery {
        collection(id: "gid://shopify/Collection/633133957462") {
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
          setInventoryQuantities(inventoryQuantities)
          const fetchedOptions = fetchedProducts?.data?.collection?.products?.nodes?.map((product) => product?.options);
          setOptions(fetchedOptions);

          const productVariantData = fetchedProducts?.data?.collection?.products?.nodes.map((product) =>
            product.variants.nodes.map((variant) => ({
              id: variant?.id,
              title: variant?.title,
              inventoryQty: variant?.inventoryQuantity,
              image: variant?.image
            }))
          );
          setProductVariantsIDS(productVariantData);

          const fetchedTags = fetchedProducts?.data?.collection?.products?.nodes.map(productEdge => productEdge?.tags);
          setTags(fetchedTags)
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

  //onpress menu item
  const handleMenuPress = (item) => {
    logEvent(`Change theme from Electronic  to Themename :${item}`);
    dispatch(selectMenuItem(item));
    dispatch(clearWishlist());
    clearCart()
  };

  //fetch menu item
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
        item?.title?.toLowerCase() === selectedItem.toLowerCase()
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
      const product = response.data.product;
      const ids = product?.variants?.map((variant) => ({
        id: variant?.admin_graphql_api_id,
        title: variant?.title,
        inventoryQty: variant?.inventory_quantity,
        image: variant?.image
      }));
      return {
        product: product,
        variants: product?.variants.map((variant) => ({
          id: variant?.id,
          title: variant?.title,
          inventoryQuantity: variant?.inventory_quantity,
          options: variant?.option_values,
        })),
        inventoryQuantities: product?.variants.map((variant) => variant?.inventory_quantity),
        tags: product?.tags.split(','),
        options: product?.options.map((option) => ({
          name: option?.name,
          values: option?.values,
        })),
        ids: ids,
      };

    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  //for text layout
  const handleTextLayout = (title: any) => (event) => {
    const { lines } = event.nativeEvent;
    const newLineHeights = { ...lineHeights };
    newLineHeights[title] = lines.length > 1 ? 13 : 16;
    setLineHeights(newLineHeights);
  };

  //move to catalog page
  const onPressShopAll = () => {
    logEvent('SeeAll Button Pressed from HomeScreenElectroncs');
    navigation.navigate('CatalogStack')
  }

  //move to collection page
  const onPressCollection = (id: any, heading: any) => {
    logEvent(`See All our product Collection Button Pressed from HomeScreenElectronics CollectionID: ${id} CollectionName: ${heading}`);
    navigation.navigate('Collections', {
      id: id, headingText: heading
    })
  }

  //get product variant
  const getVariant = (product: ShopifyProduct) => {
    if (product?.variants?.edges?.length > 0) {
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

  //handleChatButtonPress
  const handleChatButtonPress = () => {
    logEvent('Chat button clicked in Electronics Home Screen');
    navigation.navigate("ShopifyInboxScreen")
  };

  //onPressSeacrchBar
  const onPressSeacrchBar = () => {
    logEvent("Click on Search Bar");
    navigation.navigate('Search',
      { navigation: navigation })
  }

  return (
    <ImageBackground style={[flex, { backgroundColor: colors.whiteColor }]} source={isDarkMode ? "" : BACKGROUND_IMAGE}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        stickyHeaderIndices={[1]}
      >
        {/* Header */}
        <View>
          <Header
            navigation={navigation}
            image={true}
            menuImage={true}
            notification={true}
            profile={true}
            onPressShopByCatagory={onPressShopAll}
          />
        </View>

        {/* Search Bar (Sticky) */}
        <View>
          <TouchableOpacity
            style={[
              styles.input,
              flexDirectionRow,
              alignItemsCenter,
              {
                backgroundColor: isDarkMode ? colors.grayColor : whiteColor,
                shadowColor: colors.grayColor,
              },
            ]}
            onPress={onPressSeacrchBar}
          >
            <View style={[flex]}>
              <Text style={{ color: isDarkMode ? whiteColor : colors.grayColor }}> {"Search here for anything you want..."}</Text>
            </View>
            <Image
              source={WARLEY_SEARCH}
              style={{ width: wp(4), height: hp(5), resizeMode: 'contain', marginRight: 5 }}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.container, flex]}>

          {/* bannerCarousal */}
          <Carousal
            data={carouselData.slice(0, 3)}
            dostsShow={true}
            renderItem={item => (
              <Image source={{ uri: item?.image }} style={[{ width: wp(95), height: hp(20), resizeMode: "cover" }, borderRadius10]} />
            )}
          />
          {/* Shop by BRANDS */}
          <View style={[{ width: "100%", marginVertical: 10 }, alignItemsCenter, justifyContentSpaceBetween, flexDirectionRow]}>
            <Text style={[styles.text, { color: colors.blackColor }]}>{SHOP_BY}<Text style={{ color: redColor }}>{BRANDS}</Text> </Text>
            <Pressable onPress={onPressShopAll}>
              <Text style={{ color: "#717171", fontSize: style.fontSizeNormal.fontSize, fontWeight: style.fontWeightThin1x.fontWeight }} >{SHOW_ALL}</Text>
            </Pressable>
          </View>
          <View style={[{ width: wp(100), height: "auto", marginTop: 5, paddingHorizontal: spacings.large }, flexDirectionRow]}>
            {!collectionData?.collections?.edges ? (
              <SkeletonPlaceholder>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ width: wp(24), height: hp(12), borderRadius: 10, marginRight: 10 }} />
                  <View style={{ width: wp(24), height: hp(12), borderRadius: 10, marginRight: 10 }} />
                  <View style={{ width: wp(24), height: hp(12), borderRadius: 10, marginRight: 10 }} />
                  <View style={{ width: wp(24), height: hp(12), borderRadius: 10, marginRight: 10 }} />
                </View>
              </SkeletonPlaceholder>
            ) : (
              <FlatList
                data={collectionData?.collections?.edges.slice(0, 6)}
                renderItem={({ item, index }) => {
                  const borderColor = borderColors[index % borderColors.length];
                  return (
                    <View style={[{ width: wp(23), height: hp(14) }]}>
                      <Pressable
                        style={[
                          styles.categoryCard,
                          overflowHidden,
                          alignJustifyCenter,
                          {
                            backgroundColor: whiteColor,
                            borderColor: isDarkMode ? whiteColor : borderColor,
                            borderWidth: 1,
                          },
                        ]}
                        onPress={() =>
                          item.id === 'more'
                            ? onPressShopAll()
                            : onPressCollection(item?.node?.id, item?.node?.title)
                        }
                      >
                        <Image
                          source={{ uri: item?.node?.image?.url }}
                          style={[styles.categoryImage, { resizeMode: "contain" }]}
                        />
                      </Pressable>
                    </View>
                  );
                }}
                showsHorizontalScrollIndicator={false}
                horizontal
                keyExtractor={(item) => item?.id}
              />
            )}
          </View>

          {/* catagories */}
          <View style={[{ width: "100%", marginBottom: 10 }, alignItemsCenter, justifyContentSpaceBetween, flexDirectionRow]}>
            <Text style={[styles.text, { color: colors.blackColor }]}>{CATEGORIES}</Text>
            <Pressable onPress={onPressShopAll}>
              <Text style={{ color: "#717171", fontSize: style.fontSizeNormal.fontSize, fontWeight: style.fontWeightThin1x.fontWeight }} >{SHOW_ALL} </Text>
            </Pressable>
          </View>
          {
            !collectionData?.collections?.edges ? (
              <SkeletonPlaceholder>
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ width: wp(20), height: wp(20), borderRadius: 50, margin: 10 }} />
                    <View style={{ width: wp(20), height: wp(20), borderRadius: 50, margin: 10 }} />
                    <View style={{ width: wp(20), height: wp(20), borderRadius: 50, margin: 10 }} />
                    <View style={{ width: wp(20), height: wp(20), borderRadius: 50, margin: 10 }} />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ width: wp(20), height: wp(20), borderRadius: 50, margin: 10 }} />
                    <View style={{ width: wp(20), height: wp(20), borderRadius: 50, margin: 10 }} />
                    <View style={{ width: wp(20), height: wp(20), borderRadius: 50, margin: 10 }} />
                    <View style={{ width: wp(20), height: wp(20), borderRadius: 50, margin: 10 }} />
                  </View>
                </View>
              </SkeletonPlaceholder>
            ) : (
              <View style={[{ width: wp(100), height: "auto", marginTop: 5 }, flexDirectionRow]}>
                <FlatList
                  data={collectionData?.collections?.edges.slice(0, 8)}
                  renderItem={({ item, index }) => {
                    // console.log(item?.node?.id)
                    const borderColor = borderColors[index % borderColors.length];
                    return (
                      <View style={[{ width: wp(24.5), height: hp(15) }, alignItemsCenter]}>
                        <Pressable
                          style={[
                            styles.card,
                            overflowHidden,
                            alignJustifyCenter,
                            {
                              borderWidth: 1,
                              borderColor: isDarkMode ? borderColor : borderColor,
                            },
                          ]}
                          onPress={() => onPressCollection(item?.node?.id, item?.node?.title)}
                        >
                          <Image
                            source={{ uri: item?.node?.image?.url }}
                            style={[styles.categoryImage, { resizeMode: "contain" }]}
                          />
                        </Pressable>
                        <Text
                          style={[
                            styles.categoryName,
                            textAlign,
                            {
                              lineHeight: lineHeights[item?.node?.title] || 10,
                              color: blackColor,
                              paddingVertical: spacings.large,
                              fontWeight: style.fontWeightBold.fontWeight,
                              fontSize: style.fontSizeSmall.fontSize,
                              color: colors.blackColor,
                            },
                          ]}
                          onTextLayout={handleTextLayout(item?.node?.title)}
                        >
                          {item?.node?.title}
                        </Text>
                      </View>
                    );
                  }}
                  numColumns={4}
                  keyExtractor={(item) => item?.node?.id}
                />
              </View>
            )
          }


          {/* BestSelling */}
          <Text style={[styles.text, { color: colors.blackColor, marginBottom: 15 }]}>{BEST_SELLING}</Text>
          <View style={[{ height: hp(26) }, alignJustifyCenter]}>
            {bestDealProducts?.length > 0 ? <FlatList
              data={bestDealProducts}
              renderItem={({ item, index }) => {
                return (
                  <Product
                    product={item}
                    onAddToCart={addToCartProduct}
                    loading={addingToCart?.has(getVariant(item)?.id ?? '')}
                    // inventoryQuantity={bestDealInventoryQuantities[index]}
                    option={bestDealoptions[index]}
                    ids={bestDealProductVariantsIDS[index]}
                    spaceTop={4}
                    onPress={() => {
                      navigation.navigate('ProductDetails', {
                        product: item,
                        variant: getVariant(item),
                        // inventoryQuantity: bestDealInventoryQuantities[index],
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
              <SkeletonPlaceholder>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ width: wp(43), height: hp(21), borderRadius: 10, marginRight: 10 }} />
                  <View style={{ width: wp(43), height: hp(21), borderRadius: 10, marginRight: 10 }} />
                  <View style={{ width: wp(43), height: hp(21), borderRadius: 10, marginRight: 10 }} />
                  <View style={{ width: wp(43), height: hp(21), borderRadius: 10, marginRight: 10 }} />
                </View>
              </SkeletonPlaceholder>
              // <LoaderKit
              //   style={{ width: 50, height: 50 }}
              //   name={LOADER_NAME}
              //   color={blackColor}
              // />
            }
          </View>

          {/* BestDeals */}
          <View style={[{ width: "100%", marginVertical: 15 }, alignItemsCenter, justifyContentSpaceBetween, flexDirectionRow]}>
            <Text style={[styles.text, { color: colors.blackColor }]}>{BEST_DEALS}</Text>
          </View>
          <ScrollView
            horizontal
            contentContainerStyle={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
            showsHorizontalScrollIndicator={false}>
            {productsBest?.map(item => (
              <View key={item}>
                <TouchableOpacity style={{ marginRight: 12, overflow: "hidden", borderRadius: 10 }}>
                  <Image source={{ uri: item.image }} style={{ width: 200, height: 200 }} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* ourProduct */}
          <View style={[{ width: "100%", marginVertical: 15 }, alignItemsCenter, justifyContentSpaceBetween, flexDirectionRow]}>
            <Text style={[styles.text, { color: colors.blackColor }]}>{OUR_PRODUCT}</Text>
            <Text style={{ color: "#717171", fontSize: style.fontSizeNormal.fontSize, fontWeight: style.fontWeightThin1x.fontWeight }} onPress={() => onPressCollection(ELECTRONIC_OUR_PRODUCT_COLLECTION_ID, OUR_PRODUCT)}>{SHOW_ALL}</Text>
          </View>
          <View style={[{ height: hp(30) }, alignJustifyCenter]}>
            {products?.length > 0 ? <FlatList
              data={products}
              renderItem={({ item, index }) => {
                return (
                  <Product
                    product={item}
                    onAddToCart={addToCartProduct}
                    loading={addingToCart?.has(getVariant(item)?.id ?? '')}
                    inventoryQuantity={inventoryQuantities[index]}
                    option={options[index]}
                    ids={productVariantsIDS[index]}
                    spaceTop={4}
                    onPress={() => {
                      navigation.navigate('ProductDetails', {
                        product: item,
                        variant: getVariant(item),
                        inventoryQuantity: inventoryQuantities[index],
                        tags: tags[index],
                        option: options[index],
                        ids: productVariantsIDS[index]
                      });
                    }}
                  />
                );
              }}
              showsHorizontalScrollIndicator={false}
              horizontal
            /> :
              <SkeletonPlaceholder>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ width: wp(43), height: hp(21), borderRadius: 10, marginRight: 10 }} />
                  <View style={{ width: wp(43), height: hp(21), borderRadius: 10, marginRight: 10 }} />
                  <View style={{ width: wp(43), height: hp(21), borderRadius: 10, marginRight: 10 }} />
                  <View style={{ width: wp(43), height: hp(21), borderRadius: 10, marginRight: 10 }} />
                </View>
              </SkeletonPlaceholder>
              // <LoaderKit
              //   style={{ width: 50, height: 50 }}
              //   name={LOADER_NAME}
              //   color={blackColor}
              // />
            }
          </View>

          {/* bannerCarousal */}
          <Carousal
            data={carouselData.slice(3, 5)}
            dostsShow={true}
            renderItem={item => (
              <Image source={{ uri: item?.image }} style={[{ width: wp(91.5), height: hp(20) }, borderRadius10, resizeModeCover]} />
            )}
          />
        </View>
      </ScrollView>
      <ChatButton onPress={handleChatButtonPress} bottom={hp(5)} />
    </ImageBackground >
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacings.large
  },
  text: {
    fontSize: style.fontSizeMedium.fontSize,
    fontWeight: style.fontWeightThin1x.fontWeight,
    color: blackColor,
    // fontFamily: 'GeneralSans-Variable'
  },
  input: {
    width: "95.5%",
    height: hp(6),
    borderColor: 'transparent',
    borderWidth: .1,
    borderRadius: 5,
    paddingHorizontal: spacings.large,
    // marginVertical: spacings.small,
    marginHorizontal: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.75,
    shadowRadius: 10,
    elevation: 6,
    // height: 40,
  },
  card: {
    width: wp(20),
    height: wp(20),
    borderRadius: 100,
    borderWidth: 0.5,
    paddingVertical: spacings.small,
  },
  categoryCard: {
    width: wp(20),
    height: wp(22),
    borderRadius: 15,
    borderWidth: 0.5,
    paddingVertical: spacings.small,
  },
  categoryImage: {
    width: "110%",
    height: "110%",
    // borderRadius: 10,
  },
  categoryName: {
    fontSize: style.fontSizeNormal.fontSize,
    color: whiteColor,
    fontWeight: style.fontWeightThin1x.fontWeight,
  },

  image: {
    width: 100,
    height: 100,
    marginBottom: 5,
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
    fontWeight: '500',
    color: blackColor,
  },
});

export default HomeScreenElectronic;

