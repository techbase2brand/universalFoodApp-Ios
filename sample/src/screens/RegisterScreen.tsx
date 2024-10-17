import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, ActivityIndicator, ImageBackground, Pressable, Alert } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { whiteColor, blackColor, grayColor, redColor, } from '../constants/Color'
import {
  BY_CONTINUING_YOU_AGREE, EMAIL, PASSWORD, CONFIRM_PASSWORD, PLEASE_FILL_ALL_FIELD, INVALID_EMAIL_FORMAT, PASSWORD_MUST_BE_AT, APP_NAME,
  PASSWORD_DO_NOT_MATCH, FIRST_NAME, LAST_NAME, TERM_OF_SERVICES, PRIVACY_POLICY,
  ALREADY_HAVE_AN_ACCOUNT, LOGIN, STOREFRONT_DOMAIN, ADMINAPI_ACCESS_TOKEN,
} from '../constants/Constants'
import { GOOGLE_LOGO_IMAGE, BACKGROUND_IMAGE, OTP_VERIFICATION_IMAGE, APPLE_LOGO_IMAGE } from '../assests/images'
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import Toast from 'react-native-simple-toast';
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import LoadingModal from '../components/Modal/LoadingModal';
import SuccessModal from '../components/Modal/SuccessModal';
import { logEvent } from '@amplitude/analytics-react-native';
import PushNotification from 'react-native-push-notification';
import OTPTextInput from 'react-native-otp-textinput';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '../redux/actions/authActions';
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthProvider';
import { appleAuth } from '@invertase/react-native-apple-authentication';
const { flex, alignJustifyCenter, alignItemsCenter, borderWidth1, borderRadius5, resizeModeContain, flexDirectionRow, positionAbsolute, textAlign, textDecorationUnderline } = BaseStyle;

