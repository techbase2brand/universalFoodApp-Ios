import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '.././../utils';
import { whiteColor, darkgrayColor, redColor, blackColor, goldColor, lightGrayColor, lightBlueColor, grayColor, lightGrayOpacityColor, blackOpacity5 } from '../../constants/Color'
import { spacings, style } from '../../constants/Fonts';
import { BaseStyle } from '../../constants/Style';
import { logEvent } from '@amplitude/analytics-react-native';
import { useThemes } from '../../context/ThemeContext';
import { lightColors, darkColors } from '../../constants/Color';
const { alignItemsCenter, resizeModeContain, textAlign, alignJustifyCenter, flex, borderRadius10, borderRadius5, overflowHidden, borderWidth1, flexDirectionRow, justifyContentSpaceBetween, alignSelfCenter, positionAbsolute } = BaseStyle;

const ConfirmationModal = ({ visible, onConfirm, onCancel, message }) => {
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  const onConfirmClick = () => {
    logEvent('Confirm button Clicked');
    onConfirm()
  }
  const onCancleClick = () => {
    logEvent('Cancle button Clicked');
    onCancel()
  }
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
    >
      <View style={[styles.modalContainer, flex, alignJustifyCenter]}>
        <View style={[styles.modalContent, alignItemsCenter, borderRadius10, { backgroundColor: colors.whiteColor }]}>
          <Text style={[styles.text, { color: colors.blackColor }]}>{"Confirmation"}</Text>
          <Text style={{ color: colors.blackColor }}>{message}</Text>
          <View style={[styles.buttonContainer, flexDirectionRow]}>
            <TouchableOpacity onPress={onConfirmClick} style={[styles.confirmButton, borderRadius5, alignJustifyCenter]}>
              <Text style={[textAlign, { color: whiteColor }]}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onCancleClick} style={[styles.cancelButton, borderRadius5, alignJustifyCenter, borderWidth1]}>
              <Text style={[textAlign, { color: colors.blackColor }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: blackOpacity5,
  },
  modalContent: {
    backgroundColor: whiteColor,
    paddingHorizontal: spacings.Large1x,
    paddingVertical: spacings.xxLarge
  },
  buttonContainer: {
    marginTop: spacings.Large1x,
  },
  confirmButton: {
    backgroundColor: redColor,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.normal,
    marginRight: spacings.Large1x,
  },
  cancelButton: {
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.normal,
    borderColor: blackColor
  },
  text: {
    marginBottom: spacings.xxxLarge,
    fontSize: style.fontSizeLarge.fontSize,
    fontWeight: style.fontWeightThin1x.fontWeight,
    color: blackColor
  }
});

export default ConfirmationModal;
