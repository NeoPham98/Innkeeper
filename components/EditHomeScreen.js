import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Keyboard,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { supabaseDB } from "../DBconfig";

const EditHomeScreen = ({ route, navigation }) => {
  const { id, name, address, id_account } = route.params;
  const [homeName, setHomeName] = useState(name);
  const [homeAddress, setHomeAddress] = useState(address);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const updateHome = async () => {
    
    try {
      setIsLoading(true);

      const { error } = await supabaseDB
        .from("Home")
        .update({ home_name: homeName, home_address: homeAddress })
        .eq("id_home", id);

      if (error) throw error;

      setIsLoading(false);
      navigation.navigate("Home", {
        notification: "Cập nhật nhà trọ thành công!",
        id_account: id_account,

      });
    } catch (error) {
      setIsLoading(false);
      setNotification("Cập nhật thất bại!");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Home", { id_account })}
        >
          <AntDesign name="arrowleft" size={24} color="#2C3E50" />
          <Text style={styles.headerText}>Chỉnh sửa</Text>
        </TouchableOpacity>
      </View>

      <Image
        source={require("../assets/house.png")}
        style={styles.houseImage}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Chỉnh sửa thông tin nhà</Text>

        <Text style={styles.label}>Tên nhà</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: Nhà trọ Trảng Dài"
          value={homeName}
          onChangeText={setHomeName}
        />
        <Text style={styles.label}>Địa chỉ</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: 18/158 Trảng Dài"
          value={homeAddress}
          onChangeText={setHomeAddress}
        />
        <TouchableOpacity
          style={[styles.saveButton, isLoading && { opacity: 0.7 }]}
          onPress={updateHome}
          disabled={isLoading}
        >
          <Text style={styles.saveText}>
            {isLoading ? "Đang lưu..." : "Lưu lại"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFD2CC",
  },
  headerContainer: {
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginLeft: 10,
  },
  houseImage: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 20,
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
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    alignSelf: "flex-start",
    marginLeft: 20,
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    width: "90%",
    height: 50,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 18,
    backgroundColor: "#F8F9FA",
  },
  saveButton: {
    backgroundColor: "#006D5B",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "90%",
    marginTop: 15,
  },
  saveText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#E74C3C",
    marginBottom: 20,
  },
});

export default EditHomeScreen;