const RegisterScreen = ({ onBackToLogin, onCloseModal }) => {
  const navigation = useNavigation();
  const { isDarkMode } = useThemes();
  const { setIsLoggedIn } = useContext(AuthContext)
  const colors = isDarkMode ? darkColors : lightColors;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false)
  const [showOTP, setShowOTP] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [isOtpComplete, setIsOtpComplete] = useState(false);
  const [resendButtonDisabled, setResendButtonDisabled] = useState(false);
  const [timer, setTimer] = useState(60);


  const dispatch = useDispatch();

  useEffect(() => {
    logEvent('RegisterScreen Initialized');
  }, [])


  const handleSendOtp = async () => {


    // if (!firstName || !lastName || !phone || !email || !password || !confirmPassword) {
    //   setError(PLEASE_FILL_ALL_FIELD);
    //   return;
    // }

    setShowOTP(true)
    try {
      const formattedPhoneNumber = `+91${phone}`;
      console.log(formattedPhoneNumber)
      await auth().signInWithPhoneNumber(formattedPhoneNumber);
    } catch (error) {
      console.error('Error sending OTP:', error);
    }
  };

  //sign in with user Details
  const handleSignUp = async () => {
    logEvent('Sign up Button clicked');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    if (!firstName) {
      Alert.alert("Please Enter Your First Name")
      return;
    }
    if (!lastName) {
      Alert.alert("Please Enter Your Last Name")
      return;
    }
    if (!phone) {
      Alert.alert("Please Enter Your Phone Number")
      return;
    }
    if (phone.length < 10) {
      Alert.alert("Please Enter Your 10 Digit Phone Number")
      return;
    }
    if (!emailPattern.test(email)) {
      setEmailError(INVALID_EMAIL_FORMAT);
      return;
    }
    if (password.length < 8) {
      setPasswordError(PASSWORD_MUST_BE_AT);
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError(PASSWORD_DO_NOT_MATCH);
      return;
    }

    try {
      setLoading(true)
      const response = await fetch('https://whale-app-nuspa.ondigitalocean.app/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: `+91${phone}`,
          addresses: [{
            address1: null,
            city: null,
            province: null,
            country: null,
            zip: null,
            phone: null,
            default: true
          }],
          password: password,
          password_confirmation: confirmPassword
        })
      });
      const responseData = await response.json();
      console.log("responseData", responseData)
      if (responseData.message) {
        setError('')
        setError(responseData.message)
        setLoading(false)
      }
      else {
        await AsyncStorage.setItem('userDetails', JSON.stringify(responseData))
        Toast.show(`User Registered Succesfully`);
        setSuccessModalVisible(false)
        setIsLoggedIn(true)
        // onBackToLogin();
        onCloseModal();
        navigation.navigate('Cart');

        dispatch(loginSuccess({ email, password }));
        logEvent('User Registered Succesfully');
        handleNotificationTrigger()
        setLoading(false)

      }
    } catch (error) {
      setLoading(false)
      console.log('Registration error:', error);
      logEvent(`Registration error: ${error}`);
    }
  };

  //sign in with google
  const googleSignUp = async () => {
    logEvent('GoogleSignUp Button clicked from register screen');
    try {
      setLoading(true)
      await GoogleSignin.hasPlayServices();
      const { idToken, user } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
      await AsyncStorage.setItem('userImage', user.photo);
      const { email, givenName, familyName } = user;
      console.log("user:::", user)
      const isRegistered = await checkIfUserIsRegistered(user.email)
      console.log("user:::", isRegistered)
      if (isRegistered) {
        Toast.show(`User LoggedIn Succesfully from register screen`);
        navigation.navigate("Home");
        dispatch(loginSuccess({ email: user.email, password: '' }));
        setLoading(false)
      } else {
        const shopifyResponse = await registerUserToShopify({
          email: email,
          password: "defaultPassword",
          password_confirmation: "defaultPassword",
          first_name: givenName,
          last_name: familyName,
        });

        await AsyncStorage.setItem('userDetails', JSON.stringify(shopifyResponse))
        Toast.show(`User Registered Succesfully from register screen`);
        handleNotificationTrigger();
        navigation.navigate("Home");
        dispatch(loginSuccess({ email: user.email, password: '' }));
        onCloseModal();
        setLoading(false)
      }
      logEvent('GoogleSignUp Succesfully from register screen');
    } catch (error) {
      setLoading(false)
      console.error('Google sign up error:', error);

      logEvent(`Google sign up error:${error} from register screen`);
    }
  };


  //registerUserToShopify when user sign with google
  const registerUserToShopify = async (userData) => {
    console.log("userData", userData)
    try {
      const response = await fetch(`https://${STOREFRONT_DOMAIN}/admin/api/2023-10/customers.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
        },
        body: JSON.stringify({ customer: userData }),
      });

      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json(); // Capture error details from Shopify
        console.error('Error data:', errorData);
        throw new Error('Failed to register user on Shopify');
      }
    } catch (error) {
      console.error('Error registering user on Shopify:', error);
      throw error;
    }
  };

  const checkIfUserIsRegistered = async (email) => {
    console.log("email", email)
    try {
      const response = await fetch(`https://${STOREFRONT_DOMAIN}/admin/api/2024-04/customers.json`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
        },
      });

      if (response.ok) {
        const responseData = await response.json();
        const customers = responseData.customers;

        // Check if any customer matches the provided email
        const customer = customers.find(customer => customer.email === email);

        if (customer) {
          await AsyncStorage.setItem('userDetails', JSON.stringify(customer));
          return true;
        } else {
          return false;
        }
      } else {
        throw new Error('Failed to fetch customers from Shopify');
      }
    } catch (error) {
      console.error('Error checking user registration:', error);
      return false;
    }
  };

  const toggleShowPassword = () => {
    logEvent('Show Password icon click on Register Screen');
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    logEvent('Show ConfirmPassword icon click on Register Screen');
    setShowConfirmPassword(!showConfirmPassword);
  };


  const handleNotificationTrigger = () => {
    PushNotification.localNotification({
      channelId: "default-channel-id",
      title: 'Welcome',
      message: 'Thank you for using our app!',
    });
  };

  const handleOTPChange = (otp) => {
    setOtp(otp);
    setIsOtpComplete(otp.length === 6);
  };

  const VerifyOTP = () => {
    setSuccessModalVisible(true)
  }

  useEffect(() => {
    let interval;
    if (resendButtonDisabled && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setResendButtonDisabled(false);
      setTimer(60);
    }
    return () => clearInterval(interval);
  }, [resendButtonDisabled, timer]);

  const hadleResendOtp = async () => {
    if (resendButtonDisabled) return;
    try {
      setResendButtonDisabled(true);
      const formattedPhoneNumber = `+91${phone}`;
      await auth().signInWithPhoneNumber(formattedPhoneNumber);
    } catch (error) {
      console.error('Error resending OTP:', error);
    }
  };

  async function appleSignIn() {
    console.log("working>>",);
    try {
      setLoading(true)
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        // As per the FAQ of react-native-apple-authentication, the name should come first in the following array.
        // See: https://github.com/invertase/react-native-apple-authentication#faqs
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });
      const {
        email,

      } = appleAuthRequestResponse;
      const isRegistered = await checkIfUserIsRegistered(email)
      if (isRegistered) {
        Toast.show(`User LoggedIn Succesfully`);
      }
      else {
        // Send user details to Shopify
        const shopifyResponse = await registerUserToShopify({
          email: email,
          password: "defaultPassword",
          password_confirmation: "defaultPassword",
          first_name: appleAuthRequestResponse?.fullName?.givenName,
          last_name: appleAuthRequestResponse?.fullName?.familyName,
        });
        console.log('Shopify response:', shopifyResponse);
        await AsyncStorage.setItem('userDetails', JSON.stringify(shopifyResponse))
        Toast.show(`User Registered Succesfully`);
        handleNotificationTrigger();
      }
      navigation.navigate("Home");
      dispatch(loginSuccess({ email: email, password: '' }));
      setLoading(false)
      onCloseModal();
    } catch (error) {
      setLoading(false)
      console.error('Apple sign In error:', error);
      logEvent(`Apple sign In error:${error}`);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >

      {showOTP ?
        <>
          <View style={[styles.logoBox, alignJustifyCenter, { height: hp(25), }]}>
            <Image source={OTP_VERIFICATION_IMAGE} style={[styles.image, resizeModeContain]} />
          </View>
          <View style={[{ marginTop: spacings.large }]}>
            <Text style={[styles.text, { color: colors.blackColor }]}>OTP Verification</Text>
          </View>
          <Text style={{ color: colors.blackColor, marginHorizontal: spacings.small }}>
            {`Enter the OTP sent to +91 ${phone}`}
          </Text>
          <View style={[{ width: "100%", height: hp(18) }, alignJustifyCenter]}>
            <OTPTextInput
              handleTextChange={handleOTPChange}
              inputCount={6}
              tintColor={colors.blackColor}
              offTintColor={colors.blackColor}
              containerStyle={styles.otpContainer}
              textInputStyle={[styles.otpInput, { color: colors.blackColor }]}
            />
            <TouchableOpacity onPress={hadleResendOtp} disabled={resendButtonDisabled}>
              <Text style={{ color: colors.blackColor, marginHorizontal: spacings.small }}>
                OTP not Received?
                <Text style={{ color: resendButtonDisabled ? colors.grayColor : colors.blackColor, fontWeight: style.fontWeightThin1x.fontWeight, textDecorationLine: "underline" }}>
                  {resendButtonDisabled ? ` Resend code in ${timer}s` : ' Resend code'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[
              styles.button,
              alignItemsCenter,
              borderRadius5,
              { backgroundColor: isOtpComplete ? colors.redColor : colors.mediumGray }
            ]}
            onPress={isOtpComplete ? VerifyOTP : null}
            disabled={!isOtpComplete}
          >
            <Text style={[styles.buttonText, { color: colors.blackColor }]}>{"Verify & Continue"}</Text>
          </TouchableOpacity>
          <View style={[alignJustifyCenter, { height: hp(13), marginTop: spacings.xxxxLarge }]}>
            <View style={[flexDirectionRow, alignJustifyCenter, { width: "100%", marginTop: spacings.large }]}>
              <View style={{ height: 1, backgroundColor: colors.grayColor, width: "46%" }}></View>
              <Text style={[{ color: colors.blackColor, marginVertical: spacings.xxxxLarge, marginHorizontal: spacings.small }, textAlign]}>{"Or"}</Text>
              <View style={{ height: 1, backgroundColor: colors.grayColor, width: "46%" }}></View>
            </View>
            <View style={[styles.socialAuthBox, alignJustifyCenter, flexDirectionRow]}>
              <TouchableOpacity style={[styles.socialButton, alignJustifyCenter]} onPress={googleSignUp}>
                <Image source={GOOGLE_LOGO_IMAGE} style={[{ width: wp(6), height: hp(4) }, resizeModeContain]} />
              </TouchableOpacity>
              {Platform.OS === 'ios' && <TouchableOpacity style={[styles.socialButton, alignJustifyCenter]} >
                <Image source={APPLE_LOGO_IMAGE} style={[{ width: wp(6), height: hp(4) }, resizeModeContain]} />
              </TouchableOpacity>}
            </View>
          </View>
        </>
        :
        <>
          {/* <TouchableOpacity style={[positionAbsolute, styles.backIcon]} onPress={() => { logEvent(`Back Button Pressed from Register`), navigation.goBack() }}>
              <Ionicons name={"arrow-back"} size={33} color={colors.blackColor} />
            </TouchableOpacity> */}
          <View style={[styles.logoBox, alignJustifyCenter]}>
            <Text style={[styles.text, { color: colors.blackColor }]}>Sign Up</Text>
          </View>
          <View style={[styles.textInputBox]}>
            <View style={[flexDirectionRow]}>
              <View style={{ width: "48%", marginRight: spacings.large, }}>
                <Text style={[styles.textInputHeading, { color: colors.blackColor }]}>{FIRST_NAME}</Text>
                <View style={[styles.halfInput, borderRadius5, borderWidth1, flexDirectionRow, alignItemsCenter, { borderColor: colors.grayColor }]}>
                  <View style={{ width: wp(7) }}>
                    <Ionicons name={"person-sharp"} size={20} color={colors.grayColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      placeholder={FIRST_NAME}
                      placeholderTextColor={colors.grayColor}
                      onChangeText={setFirstName}
                      value={firstName}
                      style={{ color: colors.blackColor }}
                    />
                  </View>
                </View>
              </View>
              <View style={{ width: "48%", marginRight: spacings.large, }}>
                <Text style={[styles.textInputHeading, { color: colors.blackColor }]}>{LAST_NAME}</Text>
                <View style={[styles.halfInput, borderRadius5, borderWidth1, flexDirectionRow, alignItemsCenter, { borderColor: colors.grayColor }]}>
                  <View style={{ width: wp(0) }}>
                    {/* <Ionicons name={"person-sharp"} size={20} color={colors.grayColor} /> */}
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      placeholder={LAST_NAME}
                      placeholderTextColor={colors.grayColor}
                      onChangeText={setLastName}
                      value={lastName}
                      style={{ color: colors.blackColor }}
                    />
                  </View>
                </View>
              </View>
            </View>
            <Text style={[styles.textInputHeading, { color: colors.blackColor }]}>{"Phone Number"}</Text>
            <View style={[styles.input, borderRadius5, borderWidth1, flexDirectionRow, alignItemsCenter, { borderColor: colors.grayColor }]}>
              <View style={{ width: wp(7) }}>
                <MaterialCommunityIcons name={"phone"} size={20} color={colors.grayColor} />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder="Enter your Phone Number"
                  placeholderTextColor={colors.grayColor}
                  onChangeText={setPhone}
                  value={phone}
                  keyboardType="phone-pad"
                  style={{ color: colors.blackColor }}
                  maxLength={10}
                />
              </View>
            </View>
            <Text style={[styles.textInputHeading, { color: colors.blackColor }]}>{EMAIL}</Text>
            <View style={[styles.input, borderRadius5, borderWidth1, flexDirectionRow, alignItemsCenter, { borderColor: colors.grayColor }]}>
              <View style={{ width: wp(7) }}>
                <MaterialCommunityIcons name={"email-outline"} size={20} color={emailError ? redColor : colors.grayColor} />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder={"Enter your Email"}
                  placeholderTextColor={colors.grayColor}
                  onChangeText={setEmail}
                  value={email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{ color: colors.blackColor }}
                />
              </View>
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            <View style={[flexDirectionRow]}>
              <View style={{ width: "48%", marginRight: spacings.large, }}>
                <Text style={[styles.textInputHeading, { color: colors.blackColor }]}>{PASSWORD}</Text>
                <View style={[styles.halfInput, borderRadius5, borderWidth1, flexDirectionRow, alignItemsCenter, { borderColor: colors.grayColor }]}>
                  <View style={{ width: wp(7) }}>
                    <MaterialCommunityIcons name={"lock"} size={20} color={passwordError ? redColor : colors.grayColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      placeholder={"Current"}
                      placeholderTextColor={colors.grayColor}
                      onChangeText={setPassword}
                      value={password}
                      secureTextEntry={!showPassword}
                      style={{ color: colors.blackColor }}
                    />
                  </View>
                  <TouchableOpacity onPress={toggleShowPassword}>
                    <MaterialCommunityIcons name={showPassword ? "eye" : "eye-off"} size={20} color={grayColor} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ width: "48%", marginRight: spacings.large, }}>
                <Text style={[styles.textInputHeading, { color: colors.blackColor }]}>{CONFIRM_PASSWORD}</Text>
                <View style={[styles.halfInput, borderRadius5, borderWidth1, flexDirectionRow, alignItemsCenter, { borderColor: colors.grayColor }]}>
                  <View style={{ width: wp(7) }}>
                    <MaterialCommunityIcons name={"lock"} size={20} color={confirmPasswordError ? redColor : colors.grayColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      placeholder={"Confirm"}
                      placeholderTextColor={colors.grayColor}
                      onChangeText={setConfirmPassword}
                      value={confirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      style={{ color: colors.blackColor }}
                    />
                  </View>
                  <TouchableOpacity onPress={toggleShowConfirmPassword}>
                    <MaterialCommunityIcons name={showConfirmPassword ? "eye" : "eye-off"} size={20} color={colors.grayColor} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            {confirmPasswordError || error || passwordError ? <Text style={styles.errorText}>{confirmPasswordError || error || passwordError}</Text> : null}
            <Pressable style={[styles.button, alignItemsCenter, borderRadius5]} onPress={handleSignUp}>
              <Text style={styles.buttonText}>{"Register"}</Text>
            </Pressable>

            <View style={[alignJustifyCenter, {}]}>
              <View style={[flexDirectionRow, alignJustifyCenter, { width: "100%", marginVertical: 10 }]}>
                <View style={{ height: 1, backgroundColor: colors.grayColor, width: "46%" }}></View>
                <Text style={[{ color: colors.blackColor, margin: spacings.small }, textAlign]}>{"Or"}</Text>
                <View style={{ height: 1, backgroundColor: colors.grayColor, width: "46%" }}></View>
              </View>
              <View style={[styles.socialAuthBox, alignJustifyCenter, flexDirectionRow]}>
                <TouchableOpacity style={[styles.socialButton, alignJustifyCenter]} onPress={googleSignUp}>
                  <Image source={GOOGLE_LOGO_IMAGE} style={[{ width: wp(6), height: hp(4) }, resizeModeContain]} />
                </TouchableOpacity>
                {Platform.OS === 'ios' && <TouchableOpacity style={[styles.socialButton, alignJustifyCenter]} onPress={appleSignIn}>
                  <Image source={APPLE_LOGO_IMAGE} style={[{ width: wp(6), height: hp(4) }, resizeModeContain]} />
                </TouchableOpacity>}
              </View>
            </View>
            <Pressable style={[{ width: "100%" }, alignJustifyCenter]} onPress={onBackToLogin}>
              <Text style={[{ marginTop: 6, color: colors.blackColor }]}>{ALREADY_HAVE_AN_ACCOUNT}<Text style={[{ color: colors.redColor }]}>{LOGIN}</Text></Text>
            </Pressable>
            <View style={[positionAbsolute, alignJustifyCenter, { bottom: 100, width: "100%" }]}>
              <Text style={[{ color: colors.blackColor }, textAlign]}>{BY_CONTINUING_YOU_AGREE}</Text>
              <View style={[flexDirectionRow, { marginTop: 5, width: "100%" }, alignJustifyCenter]}>
                <TouchableOpacity onPress={() => {
                  navigation.navigate('WebViewScreen', {
                    headerText: TERM_OF_SERVICES
                  }),
                    logEvent('Terms Of Services From login');
                  onCloseModal()
                }}>
                  <Text style={[{ color: colors.redColor, margin: 4 }, textDecorationUnderline]}>{TERM_OF_SERVICES}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  navigation.navigate('WebViewScreen', {
                    headerText: PRIVACY_POLICY
                  }),
                    logEvent('Privacy Policy From login');
                  onCloseModal()
                }}>
                  <Text style={[{ color: colors.redColor, margin: 4 }, textDecorationUnderline]}>{PRIVACY_POLICY}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </>}
      {loading &&
        <LoadingModal visible={loading} />
      }
      {successModalVisible && <SuccessModal
        visible={successModalVisible}
        onClose={() => setSuccessModalVisible(false)}
        onPressContinue={handleSignUp}
      />}
    </KeyboardAvoidingView>

  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    width: wp(100),
    height: hp(100)
  },
  logoBox: {
    width: "100%",
    height: hp(10),
    marginBottom: spacings.xxxLarge
  },
  text: {
    fontSize: style.fontSizeLarge2x.fontSize,
    fontWeight: style.fontWeightMedium1x.fontWeight,
    color: blackColor,
    fontFamily: 'GeneralSans-Variable'
  },
  title: {
    fontSize: style.fontSizeLarge1x.fontSize,
    fontWeight: style.fontWeightMedium1x.fontWeight,
    marginBottom: spacings.Large2x,
    color: blackColor
  },
  input: {
    width: '100%',
    height: hp(5.5),
    paddingHorizontal: spacings.xLarge,
    marginVertical: spacings.medium,
  },
  halfInput: {
    width: '100%',
    height: hp(5.5),
    paddingHorizontal: spacings.large,
    marginVertical: spacings.medium,
  },
  button: {
    width: '100%',
    backgroundColor: redColor,
    paddingVertical: spacings.xLarge,
    marginTop: spacings.ExtraLarge
  },
  buttonText: {
    color: whiteColor,
    fontSize: style.fontSizeLarge.fontSize,
    fontWeight: style.fontWeightThin.fontWeight,
  },
  textInputBox: {
    width: "100%",
    height: hp(80)
  },

  errorText: {
    color: redColor
  },
  // backIcon: {
  //   top: 15,
  //   left: 10,
  //   width: wp(10),
  //   height: hp(5)
  // },
  socialAuthBox: {
    width: '100%',
    // marginTop: spacings.xxLarge
  },
  socialButton: {
    width: wp(12),
    height: wp(12),
    borderRadius: 50,
    borderWidth: .5,
    borderColor: grayColor,
    marginHorizontal: spacings.large
  },
  textInputHeading: {
    fontSize: style.fontSizeNormal1x.fontSize,
    fontWeight: style.fontWeightThin.fontWeight,
    color: blackColor
  },
  image: {
    width: wp(70),
    height: hp(25)
  },
  otpContainer: {
    marginVertical: spacings.xLarge,
    width: "100%"
  },
  otpInput: {
    borderWidth: 1,
    fontSize: 20,
    borderRadius: 5,
    width: "14%"
  },
});

export default RegisterScreen;
