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
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isActionModalVisible, setActionModalVisible] = useState(false); // Trạng thái cho modal hành động

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
    setSelectedRoom(room);
    setActionModalVisible(true); // Mở modal hành động
  };

  const handleEdit = () => {
    // Logic for editing the room
    setActionModalVisible(false);
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
      setActionModalVisible(false); // Đóng modal hành động
    }
  };

  const renderActionModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isActionModalVisible}
      onRequestClose={() => setActionModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setActionModalVisible(false)}
          >
            <AntDesign name="close" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Chọn hành động</Text>
          <TouchableOpacity onPress={handleEdit}>
            <Text style={styles.modalButtonText}>Chỉnh sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Text style={styles.modalButtonText}>Xóa</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActionModalVisible(false)}>
            <Text style={styles.modalButtonText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

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
    );
  };

  return (
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
  modalButtonText: {
    fontSize: 18,
    color: "#007BFF",
    marginVertical: 10,
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
});

export default DetailHomeScreen;
