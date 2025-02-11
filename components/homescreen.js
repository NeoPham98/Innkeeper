import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => navigation.navigate('Login')}
        >
          <AntDesign name="poweroff" size={24} color="#2C3E50" />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Image
          source={require("../assets/house.png")}
          style={styles.houseImage}
        />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Chủ trọ</Text>
        <Text style={styles.subtitle}>Quản lý nhà trọ thật dễ dàng</Text>
        
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => navigation.navigate('CreateHome')}
          >
            <AntDesign name="pluscircleo" size={50} color="#006D5B" />
          </TouchableOpacity>
          <Text style={styles.infoText}>Bạn chưa tạo nhà trọ nào</Text>
          <Text style={styles.infoText}>Bấm dấu "+" để tạo nhà trọ mới</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFD2CC",
    alignItems: "center",
    justifyContent: "center",
  },
  headerContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  logoutButton: {
    padding: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 60,
  },
  houseImage: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  content: {
    flex: 1,
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#E74C3C",
  },
  subtitle: {
    fontSize: 20,
    color: "#7F8C8D",
    marginBottom: 20,
  },
  card: {
    alignItems: "center",
    backgroundColor: "white",
    width: "90%",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 20
  },
  addButton: {
    marginBottom: 10,
  },
  infoText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
  },
});

export default HomeScreen;
