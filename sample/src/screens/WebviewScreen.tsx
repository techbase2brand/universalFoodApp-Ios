import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../utils';
import { whiteColor, blackColor } from '../constants/Color';
import Header from '../components/Header';
import { useRoute } from '@react-navigation/native';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
const { textAlign } = BaseStyle;
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
import { logEvent } from '@amplitude/analytics-react-native';

const WebviewScreen = ({ navigation }: { navigation: any }) => {
  const route = useRoute();
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  useEffect(() => {
    logEvent('WebView Screen Initialized');
  }, [])
  return (
    <View style={[styles.container, { backgroundColor: colors.whiteColor }]}>
      <Header
        backIcon={true}
        text={route?.params?.headerText}
        navigation={navigation}
      />
      {route?.params?.headerText === "Terms of Services" && <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.title, textAlign, { color: colors.blackColor }]}>AppCartify Terms of Service</Text>
        <Text style={[styles.subtitle, textAlign, { color: colors.blackColor }]}>Effective Date: 09-07-2024</Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>1. Acceptance of Terms</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>
          By using AppCartify, you agree to these Terms of Service. If you do not agree, do not use our app.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>2. User Responsibilities</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Provide accurate information during registration.</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Keep your account credentials secure.</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Comply with all applicable laws.</Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>3. Prohibited Activities</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● No fraudulent activities.</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● No distribution of harmful software.</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● No violation of intellectual property rights.</Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>4. Intellectual Property</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>
          All content on AppCartify, including text, graphics, logos, and software, is the property of AppCartify or its content suppliers and protected by intellectual property laws.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>5. Limitation of Liability</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>
          AppCartify is not liable for any indirect, incidental, or consequential damages arising from your use of the app.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>6. Changes to Terms</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>
          We may modify these terms at any time. Continued use of the app constitutes acceptance of the new terms.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>7. Governing Law</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>
          These terms are governed by the laws of India.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>8. Contact Us</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>
          For any questions or concerns, please contact us at tech@base2brand.com.
        </Text>
      </ScrollView>}
      {route?.params?.headerText === "Privacy Policy" && <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.title, textAlign, { color: colors.blackColor }]}>AppCartify Privacy Policy</Text>
        <Text style={[styles.subtitle, textAlign, { color: colors.blackColor }]}>Effective Date: 09-07-2024</Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>1. Introduction</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>
          Welcome to AppCartify. We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>2. Information We Collect</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Personal Information: Name, email address, shipping address, phone number.</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Payment Information: Credit card details, billing information.</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Usage Data: Device information, IP address, browsing history, app usage statistics.</Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>3. How We Use Your Information</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● To process and fulfill your orders.</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● To provide customer support.</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● To improve our app and services.</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● To send you promotional materials (with your consent).</Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>4. Data Sharing</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>We do not sell or rent your personal information to third parties. We may share data with:</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Service providers who help us operate our business.</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Legal authorities if required by law.</Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>5. Data Security</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>
          We implement robust security measures to protect your data from unauthorized access.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>6. Your Rights</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>
          You have the right to access, update, or delete your personal information. Contact us at [email] to exercise these rights.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>7. Changes to This Policy</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>
          We may update this policy from time to time. We will notify you of any changes by posting the new policy on our app.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>8. Contact Us</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>
          For any questions or concerns, please contact us at tech@base2brand.com.
        </Text>
      </ScrollView>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: wp(100),
    height: hp(100),
    // backgroundColor: whiteColor,
  },
  contentContainer: {
    padding: spacings.Large2x,
  },
  title: {
    fontSize: style.fontSizeLargeXX.fontSize,
    fontWeight: 'bold',
    // color: blackColor,
    marginBottom: spacings.Large2x,
  },
  subtitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginBottom: spacings.Large2x,
  },
  sectionTitle: {
    fontSize: style.fontSizeMedium1x.fontSize,
    fontWeight: 'bold',
    color: blackColor,
    marginBottom: spacings.xLarge,
  },
  paragraph: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginBottom: spacings.xLarge,
    lineHeight: 24,
  },
});

export default WebviewScreen;
