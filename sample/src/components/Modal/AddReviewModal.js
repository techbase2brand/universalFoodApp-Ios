import React from 'react';
import { Modal, View, StyleSheet, Pressable } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '.././../utils';
import { BaseStyle } from '../../constants/Style';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useThemes } from '../../context/ThemeContext';
import { lightColors, darkColors } from '../../constants/Color';
import ReviewForm from '../ReviewForm';
const { flex ,blackOpacity5} = BaseStyle;

const AddReviewModal = ({ visible, onClose, productId, customerName }) => {
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={{ position: "absolute", top: 480, left: 182, borderRadius: 100 }}>
        <AntDesign name="closecircle" size={20} color="black" />
      </View>
      <Pressable style={[styles.modalContainer, flex, { justifyContent: "flex-end" }]} onPress={onClose}>
        <View style={[styles.modalContent, { backgroundColor: colors.whiteColor }]}>
          <ReviewForm productId={productId} name={customerName} onClose={onClose} />
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
    height: hp(50),
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20
  },
});

export default AddReviewModal;
