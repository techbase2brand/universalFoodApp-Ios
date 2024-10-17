import { View, Text, Modal, Animated, StyleSheet, Pressable, ImageBackground, Image } from 'react-native'
import React, { useState } from 'react'
import AntDesign from 'react-native-vector-icons/dist/AntDesign';
import LoginScreen from '../../screens/LoginScreen'
import RegisterScreen from '../../screens/RegisterScreen'
import { darkColors, lightColors, whiteColor } from '../../constants/Color'
import { BACKGROUND_IMAGE, WARLEY_HEADER_LOGO_NEW } from '../../assests/images'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '.././../utils';
import { useThemes } from '../../context/ThemeContext';

const LoginModal = ({ modalVisible, closeModal, slideAnim }) => {
  const { isDarkMode, toggleTheme } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  const [showSignUp, setShowSignUp] = useState(false);  // State to toggle between login and signup

  // Function to switch to SignUpScreen
  const handleSignUpClick = () => {
    setShowSignUp(true);
  };

  // Function to switch back to LoginScreen
  const handleBackToLogin = () => {
    setShowSignUp(false);
  };

  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      animationType="none"
    >
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }], backgroundColor: colors.whiteColor }]}>
          <ImageBackground style={{ flex: 1 }} source={isDarkMode ? "" : BACKGROUND_IMAGE}>
            <Pressable onPress={closeModal} style={{ paddingHorizontal: 15, paddingTop: 10 }}>
              <AntDesign name={"close"} size={30} color={colors.blackColor} />
            </Pressable>
            <Image source={WARLEY_HEADER_LOGO_NEW} style={{ marginBottom: 10, width: wp(40), height: hp(6.5), resizeMode: "contain", alignSelf: "center" }} />
            {showSignUp ? (
              <RegisterScreen onBackToLogin={handleBackToLogin} setShowSignUp={setShowSignUp} onCloseModal={closeModal}/>
            ) : (
              <LoginScreen handleSignUpClick={handleSignUpClick} onBackToLogin={handleBackToLogin} onCloseModal={closeModal}/>
            )}
          </ImageBackground>
        </Animated.View>
      </View>
    </Modal>
  )
}
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dim the background
    justifyContent: 'flex-end', // Align modal at the bottom
  },
  modalContent: {
    height: '95%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  closeButton: {
    backgroundColor: '#018726',
    padding: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
})
export default LoginModal
