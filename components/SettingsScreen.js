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
        .eq("id_home", id_home) // ₫ảm bảo rằng bạn ₫ang lọc theo id_home
        .limit(1); // Sử dụng .limit(1) ₫ể chỉ lấy một hàng

      // Nếu không tìm thấy bản ghi, tạo mới mà không hiển thị lỗi
      if (!data || data.length === 0) {
        // Tạo mới bản ghi trong bảng Setting
        const { error: insertError } = await supabaseDB
          .from("Setting")
          .insert([{ id_home: id_home, electric_price: 0, water_price: 0 }]); // Gán giá trị mặc ₫ịnh

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

        // Lấy bản ghi ₫ầu tiên
        const settings = newData[0];
        setElectricPrice(settings.electric_price);
        setWaterPrice(settings.water_price);
        return;
      }

      // Lấy bản ghi ₫ầu tiên
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
      }, 2000); // Tự ₫ộng ẩn thông báo sau 2 giây
    } catch (error) {
      console.error("Error updating settings:", error.message);
      setNotificationMessage("Cập nhật thất bại!");
      setNotificationVisible(true);
      setTimeout(() => {
        setNotificationVisible(false);
      }, 2000); // Tự ₫ộng ẩn thông báo sau 2 giây
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (!selectedServiceId) return; // Kiểm tra nếu không có serviceId ₫ã chọn

    // Tìm dịch vụ ₫ã chọn ₫ể ₫iền thông tin vào modal
    const selectedService = services.find(
      (service) => service.service_id === selectedServiceId
    );
    if (selectedService) {
      setEditServiceName(selectedService.service_name);
      setEditServicePrice(selectedService.service_price.toString()); // Chuyển ₫ổi giá thành chuỗi
    }
    setActionModalVisible(false); // ₫óng modal hành ₫ộng
    setEditModalVisible(true); // Mở modal chỉnh sửa
  };

  const handleDelete = async () => {
    if (!selectedServiceId) return; // Kiểm tra nếu không có serviceId ₫ã chọn
    try {
      setIsLoading(true);
      const { error } = await supabaseDB
        .from("Service")
        .delete()
        .eq("service_id", selectedServiceId); // Sử dụng selectedServiceId ₫ể xác ₫ịnh bản ghi cần xóa

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
        .eq("service_id", selectedServiceId); // Sử dụng selectedServiceId ₫ể xác ₫ịnh bản ghi cần cập nhật

      if (error) throw error;

      setNotification("Cập nhật dịch vụ thành công!");
      fetchServices(); // Reload lại danh sách dịch vụ
      setEditModalVisible(false); // ₫óng modal chỉnh sửa
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
            <Text style={styles.modalTitle} allowFontScaling={false}>Chọn hành động</Text>
            <Text style={styles.modalMessage} allowFontScaling={false}>
              Bạn muốn làm gì với dịch vụ này?
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={handleEdit}>
                <Text style={styles.modalButtonText} allowFontScaling={false}>Chỉnh sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleDelete}
              >
                <Text style={styles.modalButtonText} allowFontScaling={false}>Xóa</Text>
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
            <Text style={styles.modalTitle} allowFontScaling={false}>Chỉnh sửa dịch vụ</Text>
            <Text
              style={[
                styles.modalLabel,
                { textAlign: "left", alignSelf: "flex-start" },
              ]}
              allowFontScaling={false}>
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
              allowFontScaling={false}>
              Số tiền
            </Text>
            <TextInput
              style={styles.modalInput}
              allowFontScaling={false}
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
              <Text style={styles.buttonText} allowFontScaling={false}>Cập nhật</Text>
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
          <Text style={styles.notificationText} allowFontScaling={false}>{notification}</Text>
        </View>
      ) : null}
      
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={24} color="#2C3E50" />
          <Text style={styles.headerText} allowFontScaling={false}>
            Cài đặt nhà trọ
          </Text>
        </TouchableOpacity>
      </View>

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
        <View style={styles.cardsContainer}>
          <View style={styles.defaultValueContainer}>
            <Text style={styles.subHeader} allowFontScaling={false}>
              Giá trị mặc định cho các phòng
            </Text>
            <Text style={styles.label} allowFontScaling={false}>
              Giá điện (₫/kWh)
            </Text>
            <TextInput
            allowFontScaling={false}
              style={styles.input}
              placeholder="Ví dụ: 3,000 ₫"
              value={electricPrice ? formatNumberWithCommas(electricPrice) : ""}
              onChangeText={(text) => {
                const numericValue = text.replace(/[^0-9]/g, "");
                setElectricPrice(numericValue);
              }}
              keyboardType="numeric"
            />

            <Text style={styles.label} allowFontScaling={false}>
              Giá nước (₫/người)
            </Text>
            <TextInput
            allowFontScaling={false}
              style={styles.input}
              placeholder="Ví dụ: 100,000 ₫"
              value={waterPrice ? formatNumberWithCommas(waterPrice) : ""}
              onChangeText={(text) => {
                const numericValue = text.replace(/[^0-9]/g, "");
                setWaterPrice(numericValue);
              }}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.button} onPress={updateSettings}>
              <Text style={styles.buttonText} allowFontScaling={false}>Cập nhật</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.serviceWrapper}>
            <Text style={styles.subHeader} allowFontScaling={false}>Thêm dịch vụ trên hóa đơn</Text>
            {services.map((service) => (
              <View key={service.service_id} style={styles.serviceContainer}>
                <Text style={styles.serviceName} allowFontScaling={false}>
                  {service.service_name}
                </Text>
                <Text style={styles.servicePrice} allowFontScaling={false}>
                  {formatNumberWithCommas(service.service_price)} ₫
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
              <AntDesign name="plus" size={30} color="white" />
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
                <Text style={styles.modalTitle} allowFontScaling={false}>Thêm dịch vụ</Text>
                <Text
                allowFontScaling={false}
                  style={[
                    styles.modalLabel,
                    { textAlign: "left", alignSelf: "flex-start" },
                  ]}
                >
                  Tên dịch vụ
                </Text>
                <TextInput
                allowFontScaling={false}
                  style={styles.modalInput}
                  placeholder="Nhập tên dịch vụ"
                  value={serviceName}
                  onChangeText={setServiceName}
                />
                <Text
                allowFontScaling={false}
                  style={[
                    styles.modalLabel,
                    { textAlign: "left", alignSelf: "flex-start" },
                  ]}
                >
                  Số tiền
                </Text>
                <TextInput
                allowFontScaling={false}
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
                  <Text style={styles.buttonText} allowFontScaling={false}>Thêm</Text>
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
    backgroundColor: "#F8F9FA",
    padding: 0,
  },
  cardsContainer: {
    alignItems: "center",
    marginTop: 100,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginVertical: 15,
    backgroundColor: "#3F51B5",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    width: "100%",
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    alignSelf: "flex-start",
    marginLeft: 5,
    marginTop: 20,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  button: {
    backgroundColor: "#3F51B5",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 25,
    width: "50%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  serviceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginBottom: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
  },
  servicePrice: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    textAlign: "right",
    marginRight: 20,
  },
  addButton: {
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    borderRadius: 50,
    width: 60,
    height: 60,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    alignSelf: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 20,
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
  defaultValueContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 25,
    marginVertical: 10,
    shadowColor: "#000",
    width: "90%",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  serviceWrapper: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "90%",
    padding: 25,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 30,
    width: "85%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#3F51B5",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#3F51B5",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 8,
    flex: 1,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  modalButtonAdd: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "#F44336",
    borderRadius: 50,
    padding: 10,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  actionModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionModalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 30,
    width: "85%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  notificationModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationModalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 30,
    width: "85%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButtonText: {
    color: "#F44336",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 20,
    textAlign: "left",
    color: "#2C3E50",
  },
  modalInput: {
    width: "100%",
    height: "auto",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
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
  notification: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 12,
    position: "absolute",
    top: 60,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  headerContainer: {
    zIndex: 999,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
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
});

export default SettingsScreen;
