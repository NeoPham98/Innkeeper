import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { AntDesign, MaterialIcons, FontAwesome, Entypo } from "@expo/vector-icons";
import { supabaseDB } from "../DBconfig";

const DetailHomeScreen = ({ route, navigation }) => {
  const { home } = route.params; // Nhận thông tin nhà từ params
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const renderRoomDetails = (room) => (
    <View style={styles.roomDetailCard}>
      <Text style={styles.roomName}>{room.room_name}</Text>
      <View style={styles.statsContainer}>
      <View style={styles.statsRow}>
        <Text style={styles.statsLabel}>Khách thuê:</Text>
        <Text style={styles.statsValue}>{room.roomer || "Chưa có"}</Text>
      </View>
      <View style={styles.statsRow}>
        <Text style={styles.statsLabel}>Quê quán:</Text>
        <Text style={styles.statsValue}>{room.hometown || "Chưa có"}</Text>
      </View>
      <View style={styles.statsRow}>
        <Text style={styles.statsLabel}>Số lượng:</Text>
        <Text style={styles.statsValue}>{room.quantity || 0}</Text>
      </View>
      <View style={styles.statsRow}>
        <Text style={styles.statsLabel}>Số điện thoại:</Text>
        <Text style={styles.statsValue}>{room.phone_number || "Chưa có"}</Text>
      </View>
      <View style={styles.statsRow}>
        <Text style={styles.statsLabel}>Ngày bắt đầu thuê:</Text>
        <Text style={styles.statsValue}>{new Date(room.rental_date).toLocaleDateString() || "Chưa có"}</Text>
      </View>
      <View style={styles.statsRow}>
        <Text style={styles.statsLabel}>Giá phòng:</Text>
        <Text style={styles.statsValue}>{room.room_price || 0} đ</Text>
      </View>
      <View style={styles.statsRow}>
        <Text style={styles.statsLabel}>Trạng thái:</Text>
        <Text style={[styles.statsValue, { color: room.is_active ? "#28a745" : "#dc3545" }]}>
          {room.is_active ? "Hoạt động" : "Không hoạt động"}
        </Text>
      </View>
    </View>
    <View style={styles.separator} />
    <View style={styles.revenueContainer}>
      <Text style={styles.revenueLabel}>Doanh thu tháng:</Text>
      <Text style={styles.revenueValue}>{room.monthly_revenue || 0} đ</Text>
    </View>
    </View>
  );

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
          onPress={() => navigation.navigate("CreateRoom", {home})}
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
        <ScrollView style={styles.roomsContainer}>
          {rooms.map((room) => (
            <View key={room.id} style={{ width: "100%", alignItems: "center" }}>
              {renderRoomDetails(room)}
            </View>
          ))}
        </ScrollView>
      )}
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
    marginTop: -2
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
    marginTop: 20,
    paddingBottom: 20,
  },
  roomDetailCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  roomName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF9999",
    marginBottom: 10,
  },
  statsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 15,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statsLabel: {
    fontSize: 16,
    color: "#333",
    flex: 2,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: "500",
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
    marginTop: 10,
  },
  revenueLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  revenueValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E74C3C",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DetailHomeScreen;
