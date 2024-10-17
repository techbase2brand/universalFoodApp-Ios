import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { whiteColor, blackColor, grayColor, redColor } from '../constants/Color';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { logEvent } from '@amplitude/analytics-react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ADMINAPI_ACCESS_TOKEN, STOREFRONT_DOMAIN } from '../constants/Constants';
import { BACKGROUND_IMAGE } from '../assests/images';
import Header from '../components/Header';
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
import ChatButton from '../components/ChatButton';
const { flex, alignItemsCenter, flexDirectionRow, alignJustifyCenter, positionAbsolute, borderRadius5, borderWidth1, justifyContentSpaceBetween } = BaseStyle;


const AccountDetails = ({ navigation }: { navigation: any }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerId, setCustomerId] = useState(null);
  const today = new Date();

  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(false);
    setDateOfBirth(currentDate);
  };

  //Fetch Customer Id
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
    logEvent('Account Details Screen Trigger');
  }, [])

  //Fetch userProfile Details
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`https://${STOREFRONT_DOMAIN}/admin/api/2024-01/customers/${customerId}.json`, {
          headers: {
            'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
            'Content-Type': 'application/json',
          },
        });
        const customer = response.data.customer;
        setFullName(`${customer.first_name} ${customer.last_name}`);
        setEmail(customer.email);
        if (customer.date_of_birth) {
          setDateOfBirth(new Date(customer.date_of_birth));
        }

        if (customer.gender) {
          setGender(customer.gender);
        }

        if (customer.phone) {
          const phoneWithoutCountryCode = customer.phone.replace(/^\+91\s*/, '');
          setPhoneNumber(phoneWithoutCountryCode);
        }
      } catch (error) {
        console.error('Error fetching customer profile:', error);
      }
    };
    if (customerId) {
      fetchUserProfile();
    }
  }, [customerId]);

  //onUpdate Profile
  const handleSubmit = async (id) => {
    logEvent('Submit button clicked in Acoount details');
    try {
      const [firstName, lastName] = fullName.split(' ');
      const data = {
        customer: {
          id: id,
          email: email,
          first_name: firstName,
          last_name: lastName,
          phone: phoneNumber,
          date_of_birth: dateOfBirth.toISOString().split('T')[0],
          gender: gender,
        }
      };

      const metafieldStatusKey = `customerMetafieldStatus_${id}`;
      const isFirstUpdate = !(await AsyncStorage.getItem(metafieldStatusKey));

      if (isFirstUpdate) {
        data.customer.metafields = [
          {
            key: 'new',
            value: 'newvalue',
            type: 'single_line_text_field',
            namespace: 'global'
          }
        ];

        await AsyncStorage.setItem(metafieldStatusKey, 'true');
      }

      const response = await axios.put(`https://${STOREFRONT_DOMAIN}/admin/api/2024-01/customers/${id}.json`, data, {
        headers: {
          'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      });
      navigation.goBack();
      logEvent('updating customer profile Succesfully');
    } catch (error) {
      console.error('Error updating customer profile:', error);
      logEvent('Error updating customer profile');
    }
  };

  const handleChatButtonPress = () => {
    logEvent('Chat button clicked in Acoount details Screen');
    navigation.navigate("ShopifyInboxScreen")
  };

  return (
    <ImageBackground style={[styles.container, flex, { backgroundColor: colors.whiteColor }]} source={isDarkMode ? '' : BACKGROUND_IMAGE}>
      <Header
        backIcon={true}
        text={"AccountDetails"}
        navigation={navigation} />
      <View style={{ width: "100%", padding: spacings.large, height: hp(87.5) }}>
        <Text style={[styles.textInputHeading, { color: colors.blackColor, }]}>{"Full Name"}</Text>
        <View style={[styles.input, borderRadius5, borderWidth1, flexDirectionRow, alignItemsCenter, { borderColor: colors.grayColor }]}>
          <View style={{ flex: 1 }}>
            <TextInput
              placeholder={"Full Name"}
              placeholderTextColor={colors.grayColor}
              onChangeText={(text) => {
                setFullName(text);
              }}
              value={fullName}
              style={{ color: colors.blackColor }}
            />
          </View>
        </View>
        <Text style={[styles.textInputHeading, { color: colors.blackColor }]}>Email Address</Text>
        <View style={[styles.input, borderRadius5, borderWidth1, flexDirectionRow, alignItemsCenter, { borderColor: colors.grayColor }]}>
          <View style={{ flex: 1 }}>
            <TextInput
              style={[styles.input, { color: colors.blackColor }]}
              value={email}
              onChangeText={setEmail}
              placeholder="Email Address"
              keyboardType="email-address"
              editable={false}
            />
          </View>
        </View>

        <Text style={[styles.textInputHeading, { color: colors.blackColor }]}>Date of Birth</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.dateInput, borderRadius5, borderWidth1, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
          <Text style={{ color: colors.blackColor }}>{dateOfBirth.toLocaleDateString()}</Text>
          <Ionicons name="calendar" size={20} color={colors.blackColor} />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth}
            mode="date"
            display="default"
            onChange={onChangeDate}
            maximumDate={today}
          />
        )}
        <Text style={[styles.textInputHeading, { color: colors.blackColor }]}>Gender</Text>
        <View style={[styles.pickerContainer, borderRadius5, borderWidth1]}>
          <Picker
            selectedValue={gender}
            onValueChange={(itemValue) => setGender(itemValue)}
            style={[styles.picker, { color: colors.blackColor }]}
          >
            <Picker.Item label="Select Gender" value="" />
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>
        <Text style={[styles.textInputHeading, { color: colors.blackColor, }]}>Phone Number</Text>
        <View style={[styles.input, borderRadius5, borderWidth1, flexDirectionRow, alignItemsCenter, { borderColor: colors.grayColor }]}>
          <View style={{ flex: 1 }}>
            <TextInput
              style={[styles.input, { color: colors.blackColor }]}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Phone Number"
              keyboardType="number-pad"
              maxLength={10}
              placeholderTextColor={colors.grayColor}
            />
          </View>
        </View>
        <Pressable style={[styles.submitButton, positionAbsolute, alignJustifyCenter]} onPress={() => handleSubmit(customerId)}>
          <Text style={[styles.submitButtonText, { color: whiteColor }]}>Submit</Text>
        </Pressable>
      </View>
      <ChatButton onPress={handleChatButtonPress} bottom={60}/>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
  },
  backIcon: {

  },
  text: {
    fontSize: style.fontSizeMedium1x.fontSize,
    fontWeight: style.fontWeightMedium.fontWeight,
    paddingLeft: spacings.large,
    color: blackColor
  },
  input: {
    width: '100%',
    height: hp(6),
    borderColor: grayColor,
    paddingHorizontal: spacings.normal,
  },
  dateInput: {
    width: '100%',
    height: hp(6),
    borderColor: grayColor,
    paddingHorizontal: spacings.large,
  },
  pickerContainer: {
    width: '100%',
    height: hp(7),
    borderColor: grayColor,
    paddingHorizontal: spacings.large,
  },
  picker: {
    height: 50,
  },
  submitButton: {
    backgroundColor: redColor,
    padding: spacings.xLarge,
    borderRadius: 10,
    bottom: 5,
    width: "100%",
    alignSelf: 'center'
  },
  submitButtonText: {
    fontSize: style.fontSizeNormal2x.fontSize,
    fontWeight: style.fontWeightThin.fontWeight
  },
  textInputHeading: {
    fontSize: style.fontSizeNormal1x.fontSize,
    fontWeight: style.fontWeightThin.fontWeight,
    color: blackColor,
    marginTop: spacings.xxxxLarge,
    marginBottom: spacings.normal
  },

});

export default AccountDetails;
