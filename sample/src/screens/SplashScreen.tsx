import { StyleSheet, ImageBackground, TouchableOpacity, Linking } from 'react-native'
import React, { useEffect } from 'react'
import { SPLASH_IMAGE } from '../assests/images'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { logEvent } from '@amplitude/analytics-react-native';
export default function CustomSplashScreen() {
  useEffect(() => {
    logEvent('Splash Screen Initialized');
  }, [])
  return (
    <ImageBackground source={SPLASH_IMAGE} style={[{ width: wp(100), height: hp(100) }]} >
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
})
