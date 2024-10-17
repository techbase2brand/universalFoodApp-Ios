import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
import { useNavigation } from '@react-navigation/native';
const ChatButton = ({ onPress,bottom }) => {
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={[styles.chatButton, { backgroundColor: colors.blackColor, bottom: bottom ? bottom : 20 }]}
      onPress={onPress}
    >
      <Icon name="chatbox-ellipses" size={25} color={colors.whiteColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chatButton: {
    position: 'absolute',
    // bottom: 20,
    right: 20,
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
  },
});

export default ChatButton;
