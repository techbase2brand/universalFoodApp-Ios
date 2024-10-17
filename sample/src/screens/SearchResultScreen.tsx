import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Pressable, ImageBackground } from 'react-native';
import { blackColor, grayColor, whiteColor, redColor } from '../constants/Color';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import {
  ADD_TO_CART, OUT_OF_STOCK, BEST_DEALS_OF_THE_WEEK, POPULAR_LIQUOR, BEER, CAN, NON_LOW_ALCOHOL, getAdminAccessToken, getStoreDomain,
  STOREFRONT_DOMAIN, ADMINAPI_ACCESS_TOKEN, LOADER_NAME
} from '../constants/Constants'
import { BaseStyle } from '../constants/Style';
import { spacings, style } from '../constants/Fonts';
import Toast from 'react-native-simple-toast';
import { useRoute } from '@react-navigation/native';
import useShopify from '../hooks/useShopify';
import { useCart } from '../context/Cart';
import type { ShopifyProduct } from '../../@types';
import { logEvent } from '@amplitude/analytics-react-native';
import Header from '../components/Header'
import { BACKGROUND_IMAGE } from '../assests/images';
import { useSelector } from 'react-redux';
import LoaderKit from 'react-native-loader-kit'
import LoadingModal from '../components/Modal/LoadingModal';
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
import ChatButton from '../components/ChatButton';
import { scheduleNotification } from '../notifications';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
const { alignJustifyCenter, flexDirectionRow, flex, borderRadius10, overflowHidden, textAlign, borderWidth1, resizeModeContain } = BaseStyle;

