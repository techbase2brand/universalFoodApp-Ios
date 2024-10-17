import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Pressable } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '.././../utils';
import { blackColor, grayColor, redColor, whiteColor, blackOpacity5, mediumGray } from '../../constants/Color';
import { spacings, style } from '../../constants/Fonts';
import { BaseStyle } from '../../constants/Style';
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import { useCart } from '../../context/Cart';
import Toast from 'react-native-simple-toast';
import Carousal from '../Carousal';
import { logEvent } from '@amplitude/analytics-react-native';
import { useThemes } from '../../context/ThemeContext';
import { lightColors, darkColors } from '../../constants/Color';
const { textAlign, alignJustifyCenter, flex, borderRadius10, positionAbsolute, positionRelative, flexDirectionRow, resizeModeContain, borderRadius5, resizeModeCover } = BaseStyle;
const QuickViewModal = ({ modalVisible, setModalVisible, product, onAddToCart, options, ids, shopCurrency }) => {
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  const { addToCart, addingToCart } = useCart();
  const imageSource = product?.images?.edges ? product?.images?.edges[0]?.node?.url : product?.images?.nodes[0]?.url;
  const price = product?.variants?.edges ? product?.variants?.edges[0]?.node?.price : product?.variants?.nodes[0];
  const priceAmount = price?.price ? price?.price : price?.amount;
  const currencyCode = price ? price?.currencyCode : null;
  const [selectedOptions, setSelectedOptions] = useState({});
  const [showButtons, setShowButtons] = useState(false);
  const variantImages = ids?.map(variant => variant?.image?.originalSrc)
  const [expanded, setExpanded] = useState(false);
  const currency = shopCurrency


  const handleSelectOption = (optionName, value) => {
    logEvent(`Selected Product Variant Name:${optionName} Value:${value}`);
    setSelectedOptions(prevOptions => ({
      ...prevOptions,
      [optionName]: value,
    }));
    setShowButtons(true)
  };

  const getSelectedVariantId = () => {
    const selectedOptionString = Object.values(selectedOptions).join(' / ');
    const selectedVariant = ids?.find(variant => variant.title === selectedOptionString);
    return selectedVariant ? selectedVariant.id : null;
  };

  const addToCartProduct = async (variantId: any, quantity: any) => {
    logEvent(`Add To Cart Pressed variantId:${variantId} Qty:${quantity}`);
    await addToCart(variantId, 1);
    Toast.show(`${quantity} item${quantity !== 1 ? 's' : ''} added to cart`);
    setModalVisible(!modalVisible);
  };

  const isVariantInStock = () => {
    const selectedVariantId = getSelectedVariantId();
    if (selectedVariantId) {
      const selectedVariant = ids?.find(variant => variant.id === selectedVariantId);
      return selectedVariant ? selectedVariant.inventoryQty > 0 : false;
    }
    return false;
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };


  const trimcateText = (text) => {
    const words = text.split(' ');
    if (words.length > 5) {
      return words.slice(0, 5).join(' ') + '...';
    }
    return text;
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
    >
      <Pressable onPress={() => { logEvent(`QuickViewModal closed`), setModalVisible(!modalVisible) }} style={[styles.modalOverlay, flex]}>
        <View style={[styles.modalView, positionRelative, alignJustifyCenter, { backgroundColor: colors.whiteColor }]}>
          <View style={{ width: wp(50), height: hp(0.6), backgroundColor: grayColor, borderBottomRightRadius: 10, borderBottomLeftRadius: 10 }}>
          </View>
          <View style={[{ width: wp(95), height: hp(20) }, alignJustifyCenter]}>
            <Carousal
              data={variantImages}
              renderItem={item => {
                return (
                  <Image source={{ uri: item ? item : imageSource }} style={[{ width: wp(35.5), height: hp(18) }, borderRadius10, resizeModeContain]} />
                )
              }}
            />
          </View>
          <View style={{ width: "100%" }}>
            <Text style={styles.modalText}>{trimcateText(product?.title)}</Text>
            {product.description && <Pressable onPress={toggleExpanded} style={{ marginVertical: spacings.large }}>
              <Text style={[styles.modalDescription, { color: colors.mediumGray, }]} numberOfLines={expanded ? null : 2}
                ellipsizeMode="tail">{product.description}</Text>
            </Pressable>}
          </View>
          <View style={{ marginBottom: spacings.large }}>
            <View style={{ width: "100%" }}>
              {options?.map((option, index) => {
                if (option.name === "Title" && option.values.includes("Default Title")) {
                  return null;
                }

                return (
                  <View key={index} style={[styles.optionContainer, { paddingHorizontal: spacings.xxLarge, width: wp(100) }]}>
                    <Text style={{ paddingVertical: spacings.small, color: redColor, fontSize: style.fontSizeLarge.fontSize }}>{option.name}</Text>
                    <View style={[flexDirectionRow, { marginTop: spacings.large }]}>
                      <ScrollView horizontal>
                        {option?.values.map((value, idx) => (
                          <TouchableOpacity
                            key={idx}
                            onPress={() => handleSelectOption(option?.name, value)}
                            style={[
                              styles.optionValueContainer,
                              flexDirectionRow,
                              borderRadius5,
                              alignJustifyCenter,
                              selectedOptions[option.name] === value
                                ? { backgroundColor: redColor, borderWidth: 0 }
                                : { backgroundColor: whiteColor }
                            ]}
                          >
                            <Text style={[styles.optionValue, selectedOptions[option?.name] === value && { color: whiteColor }]}>
                              {value}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
          <View style={{ width: "100%" }}>
            <Text style={{ paddingVertical: spacings.small, color: redColor, fontSize: style.fontSizeLarge.fontSize }}>{"PRICE"}:</Text>
            {priceAmount && (
              <Text style={[styles.modalPrice, { color: colors.blackColor }]}>{priceAmount} {currencyCode ? currencyCode : currency}</Text>
            )}
          </View>
          <View style={{ height: hp(10), marginTop: spacings.xxxxLarge }}>
            {options?.map((option, index) => (
              <View key={index} style={styles.optionContainer}>
                {option.name === "Title" && option.values.includes("Default Title") ? (
                  <View style={[flexDirectionRow, { marginTop: spacings.large, width: "100%" }]}>
                    <TouchableOpacity style={[styles.addToCartButton, alignJustifyCenter]} onPress={() => {
                      addToCartProduct(ids[0].id, 1);
                    }}>
                      <Text style={{ ...styles.addToCartButtonText, color: whiteColor }}>Add to Cart</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ height: hp(5), marginTop: spacings.xxxxLarge }}>
                    {showButtons ? (
                      isVariantInStock() ? (
                        <TouchableOpacity
                          style={[styles.addToCartButton, alignJustifyCenter]}
                          onPress={() => {
                            const selectedVariantId = getSelectedVariantId();
                            if (selectedVariantId) {
                              addToCartProduct(selectedVariantId, 1);
                            } else {
                              console.error('Selected variant ID not found');
                            }
                          }}
                        >
                          <Text style={styles.addToCartButtonText}>Add to Cart</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity style={[styles.addToCartButton, alignJustifyCenter]}>
                          <Text style={{ ...styles.addToCartButtonText, color: whiteColor }}>Out of Stock</Text>
                        </TouchableOpacity>
                      )
                    ) : (
                      <View style={[{ height: hp(8) }, alignJustifyCenter]}>
                        <Text style={[{ paddingTop: spacings.small, fontSize: style.fontSizeLarge.fontSize, color: redColor }, textAlign]}>Please select any variant</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    backgroundColor: blackOpacity5,
    justifyContent: "flex-end"
  },
  modalView: {
    width: wp(100),
    maxHeight: 'auto',
    backgroundColor: whiteColor,
    paddingHorizontal: spacings.xxLarge,
    paddingBottom: spacings.xxLarge,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  },
  modalImage: {
    width: wp(90),
    height: hp(20),
    borderRadius: 10,
  },
  modalText: {
    fontSize: style.fontSizeLarge.fontSize,
    fontWeight: style.fontWeightThin.fontWeight,
    color: redColor,
    marginTop: spacings.medium,
  },
  modalDescription: {
    fontSize: 12,

    marginTop: spacings.small,
  },
  modalPrice: {
    fontSize: style.fontSizeMedium.fontSize,
    color: blackColor,
    marginTop: spacings.small,
  },
  closeButton: {
    top: spacings.small,
    right: spacings.small,
  },
  addToCartButton: {
    backgroundColor: redColor,
    borderRadius: 5,
    width: wp(90),
    height: hp(5),
    marginTop: spacings.medium,
  },
  addToCartButtonText: {
    color: whiteColor,
    fontWeight: 'bold',
    fontSize: style.fontSizeNormal.fontSize,
  },
  optionContainer: {
    marginVertical: spacings.small,
    width: "100%"
  },
  optionName: {
    fontSize: style.fontSizeNormal.fontSize,
    color: blackColor,
    fontWeight: style.fontWeightThin1x.fontWeight,
    marginBottom: spacings.xsmall,
  },
  optionValueContainer: {
    marginHorizontal: spacings.large,
    padding: spacings.small,
    borderWidth: 1,
    borderColor: blackColor,
    width: wp(23)
  },
  optionValue: {
    fontSize: style.fontSizeNormal.fontSize,
    color: blackColor,
  }
});

export default QuickViewModal;
