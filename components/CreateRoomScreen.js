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
import DateTimePicker from "@react-native-community/datetimepicker";

const CreateRoomScreen = ({ navigation }) => {
  const [roomName, setRoomName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [idCardFront, setIdCardFront] = useState(null);
  const [idCardBack, setIdCardBack] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNotificationVisible, setNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [contractImage, setContractImage] = useState([null, null]);
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const handleImageUpload = async (side, index) => {
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
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      if (side === "front") {
        setIdCardFront(result.assets[0].uri);
      } else if (side === "back") {
        setIdCardBack(result.assets[0].uri);
      } else if (side === "contract") {
        const newContractImages = [...contractImage];
        newContractImages[index] = result.assets[0].uri;
        setContractImage(newContractImages);
      }
    }
  };

  const openImagePreview = (uri) => {
    setSelectedImage(uri);
    setModalVisible(true);
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowDatePicker(false);
    setStartDate(currentDate);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "android" ? 150 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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

            <View style={styles.rowContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Tên phòng</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: Phòng 1"
                  value={roomName}
                  onChangeText={setRoomName}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Số lượng</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: 1"
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                />
              </View>
            </View>

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
              style={[styles.input, { height: 100 }]}
              placeholder="Ví dụ: Hà Nội"
              value={roomName}
              onChangeText={setRoomName}
              multiline={true}
              numberOfLines={6}
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
                  <View style={styles.labelContainer}>
                    <Text style={styles.label}>Ảnh CCCD trước</Text>
                    {idCardFront && (
                      <TouchableOpacity
                        onPress={() => setIdCardFront(null)}
                        style={styles.deleteIcon}
                      >
                        <AntDesign name="delete" size={20} color="#E74C3C" />
                      </TouchableOpacity>
                    )}
                  </View>
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
                  <View style={styles.labelContainer}>
                    <Text style={styles.label}>Ảnh CCCD sau</Text>
                    {idCardBack && (
                      <TouchableOpacity
                        onPress={() => setIdCardBack(null)}
                        style={styles.deleteIcon}
                      >
                        <AntDesign name="delete" size={20} color="#E74C3C" />
                      </TouchableOpacity>
                    )}
                  </View>
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
              {/* Thêm phần upload ảnh hợp đồng */}
              <View style={styles.imageColumn}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>Ảnh hợp đồng</Text>
                  {contractImage.every((image) => image === null) ? null : (
                    <TouchableOpacity
                      onPress={() => setContractImage([null, null])} // Xóa tất cả ảnh
                      style={styles.deleteIcon}
                    >
                      <AntDesign name="delete" size={20} color="#E74C3C" />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.imageRow}>
                  {[0, 1].map((index) => (
                    <View key={index} style={styles.imageColumn}>
                      <TouchableOpacity
                        style={styles.imageUploadButton}
                        onPress={() => handleImageUpload("contract", index)}
                      >
                        {contractImage[index] ? (
                          <Image
                            source={{ uri: contractImage[index] }}
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
                  ))}
                </View>
              </View>
            </View>

            <Text style={styles.label}>Tiền cọc</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: 1,000,000 ₫"
              value={roomName}
              onChangeText={setRoomName}
            />

            <Text style={styles.label}>Giá phòng (₫/tháng)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: 1,000,000 "
              value={roomName}
              onChangeText={setRoomName}
            />

            <Text style={styles.label}>Ngày bắt đầu thuê</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{ width: "100%" }}
            >
              <TextInput
                style={styles.input}
                placeholder="Chọn ngày bắt đầu"
                value={startDate.toLocaleDateString()}
                editable={false}
              />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            <Text style={styles.label}>Ghi chú</Text>
            <TextInput
              style={[styles.input, { height: 100 }]}
              placeholder="Ví dụ: Ở 2 người"
              value={roomName}
              onChangeText={setRoomName}
              multiline={true}
              numberOfLines={6}
              textAlignVertical="top"
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
                  resizeMode="cover" // Hoặc "cover" nếu bạn muốn lấp đầy
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
    // padding: 30,
    width: "90%",
    height: "auto",
    maxHeight: "67%",
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
    borderRadius: 15,
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
    borderRadius: 15,
    width: "100%", // Keep full width
    height: "100%", // Maintain aspect ratio
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
  },
  deleteIcon: {
    marginTop: 10,
  },
  rowContainer: {
    flexDirection: "row", // Căn chỉnh theo hàng
    justifyContent: "space-between", // Căn giữa các ô
    width: "100%", // Đảm bảo chiều rộng đầy đủ
  },
  inputContainer: {
    width: "48%", // Đặt chiều rộng cho mỗi ô input
  },
});

export default CreateRoomScreen;
