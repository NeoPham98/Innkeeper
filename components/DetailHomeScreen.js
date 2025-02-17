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

const DetailHomeScreen = ({ route, navigation }) => {
  const { home } = route.params; // Nhận thông tin nhà từ params
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabaseDB
        .from("Rooms")
        .select("*")
        .eq("id_home", home.id_home);

      if (error) {
        console.error("Error fetching rooms:", error.message);
        return;
      }

      setRooms(data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [home]);

  const handleMenuPress = (room) => {
    if (!room.is_active) return;
    setSelectedRoom(room);
    setShowDropdown(!showDropdown);
  };

  const handleEdit = () => {
    // Logic for editing the room
    setShowDropdown(false);
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
        Toast.show({
          text1: "Xóa thất bại",
          text2: "Không thể xóa phòng.",
          type: "error",
          style: { fontSize: 18 },
        });
      } else {
        // Cập nhật danh sách phòng sau khi xóa
        setRooms((prevRooms) =>
          prevRooms.filter((room) => room.id_room !== selectedRoom.id_room)
        );
        Toast.show({
          text1: "Xóa thành công",
          text2: "Phòng đã được xóa.",
          type: "success",
          style: { fontSize: 18 },
        });
      }
    } catch (error) {
      console.error("Error deleting room:", error.message);
    } finally {
      setModalVisible(false); // Đóng modal sau khi xóa
      setShowDropdown(false); // Đóng dropdown nếu mở
    }
  };

  const renderDropdown = () => {
    if (!showDropdown || !selectedRoom) return null;
    return (
      <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
        <View style={[styles.dropdown, { width: 200, top: 40, right: 20 }]}>
          <TouchableOpacity onPress={handleEdit}>
            <Text style={styles.dropdownItem}>Chỉnh sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.dropdownItem}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const renderRoomDetails = (room) => {
    const handleToggleSwitch = async () => {
      const newStatus = !room.is_active;
      console.log("Trạng thái đã thay đổi:", newStatus);

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
        setRooms((prevRooms) =>
          prevRooms.map((r) =>
            r.id_room === room.id_room ? { ...r, is_active: newStatus } : r
          )
        );
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

    return (
      <TouchableWithoutFeedback onPress={() => handleMenuPress(room)}>
        <View style={styles.roomDetailCard}>
          <View style={styles.roomHeader}>
            <FontAwesome name="home" size={35} color="#333333" />
            <Text style={styles.roomName}>{room.room_name}</Text>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => handleMenuPress(room)}
            >
              <Entypo name="dots-three-vertical" size={24} color="#2C3E50" />
            </TouchableOpacity>
          </View>

          {showDropdown && selectedRoom?.id_room === room.id_room && (
            <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
              {renderDropdown()}
            </TouchableWithoutFeedback>
          )}
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Người thuê:</Text>
              <Text style={styles.statsValue}>{room.roomer || "Chưa có"}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Số người:</Text>
              <Text style={styles.statsValue}>{room.quantity || 0}</Text>
            </View>
            {/* <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Quê quán:</Text>
              <Text style={styles.statsValue}>
                {room.hometown || "Chưa có"}
              </Text>
            </View> */}

            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Số điện thoại:</Text>
              <Text style={styles.statsValue}>
                {room.phone_number || "Chưa có"}
              </Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Ngày bắt đầu thuê:</Text>
              <Text style={styles.statsValue}>
                {new Date(room.rental_date).toLocaleDateString() || "Chưa có"}
              </Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Giá phòng:</Text>
              <Text style={styles.statsValue}>{room.room_price || 0} đ</Text>
            </View>
          </View>
          <View style={styles.separator} />
          <View style={styles.revenueContainer}>
            <View style={styles.switchContainer}>
              <Text style={styles.statsLabel}>Trạng thái:</Text>
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
                onPress={() => {
                  if (room.is_active) {
                    console.log("Tạo hóa đơn được nhấn");
                  }
                }}
                disabled={!room.is_active}
              >
                <Text style={styles.createInvoiceButtonText}>Tạo hóa đơn</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const renderModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Ionicons name="alert-circle" size={30} color="#E74C3C" />
            <Text style={styles.modalTitle}>Xác nhận xóa</Text>
          </View>
          <Text style={styles.modalMessage}>
            Bạn có chắc chắn muốn xóa phòng này không?
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Text style={styles.modalButtonText}>Xóa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={26} color="#2C3E50" />
            <Text style={styles.headerText}>{home.home_name}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <TouchableOpacity
            style={styles.infoItem}
            onPress={() => navigation.navigate("CreateRoom", { home })}
          >
            <FontAwesome name="plus-circle" size={30} color="#FF6347" />
            <Text style={styles.infoText}>Thêm phòng</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.infoItem}>
            <FontAwesome name="lightbulb-o" size={30} color="#FFD700" />
            <Text style={styles.infoText}>Ghi điện nước</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.infoItem}>
            <FontAwesome name="money" size={30} color="#32CD32" />
            <Text style={styles.infoText}>Thu tiền</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.infoItem}>
            <FontAwesome name="cog" size={30} color="#1E90FF" />
            <Text style={styles.infoText}>Cài đặt</Text>
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

        {renderModal()}
      </View>
    </TouchableWithoutFeedback>
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
    marginTop: 30,
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
    justifyContent: "center",
    marginBottom: 20,
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
  dropdown: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
  },
  dropdownItem: {
    padding: 10,
    textAlign: "center",
    color: "#007BFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E74C3C",
  },
  modalMessage: {
    fontSize: 16,
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5, // Khoảng cách giữa các nút
  },
  deleteButton: {
    backgroundColor: "#E74C3C", // Màu đỏ cho nút xóa
  },
  cancelButton: {
    backgroundColor: "#007BFF", // Màu xanh cho nút hủy
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default DetailHomeScreen;
