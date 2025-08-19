import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {notification ? (
              <View style={styles.notification}>
                <Text style={styles.notificationText} allowFontScaling={false}>
                  {notification}
                </Text>
              </View>
            ) : null}
            
            <View style={styles.headerContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate("Home", { id_account })}
              >
                <AntDesign name="arrowleft" size={24} color="#2C3E50" />
                <Text style={styles.headerText} allowFontScaling={false}>
                  Chỉnh sửa
                </Text>
              </TouchableOpacity>
            </View>

            <Image
              source={require("../assets/house.png")}
              style={styles.houseImage}
            />

            <View style={styles.content}>
              <Text style={styles.title} allowFontScaling={false}>
                Chỉnh sửa thông tin nhà
              </Text>

              <Text style={styles.label} allowFontScaling={false}>
                Tên nhà
              </Text>
              <TextInput
                allowFontScaling={false}
                style={styles.input}
                placeholder="Ví dụ: Nhà trọ Trảng Dài"
                value={homeName}
                onChangeText={setHomeName}
                textAlignVertical="top"
              />
              <Text style={styles.label} allowFontScaling={false}>
                Địa chỉ
              </Text>
              <TextInput
                allowFontScaling={false}
                style={styles.input}
                placeholder="Ví dụ: 18/158 Trảng Dài"
                value={homeAddress}
                onChangeText={setHomeAddress}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.saveButton, isLoading && { opacity: 0.7 }]}
                onPress={updateHome}
                disabled={isLoading}
              >
                <Text style={styles.saveText} allowFontScaling={false}>
                  {isLoading ? "Đang lưu..." : "Lưu lại"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 0,
  },
  headerContainer: {
    backgroundColor: "#F8F9FA",
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: -20
  },
  headerText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A237E",
    marginLeft: 15,
    marginTop: -2,
  },
  houseImage: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 20,
  },
  content: {
    height: 400,
    width: "90%",
    backgroundColor: "white",
    borderRadius: 16,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    alignSelf: "flex-start",
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  input: {
    width: "90%",
    height: 50,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: "#F8F9FA",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  saveButton: {
    backgroundColor: "#3F51B5",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    width: "90%",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  saveText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3F51B5",
    marginBottom: 15,
  },
  notification: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 12,
    position: "absolute",
    top: 70,
    left: 20,
    right: 20,
    alignItems: "center",
    zIndex: 999,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  notificationText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EditHomeScreen;
