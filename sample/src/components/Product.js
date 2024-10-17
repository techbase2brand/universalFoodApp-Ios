import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native';
import { blackColor, grayColor, redColor, whiteColor } from '../constants/Color'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { ADD_TO_CART, OUT_OF_STOCK } from '../constants/Constants';
import { logEvent } from '@amplitude/analytics-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
const { alignItemsCenter, resizeModeCover, flexDirectionRow, alignJustifyCenter, borderWidth1 } = BaseStyle;

const Product = ({ product, onAddToCart, loading, inventoryQuantity, onPress }) => {
  const imageSource = product?.images?.edges ? product?.images?.edges[0]?.node?.url : product?.images?.nodes[0]?.url;
  const price = product?.variants?.edges ? product?.variants?.edges[0]?.node?.price : product?.variants?.nodes[0];
  const priceAmount = price?.price ? price?.price : price?.amount;
  const currencyCode = price ? price?.currencyCode : null;
  const [quantity, setQuantity] = useState(1);
  const [shopCurrency, setShopCurrency] = useState('');
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const shopCurrency = await AsyncStorage.getItem('shopCurrency');
        if (shopCurrency) {
          setShopCurrency(shopCurrency);
        }
      } catch (error) {
        console.error('Error fetching shop currency:', error);
      }
    };
    fetchCurrency();
  }, []);
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
  const outOfStock = inventoryQuantity && inventoryQuantity[0] <= 0;

  const trimcateText = (text) => {
    const words = text.split(' ');
    if (words.length > 5) {
      return words.slice(0, 4).join(' ') + '...';
    }
    return text;
  };
  return (
    <Pressable style={[styles.productContainer, alignItemsCenter, flexDirectionRow, { backgroundColor: isDarkMode ? grayColor : whiteColor }]} onPress={onPress}>
      <Image
        source={{ uri: imageSource }}
        style={[styles.productImage, resizeModeCover]}
      />
      <View style={[styles.contentBox, flexDirectionRow]}>
        <View style={{ width: "45%", paddingRight: spacings.large }}>
          <Text style={[styles.productName, { color: colors.blackColor }]}>{trimcateText(product?.title)}</Text>
          {priceAmount && (
            <Text style={[styles.productPrice, { color: colors.blackColor }]}>
              {priceAmount} {currencyCode ? currencyCode : shopCurrency}
            </Text>)}
        </View>
        <View style={[{ width: "42%", paddingVertical: spacings.small, alignItems: "center", justifyContent: "space-around", marginLeft: spacings.large }]}>
          <View style={[styles.quantityContainer, borderWidth1, { marginBottom: spacings.normal, backgroundColor: colors.whiteColor }]}>
            <TouchableOpacity onPress={decrementQuantity}>
              <Text style={[styles.quantityButton, { color: colors.blackColor }]}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.quantity, { color: colors.blackColor }]}>{quantity}</Text>
            <TouchableOpacity onPress={incrementQuantity}>
              <Text style={[styles.quantityButton, { color: colors.blackColor }]}>+</Text>
            </TouchableOpacity>
          </View>
          {!outOfStock ? (
            loading ? (
              <View style={styles.addToCartLoading}>
                <ActivityIndicator size="small" />
              </View>
            ) : (
              <Pressable
                style={styles.addToCartButton}
                onPress={() => onAddToCart((product?.variants?.edges) ? (product?.variants?.edges[0]?.node.id) : product?.variants?.nodes[0].id, quantity)}>
                <Text style={styles.addToCartButtonText}>{ADD_TO_CART}</Text>
              </Pressable>
            )
          ) : (
            <View style={styles.addToCartButton}>
              <Text style={styles.addToCartButtonText}>{OUT_OF_STOCK}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  productContainer: {
    width: "100%",
    padding: spacings.large,
    marginVertical: 10,
    borderColor: 'transparent',
    borderWidth: .1,
    borderRadius: 10,

    shadowColor: grayColor,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,

    elevation: 1.5,
  },
  productImage: {
    width: "23%",
    height: hp(12),
    borderRadius: 6,
    alignSelf: "center",
  },
  productName: {
    fontSize: style.fontSizeNormal.fontSize,
    fontWeight: style.fontWeightThin1x.fontWeight,
  },
  productPrice: {
    fontSize: style.fontSizeSmall1x.fontSize,
    fontWeight: style.fontWeightThin1x.fontWeight,
    fontFamily: 'GeneralSans-Variable'
  },
  contentBox: {
    width: "85%",
    paddingLeft: spacings.large,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    justifyContent: "center",
    borderRadius: 10
  },
  quantityButton: {
    paddingHorizontal: 8,
    borderRadius: 5,
    color: blackColor,
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantity: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    fontSize: 16,
    fontWeight: 'bold',
    color: blackColor,
  },
  addToCartButton: {
    borderRadius: 10,
    fontSize: 8,
    backgroundColor: redColor,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  addToCartButtonText: {
    fontSize: 14,
    lineHeight: 20,
    color: whiteColor,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Product;
