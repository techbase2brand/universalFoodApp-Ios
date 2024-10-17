import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '.././../utils';
import { blackColor, redColor, whiteColor, blackOpacity5 } from '../../constants/Color';
import { getAdminAccessToken, getStoreDomain, STOREFRONT_DOMAIN, ADMINAPI_ACCESS_TOKEN } from '../../constants/Constants';
import { spacings, style } from '../../constants/Fonts';
import { BaseStyle } from '../../constants/Style';
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import Toast from 'react-native-simple-toast';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { logEvent } from '@amplitude/analytics-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useThemes } from '../../context/ThemeContext';
import { lightColors, darkColors } from '../../constants/Color';
const { textAlign, alignJustifyCenter, flex, borderRadius10, positionAbsolute } = BaseStyle;

const AddAddressModal = ({ visible, onClose }) => {
  const selectedItem = useSelector((state) => state.menu.selectedItem);
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  const navigation = useNavigation()
  const [customerId, setCustomerId] = useState(Number)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [company, setCompany] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [zip, setZip] = useState('');
  const [provinceCode, setProvinceCode] = useState('');
  const [countryCode, setCountryCode] = useState('');


  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const [address1Error, setAddress1Error] = useState(false);
  const [countryError, setCountryError] = useState(false);
  const [stateError, setStateError] = useState(false);
  const [cityError, setCityError] = useState(false);
  const [companyError, setCompanyError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [zipError, setZipError] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userDetails = await AsyncStorage.getItem('userDetails')
      if (userDetails) {
        const userDetailsObject = JSON.parse(userDetails);
        const userId = userDetailsObject.customer ? userDetailsObject.customer.id : userDetailsObject.id;
        setCustomerId(userId)
      }
    };
    fetchUserDetails();
  }, []);

  useEffect(() => {
    const fetchProvinceCode = async () => {
      try {
        const countryResponse = await axios.get(`https://${STOREFRONT_DOMAIN}/admin/api/2023-10/countries.json`, {
          headers: {
            'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
          },
        });
        const countries = countryResponse.data.countries;

        const selectedCountry = countries.find(c => c.name === country);
        const country_Id = selectedCountry.id;
        const countryCode = selectedCountry.code;
        setCountryCode(countryCode)

        const provinceResponse = await axios.get(`https://${STOREFRONT_DOMAIN}/admin/api/2023-10/countries/${country_Id}/provinces.json`, {
          headers: {
            'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
          },
        });
        const provinces = provinceResponse.data.provinces;

        const selectedProvince = provinces.find(p => p.name.toLowerCase() === state.toLowerCase());
        const provinceCode = selectedProvince.code;
        setProvinceCode(provinceCode)

      } catch (error) {
        console.log('Error fetching province code:', error);
      }
    };

    fetchProvinceCode();

  }, [country, state]);

  const handleSubmit = async () => {
    logEvent('Submit Address Clicked');
    if (!firstName || !lastName || !address1 || !country || !state || !city || !phone || !zip) {
      Toast.show('All fields marked with * are required');
      setFirstNameError(!firstName);
      setLastNameError(!lastName);
      setAddress1Error(!address1);
      setCountryError(!country);
      setStateError(!state);
      setCityError(!city);
      setCompanyError(!company)
      setPhoneError(!phone);
      setZipError(!zip);
      return;
    }

    try {
      const response = await axios.post(
        `https://${STOREFRONT_DOMAIN}/admin/api/2024-04/customers/${customerId}/addresses.json`,
        {
          "address": {
            "address1": address1,
            "address2": address2,
            "city": city,
            "company": company,
            "first_name": firstName,
            "last_name": lastName,
            "phone": phone,
            "province": state,
            "country": country,
            "zip": zip,
            "name": firstName + lastName,
            "province_code": provinceCode,
            "country_code": countryCode,
            "country_name": country
          }
        },
        {
          headers: {
            'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
            'Content-Type': 'application/json',
          }
        }
      );
      Toast.show('Address added successfully');
      logEvent('Address added successfully');
      setFirstName('');
      setLastName('');
      setAddress1('');
      setAddress2('');
      setCountry('');
      setState('');
      setCity('');
      setCompany('')
      setPhone('');
      setZip('');
      navigation.navigate('ProfileScreen')
      onClose();
    } catch (error) {
      console.log('Error adding address:', error);
      Toast.show('Error adding address:', error);
      logEvent(`Error adding address:${error}`);
    }

  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <Pressable style={[styles.modalContainer, flex, { justifyContent: "flex-end" }]} onPress={onClose}>
        <View style={[styles.modalContent, alignJustifyCenter, { backgroundColor: colors.whiteColor }]}>
          <TouchableOpacity onPress={onClose} style={[styles.closeButton, positionAbsolute]}>
            <Ionicons name="close" size={28} color={colors.blackColor} />
          </TouchableOpacity>
          <Text style={[styles.title, textAlign, { marginBottom: spacings.Large1x, color: colors.blackColor }]}>Add Address</Text>
          <ScrollView style={{ width: "100%", height: hp(40) }}>
            <TextInput
              style={[
                styles.input,
                { borderBottomColor: firstNameError ? colors.redColor : colors.blackColor, color: colors.blackColor }
              ]}
              placeholder="First Name*"
              placeholderTextColor={firstNameError ? colors.redColor : colors.blackColor}
              value={firstName}
              onChangeText={text => {
                setFirstName(text);
                setFirstNameError(!text);
              }}
            />
            <TextInput
              style={[
                styles.input,
                { borderBottomColor: lastNameError ? colors.redColor : colors.blackColor, color: colors.blackColor }
              ]}
              placeholder="Last Name*"
              placeholderTextColor={lastNameError ? colors.redColor : colors.blackColor}
              value={lastName}
              onChangeText={text => {
                setLastName(text);
                setLastNameError(!text);
              }}
            />
            <TextInput
              style={[
                styles.input,
                { borderBottomColor: address1Error ? colors.redColor : colors.blackColor, color: colors.blackColor }
              ]}
              placeholder="Address 1*"
              placeholderTextColor={address1Error ? colors.redColor : colors.blackColor}
              value={address1}
              onChangeText={text => {
                setAddress1(text);
                setAddress1Error(!text);
              }}
            />
            <TextInput
              style={[styles.input,
              { borderBottomColor: colors.blackColor, color: colors.blackColor }
              ]}
              placeholder="Address 2"
              placeholderTextColor={colors.blackColor}
              value={address2}
              onChangeText={setAddress2}
            />
            <TextInput
              style={[
                styles.input,
                { borderBottomColor: countryError ? colors.redColor : colors.blackColor, color: colors.blackColor }
              ]}
              placeholder="Country*"
              placeholderTextColor={countryError ? colors.redColor : colors.blackColor}
              value={country}
              onChangeText={text => {
                setCountry(text);
                setCountryError(!text);
              }}
            />
            <TextInput
              style={[
                styles.input,
                { borderBottomColor: stateError ? colors.redColor : colors.blackColor, color: colors.blackColor }
              ]}
              placeholder="State*"
              placeholderTextColor={stateError ? colors.redColor : colors.blackColor}
              value={state}
              onChangeText={text => {
                setState(text);
                setStateError(!text);
              }}
            />
            <TextInput
              style={[
                styles.input,
                { borderBottomColor: cityError ? colors.redColor : colors.blackColor, color: colors.blackColor }
              ]}
              placeholder="City*"
              placeholderTextColor={cityError ? colors.redColor : colors.blackColor}
              value={city}
              onChangeText={text => {
                setCity(text);
                setCityError(!text);
              }}
            />
            <TextInput
              style={[
                styles.input,
                { borderBottomColor: companyError ? colors.redColor : colors.blackColor, color: colors.blackColor }
              ]}
              placeholder="Company*"
              placeholderTextColor={companyError ? colors.redColor : colors.blackColor}
              value={company}
              onChangeText={text => {
                setCompany(text);
                setCompanyError(!text);
              }}
            />
            <TextInput
              style={[
                styles.input,
                { borderBottomColor: phoneError ? colors.redColor : colors.blackColor, color: colors.blackColor }
              ]}
              placeholder="Phone*"
              placeholderTextColor={phoneError ? colors.redColor : colors.blackColor}
              value={phone}
              onChangeText={text => {
                setPhone(text);
                setPhoneError(!text);
              }}
              keyboardType="phone-pad"
              maxLength={10}
            />
            <TextInput
              style={[
                styles.input,
                { borderBottomColor: zipError ? colors.redColor : colors.blackColor, color: colors.blackColor }
              ]}
              placeholder="Zip Code*"
              placeholderTextColor={zipError ? colors.redColor : colors.blackColor}
              value={zip}
              onChangeText={text => {
                setZip(text);
                setZipError(!text);
              }}
              keyboardType="number-pad"
              maxLength={6}
            />
          </ScrollView>
          <Pressable onPress={handleSubmit} style={[styles.submitButton, alignJustifyCenter, borderRadius10]}>
            <Text style={[styles.title, textAlign, { color: whiteColor }]}>Submit</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: blackOpacity5,
  },
  modalContent: {
    width: wp(100),
    height: hp(60),
    paddingHorizontal: spacings.Large1x,
    paddingVertical: spacings.large,
    backgroundColor: whiteColor,
  },
  title: {
    fontSize: style.fontSizeLarge.fontSize,
    fontWeight: style.fontWeightThin.fontWeight,
    color: blackColor
  },
  input: {
    height: hp(6),
    width: "100%",
    borderBottomWidth: 1,
    marginBottom: spacings.large,
    paddingLeft: spacings.large,
    borderRadius: 5,
  },
  closeButton: {
    top: spacings.small,
    right: spacings.small,
  },
  submitButton: {
    width: wp(50),
    height: hp(5),
    backgroundColor: redColor,
    marginTop: spacings.Large1x,
    alignSelf: "center"
  }
});

export default AddAddressModal;
