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

const SettingsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { id_home } = route.params; // Nhận id_home từ params
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
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editServiceName, setEditServiceName] = useState("");
  const [editServicePrice, setEditServicePrice] = useState("");

  const formatNumberWithCommas = (numberString) => {
    const number = parseFloat(numberString.replace(/,/g, ""));
    return isNaN(number) ? "" : number.toLocaleString("en-US");
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabaseDB
        .from("Setting")
        .select("*")
        .eq("id_home", id_home) // Đảm bảo rằng bạn đang lọc theo id_home
        .limit(1); // Sử dụng .limit(1) để chỉ lấy một hàng

      // Nếu không tìm thấy bản ghi, tạo mới mà không hiển thị lỗi
      if (!data || data.length === 0) {
        // Tạo mới bản ghi trong bảng Setting
        const { error: insertError } = await supabaseDB
          .from("Setting")
          .insert([{ id_home: id_home, electric_price: 0, water_price: 0 }]); // Gán giá trị mặc định

        // Không hiển thị lỗi nếu không thể tạo mới
        if (insertError) {
          console.error("Error creating new settings:", insertError.message);
          return;
        }

        // Lấy lại bản ghi vừa tạo
        const { data: newData } = await supabaseDB
          .from("Setting")
          .select("*")
          .eq("id_home", id_home)
          .limit(1);

        // Lấy bản ghi đầu tiên
        const settings = newData[0];
        setElectricPrice(settings.electric_price);
        setWaterPrice(settings.water_price);
        return;
      }

      // Lấy bản ghi đầu tiên
      const settings = data[0];
      setElectricPrice(settings.electric_price);
      setWaterPrice(settings.water_price);
    } catch (error) {
      console.error("Error fetching settings:", error.message);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabaseDB
        .from("Service")
        .select("*")
        .eq("id_home", id_home); // Lọc theo id_home

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
      setTimeout(() => {
        setNotificationVisible(false);
      }, 2000);
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
        .eq("id_home", id_home); // Cập nhật theo id_home

      if (error) throw error;

      // Hiển thị thông báo thành công
      setNotification("Cập nhật thành công!");
      setNotificationVisible(true);
      setTimeout(() => {
        setNotificationVisible(false);
        setNotification("");
      }, 2000); // Tự động ẩn thông báo sau 2 giây
    } catch (error) {
      console.error("Error updating settings:", error.message);
      setNotificationMessage("Cập nhật thất bại!");
      setNotificationVisible(true);
      setTimeout(() => {
        setNotificationVisible(false);
      }, 2000); // Tự động ẩn thông báo sau 2 giây
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (!selectedServiceId) return; // Kiểm tra nếu không có serviceId đã chọn

    // Tìm dịch vụ đã chọn để điền thông tin vào modal
    const selectedService = services.find(
      (service) => service.service_id === selectedServiceId
    );
    if (selectedService) {
      setEditServiceName(selectedService.service_name);
      setEditServicePrice(selectedService.service_price.toString()); // Chuyển đổi giá thành chuỗi
    }
    setActionModalVisible(false); // Đóng modal hành động
    setEditModalVisible(true); // Mở modal chỉnh sửa
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

  const handleAddService = async () => {
    if (!serviceName || !servicePrice) {
      setNotificationMessage("Tên dịch vụ và số tiền không được để trống.");
      setNotificationVisible(true);
      setTimeout(() => {
        setNotificationVisible(false);
      }, 3000);
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabaseDB.from("Service").insert([
        {
          service_name: serviceName,
          service_price: parseFloat(servicePrice),
          id_home: id_home,
        },
      ]);

      if (error) throw error;

      setNotification("Thêm dịch vụ thành công!");
      fetchServices(); // Reload lại danh sách dịch vụ
      setTimeout(() => {
        setNotification("");
      }, 3000);

      setModalVisible(false);
    } catch (error) {
      console.error("Error adding service:", error.message);
      setNotificationMessage("Thêm dịch vụ thất bại!");
      setTimeout(() => {
        setNotificationMessage("");
      }, 3000);
    } finally {
      setIsLoading(false);
      setServiceName("");
      setServicePrice("");
    }
  };

  const handleEditService = async () => {
    if (!editServiceName || !editServicePrice) {
      setNotificationMessage("Tên dịch vụ và số tiền không được để trống.");
      setNotificationVisible(true);
      setTimeout(() => {
        setNotificationVisible(false);
      }, 2000);
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabaseDB
        .from("Service")
        .update({
          service_name: editServiceName,
          service_price: parseFloat(editServicePrice),
        })
        .eq("service_id", selectedServiceId); // Sử dụng selectedServiceId để xác định bản ghi cần cập nhật

      if (error) throw error;

      setNotification("Cập nhật dịch vụ thành công!");
      fetchServices(); // Reload lại danh sách dịch vụ
      setEditModalVisible(false); // Đóng modal chỉnh sửa
      setNotificationVisible(true);
      setTimeout(() => {
        setNotificationVisible(false);
        setNotification(""); // Xóa thông báo
      }, 3000);
    } catch (error) {
      console.error("Error updating service:", error.message);
      setNotificationMessage("Cập nhật dịch vụ thất bại!");
    } finally {
      setIsLoading(false);
      setEditServiceName("");
      setEditServicePrice("");
      setNotificationVisible(true);
      setTimeout(() => {
        setNotificationVisible(false);
      }, 2000);
    }
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

  const renderEditModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isEditModalVisible}
      onRequestClose={() => setEditModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setEditModalVisible(false)}
            >
              <AntDesign name="close" size={20} color="white" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Chỉnh sửa dịch vụ</Text>
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
              value={editServiceName}
              onChangeText={setEditServiceName}
            />
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
              placeholder="Nhập số tiền"
              keyboardType="numeric"
              value={
                editServicePrice ? formatNumberWithCommas(editServicePrice) : ""
              }
              onChangeText={(text) => {
                const numericValue = text.replace(/[^0-9]/g, "");
                setEditServicePrice(numericValue);
              }}
            />
            <TouchableOpacity
              style={styles.modalButtonAdd}
              onPress={handleEditService}
            >
              <Text style={styles.buttonText}>Cập nhật</Text>
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
              value={electricPrice ? formatNumberWithCommas(electricPrice) : ""}
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
              value={waterPrice ? formatNumberWithCommas(waterPrice) : ""}
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
              <View key={service.service_id} style={styles.serviceContainer}>
                <Text style={styles.serviceName}>{service.service_name}</Text>
                <Text style={styles.servicePrice}>
                  {formatNumberWithCommas(service.service_price)} đ
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
              <AntDesign name="pluscircleo" size={35} color="#006D5B" />
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
            setServiceName("");
            setServicePrice("");
          }}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              setModalVisible(false);
              setServiceName("");
              setServicePrice("");
            }}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setModalVisible(false);
                    setServiceName("");
                    setServicePrice("");
                  }}
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
                  value={serviceName}
                  onChangeText={setServiceName}
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
                  value={
                    servicePrice ? formatNumberWithCommas(servicePrice) : ""
                  }
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9]/g, "");
                    setServicePrice(numericValue);
                  }}
                />
                <TouchableOpacity
                  style={styles.modalButtonAdd}
                  onPress={handleAddService}
                >
                  <Text style={styles.buttonText}>Thêm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {renderActionModal()}

        {renderEditModal()}
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
    // textAlign: "center",
    marginRight: 30,
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
