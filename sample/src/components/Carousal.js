import React, { useEffect, useRef } from 'react';
import { View, ScrollView, Dimensions, StyleSheet, Animated } from 'react-native';
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';

const { width } = Dimensions.get('window');
const itemWidth = width * 0.92; // Adjust the width of each item
const itemSpacing = width * 0.095;

const Carousal = ({ data, renderItem, dostsShow }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  const scrollViewRef = useRef(null); // Ref for ScrollView
  const currentIndex = useRef(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (scrollViewRef.current) {
        currentIndex.current += 1;

        // If we reach the last item, reset to the first item
        if (currentIndex.current >= data.length) {
          // Scroll back to the first item without animation
          scrollViewRef.current.scrollTo({ x: 0, animated: false });
          currentIndex.current = 0;
        } else {
          // Scroll to the next item
          scrollViewRef.current.scrollTo({
            x: currentIndex.current * width,
            animated: true,
          });
        }
      }
    }, 3000); // Auto scroll every 1 second

    return () => clearInterval(intervalId); // Clear the interval when component unmounts
  }, [data]);
  return (
    <View style={styles.container}>
      <View style={styles.carouselContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
        // contentContainerStyle={{ paddingHorizontal: itemSpacing / 2.7 }}
        >
          {data?.map((item, index) => (
            <View key={index} style={{ width: itemWidth, alignItems: 'center', justifyContent: 'center', marginHorizontal: 11 }}>
              {renderItem(item)}
            </View>
          ))}
        </ScrollView>
      </View>
      {dostsShow && (
        <View style={styles.dotsContainer}>
          {data?.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 20, 8], // Interpolates width between 10 (inactive) and 20 (active)
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index.toString()}
                style={[styles.dot, { opacity: dotOpacity, width: dotWidth }]}
              />
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 10,
    justifyContent: 'center',
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 10,
    alignSelf: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#595959',
    marginHorizontal: 4,
  },
});

export default Carousal;
