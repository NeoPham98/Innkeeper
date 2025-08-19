import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 1500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image source={require("../assets/logoApp.png")} style={styles.logo} />
        <Text style={styles.title} allowFontScaling={false}>Nhà trọ</Text>
        <Text style={styles.subtitle} allowFontScaling={false}>Quản lý nhà trọ thật dễ dàng</Text>
        <ActivityIndicator size="large" color="#3F51B5" style={{ marginTop: 10 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "75%",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3F51B5",
  },
  subtitle: {
    fontSize: 16,
    color: "#2C3E50",
    marginTop: 6,
  },
});

export default SplashScreen; 