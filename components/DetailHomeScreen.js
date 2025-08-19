import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Switch,
  TouchableWithoutFeedback,
  Modal,
} from "react-native";
import {
  AntDesign,
  MaterialIcons,
  FontAwesome,
  Entypo,
  Ionicons,
} from "@expo/vector-icons";
import { supabaseDB } from "../DBconfig";
import Toast from "react-native-toast-message";
import EditRoomScreen from "./EditRoomScreen";

const DetailHomeScreen = ({ route, navigation }) => {
  const { home } = route.params || {}; // Nhận thông tin nhà từ params
  const effectiveHome = home || {}; // Gán giá trị mặc ₫ịnh cho home
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isActionModalVisible, setActionModalVisible] = useState(false); // Trạng thái cho modal hành ₫ộng
  const [notification, setNotification] = useState(""); // Thêm state cho thông báo

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabaseDB
        .from("Rooms")
        .select("*")
        .eq("id_home", effectiveHome.id_home);

      if (error) {
        console.error("Error fetching rooms:", error.message);
        return;
      }

      // ₫ếm số lượng id_room
      const roomCount = data ? data.length : 0;

      // ₫ếm số lượng phòng có is_active = true
      const inActiveRoomCount = data
        ? data.filter((room) => room.is_active === false).length
        : 0;

      // Cập nhật room_total và room_total_empty trong bảng Home
      const { updateError } = await supabaseDB
        .from("Home")
        .update({
          room_total: roomCount,
          room_total_empty: inActiveRoomCount, // Cập nhật số lượng phòng ₫ang hoạt ₫ộng
        })
        .eq("id_home", effectiveHome.id_home);

      if (updateError) {
        console.error(
          "Error updating room_total and room_total_empty:",
          updateError.message
        );
      }

      setRooms(data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (effectiveHome && effectiveHome.id_home) {
      fetchRooms();

      const unsubscribe = navigation.addListener("focus", () => {
        if (effectiveHome && effectiveHome.id_home) {
          fetchRooms();
        }
      });

      return unsubscribe; // Dọn dẹp listener khi component unmount
    }
  }, [navigation, effectiveHome]);

  const handleMenuPress = (room) => {
    setSelectedRoom(room);
    setActionModalVisible(true); // Mở modal hành ₫ộng
  };

  const handleEdit = () => {
    setActionModalVisible(false); // ₫óng modal hành ₫ộng trước khi ₫iều hướng
    navigation.navigate("EditRoom", {
      room: selectedRoom,
      home: effectiveHome,
    }); // ₫iều hướng ₫ến màn chỉnh sửa
  };

  const handleDelete = async () => {
    if (!selectedRoom) return; // Kiểm tra xem có phòng ₫ược chọn không
    try {
      const { error } = await supabaseDB
        .from("Rooms")
        .delete()
        .eq("id_room", selectedRoom.id_room); // Xóa phòng theo id

      if (error) {
        console.error("Error deleting room:", error.message);
        setNotification("Không thể xóa phòng."); // Thiết lập thông báo thất bại
      } else {
        // Cập nhật danh sách phòng sau khi xóa
        setRooms((prevRooms) =>
          prevRooms.filter((room) => room.id_room !== selectedRoom.id_room)
        );
        setNotification("Xóa phòng thành công!"); // Thiết lập thông báo thành công

        // Cập nhật room_total và room_total_empty trong bảng Home
        const roomCount = rooms.length - 1; // ₫ếm số lượng phòng còn lại
        const inActiveRoomCount = rooms.filter(
          (room) => room.is_active === false
        ).length; // ₫ếm số lượng phòng ₫ang hoạt ₫ộng
        const { updateError } = await supabaseDB
          .from("Home")
          .update({
            room_total: roomCount,
            room_total_empty: inActiveRoomCount,
          })
          .eq("id_home", effectiveHome.id_home);

        if (updateError) {
          console.error(
            "Error updating room_total and room_total_empty:",
            updateError.message
          );
        }
      }
    } catch (error) {
      console.error("Error deleting room:", error.message);
      setNotification("Không thể xóa phòng."); // Thiết lập thông báo thất bại
    } finally {
      setModalVisible(false); // ₫óng modal sau khi xóa
      setActionModalVisible(true); // ₫óng modal hành ₫ộng
    }
  };

  // Xóa thông báo sau 3 giây
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const renderActionModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isActionModalVisible}
      onRequestClose={() => setActionModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setActionModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setActionModalVisible(false)}
            >
              <AntDesign name="close" size={20} color="white" />
            </TouchableOpacity>
            <Text style={styles.modalTitle} allowFontScaling={false}>
              Chọn hành động
            </Text>
            <Text style={styles.modalMessage} allowFontScaling={false}>
              Bạn muốn làm gì với phòng này?
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

  const renderRoomDetails = (room) => {
    const handleToggleSwitch = async () => {
      const newStatus = !room.is_active;

      const { error } = await supabaseDB
        .from("Rooms")
        .update({ is_active: newStatus })
        .eq("id_room", room.id_room);

      if (error) {
        console.error("Error updating room status:", error.message);
        Toast.show({
          text1: "Cập nhật thất bại",
          text2: "Không thể cập nhật trạng thái phòng.",
          type: "error",
          style: { fontSize: 18 },
        });
      } else {
        // Cập nhật trạng thái trong local state
        setRooms((prevRooms) =>
          prevRooms.map((r) =>
            r.id_room === room.id_room ? { ...r, is_active: newStatus } : r
          )
        );

        // Gọi lại hàm fetchRooms ₫ể cập nhật dữ liệu từ cơ sở dữ liệu
        await fetchRooms();

        Toast.show({
          text1: "Cập nhật thành công",
          text2: `Trạng thái phòng đã được cập nhật thành ${
            newStatus ? "hoạt động" : "không hoạt động"
          }.`,
          type: "success",
          style: { fontSize: 18 },
        });
      }
    };

    // Hàm ₫ịnh dạng giá tiền với dấu phẩy
    const formatCurrency = (value) => {
      if (value) {
        return parseFloat(value).toLocaleString("vi-VN"); // ₫ịnh dạng số với dấu phẩy
      }
      return "0"; // Trả về "0" nếu không có giá trị
    };

    return (
      <View style={styles.roomDetailCard}>
        <View style={styles.roomHeader}>
          <FontAwesome name="home" size={35} color="#333333" />
          <Text style={styles.roomName} allowFontScaling={false}>
            {room.room_name}
          </Text>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => handleMenuPress(room)}
          >
            <Entypo name="dots-three-vertical" size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel} allowFontScaling={false}>
              Người thuê:
            </Text>
            <Text style={styles.statsValue} allowFontScaling={false}>
              {room.roomer || "Chưa có"}
            </Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel} allowFontScaling={false}>
              Số người:
            </Text>
            <Text style={styles.statsValue} allowFontScaling={false}>
              {room.quantity || 0}
            </Text>
          </View>
          {/* <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Quê quán:</Text>
            <Text style={styles.statsValue}>
              {room.hometown || "Chưa có"}
            </Text>
          </View> */}

          <View style={styles.statsRow}>
            <Text style={styles.statsLabel} allowFontScaling={false}>
              Số điện thoại:
            </Text>
            <Text style={styles.statsValue} allowFontScaling={false}>
              {room.phone_number || "Chưa có"}
            </Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel} allowFontScaling={false}>
              Ngày bắt đầu thuê:
            </Text>
            <Text style={styles.statsValue} allowFontScaling={false}>
              {new Date(room.rental_date).toLocaleDateString() || "Chưa có"}
            </Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel} allowFontScaling={false}>
              Giá phòng:
            </Text>
            <Text style={styles.statsValue} allowFontScaling={false}>
              {formatCurrency(room.room_price)} ₫
            </Text>
          </View>
        </View>
        <View style={styles.separator} />
        <View style={styles.revenueContainer}>
          <View style={styles.switchContainer}>
            <Text style={styles.statsLabel} allowFontScaling={false}>
              Trạng thái:
            </Text>
            <Switch
              value={room.is_active}
              onValueChange={handleToggleSwitch}
              thumbColor={room.is_active ? "#4CAF50" : "#FF3D00"}
              trackColor={{ false: "#FFAB91", true: "#A5D6A7" }}
            />
          </View>

          <View style={styles.createInvoiceContainer}>
            <TouchableOpacity
              style={[
                styles.createInvoiceButton,
                { opacity: room.is_active ? 1 : 0.5 },
              ]}
              onPress={() =>
                navigation.navigate("CreateInvoice", {
                  room_name: room.room_name,
                  room_id: room.id_room,
                  room_price: room.room_price,
                  roomer: room.roomer,
                  phone_number: room.phone_number,
                  id_home: effectiveHome.id_home,
                  quantity: room.quantity,
                })
              }
              disabled={!room.is_active}
            >
              <Text
                style={styles.createInvoiceButtonText}
                allowFontScaling={false}
              >
                Tạo hóa đơn
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Hiển thị thông báo nếu có */}
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
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={26} color="#2C3E50" />
          <Text style={styles.headerText} allowFontScaling={false}>
            {effectiveHome.home_name}
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#006D5B" />
          <Text>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.roomsContainer}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.infoContainer}>
            <TouchableOpacity
              style={styles.infoItem}
              onPress={() =>
                navigation.navigate("CreateRoom", { home: effectiveHome })
              }
            >
              <FontAwesome name="plus-circle" size={30} color="#FF6347" />
              <Text style={styles.infoText} allowFontScaling={false}>
                Thêm phòng
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.infoItem}
              onPress={() => navigation.navigate('Chart', { id_home: effectiveHome.id_home })}
            >
              <FontAwesome name="line-chart" size={30} color="#FFD700" />
              <Text style={styles.infoText} allowFontScaling={false}>Biểu đồ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.infoItem}
              onPress={() =>
                navigation.navigate("Bill", {
                  id_home: effectiveHome.id_home,
                  id_room: effectiveHome.id_room,
                })
              }
            >
              <AntDesign name="filetext1" size={30} color="#32CD32" />
              {/* <FontAwesome name="money" size={30} color="#32CD32" /> */}
              <Text style={styles.infoText} allowFontScaling={false}>
                Hóa đơn
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.infoItem}
              onPress={() =>
                navigation.navigate("Settings", { id_home: effectiveHome.id_home })
              }
            >
              <FontAwesome name="cog" size={30} color="#1E90FF" />
              <Text style={styles.infoText} allowFontScaling={false}>
                Cài đặt
              </Text>
            </TouchableOpacity>
          </View>

          {rooms.map((room) => (
            <View
              key={room.id_room}
              style={{ width: "100%", alignItems: "center" }}
            >
              {renderRoomDetails(room)}
            </View>
          ))}
        </ScrollView>
      )}

      {renderActionModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 0,
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
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    marginHorizontal: -10,
    marginTop: 100,
    paddingHorizontal: 0,
  },
  infoItem: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
    marginTop: 10,
    backgroundColor: "white",
    padding: 0,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 90,
    justifyContent: "center",
  },
  infoText: {
    fontSize: 13,
    marginVertical: 8,
    color: "#2C3E50",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 5,
  },
  roomsContainer: {
    marginTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  roomDetailCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 25,
    marginVertical: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  roomHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  roomName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3F51B5",
    marginLeft: 15,
  },
  menuButton: {
    marginLeft: "auto",
    padding: 5,
  },
  statsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 20,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  statsLabel: {
    fontSize: 16,
    color: "#2C3E50",
    flex: 1,
    fontWeight: "500",
  },
  statsValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    flex: 1,
    textAlign: "right",
  },
  separator: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 15,
  },
  revenueContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  createInvoiceContainer: {
    flex: 1,
  },
  createInvoiceButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  createInvoiceButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 60,
    paddingHorizontal: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
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

export default DetailHomeScreen;
