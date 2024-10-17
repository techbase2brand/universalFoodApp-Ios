import React from 'react';
import { View, Text, Modal, ActivityIndicator, StyleSheet, } from 'react-native';
import { blackColor, blackOpacity7, whiteColor } from '../../constants/Color'
import { BaseStyle } from '../../constants/Style';
import LoaderKit from 'react-native-loader-kit'
import { useThemes } from '../../context/ThemeContext';
import { lightColors, darkColors } from '../../constants/Color';
const { alignJustifyCenter, flex, borderRadius10, flexDirectionColumn } = BaseStyle;

const LoadingModal = ({ visible, text }) => {
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={() => { }}
    >
      <View style={[styles.modalBackground, alignJustifyCenter, flex, flexDirectionColumn]}>
        <View style={[styles.activityIndicatorWrapper, alignJustifyCenter, borderRadius10]}>
          <Text style={[styles.loadingText, { color: colors.blackColor }]}>{text}</Text>
          <LoaderKit
            style={{ width: 100, height: 100 }}
            name={'BallClipRotateMultiple'}
            color={"white"}
          />
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  modalBackground: {
    backgroundColor: blackOpacity7,
  },
  activityIndicatorWrapper: {
    height: 300,
    width: 300,
    display: 'flex',
  },
  loadingText: {
    marginTop: 10,
    color: whiteColor
  },
});
export default LoadingModal;
