// components/SettingsScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { supabaseDB } from "../DBconfig";

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [electricPrice, setElectricPrice] = useState("");
  const [waterPrice, setWaterPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNotificationVisible, setNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [services, setServices] = useState([]);
  const [isActionModalVisible, setActionModalVisible] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [notification, setNotification] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabaseDB
        .from("Setting")
        .select("electric_price, water_price")
        .single();

      if (error) {
        console.error("Error fetching settings:", error.message);
        return;
      }

      setElectricPrice(data.electric_price);
      setWaterPrice(data.water_price);
    } catch (error) {
      console.error("Error fetching settings:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabaseDB.from("Service").select("*");

      if (error) {
        console.error("Error fetching services:", error.message);
        return;
      }

      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error.message);
    }
  };

  const updateSettings = async () => {
    if (!electricPrice || !waterPrice) {
      setNotificationMessage("Giá điện và giá nước không được để trống.");
      setNotificationVisible(true);
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabaseDB
        .from("Setting")
        .update({
          electric_price: parseFloat(electricPrice),
          water_price: parseFloat(waterPrice),
        })
        .eq("id", 1); // Giả sử bạn có một trường id để xác định bản ghi cần cập nhật

      if (error) throw error;

      setNotificationMessage("Cập nhật thành công!");
    } catch (error) {
      console.error("Error updating settings:", error.message);
      setNotificationMessage("Cập nhật thất bại!");
    } finally {
      setIsLoading(false);
      setNotificationVisible(true);
    }
  };

  const handleEdit = () => {
    // Implement the edit logic here
  };

  const handleDelete = async () => {
    if (!selectedServiceId) return; // Kiểm tra nếu không có serviceId đã chọn
    try {
      setIsLoading(true);
      const { error } = await supabaseDB
        .from("Service")
        .delete()
        .eq("service_id", selectedServiceId); // Sử dụng selectedServiceId để xác định bản ghi cần xóa

      if (error) throw error;

      fetchServices(); // Reload lại danh sách dịch vụ
      setNotification("Xóa dịch vụ thành công!");
      setTimeout(() => setNotification(""), 3000);
      setActionModalVisible(false);
    } catch (error) {
      console.error("Error deleting service:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSettings();
    await fetchServices();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchSettings();
    fetchServices();
  }, []);

  const renderActionModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isActionModalVisible}
      onRequestClose={() => setActionModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setActionModalVisible(false)}>
        <View style={styles.actionModalOverlay}>
          <View style={styles.actionModalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setActionModalVisible(false)}
            >
              <AntDesign name="close" size={20} color="white" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Chọn hành động</Text>
            <Text style={styles.modalMessage}>
              Bạn muốn làm gì với dịch vụ này?
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={handleEdit}>
                <Text style={styles.modalButtonText}>Chỉnh sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleDelete}
              >
                <Text style={styles.modalButtonText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderNotificationModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isNotificationVisible}
      onRequestClose={() => setNotificationVisible(false)}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.notificationModalOverlay}>
          <View style={styles.notificationModalContent}>
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
  );

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#006D5B" />
        </View>
      )}
      {notification ? (
        <View style={styles.notification}>
          <Text style={styles.notificationText}>{notification}</Text>
        </View>
      ) : null}
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#006D5B"]}
            tintColor="#006D5B"
          />
        }
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={26} color="#2C3E50" />
          <Text style={styles.headerText}>Cài đặt nhà trọ</Text>
        </TouchableOpacity>

        <View style={styles.cardsContainer}>
          <View style={styles.defaultValueContainer}>
            <Text style={styles.subHeader}>Giá trị mặc định cho các phòng</Text>
            <Text style={styles.label}>Giá điện (đ/kWh)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: 3,000 đ"
              value={
                electricPrice ? parseFloat(electricPrice).toLocaleString() : ""
              }
              onChangeText={(text) => {
                const numericValue = text.replace(/[^0-9]/g, "");
                setElectricPrice(numericValue);
              }}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Giá nước (đ/người)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: 100,000 đ"
              value={waterPrice ? parseFloat(waterPrice).toLocaleString() : ""}
              onChangeText={(text) => {
                const numericValue = text.replace(/[^0-9]/g, "");
                setWaterPrice(numericValue);
              }}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.button} onPress={updateSettings}>
              <Text style={styles.buttonText}>Cập nhật</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.serviceWrapper}>
            <Text style={styles.subHeader}>Thêm dịch vụ trên hóa đơn</Text>
            {services.map((service) => (
              <View key={service.id} style={styles.serviceContainer}>
                <Text style={styles.serviceName}>{service.service_name}</Text>
                <Text style={styles.servicePrice}>
                  {parseFloat(service.service_price).toLocaleString()} đ
                </Text>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => {
                    setActionModalVisible(true);
                    setSelectedServiceId(service.service_id);
                  }}
                >
                  <Entypo
                    name="dots-three-vertical"
                    size={24}
                    color="#2C3E50"
                  />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <AntDesign name="pluscircleo" size={24} color="#006D5B" />
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <AntDesign name="close" size={20} color="white" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Thêm dịch vụ</Text>
                <Text
                  style={[
                    styles.modalLabel,
                    { textAlign: "left", alignSelf: "flex-start" },
                  ]}
                >
                  Tên dịch vụ
                </Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Nhập tên dịch vụ"
                />
                <Text
                  style={[
                    styles.modalLabel,
                    { textAlign: "left", alignSelf: "flex-start" },
                  ]}
                >
                  Số tiền
                </Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Nhập số tiền"
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.modalButtonAdd}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Thêm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {renderActionModal()}
        {renderNotificationModal()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  cardsContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    marginVertical: 10,
    backgroundColor: "#FFD2CC",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
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
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 20,
    width: "40%",
    alignSelf: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  serviceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
  },
  serviceName: {
    flex: 1,
    fontSize: 17,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  servicePrice: {
    flex: 1,
    fontSize: 17,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
    marginRight: 120,
  },
  addButton: {
    marginTop: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginLeft: 20,
    marginTop: -2,
  },
  defaultValueContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    shadowColor: "#000",
    width: "95%",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  serviceWrapper: {
    backgroundColor: "white",
    borderRadius: 15,
    width: "95%",
    padding: 20,
    marginVertical: 10,
    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    width: "85%",
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
  modalButton: {
    backgroundColor: "#006D5B",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 5,
    flex: 1,
    alignItems: "center",
  },
  modalButtonAdd: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
  },
  modalButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 15,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#E74C3C",
    borderRadius: 50,
    padding: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  modalMessage: {
    fontSize: 18,
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 25,
  },
  actionModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionModalContent: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 30,
    width: "85%",
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
  notificationModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationModalContent: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 30,
    width: "85%",
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
  closeButtonText: {
    color: "#E74C3C",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 20,
    textAlign: "left",
  },
  modalInput: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SettingsScreen;
