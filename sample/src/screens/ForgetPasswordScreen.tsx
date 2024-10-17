import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ImageBackground, Alert } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { whiteColor, blackColor, grayColor, redColor, mediumGray } from '../constants/Color';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { logEvent } from '@amplitude/analytics-react-native';
import { EMAIL, CONFIRM_PASSWORD, PASSWORD } from '../constants/Constants';
import OTPTextInput from 'react-native-otp-textinput';
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import SuccessModal from '../components/Modal/SuccessModal';
import { BACKGROUND_IMAGE } from '../assests/images';
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
const { flex, alignItemsCenter, flexDirectionRow, alignJustifyCenter, positionAbsolute, borderRadius5, borderWidth1 } = BaseStyle;

const ForgetPasswordScreen = ({ navigation}: { navigation: any }) => {
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isOtpComplete, setIsOtpComplete] = useState(false);
  const [resendButtonDisabled, setResendButtonDisabled] = useState(false);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState('email');
  const [successModalVisible, setSuccessModalVisible] = useState(false);

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

  useEffect(() => {
    logEvent('Forget Password Screen Trigger');
  }, [])

  const hadleResendOtp = async () => {
    if (resendButtonDisabled) return;
  };

  const handleOTPChange = (otp) => {
    setOtp(otp);
    setIsOtpComplete(otp.length === 6);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleEmailSubmit = async () => {
    logEvent('Sumbit Email button clicked on forget Password ');
    if (!email) {
      setEmailError('Email is required');
      return;
    }

    try {
      const response = await fetch('https://whale-app-nuspa.ondigitalocean.app/api/forgotPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      setCurrentStep('otp');
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailError('Failed to send email. Please try again.');
    }
  };

  const handleOTPSubmit = () => {
    logEvent('Sumbit OTP button clicked on forget Password ');
    if (otp.length !== 6) {
      Alert.alert('Please enter a valid OTP');
      return;
    }
    setCurrentStep('password');
  };

  const handlePasswordSubmit = async () => {
    logEvent('Sumbit Password button clicked on forget Password ');
    if (!password || !confirmPassword) {
      setPasswordError('Password and Confirm Password are required');
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }
    try {
      const response = await fetch('https://whale-app-nuspa.ondigitalocean.app/api/resetPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, "resetCode": otp, "newPassword": password, "newPasswordConfirmation": confirmPassword }),
      });

      if (response.ok) {
      setSuccessModalVisible(true);
        logEvent('succesfuuly resetting password ');
      }

    } catch (error) {
      console.error('Error resetting password:', error);
      logEvent(`Error resetting password:${error}`);
    }
  };
  return (
    <KeyboardAvoidingView
      style={[flex]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ImageBackground style={[styles.container, { backgroundColor: colors.whiteColor }]} source={isDarkMode ? '' : BACKGROUND_IMAGE}>
        <View style={[{ width: "100%", height: hp(5) }, flexDirectionRow, alignItemsCenter]}>
          <TouchableOpacity style={[styles.backIcon, alignItemsCenter]} onPress={() => { logEvent(`Back Button Pressed from ForgetPasswordScreen`), navigation.goBack() }}>
            <Ionicons name={"arrow-back"} size={33} color={colors.blackColor} />
          </TouchableOpacity>
        </View>
        {currentStep === 'email' && (
          <View style={{ width: "100%", height: hp(90), padding: spacings.large }}>
            <Text style={[styles.text, { color: colors.blackColor }]}>Forgot password</Text>
            <Text style={[{ color: isDarkMode ? whiteColor : mediumGray, paddingVertical: spacings.small }]}>Enter your email for the verification process.We will send 6 digits code to your email.</Text>
            <Text style={[styles.textInputHeading, { marginTop: spacings.large, color: colors.blackColor }]}>{EMAIL}</Text>
            <View style={[styles.input, borderRadius5, borderWidth1, flexDirectionRow, alignItemsCenter]}>
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder={EMAIL}
                  placeholderTextColor={colors.grayColor}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) {
                      setEmailError('');
                    }
                  }}
                  value={email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{ color: colors.blackColor }}
                />
              </View>

            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            <TouchableOpacity style={[styles.button, positionAbsolute, alignJustifyCenter]} onPress={handleEmailSubmit}>
              <Text style={[styles.buttonText, { color: whiteColor }]}>Send Code</Text>
            </TouchableOpacity>
          </View>)}
        {currentStep === 'otp' && (
          <View style={{ width: "100%", height: hp(90), padding: spacings.large }}>
            <Text style={[styles.text, { color: colors.blackColor }]}>Enter 6 Digit Code</Text>
            <Text style={{ color: isDarkMode ? whiteColor : mediumGray, paddingVertical: spacings.small }}>Enter 6 digit code that you received on your email
              <Text style={{ color: colors.blackColor }}> ({email}).</Text></Text>
            <View style={[{ width: "100%", height: hp(18) }, alignJustifyCenter]}>
              <OTPTextInput
                handleTextChange={handleOTPChange}
                inputCount={6}
                tintColor={colors.blackColor}
                offTintColor={colors.mediumGray}
                containerStyle={styles.otpContainer}
                textInputStyle={[styles.otpInput, { color: colors.blackColor }]}
              />
            </View>
            <TouchableOpacity style={[styles.button, positionAbsolute, alignJustifyCenter]} onPress={handleOTPSubmit}>
              <Text style={[styles.buttonText, { color: whiteColor }]}>Continue</Text>
            </TouchableOpacity>
          </View>)}
        {currentStep === 'password' && (<View style={{ width: "100%", height: hp(90), padding: spacings.large }}>
          <Text style={[styles.text, { color: colors.blackColor }]}>Reset password</Text>
          <Text style={[{ color: isDarkMode ? whiteColor : mediumGray, paddingVertical: spacings.small }]}>Set the new password for your account so you can login and access all the features.</Text>
          <View style={[{ width: "100%", height: hp(18), marginTop: spacings.Large1x }]}>
            <Text style={[styles.textInputHeading, { color: colors.blackColor }]}>{PASSWORD}</Text>
            <View style={[styles.input, borderRadius5, borderWidth1, flexDirectionRow, alignItemsCenter]}>
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder={PASSWORD}
                  placeholderTextColor={grayColor}
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
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            <Text style={[styles.textInputHeading, { color: colors.blackColor }]}>{CONFIRM_PASSWORD}</Text>
            <View style={[styles.input, borderRadius5, borderWidth1, flexDirectionRow, alignItemsCenter]}>
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder={CONFIRM_PASSWORD}
                  placeholderTextColor={grayColor}
                  onChangeText={(text) => {
                    setConfirmPassword(text)
                    if (passwordError) {
                      setPasswordError('');
                    }
                  }}
                  value={confirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  style={{ color: colors.blackColor }}
                />
              </View>
              <TouchableOpacity onPress={toggleShowConfirmPassword}>
                <MaterialCommunityIcons name={showConfirmPassword ? "eye" : "eye-off"} size={20} color={grayColor} />
              </TouchableOpacity>
            </View>
            {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
          </View>
          <TouchableOpacity style={[styles.button, positionAbsolute, alignJustifyCenter, { top: hp(45) }]} onPress={handlePasswordSubmit}>
            <Text style={[styles.buttonText, { color: whiteColor }]}>Continue</Text>
          </TouchableOpacity>
        </View>)}
        {successModalVisible && <SuccessModal
          visible={successModalVisible}
          onClose={() => setSuccessModalVisible(false)}
          headingText={"Password Changed!"}
          text={"You can now use your new password to login to your account."}
          onPressContinue={() => { navigation.goBack(), logEvent('Click continue button in success modal '); }}
        />}
      </ImageBackground>
    </KeyboardAvoidingView>
  )
}
export default ForgetPasswordScreen

