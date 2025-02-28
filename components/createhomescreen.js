import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { supabaseDB } from "../DBconfig";

const CreateHomeScreen = ({ navigation, route }) => {
  const { id_account } = route.params || {};
  if (!id_account) {
    console.error("id_account is undefined");
    return null;
  }
  const [houseName, setHouseName] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNotificationVisible, setNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notification, setNotification] = useState("");

  const handleSave = async () => {
    if (!houseName || !address) {
      setNotification("Vui lòng nhập đầy đủ thông tin");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    if (typeof id_account === "undefined") {
      console.error("id_account is undefined");
      setNotification("Có lỗi xảy ra, vui lòng thử lại.");
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabaseDB.from("Home").insert({
        home_name: houseName,
        home_address: address,
        id_account: id_account,
      });

      if (error) throw error;

      setIsLoading(false);

      navigation.navigate("Home", {
        id_account,
        notification: "Đã tạo nhà trọ thành công!",
      });
    } catch (error) {
      setIsLoading(false);
      console.error("Error creating home:", error.message);
      setNotificationMessage("Tạo nhà thất bại!");
      setNotificationVisible(true);
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
                <Text style={styles.notificationText}>{notification}</Text>
              </View>
            ) : null}
            <View style={styles.headerContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate("Home", { id_account })}
              >
                <AntDesign name="arrowleft" size={24} color="#2C3E50" />
                <Text style={styles.headerText}>Tạo nhà</Text>
              </TouchableOpacity>
            </View>

            <Image
              source={require("../assets/house.png")}
              style={styles.houseImage}
            />

            <View style={styles.content}>
              <Text style={styles.title}>Thông tin nhà</Text>

              <Text style={styles.label}>Tên nhà</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Nhà trọ Trảng Dài"
                value={houseName}
                onChangeText={setHouseName}
              />
              <Text style={styles.label}>Địa chỉ</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: 18/158 Trảng Dài"
                value={address}
                onChangeText={setAddress}
              />
              <TouchableOpacity
                style={[styles.saveButton, isLoading && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={isLoading}
              >
                <Text style={styles.saveText}>
                  {isLoading ? "Đang lưu..." : "Lưu lại"}
                </Text>
              </TouchableOpacity>
            </View>

            <Modal
              animationType="slide"
              transparent={true}
              visible={isNotificationVisible}
              onRequestClose={() => setNotificationVisible(false)}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Thông báo</Text>
                    <Text style={styles.modalMessage}>
                      {notificationMessage}
                    </Text>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setNotificationVisible(false)}
                    >
                      <Text style={styles.closeButtonText}>Đóng</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFD2CC",
  },
  headerContainer: {
    // paddingTop: 40,
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
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
    height: 400, // Giảm chiều dài khối
    width: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    alignSelf: "center", // Canh giữa theo chiều ngang
    justifyContent: "center", // Canh giữa theo chiều dọc
    alignItems: "center",
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
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
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 30,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E74C3C",
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 18,
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 25,
  },
  closeButton: {
    backgroundColor: "#006D5B",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  notification: {
    backgroundColor: "#FFD700",
    padding: 10,
    borderRadius: 5,
    position: "absolute",
    top: 40,
    left: 10,
    right: 10,
    alignItems: "center",
    zIndex: 1,
  },
  notificationText: {
    color: "#2C3E50",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CreateHomeScreen;
