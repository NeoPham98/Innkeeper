import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";

const DetailHomeScreen = ({ route, navigation }) => {
  const { home } = route.params; // Nhận thông tin nhà từ params

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={26} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{home.home_name}</Text>
      </View>

      <View style={styles.infoContainer}>
        <TouchableOpacity style={styles.infoItem}>
          <AntDesign name="plus" size={24} color="#2C3E50" />
          <Text style={styles.infoText}>Thêm phòng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.infoItem}>
          <MaterialIcons name="lightbulb-outline" size={24} color="#2C3E50" />
          <Text style={styles.infoText}>Ghi điện nước</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.infoItem}>
          <MaterialIcons name="attach-money" size={24} color="#2C3E50" />
          <Text style={styles.infoText}>Thu tiền</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.infoItem}>
          <AntDesign name="setting" size={24} color="#2C3E50" />
          <Text style={styles.infoText}>Cài đặt</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.infoItem}>
          <MaterialIcons name="info-outline" size={24} color="#2C3E50" />
          <Text style={styles.infoText}>Hướng dẫn</Text>
        </TouchableOpacity>
      </View>

    
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 40,
  },
  backButton: {
    marginTop: -20,
    marginRight: 20,
  },
  headerText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2C3E50",
    marginTop: -25,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  infoItem: {
    alignItems: "center",
  },
  infoText: {
    fontSize: 14,
    marginVertical: 5,
    color: "#333",
  },
});

export default DetailHomeScreen;
