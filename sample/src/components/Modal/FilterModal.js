import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Modal, StyleSheet, TouchableOpacity, Alert, PanResponder, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '.././../utils';
import { whiteColor, darkgrayColor, redColor, blackColor, goldColor, lightGrayColor, lightBlueColor, grayColor, lightGrayOpacityColor, blackOpacity5, mediumGray } from '../../constants/Color';
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import { spacings, style } from '../../constants/Fonts';
import { BaseStyle } from '../../constants/Style';
import { ALL, APPLY, AVAILABILITY, BRAND, CLEAR, FILTER, INSTOCK, OUT_OF_STOCK, PRICE } from '../../constants/Constants';
import { logEvent } from '@amplitude/analytics-react-native';
import { useSelector } from 'react-redux';
import { useThemes } from '../../context/ThemeContext';
import { lightColors, darkColors } from '../../constants/Color';

const { alignItemsCenter, resizeModeContain, textAlign, alignJustifyCenter, flex, borderRadius10, overflowHidden, borderWidth1, flexDirectionRow, justifyContentSpaceBetween, alignSelfCenter, positionAbsolute } = BaseStyle;

const FilterModal = ({ applyFilters, onClose, visible, allProducts, vendor, onSelectVendor }) => {
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  const selectedItem = useSelector((state) => state.menu.selectedItem);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showPriceRange, setShowPriceRange] = useState(false);
  const [showBrand, setShowBrand] = useState(false);
  const [showAvailibility, setShowAvailibitlity] = useState(false);
  const [showInStock, setShowInStock] = useState(false);
  const [startPrice, setStartPrice] = useState(0);
  const [endPrice, setEndPrice] = useState();
  const [priceRange, setPriceRange] = useState();
  const [startPricePosition, setStartPricePosition] = useState(0);
  const [endPricePosition, setEndPricePosition] = useState(30);
  const [selectedVendor, setSelectedVendor] = useState(null);

  useEffect(() => {
    if (allProducts?.length > 0) {
      const prices = allProducts.map(product => parseFloat(product.variants.nodes[0]?.price)).filter(price => !isNaN(price));
      const maxPrice = Math.max(...prices);
      setEndPrice(maxPrice.toString());
      setPriceRange(maxPrice.toString());
    }
  }, [allProducts]);

  const handleStartPriceChange = (position) => {
    const newPos = Math.max(0, Math.min(endPricePosition - 20, position));
    const price = Math.round((newPos / wp(90)) * priceRange);
    setStartPrice(price);
    setMinPrice(price.toString());
    setStartPricePosition(newPos);
  };

  const handleEndPriceChange = (position) => {
    const newPos = Math.max(startPricePosition + 20, Math.min(wp(90), position));
    const price = Math.round((newPos / wp(90)) * priceRange);
    setEndPrice(price);
    setMaxPrice(price.toString());
    setEndPricePosition(newPos);
  };

  const handleMinPriceChange = (value) => {
    const price = parseFloat(value) || 0;
    const newPos = (price / priceRange) * wp(90);
    setMinPrice(value);
    setStartPrice(price);
    setStartPricePosition(newPos);
  };

  const handleMaxPriceChange = (value) => {
    const price = parseFloat(value) || 0;
    const newPos = (price / priceRange) * wp(90);
    setMaxPrice(value);
    setEndPrice(price);
    setEndPricePosition(newPos);
  };

  const startPricePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gestureState) => {
      handleStartPriceChange(gestureState.moveX - 10);
    },
  });

  const endPricePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gestureState) => {
      handleEndPriceChange(gestureState.moveX - 10);
    },
  });

  const applyFiltersCombined = () => {
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);

    const filteredProducts = allProducts.filter(product => {
      const productPrice = parseFloat(product.variants.nodes[0]?.price);
      const inventoryQuantities = product.variants.nodes.map(variant => variant.inventoryQuantity);
      const matchesPriceRange = (isNaN(min) || productPrice >= min) && (isNaN(max) || productPrice <= max);
      const matchesAvailability = showAvailibility ? (showInStock ? inventoryQuantities.some(quantity => quantity > 0) : inventoryQuantities.every(quantity => quantity === 0)) : true;
      return matchesPriceRange && matchesAvailability;
    });

    if (filteredProducts.length === 0) {
      Alert.alert("No products are currently available with the applied filters.");
    } else {
      applyFilters(filteredProducts);
      onClose();
    }
    logEvent(`Filters_Applied minPrice:${minPrice} maxPrice ${maxPrice} inStock:${showInStock}`);
  };

  const togglePriceRange = () => {
    setShowPriceRange(!showPriceRange);
    logEvent('Price_Range_Toggled');
  };

  const toggleBrand = () => {
    setShowBrand(!showBrand);
    logEvent('Brand_Filter_Toggled');
  };

  const toggleAvailability = () => {
    setShowAvailibitlity(!showAvailibility);
    logEvent('Availability_Filter_Toggled');
  };

  const resetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setStartPrice(0);
    setEndPrice(0);
    setStartPricePosition(0);
    setEndPricePosition(30);
    setShowPriceRange(false);
    setShowBrand(false);
    setShowAvailibitlity(false);
    setShowInStock(false);
    setSelectedVendor(null);
    logEvent('Reset All Apply Filter');
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ backgroundColor: blackOpacity5, height: hp(100) }}>
          <View style={[positionAbsolute, { backgroundColor: colors.whiteColor, bottom: 0, height: hp(85), borderTopLeftRadius: 10, borderTopRightRadius: 10, width: "100%" }]}>
            <View style={[styles.modalHeader, flexDirectionRow, alignJustifyCenter]}>
              <View style={{ width: "80%" }}>
                <Text style={[styles.headertext, { color: colors.blackColor }]}>Apply Filter</Text>
              </View>
              <TouchableOpacity style={styles.backIconBox} onPress={() => { onClose(), logEvent('Closed fiter modal'); }}>
                <Ionicons name={"close"} size={30} color={colors.blackColor} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TouchableOpacity style={[styles.Box, flexDirectionRow, justifyContentSpaceBetween]} onPress={toggleBrand}>
                <Text style={[styles.text, { color: colors.blackColor }]}>{BRAND}</Text>
                <View style={styles.backIconBox}>
                  <Text style={[styles.graytext, { color: colors.blackColor }]}>{ALL}</Text>
                </View>
              </TouchableOpacity>
              {showBrand && (
                <View>
                  {vendor.map(vendor => (
                    <TouchableOpacity
                      key={vendor}
                      style={[styles.vendorButton, flexDirectionRow, { backgroundColor: isDarkMode ? grayColor : whiteColor }]}
                      onPress={() => { setSelectedVendor(vendor), onSelectVendor(vendor), setShowBrand(false), logEvent(`Vendor_Selected ${vendor}`); }}
                    >
                      <Text style={[styles.graytext, { color: colors.blackColor }]}>{vendor}</Text>
                      {selectedVendor === vendor && <Ionicons name="checkmark" size={20} color={colors.blackColor} style={{ marginLeft: "auto", marginRight: spacings.xxxxLarge }} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <TouchableOpacity style={[styles.Box, flexDirectionRow, justifyContentSpaceBetween]} onPress={togglePriceRange}>
                <Text style={[styles.text, { color: colors.blackColor }]}>{PRICE}</Text>
                <View style={styles.backIconBox}>
                  <Text style={[styles.graytext, { color: colors.blackColor }]}>
                    {minPrice && maxPrice ? `${minPrice} - ${maxPrice}` : 'Min - Max'}
                  </Text>
                </View>
              </TouchableOpacity>
              {showPriceRange && (
                <View style={{
                  borderBottomWidth: 0.5,
                  borderBottomColor: lightGrayColor, paddingVertical: spacings.large
                }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", padding: spacings.large }}>
                    <TextInput
                      style={[styles.input, { color: colors.blackColor }]}
                      placeholder='Min Price'
                      value={minPrice}
                      onChangeText={handleMinPriceChange}
                      keyboardType="numeric"
                      placeholderTextColor={colors.blackColor}
                    />
                    <TextInput
                      style={[styles.input, { color: colors.blackColor }]}
                      placeholder='Max Price'
                      placeholderTextColor={colors.blackColor}
                      value={maxPrice}
                      onChangeText={handleMaxPriceChange}
                      keyboardType="numeric"
                    />

                  </View>
                  <View style={[styles.sliderContainer, flexDirectionRow]}>
                    <View {...startPricePanResponder.panHandlers} style={[styles.sliderHandle, { left: startPricePosition }]} />
                    <View {...endPricePanResponder.panHandlers} style={[styles.sliderHandle, { left: endPricePosition }]} />
                  </View>
                </View>
              )}
              <TouchableOpacity style={[styles.Box, flexDirectionRow, justifyContentSpaceBetween]} onPress={toggleAvailability}>
                <Text style={[styles.text, { color: colors.blackColor }]}>{AVAILABILITY}</Text>
                <View style={styles.backIconBox}>
                  <Text style={[styles.graytext, { color: colors.blackColor }]}>{showInStock ? INSTOCK : OUT_OF_STOCK}</Text>
                </View>
              </TouchableOpacity>
              {showAvailibility && (
                <View>
                  <TouchableOpacity style={[styles.Box, flexDirectionRow]} onPress={() => setShowInStock(!showInStock)}>
                    <Text style={[styles.optionText, { color: colors.blackColor }]}>{INSTOCK}</Text>
                    {showInStock && <Ionicons name="checkmark" size={20} color={colors.blackColor} style={{ marginLeft: "auto", marginRight: spacings.xxxxLarge }} />}
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.Box, flexDirectionRow]} onPress={() => setShowInStock(false)}>
                    <Text style={[styles.optionText, { color: colors.blackColor }]}>{OUT_OF_STOCK}</Text>
                    {!showInStock && <Ionicons name="checkmark" size={20} color={colors.blackColor} style={{ marginLeft: "auto", marginRight: spacings.xxxxLarge }} />}
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
            <View style={styles.footer}>
              <Pressable style={styles.resetButton} onPress={resetFilters}>
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </Pressable>
              <Pressable style={styles.applyButton} onPress={applyFiltersCombined}>
                <Text style={styles.applyButtonText}>{APPLY}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalHeader: {
    height: hp(8),
    borderBottomWidth: 0.5,
    borderBottomColor: grayColor,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5
  },
  headertext: {
    fontSize: 18,
    fontWeight: '600',
    color: blackColor
  },
  backIconBox: {
    paddingHorizontal: 4
  },
  Box: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
    borderBottomWidth: 0.5,
    borderBottomColor: lightGrayColor
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: blackColor
  },
  graytext: {
    fontSize: 16,
    color: mediumGray
  },
  vendorButton: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: lightGrayColor,
    backgroundColor: whiteColor,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  input: {
    borderWidth: 1,
    borderColor: grayColor,
    padding: spacings.large,
    marginHorizontal: wp(5),
    marginVertical: hp(2),
    fontSize: 16,
    color: blackColor,
    width: "40%",
    borderRadius: 10,
    height: 40
  },
  sliderContainer: {
    height: 20,
    backgroundColor: lightGrayColor,
    marginHorizontal: wp(2),
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: grayColor,
  },
  sliderHandle: {
    width: 20,
    height: 20,
    backgroundColor: redColor,
    position: 'absolute',
    top: 0,
    borderRadius: 100
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    borderTopColor: grayColor
  },
  resetButton: {
    backgroundColor: grayColor,
    borderRadius: 10,
    padding: 12,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  resetButtonText: {
    color: whiteColor,
    fontWeight: '600'
  },
  applyButton: {
    backgroundColor: redColor,
    borderRadius: 10,
    padding: 12,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  applyButtonText: {
    color: whiteColor,
    fontWeight: '600'
  },
  optionButton: {
    padding: spacings[3],
    borderBottomWidth: 1,
    borderBottomColor: grayColor,
    borderRadius: 5,
    backgroundColor: whiteColor,
  },
});


export default FilterModal;



