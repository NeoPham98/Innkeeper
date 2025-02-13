import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { AntDesign, Entypo, MaterialIcons } from "@expo/vector-icons";
import { supabaseDB } from "../DBconfig";
import { useRoute } from "@react-navigation/native";

const HomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [homes, setHomes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedHome, setSelectedHome] = useState(null);
  const [notification, setNotification] = useState("");
  const route = useRoute();

  const fetchHomes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabaseDB
        .from("Home")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching homes:", error.message);
        return;
      }

      console.log("Fetched homes:", data);
      setHomes(data || []);
    } catch (error) {
      console.error("Error fetching homes:", error.message);
      setHomes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHomes();
  }, []);

  useEffect(() => {
    const { notification } = route.params || {};
    if (notification) {
      setNotification(notification);
      setTimeout(() => setNotification(""), 3000);
    }
  }, [route.params]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHomes();
    setRefreshing(false);
  }, []);

  const handleMenu = (homeId, homeName, homeAddress) => {
    setSelectedHome({ id: homeId, name: homeName, address: homeAddress });
    setModalVisible(true);
  };

  const handleDeleteHome = async () => {
    if (selectedHome) {
      await deleteHome(selectedHome.id);
      setModalVisible(false);
      setNotification("Xóa nhà trọ thành công!");
      setTimeout(() => setNotification(""), 3000);
    }
  };

  const deleteHome = async (homeId) => {
    try {
      const { error } = await supabaseDB
        .from("Home")
        .delete()
        .eq("id_home", homeId);

      if (error) throw error;

      fetchHomes(); // Cập nhật lại danh sách homes
    } catch (error) {
      console.error("Error deleting home:", error.message);
    }
  };

  const reloadHomes = async () => {
    await fetchHomes(); // Gọi lại hàm fetchHomes để lấy dữ liệu mới
  };

  const renderHomeCard = (home) => (
    <View style={styles.homeCard}>
      <View style={styles.homeHeader}>
        <Text style={styles.homeName}>{home.home_name}</Text>
        <TouchableOpacity
          onPress={() =>
            handleMenu(home.id_home, home.home_name, home.home_address)
          }
        >
          <Entypo name="dots-three-vertical" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.locationRow}>
        <MaterialIcons name="location-on" size={24} color="#FF9999" />
        <Text style={styles.locationText}>{home.home_address}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Số phòng:</Text>
          <Text style={styles.statsValue}>{home.room_total || 0}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Số phòng trống:</Text>
          <Text style={styles.statsValue}>{home.room_total_empty || 0}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Số phòng thiếu tiền:</Text>
          <Text style={styles.statsValue}>
            {home.room_total_lacks_money || 0}
          </Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Số tiền còn thiếu:</Text>
          <Text style={styles.statsValue}>{home.monthly_revenue || 0} đ</Text>
        </View>
      </View>

      <View style={styles.separator} />

      <View style={styles.revenueContainer}>
        <Text style={styles.revenueLabel}>Doanh thu tháng:</Text>
        <View style={styles.revenueValueContainer}>
          <Text style={styles.revenueValue}>{home.monthly_revenue || 0} đ</Text>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => navigation.navigate("DetailHome", { home })}
          >
            <Text style={styles.detailButtonText}>Chi tiết</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <>
      {notification ? (
        <View style={styles.notification}>
          <Text style={styles.notificationText}>{notification}</Text>
        </View>
      ) : null}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#006D5B"]}
            tintColor="#006D5B"
          />
        }
      >
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => navigation.navigate("Login")}
            >
              <AntDesign name="poweroff" size={24} color="#2C3E50" />
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <Image
              source={require("../assets/house.png")}
              style={styles.houseImage}
            />
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Chủ trọ</Text>
            <Text style={styles.subtitle}>Quản lý nhà trọ thật dễ dàng</Text>

            <View style={styles.card}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate("CreateHome")}
              >
                <AntDesign name="pluscircleo" size={50} color="#006D5B" />
              </TouchableOpacity>
              <Text style={styles.infoText}>
                Bấm dấu "+" để tạo nhà trọ mới
              </Text>
            </View>

            {isLoading ? (
              <ActivityIndicator size="large" color="#006D5B" />
            ) : Array.isArray(homes) && homes.length > 0 ? (
              homes.map((home) =>
                home && home.id_home ? (
                  <View
                    key={home.id_home.toString()}
                    style={{ width: "100%", alignItems: "center" }}
                  >
                    {renderHomeCard(home)}
                  </View>
                ) : null
              )
            ) : (
              <View style={{ width: "100%", alignItems: "center" }}>
                {/* Có thể để trống hoặc thêm một thành phần khác nếu cần */}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <AntDesign name="close" size={20} color="white" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Chọn hành động</Text>
              <Text style={styles.modalMessage}>
                Bạn muốn làm gì với nhà này?
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    navigation.navigate("EditHome", {
                      id: selectedHome.id,
                      name: selectedHome.name,
                      address: selectedHome.address,
                      reloadHomes,
                    });
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>Chỉnh sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleDeleteHome}
                >
                  <Text style={styles.modalButtonText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#FFD2CC",
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#FFD2CC",
    alignItems: "center",
    justifyContent: "center",
  },
  headerContainer: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
  logoutButton: {
    padding: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 60,
  },
  houseImage: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  content: {
    flex: 1,
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    alignItems: "center",
    paddingTop: 5,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#E74C3C",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 20,
    color: "#7F8C8D",
    marginBottom: 30,
  },
  card: {
    alignItems: "center",
    backgroundColor: "white",
    width: "70%",
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 15,
  },
  addButton: {
    marginBottom: 10,
  },
  infoText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
  },
  homeCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  homeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  homeName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF9999",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  locationText: {
    fontSize: 16,
    marginLeft: 8,
    color: "#666",
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
    position: "relative",
    paddingRight: 90,
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
    textAlign: "left",
    marginRight: 0,
  },
  dateContainer: {
    position: "absolute",
    right: 0,
    top: -5,
    width: 80,
  },
  dateLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    textAlign: "center",
  },
  dateBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 5,
    alignItems: "center",
    backgroundColor: "white",
    width: 80,
  },
  dateMonth: {
    fontSize: 14,
    color: "#666",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 2,
    width: "100%",
    textAlign: "center",
  },
  dateDay: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF9999",
    marginTop: 2,
  },
  revenueContainer: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginTop: 10,
  },
  revenueValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
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
    marginRight: 10,
  },
  detailButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    width: 120,
  },
  detailButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
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
  modalMessage: {
    fontSize: 18,
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 25,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 15,
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
  closeButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 1,
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

export default HomeScreen;