const SearchResultScreen: React.FC = ({ navigation }: { navigation: any }) => {
  const selectedItem = useSelector((state) => state.menu.selectedItem);
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  // const STOREFRONT_DOMAIN = getStoreDomain(selectedItem)
  // const ADMINAPI_ACCESS_TOKEN = getAdminAccessToken(selectedItem)
  const route = useRoute();
  const title = route.params?.title;
  const collectionId = route.params?.id;
  const [bestDealInventoryQuantities, setBestDealInventoryQuantities] = useState('');
  const [bestDealoptions, setBestDealOptions] = useState([]);
  const [bestDealProductVariantsIDS, setBestDealProductVariantsIDS] = useState([]);
  const [bestDealTags, setbestDealTags] = useState<string[][]>([]);
  const [inventoryQuantity, setInventoryQuantity] = useState('');
  const [tags, setTags] = useState<string[][]>([]);
  const [options, setOptions] = useState([]);
  const [productVariantsIDS, setProductVariantsIDS] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { queries } = useShopify();
  const { addToCart, addingToCart } = useCart();
  const [fetchProducts, { data }] = queries.products;

  useEffect(() => {
    fetchProducts({
      variables: {
        first: selectedItem === "Food" ? 10 : 12,
      },
    });
  }, [fetchProducts])

  useEffect(() => {
    logEvent('Search Result Screen Initialized');
  }, [])

  //Popular Liquor
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
          const inventoryQuantities = fetchedProducts?.map((productEdge) => {
            return productEdge?.node?.variants?.nodes.map((variant) => variant.inventoryQuantity);
          });
          setInventoryQuantity(inventoryQuantities);

          const fetchedTags = fetchedProducts?.map(productEdge => productEdge?.node?.tags);
          const fetchedOptions = fetchedProducts?.map(product => product?.node?.options);
          const productVariantData = fetchedProducts?.map(productEdge =>
            productEdge?.node?.variants?.nodes.map(variant => ({
              id: variant?.id,
              title: variant?.title,
              inventoryQty: variant?.inventoryQuantity,
              image: variant?.image
            }))
          );

          setOptions(fetchedOptions)
          setProductVariantsIDS(productVariantData)
          setTags(fetchedTags);

        })
        .catch((error) => console.log(error));
    }
    fetchproduct()
  }, [])

  //with collection id
  useEffect(() => {
    const fetchproduct = () => {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("X-Shopify-Access-Token", ADMINAPI_ACCESS_TOKEN);
      const graphql = JSON.stringify({
        query: `query MyQuery {
          collection(id: "${collectionId}") {
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
          setProducts(fetchedProducts?.data?.collection?.products.nodes);
          const inventoryQuantities = fetchedProducts?.data?.collection?.products?.nodes?.map((productEdge) => {
            return productEdge?.variants?.nodes?.map((variants) => variants?.inventoryQuantity);
          });
          setBestDealInventoryQuantities(inventoryQuantities)

          const fetchedTags = fetchedProducts.data?.collection?.products?.nodes.map(productEdge => productEdge?.tags);
          setbestDealTags(fetchedTags)

          const fetchedOptions = fetchedProducts.data?.collection?.products?.nodes.map((product) => product?.options);
          setBestDealOptions(fetchedOptions);

          const productVariantData = fetchedProducts.data?.collection?.products?.nodes.map((product) =>
            product?.variants?.nodes.map((variant) => ({
              id: variant?.id,
              title: variant?.title,
              inventoryQty: variant?.inventoryQuantity,
              image: variant?.image
            }))
          );
          setBestDealProductVariantsIDS(productVariantData);
          setLoading(false)
        })
        .catch((error) => {
          console.log(error);
          setLoading(false);
        });
    }
    fetchproduct();
  }, [])

  //add to cart Product
  const addToCartProduct = async (variantId: any, quantity: any) => {
    logEvent(`Add To Cart Product variantId:${variantId} Qty:${quantity}`);
    await addToCart(variantId, quantity);
    navigation.navigate('CartModal')
    Toast.show(`${quantity} item${quantity !== 1 ? 's' : ''} added to cart`);
    scheduleNotification()
  };

  function getVariant(product: ShopifyProduct) {
    if (product.variants.edges?.length > 0) {
      return product?.variants?.edges[0].node;
    } else if (product?.variants?.nodes?.length > 0) {
      return product?.variants?.nodes[0];
    } else {
      return null;
    }
  }

  const handleChatButtonPress = () => {
    logEvent('Chat button clicked in Search Result Screen');
    navigation.navigate("ShopifyInboxScreen")
  };

  return (
    <ImageBackground style={[flex, { backgroundColor: colors.whiteColor }]} source={isDarkMode ? '' : BACKGROUND_IMAGE}>
      <Header backIcon={true} text={route?.params?.title} navigation={navigation} />
      <View style={{ width: wp(100), height: 5, backgroundColor: whiteColor }} />
      <View style={[styles.container,{ marginVertical: spacings.large,height:hp(74.5) }]}>
        {loading &&
          <SkeletonPlaceholder>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: "wrap" }}>
              <View style={{ width: wp(47), height: hp(28), borderRadius: 10, marginVertical: 5 }} />
              <View style={{ width: wp(47), height: hp(28), borderRadius: 10, marginVertical: 5 }} />
              <View style={{ width: wp(47), height: hp(28), borderRadius: 10, marginVertical: 5 }} />
              <View style={{ width: wp(47), height: hp(28), borderRadius: 10, marginVertical: 5 }} />
              <View style={{ width: wp(47), height: hp(28), borderRadius: 10, marginVertical: 5 }} />
              <View style={{ width: wp(47), height: hp(28), borderRadius: 10, marginVertical: 5 }} />
            </View>
          </SkeletonPlaceholder>}
        {(title === BEST_DEALS_OF_THE_WEEK || title === POPULAR_LIQUOR) &&
          <FlatList
            data={products}
            renderItem={({ item, index }) => <ProductItem item={item} addToCartProduct={addToCartProduct} BestDealInventoryQuantities={bestDealInventoryQuantities[index]} BestDealsids={bestDealProductVariantsIDS[index]}
              onPress={() => {
                navigation.navigate('ProductDetails', {
                  product: item,
                  variant: getVariant(item),
                  inventoryQuantity: bestDealInventoryQuantities[index],
                  tags: bestDealTags[index],
                  option: bestDealoptions[index],
                  ids: bestDealProductVariantsIDS[index]
                });
              }} />}
            numColumns={2}
            keyExtractor={(item) => item?.id.toString()}
            showsVerticalScrollIndicator={false}
          />
        }
        {/* {loading && <LoadingModal visible={loading} text={"Please wait while we load the products."} />} */}
        <ChatButton onPress={handleChatButtonPress} />
      </View>
    </ImageBackground>
  );
};

const ProductItem = ({ item, addToCartProduct, BestDealInventoryQuantities, BestDealsids, onPress }) => {
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  const outOfStock = BestDealsids && BestDealsids[0].inventoryQty;
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const incrementQuantity = () => {
    logEvent('Increase Product Quantity');
    setQuantity(quantity + 1);
  };
  const decrementQuantity = () => {
    logEvent('Decrease Product Quantity');
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  const handleAddToCart = async () => {
    setLoading(true);
    await addToCartProduct(((item?.node?.variants) ? (item?.node?.variants?.edges[0]?.node.id) : (item?.variants?.nodes[0]?.id)), quantity);
    setLoading(false);
  };
  const productTitle = (item?.node) ? (item?.node?.title) : (item?.title);
  const imageSrc = (item?.node?.images?.edges) ? (item?.node?.images?.edges[0].node.url) : (item?.images?.nodes[0]?.url);

  const trimcateText = (text) => {
    const words = text.split(' ');
    if (words.length > 5) {
      return words.slice(0, 5).join(' ') + '...';
    }
    return text;
  };

  return (
    <Pressable style={[styles.itemContainer, alignJustifyCenter, borderRadius10, overflowHidden, { backgroundColor: isDarkMode ? colors.grayColor : whiteColor }]} onPress={onPress}>
      <Image source={{ uri: imageSrc }} style={[styles.image, resizeModeContain]} />
      <Text style={[styles.categoryName, textAlign, { fontWeight: style.fontWeightThin1x.fontWeight, color: colors.blackColor }]}>{trimcateText(productTitle)}</Text>
      <View style={[styles.quantityContainer, borderWidth1, flexDirectionRow, alignJustifyCenter, { backgroundColor: colors.whiteColor }]}>
        <TouchableOpacity onPress={decrementQuantity}>
          <Text style={[styles.quantityButton, { color: colors.blackColor }]}>-</Text>
        </TouchableOpacity>
        <Text style={[styles.quantity, { color: colors.blackColor }]}>{quantity}</Text>
        <TouchableOpacity onPress={incrementQuantity}>
          <Text style={[styles.quantityButton, { color: colors.blackColor }]}>+</Text>
        </TouchableOpacity>
      </View>
      {outOfStock ? (
        loading ? (
          <View style={{ marginTop: 5 }}>
            <ActivityIndicator size="small" />
          </View>
        ) : (
          <Pressable
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <Text style={[styles.addToCartButtonText, textAlign]}>{ADD_TO_CART}</Text>
          </Pressable>
        )
      ) : (
        <View style={styles.addToCartButton}>
          <Text style={styles.addToCartButtonText}>{OUT_OF_STOCK}</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacings.large
  },
  itemContainer: {
    margin: spacings.small,
    width: "48%",
    padding: spacings.large,
    borderColor: 'transparent',
    borderWidth: .1,
    borderRadius: 10,
    shadowColor: grayColor,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1.7,
  },
  quantityContainer: {
    marginTop: spacings.large,
    backgroundColor: whiteColor,
    paddingHorizontal: 5,
    borderRadius: 10
  },
  quantityButton: {
    paddingHorizontal: spacings.large,
    borderRadius: 5,
    fontSize: style.fontSizeMedium1x.fontSize,
    fontWeight: style.fontWeightThin1x.fontWeight,
    color: blackColor,
  },
  quantity: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    fontSize: style.fontSizeMedium1x.fontSize,
    fontWeight: style.fontWeightThin1x.fontWeight,
    color: blackColor,
  },
  addToCartButton: {
    borderRadius: 10,
    fontSize: 8,
    marginTop: 15,
    backgroundColor: redColor,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  addToCartButtonText: {
    fontSize: style.fontSizeNormal.fontSize,
    lineHeight: 20,
    color: whiteColor,
    fontWeight: style.fontWeightThin1x.fontWeight,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 14,
    color: blackColor,
  },
});

export default SearchResultScreen;
