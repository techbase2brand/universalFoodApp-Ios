import React, { useCallback, useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Pressable, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { whiteColor, blackColor, grayColor, redColor, lightGrayOpacityColor,blackOpacity5 } from '../constants/Color'
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import Carousal from '../components/Carousal'
import Header from '../components/Header'
import Product from '../components/ProductVertical';
import {
  SEE_ALL, SHOP_BY_PRODUCT_CATAGORY, NEW_LAUNCHES, BEST_SELLING,OUR_PRODUCT, BEST_DRINKS_CHOICES, WORLD_OF_WISKEY, STOREFRONT_DOMAIN, ADMINAPI_ACCESS_TOKEN,
  DRINK_OUR_PRODUCT_COLLECTION_ID, STOREFRONT_ACCESS_TOKEN, LOADER_NAME
} from '../constants/Constants'
import useShopify from '../hooks/useShopify';
import { useCart } from '../context/Cart';
import type { ShopifyProduct } from '../../@types';
import Toast from 'react-native-simple-toast';
import { logEvent } from '@amplitude/analytics-react-native';
import Octicons from 'react-native-vector-icons/dist/Octicons';
import FastImage from 'react-native-fast-image';
import axios from 'axios';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import { useDispatch, useSelector } from 'react-redux';
import { selectMenuItem } from '../redux/actions/menuActions';
import { useFocusEffect } from '@react-navigation/native';
import LoaderKit from 'react-native-loader-kit'

const { flex, alignJustifyCenter, flexDirectionRow, resizeModeContain, resizeModeCover, justifyContentSpaceBetween, borderRadius10, alignItemsCenter,
  textAlign, overflowHidden, positionRelative, positionAbsolute } = BaseStyle;

const HomeScreenDrink = ({ navigation }: { navigation: any }) => {
  const selectedItem = useSelector((state) => state.menu.selectedItem);
  const { addToCart, addingToCart } = useCart();
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

  const carouselData = [
    { id: 1, image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/bannerimages%2FDrinks%2Fdrinkbanner2.png?alt=media&token=272cbf3e-ad17-4317-942a-07167c726548" },
    { id: 2, image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/bannerimages%2FDrinks%2Fdrinkbanner3.png?alt=media&token=bbac72a9-af38-4a91-afbe-6c5366aa7dc6" },
    { id: 3, image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/bannerimages%2FDrinks%2Fdrinkbanner4.png?alt=media&token=39ff8aa3-576e-4060-ac53-8fa948651fd1" },
    { id: 4, image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/bannerimages%2FDrinks%2Fdrinkbanner5.png?alt=media&token=fdcee7fd-4a4c-4b92-8e9f-98021bfde920" },
    { id: 5, image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/bannerimages%2FDrinks%2Fdrinkbanner6.png?alt=media&token=ef64546c-4a25-4018-ac9c-7e4f9b0db4b0" }
  ];

  const drinkCollections = [
    { id: 1, image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/Collections%2FbourBon.png?alt=media&token=8b3dd85a-e11c-443e-b8d1-60fa1e90b285" },
    { id: 2, image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/Collections%2Fwine.png?alt=media&token=20924d25-0ed0-43d6-a417-c168087576d7" },
    { id: 3, image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/Collections%2FcocktailBar.png?alt=media&token=de1e1611-c712-4f47-9536-6bfac51b4468" },
    { id: 4, image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/Collections%2Fcocktails.png?alt=media&token=d40ccb7b-82cc-478a-b1c9-b88bd0f212e7" },
    { id: 5, image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/Collections%2Ftequila.png?alt=media&token=a35fefd6-9b25-463d-bfc4-1c20b78f25e0" },
  ];

  const drinksBanner = [
    {
      id: "gid://shopify/Collection/331220484249",
      image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/New%20Launches%2FjackDeniels.png?alt=media&token=d5a4f98e-7598-4527-9ad2-954f1e049544",
      title: "Beers"
    },
    {
      id: "gid://shopify/Collection/331221041305",
      image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/New%20Launches%2Flindenmans.png?alt=media&token=60ae4ee1-8992-4571-989d-5d581b51bf39",
      title: "Lindenmans"
    },
    {
      id: "gid://shopify/Collection/331220943001",
      image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/New%20Launches%2Fhavanaclub.png?alt=media&token=938d735c-a807-4b7f-a22a-a8ce471c31ce",
      title: "Havana"
    },
    {
      id: "gid://shopify/Collection/331221729433",
      image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/New%20Launches%2Fgentlemjack.png?alt=media&token=7347a0dd-d0f0-4481-a8d8-2a2f108cdd04",
      title: "Jack"
    },
  ];

  const bannerImage = [
    { id: 1, image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/Chioces%2FblackLevel.png?alt=media&token=bf0d4b57-e873-455d-b5b7-43b1ef1ca56a" },
    { id: 2, image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/Chioces%2FhonexxyXo.png?alt=media&token=7ac24d86-3f08-4f28-8653-b6d6a3b2bdf0" },
    { id: 3, image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/Chioces%2Fhardys.png?alt=media&token=dc6902d0-0bf7-4b39-b4ed-2ad41beb1c51" },
    { id: 4, image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/Chioces%2ForangeHooch.png?alt=media&token=bbffd6d3-f57a-4fa7-b431-924369173ae1" },
    { id: 5, image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/Chioces%2Falize.png?alt=media&token=b2a0a164-7deb-444d-ae90-5e680c16357f" },
    { id: 6, image: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/Chioces%2FhardysGreen.png?alt=media&token=3deb086a-5efc-418d-9f44-393bf750c6c1" }
  ];

  const drinksGIF = [
    { id: 1, gif: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/Gif.gif?alt=media&token=fbc56834-b12d-4d77-a7be-9ecb43b7e31b", title: "Indian Whiskey" },
    { id: 2, gif: "https://firebasestorage.googleapis.com/v0/b/ecommerceapp-34078.appspot.com/o/Sequence.gif?alt=media&token=7d847e42-7a7e-4d2e-8c58-953d4a38c70f", title: "Scotch" },
  ];

  useEffect(() => {
    logEvent('Home Screen Initialized');
  }, [])

  //best selling
  useEffect(() => {
    const fetchproduct = () => {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("X-Shopify-Access-Token", ADMINAPI_ACCESS_TOKEN);
      const graphql = JSON.stringify({
        query: `query MyQuery {
      collection(id: "gid://shopify/Collection/331222089881") {
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
        collection(id: "gid://shopify/Collection/331220451481") {
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
    dispatch(selectMenuItem(item));
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
    logEvent('ShopAll Button Pressed from HomeScreen');
    navigation.navigate('CatalogStack')
  }

  //move to collection page
  const onPressCollection = (id: any, heading: any) => {
    logEvent(`Collection Button Pressed from HomeScreen CollectionID: ${id} CollectionName: ${heading}`);
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
  };

  return (
    <KeyboardAvoidingView style={[flex, { backgroundColor: whiteColor }]} behavior="padding" enabled>
      <Header
        navigation={navigation}
        textinput={true}
        image={true}
        menuImage={true}
        shoppingCart={true}
        onPressShopByCatagory={onPressShopAll}
      />
      <View style={[styles.container, flex]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.title}
              style={[
                styles.menuItem,
                selectedItem === item.title && styles.selectedMenuItem,
              ]}
              onPress={() => handleMenuPress(item.title)}
            >
              <Text style={styles.menuText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: spacings.large }}>
          <Carousal
            data={carouselData.slice(0, 3)}
            dostsShow={true}
            renderItem={item => (
              <Image source={{ uri: item?.image }} style={[{ width: wp(91.8), height: hp(20) }, borderRadius10, resizeModeCover]} />
            )}
          />
          <View style={[{ width: "100%", marginVertical: 10 }, alignItemsCenter, justifyContentSpaceBetween, flexDirectionRow]}>
            <Text style={[styles.text]}>{NEW_LAUNCHES}</Text>
          </View>
          <View style={[styles.productDetailBox, flexDirectionRow]}>
            <FlatList
              data={drinksBanner}
              renderItem={({ item }) => (
                <View style={[alignJustifyCenter, { width: wp(32), height: hp(16) }]}>
                  <Pressable style={[styles.newLaunchProductCard, overflowHidden, alignJustifyCenter]}
                    onPress={() => onPressCollection(item?.id, item?.title)}
                  >
                    <Image source={{ uri: item.image }} style={[styles.newLaunchProductcategoryImage, resizeModeCover]} />
                    <Text
                      style={[
                        styles.categoryName,
                        textAlign,
                        positionAbsolute,
                        {
                          backgroundColor: blackOpacity5,
                          bottom: 0, width: "100%", paddingVertical: spacings.small, fontSize: style.fontSizeSmall.fontSize,
                        }
                      ]}
                    >{item?.title}</Text>
                  </Pressable>
                </View>
              )}
              showsHorizontalScrollIndicator={false}
              horizontal
            />
          </View>
          <View style={[{ width: "100%", marginVertical: 10 }, alignItemsCenter, justifyContentSpaceBetween, flexDirectionRow]}>
            <Text style={[styles.text]}>{SHOP_BY_PRODUCT_CATAGORY}</Text>
            <Pressable onPress={onPressShopAll}>
              <Text style={{ color: redColor, fontSize: style.fontSizeNormal.fontSize, fontWeight: style.fontWeightThin1x.fontWeight }} >{SEE_ALL}</Text>
            </Pressable>
          </View>
          <View style={[{ width: wp(100), height: "auto", marginTop: 5 }, flexDirectionRow]}>
            <FlatList
              data={shopifyCollection.slice(0, 8)}
              renderItem={({ item }) => (
                <View style={[{ width: wp(24), height: hp(18) }, alignItemsCenter]}>
                  <Pressable style={[styles.card, overflowHidden, alignJustifyCenter]} onPress={() => onPressCollection(item?.id, item?.title)}>
                    <Image source={{ uri: item?.image?.url }} style={[styles.categoryImage, resizeModeContain]} />
                  </Pressable>
                  <Text
                    style={[
                      styles.categoryName,
                      textAlign,
                      {
                        lineHeight: lineHeights[item?.title] || 10,
                        color: blackColor,
                        paddingVertical: spacings.large,
                        fontWeight: style.fontWeightBold.fontWeight,
                        fontSize: style.fontSizeSmall.fontSize
                      }
                    ]}
                    onTextLayout={handleTextLayout(item?.title)}>{item?.title}</Text>
                </View>
              )}
              numColumns={4}
              keyExtractor={(item) => item?.id}
            />
          </View>
          <Text style={[styles.text]}>{BEST_SELLING}</Text>
          <View style={[{ height: hp(30) }, alignJustifyCenter]}>
            {bestDealProducts?.length > 0 ? <FlatList
              data={bestDealProducts}
              renderItem={({ item, index }) => {
                return (
                  <Product
                    product={item}
                    onAddToCart={addToCartProduct}
                    loading={addingToCart?.has(getVariant(item)?.id ?? '')}
                    inventoryQuantity={bestDealInventoryQuantities[index]}
                    option={bestDealoptions[index]}
                    ids={bestDealProductVariantsIDS[index]}
                    width={wp(38)}
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
          <Carousal
            data={carouselData.slice(3, 5)}
            dostsShow={true}
            renderItem={item => (
              <Image source={{ uri: item?.image }} style={[{ width: wp(91.8), height: hp(20) }, borderRadius10, resizeModeCover]} />
            )}
          />
          <View style={[{ width: "100%", marginVertical: 10 }, alignItemsCenter, justifyContentSpaceBetween, flexDirectionRow]}>
            <Text style={[styles.text]}>{OUR_PRODUCT}</Text>
            <Text style={{ color: redColor, fontSize: style.fontSizeNormal.fontSize, fontWeight: style.fontWeightThin1x.fontWeight }} onPress={() => onPressCollection(DRINK_OUR_PRODUCT_COLLECTION_ID, OUR_PRODUCT)}>{SEE_ALL}</Text>
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
                    width={wp(38)}
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
              <LoaderKit
                style={{ width: 50, height: 50 }}
                name={LOADER_NAME}
                color={colors.blackColor}
              />
            }
          </View>
          <View>
            <FlatList
              data={drinkCollections}
              renderItem={({ item }) => (
                <View style={[styles.drinkCollectioncard, alignJustifyCenter]}>
                  <Image source={{ uri: item.image }} style={[styles.drinkBannerImage, resizeModeContain]} />
                </View>
              )}
              horizontal
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
            />
          </View>
          <View>
            <FlatList
              data={drinksBanner}
              renderItem={({ item }) => (
                <Pressable style={[styles.drinkBannerBox, borderRadius10, positionRelative, alignJustifyCenter, { overflow: "hidden" }]} onPress={() => onPressCollection(item?.id, item?.title)}>
                  <Image source={{ uri: item.image }} style={[{ width: "100%", height: hp(25) }, resizeModeCover, borderRadius10]} />
                  <View
                    style={[
                      styles.categoryName,
                      alignJustifyCenter,
                      positionAbsolute,
                      flexDirectionRow,
                      {
                        backgroundColor: blackOpacity5,
                        bottom: 2, width: "100%", paddingVertical: spacings.normal, fontSize: style.fontSizeSmall.fontSize,
                      }
                    ]}
                  >
                    <Text style={[textAlign, { color: whiteColor }]}>{item?.title}  </Text>
                    <Octicons name={"arrow-right"} size={20} color={whiteColor} />
                  </View>
                </Pressable>
              )}
              numColumns={2}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
          <View style={[{ width: "100%", marginVertical: 10 }, alignItemsCenter, justifyContentSpaceBetween, flexDirectionRow]}>
            <Text style={[styles.text]}>{BEST_DRINKS_CHOICES}</Text>
          </View>
          <View>
            <FlatList
              data={bannerImage}
              renderItem={({ item }) => (
                <View style={{ width: wp(34), height: hp(20), marginHorizontal: spacings.small }}>
                  <Image source={{ uri: item.image }} style={[borderRadius10, { width: "100%", height: "100%" }, resizeModeContain]} />
                </View>
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
          <View style={[{ width: "100%", marginVertical: 10 }, alignItemsCenter, justifyContentSpaceBetween, flexDirectionRow]}>
            <Text style={[styles.text]}>{WORLD_OF_WISKEY}</Text>
          </View>
          <View>
            <FlatList
              data={drinksGIF}
              renderItem={({ item }) => (
                <Pressable style={[styles.drinkBannerBox, borderRadius10, positionRelative, alignJustifyCenter, { overflow: "hidden" }]} >
                  <FastImage
                    source={{ uri: item.gif }}
                    style={[
                      { width: '100%', height: hp(25) },
                      { borderRadius: 10 },
                    ]}
                  />
                  <Text style={[styles.text, { marginTop: spacings.normal, fontSize: style.fontSizeNormal.fontSize, }]}>{item?.title}</Text>
                </Pressable>
              )}
              horizontal
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
        </ScrollView>
      </View>

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: whiteColor,
    paddingVertical: spacings.small
  },
  text: {
    fontSize: style.fontSizeNormal2x.fontSize,
    fontWeight: style.fontWeightMedium.fontWeight,
    color: blackColor,
    fontFamily: 'GeneralSans-Variable'
  },
  productDetailBox: {
    width: wp(100),
    height: hp(16),
    paddingRight: spacings.Large1x,
  },
  newLaunchProductCard: {
    width: wp(29),
    height: wp(29),
    borderRadius: 10,
  },
  newLaunchProductcategoryImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  card: {
    width: wp(20),
    height: wp(20),
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: lightGrayOpacityColor,
    paddingVertical: spacings.small,
  },

  categoryImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
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

  drinkCollectioncard: {
    width: wp(27),
    height: hp(10),
    padding: spacings.medium,
    marginRight: spacings.large,
    marginBottom: spacings.large,
  },
  drinkBannerBox: {
    width: wp(45.3),
    height: hp(28),
    margin: spacings.normal,
    marginBottom: spacings.xxLarge
  },
  drinkBannerImage: {
    width: wp(25),
    height: hp(20),
    margin: spacings.normal,
  },
  menuItem: {
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.medium,
    marginRight: spacings.large,
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  selectedMenuItem: {
    borderBottomColor: redColor,
    borderBottomWidth: 2,
    paddingVertical: spacings.normalx,
  },
  menuText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: blackColor,
  },
});

export default HomeScreenDrink;