const styles = StyleSheet.create({
  container: {
    padding: spacings.large
  },
  backIcon: {
    width: wp(10),
    height: hp(5)
  },
  text: {
    fontSize: style.fontSizeLarge2x.fontSize,
    fontWeight: style.fontWeightMedium.fontWeight,
    color: blackColor
  },
  input: {
    width: '100%',
    height: hp(6),
    borderColor: grayColor,
    paddingHorizontal: spacings.normal,
    marginVertical: spacings.large,
  },
  button: {
    backgroundColor: redColor,
    padding: spacings.xLarge,
    borderRadius: 10,
    top: hp(35),
    width: "100%",
    alignSelf: 'center'
  },
  buttonText: {
    fontSize: style.fontSizeNormal2x.fontSize,
    fontWeight: style.fontWeightThin.fontWeight
  },
  textInputHeading: {
    fontSize: style.fontSizeNormal2x.fontSize,
    fontWeight: style.fontWeightThin1x.fontWeight,
    color: blackColor
  },
  otpContainer: {
    marginVertical: spacings.xLarge,
    width: "90%"
  },
  otpInput: {
    borderWidth: 1,
    fontSize: 20,
    color: blackColor,
    borderRadius: 5,
    width: "14%"
  },
  errorText: {
    color: redColor
  },
})

