import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";

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
          <Text style={styles.headerText}>{home.home_name}</Text>
        </TouchableOpacity>
        
      </View>

      <View style={styles.infoContainer}>
        <TouchableOpacity
          style={styles.infoItem}
          onPress={() => navigation.navigate("CreateRoom")}
        >
          <FontAwesome name="plus-circle" size={30} color="#FF6347" />
          <Text style={styles.infoText}>Thêm phòng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.infoItem}>
          <FontAwesome name="lightbulb-o" size={30} color="#FFD700" />
          <Text style={styles.infoText}>Ghi điện nước</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.infoItem}>
          <FontAwesome name="money" size={30} color="#32CD32" />
          <Text style={styles.infoText}>Thu tiền</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.infoItem}>
          <FontAwesome name="cog" size={30} color="#1E90FF" />
          <Text style={styles.infoText}>Cài đặt</Text>
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
    marginTop: 30,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginLeft: 20,
    marginTop: -2
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  infoItem: {
    alignItems: "center",
    marginHorizontal: 15,
    marginTop: 10,
  },
  infoText: {
    fontSize: 16,
    marginVertical: 5,
    color: "#000",
    fontWeight: "bold",
  },
});

export default DetailHomeScreen;
