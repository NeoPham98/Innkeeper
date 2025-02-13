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
  ScrollView,
  Platform,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

const CreateRoomScreen = ({ navigation }) => {
  const [roomName, setRoomName] = useState("");
  const [idCardFront, setIdCardFront] = useState(null);
  const [idCardBack, setIdCardBack] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNotificationVisible, setNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleSave = async () => {
    if (!roomName) {
      setNotificationMessage("Vui lòng nhập tên phòng");
      setNotificationVisible(true);
      return;
    }

    // Logic để lưu thông tin phòng vào database (nếu cần)

    setIsLoading(false);
    setNotificationMessage("Đã tạo phòng thành công!");
    setNotificationVisible(true);
    setTimeout(() => navigation.navigate("Home"), 2000);
  };

  const handleImageUpload = async (side) => {
    // Yêu cầu quyền truy cập vào thư viện ảnh
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Bạn cần cấp quyền truy cập vào thư viện ảnh!");
      return;
    }

    // Mở bộ sưu tập ảnh
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      if (side === "front") {
        setIdCardFront(result.assets[0].uri); // Lưu URI của ảnh đã chọn
      } else {
        setIdCardBack(result.assets[0].uri); // Lưu URI của ảnh đã chọn
      }
    }
  };

  const openImagePreview = (uri) => {
    setSelectedImage(uri);
    setModalVisible(true);
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
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <AntDesign name="arrowleft" size={24} color="#2C3E50" />
              <Text style={styles.headerText}>Tạo phòng</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Thông tin phòng</Text>

            <Text style={styles.label}>Tên phòng</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: Phòng 1"
              value={roomName}
              onChangeText={setRoomName}
            />
            <Text style={styles.label}>Khách thuê</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: Nguyễn Văn A"
              value={roomName}
              onChangeText={setRoomName}
            />
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: 0387022221"
              value={roomName}
              onChangeText={setRoomName}
            />
            <Text style={styles.label}>Quê quán / Địa chỉ</Text>
            <TextInput
              style={[styles.input, { height: 120 }]}
              placeholder="Ví dụ: Hà Nội"
              value={roomName}
              onChangeText={setRoomName}
              multiline={true}
              numberOfLines={2}
              textAlignVertical="top"
            />
            <Text style={styles.label}>CCCD / CMND</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: 046440849881"
              value={roomName}
              onChangeText={setRoomName}
            />

            {/* Phần upload ảnh CMND */}
            <View style={styles.imageUploadContainer}>
              <View style={styles.imageRow}>
                <View style={styles.imageColumn}>
                  <Text style={styles.label}>Ảnh CCCD trước</Text>
                  <TouchableOpacity
                    style={styles.imageUploadButton}
                    onPress={() =>
                      idCardFront
                        ? openImagePreview(idCardFront)
                        : handleImageUpload("front")
                    }
                  >
                    {idCardFront ? (
                      <Image
                        source={{ uri: idCardFront }}
                        style={styles.imagePreview}
                        resizeMode="contain"
                      />
                    ) : (
                      <Image
                        source={require("../assets/img_icon.png")}
                        style={styles.thumbnail}
                        resizeMode="contain"
                      />
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.imageColumn}>
                  <Text style={styles.label}>Ảnh CCCD sau</Text>
                  <TouchableOpacity
                    style={styles.imageUploadButton}
                    onPress={() =>
                      idCardBack
                        ? openImagePreview(idCardBack)
                        : handleImageUpload("back")
                    }
                  >
                    {idCardBack ? (
                      <Image
                        source={{ uri: idCardBack }}
                        style={styles.imagePreview}
                        resizeMode="contain"
                      />
                    ) : (
                      <Image
                        source={require("../assets/img_icon.png")}
                        style={styles.thumbnail}
                        resizeMode="contain"
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>

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
                  <Text style={styles.modalMessage}>{notificationMessage}</Text>
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

          {/* Modal để hiển thị ảnh phóng to */}
          <Modal
            visible={isModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setModalVisible(false)} // Đóng modal khi nhấn ra ngoài ảnh
            >
              <View style={styles.modalContent}>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.fullImage} // Đặt kích thước ảnh đầy đủ
                  resizeMode="contain" // Hoặc "cover" nếu bạn muốn lấp đầy
                />
              </View>
            </TouchableOpacity>
          </Modal>
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
    paddingTop: 40,
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
    marginTop: -5,
  },
  content: {
    marginTop: 30,
    paddingTop: 20,
    paddingBottom: 30,
    height: "auto", // Giảm chiều dài khối
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
    marginLeft: 5,
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    width: "100%",
    height: "auto",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
    fontSize: 16,
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
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#E74C3C",
    marginBottom: 5,
    marginTop: 10,
  },
  imageUploadContainer: {
    width: "100%",
    marginVertical: 0,
  },
  imageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  imageColumn: {
    width: "100%", // Để hai cột có chiều rộng gần bằng nhau
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  imageUploadButton: {
    width: "95%",
    height: 110,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ECECEC",
    marginBottom: 15,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  thumbnail: {
    width: 100,
    height: 100,
  },
  uploadText: {
    color: "#666",
    fontSize: 16,
  },
  fullImage: {
    width: "130%", // Chiếm toàn bộ chiều rộng màn hình
    height: "130%", // Chiếm toàn bộ chiều cao màn hình
  },
});

export default CreateRoomScreen;
