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
  const effectiveHome = home || {}; // Gán giá trị mặc định cho home
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isActionModalVisible, setActionModalVisible] = useState(false); // Trạng thái cho modal hành động
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

      // Đếm số lượng id_room
      const roomCount = data ? data.length : 0;

      // Đếm số lượng phòng có is_active = true
      const inActiveRoomCount = data
        ? data.filter((room) => room.is_active === false).length
        : 0;

      // Cập nhật room_total và room_total_empty trong bảng Home
      const { updateError } = await supabaseDB
        .from("Home")
        .update({
          room_total: roomCount,
          room_total_empty: inActiveRoomCount, // Cập nhật số lượng phòng đang hoạt động
        })
        .eq("id_home", effectiveHome.id_home);

      if (updateError) {
        console.error(
          "Error updating room_total and room_total_empty:",
          updateError.message
        );
      } else {
        console.log(
          "Cập nhật room_total và room_total_empty thành công:",
          roomCount,
          inActiveRoomCount
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
    setActionModalVisible(true); // Mở modal hành động
  };

  const handleEdit = () => {
    setActionModalVisible(false); // Đóng modal hành động trước khi điều hướng
    navigation.navigate("EditRoom", {
      room: selectedRoom,
      home: effectiveHome,
    }); // Điều hướng đến màn chỉnh sửa
  };

  const handleDelete = async () => {
    if (!selectedRoom) return; // Kiểm tra xem có phòng được chọn không
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
        const roomCount = rooms.length - 1; // Đếm số lượng phòng còn lại
        const inActiveRoomCount = rooms.filter(
          (room) => room.is_active === false
        ).length; // Đếm số lượng phòng đang hoạt động
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
        } else {
          console.log(
            "Cập nhật room_total và room_total_empty thành công:",
            roomCount,
            inActiveRoomCount
          );
        }
      }
    } catch (error) {
      console.error("Error deleting room:", error.message);
      setNotification("Không thể xóa phòng."); // Thiết lập thông báo thất bại
    } finally {
      setModalVisible(false); // Đóng modal sau khi xóa
      setActionModalVisible(true); // Đóng modal hành động
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

        // Gọi lại hàm fetchRooms để cập nhật dữ liệu từ cơ sở dữ liệu
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

    // Hàm định dạng giá tiền với dấu phẩy
    const formatCurrency = (value) => {
      if (value) {
        return parseFloat(value).toLocaleString("vi-VN"); // Định dạng số với dấu phẩy
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
              {formatCurrency(room.room_price)} đ
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
    padding: 20,
    backgroundColor: "white",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 0,
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
    marginTop: -2,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
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
  roomsContainer: {
    marginTop: 10,
    paddingBottom: 20,
  },
  roomDetailCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    width: "95%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  roomHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  roomName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF9999",
    marginLeft: 10,
  },
  menuButton: {
    marginLeft: "auto",
  },
  statsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 15,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statsLabel: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "right",
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 10,
  },
  revenueContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  createInvoiceContainer: {
    flex: 1,
  },
  createInvoiceButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
  },
  createInvoiceButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
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

export default DetailHomeScreen;
