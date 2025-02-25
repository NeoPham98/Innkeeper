// InvoiceDetailScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { supabaseDB } from "../DBconfig"; // Đảm bảo import supabaseDB
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Entypo from "@expo/vector-icons/Entypo";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";

const InvoiceDetailScreen = ({ navigation, route }) => {
  const { invoiceData, isShared } = route.params;
  const [settings, setSettings] = useState({
    electric_price: 0,
    water_price: 0,
  });
  const [services, setServices] = useState([]);
  const viewRef = useRef();
  const handleSend = async () => {
    try {
      const uri = await viewRef.current.capture({
        format: "png", // Sử dụng định dạng PNG
        quality: 1.0, // Chất lượng cao nhất
      });
      console.log("Chụp ảnh thành công: ", uri);

      // Chia sẻ ảnh
      await Sharing.shareAsync(uri, {
        dialogTitle: "Chia sẻ hóa đơn",
        UTI: "public.image", // Định dạng file
      });
      navigation.pop(2)
    } catch (error) {
      console.error("Chụp ảnh thất bại: ", error);
      Alert.alert("Thông báo", "Chụp ảnh thất bại!");
    }
  };

  // Hàm định dạng ngày
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Hàm định dạng số với dấu phẩy
  const formatCurrency = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Hàm lấy dữ liệu từ bảng Setting
  const fetchSettings = async () => {
    if (!invoiceData.id_home) {
      console.error("id_home is invalid");
      return;
    }

    try {
      const { data, error } = await supabaseDB
        .from("Setting")
        .select("*")
        .eq("id_home", invoiceData.id_home);

      if (error) {
        console.error("Error fetching settings:", error.message);
        return;
      }

      if (data && data.length > 0) {
        setSettings({
          electric_price: data[0].electric_price,
          water_price: data[0].water_price,
        });
      } else {
        console.warn("No settings found for id_home:", invoiceData.id_home);
      }
    } catch (error) {
      console.error("Error fetching settings:", error.message);
    }
  };

  // Hàm lấy dữ liệu dịch vụ
  const fetchServices = async () => {
    const { service_id } = invoiceData;
    if (!service_id || service_id.length === 0) {
      console.error("service_id is invalid");
      return;
    }

    try {
      const { data, error } = await supabaseDB
        .from("Service")
        .select("*")
        .in("service_id", service_id);

      if (error) {
        console.error("Error fetching services:", error.message);
        return;
      }

      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error.message);
    }
  };

  useEffect(() => {
    fetchSettings();
    if (invoiceData.service_id && invoiceData.service_id.length > 0) {
      fetchServices();
    }
  }, [invoiceData.id_home, invoiceData.service_id]);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.pop(2)}
        >
          <AntDesign name="arrowleft" size={24} color="black" />
          <Text style={styles.headerText}>Hóa đơn</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <ViewShot ref={viewRef} options={{ format: "png", quality: 1.0 }}>
          <View style={{ padding: 20, backgroundColor: "white" }}>
            <Text style={styles.roomNameText}>{invoiceData.room_name}</Text>
            <View style={styles.row}>
              <Text>
                <FontAwesome name="calendar" size={16} color="black" /> Ngày lập
                hóa đơn:
              </Text>
              <Text style={styles.rightText}>
                {formatDate(invoiceData.created_at)}
              </Text>
            </View>
            <View
              style={[
                styles.separatorContainer,
                { justifyContent: "flex-start" },
              ]}
            >
              <Text style={styles.separatorText}>Thông tin cá nhân</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.textWithBorder}>
                <MaterialCommunityIcons
                  name="face-man"
                  size={16}
                  color="#28A745"
                />{" "}
                Họ tên:
              </Text>

              <Text style={[styles.rightText, styles.textWithBorder]}>
                {invoiceData.roomer}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.textWithBorder}>
                <MaterialCommunityIcons
                  name="phone-classic"
                  size={16}
                  color="#FFC107"
                />{" "}
                Số điện thoại:
              </Text>
              <Text style={[styles.rightText, styles.textWithBorder]}>
                {invoiceData.phone_number}
              </Text>
            </View>

            <View
              style={[
                styles.separatorContainer,
                { justifyContent: "flex-start" },
              ]}
            >
              <Text style={[styles.separatorText, { marginTop: 10 }]}>
                Thông tin điện nước
              </Text>
            </View>
            <Text style={styles.subHeader}>1. Nước</Text>
            <View style={styles.row}>
              <Text style={styles.textWithBorder}>
                <AntDesign name="github" size={16} color="black" />
                {""} Số người:
              </Text>
              <Text style={[styles.rightText, styles.textWithBorder]}>
                {invoiceData.quantity}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.textWithBorder}>
                <Ionicons name="pricetags" size={16} color="#2ECC71" /> Giá
                nước:
              </Text>
              <Text style={[styles.rightText, styles.textWithBorder]}>
                {formatCurrency(settings.water_price)} đ
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.textWithBorder}>
                <Ionicons name="water" size={16} color="#3498DB" /> Tiền nước:
              </Text>
              <Text
                style={[
                  styles.rightText,
                  styles.textWithBorder,
                  styles.priceText,
                ]}
              >
                {formatCurrency(invoiceData.total_water_price)} đ
              </Text>
            </View>

            <Text style={styles.subHeader}>2. Điện</Text>
            <View style={styles.row}>
              <Text style={styles.textWithBorder}>
                <MaterialIcons name="electric-bolt" size={16} color="#E67E22" />{" "}
                Số điện:
              </Text>
              <Text style={[styles.rightText, styles.textWithBorder]}>
                {invoiceData.total_electric_use}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.textWithBorder}>
                <FontAwesome5 name="hot-tub" size={16} color="#E74C3C" /> Số
                bình nóng lạnh:
              </Text>
              <Text style={[styles.rightText, styles.textWithBorder]}>
                {invoiceData.total_bnl_use}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.textWithBorder}>
                <Ionicons name="pricetags" size={16} color="#2ECC71" /> Giá
                điện:
              </Text>
              <Text style={[styles.rightText, styles.textWithBorder]}>
                {formatCurrency(settings.electric_price)} đ
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.textWithBorder}>
                <MaterialIcons
                  name="electrical-services"
                  size={16}
                  color="black"
                />
                Tiền điện{isShared ? " (đã chia BNL)" : ""}:
              </Text>
              <Text
                style={[
                  styles.rightText,
                  styles.textWithBorder,
                  styles.priceText,
                ]}
              >
                {formatCurrency(invoiceData.number_price)} đ
              </Text>
            </View>

            <View
              style={[
                styles.separatorContainer,
                { justifyContent: "flex-start" },
              ]}
            >
              <Text style={[styles.separatorText, { marginTop: 10 }]}>
                Thông tin dịch vụ
              </Text>
            </View>
            {services.map((service) => (
              <View key={service.service_id} style={styles.row}>
                <Text style={styles.textWithBorder}>
                  <Entypo name="pin" size={16} color="#FF4D4D" />{" "}
                  {service.service_name}:
                </Text>

                <Text style={[styles.rightText, styles.textWithBorder]}>
                  {formatCurrency(service.service_price)} ₫
                </Text>
              </View>
            ))}
            <View style={styles.row}>
              <Text style={styles.textWithBorder}>
                <FontAwesome6
                  name="money-bill-1-wave"
                  size={16}
                  color="green"
                />{" "}
                Tiền phòng:
              </Text>
              <Text
                style={[
                  styles.rightText,
                  styles.textWithBorder,
                  styles.priceText,
                ]}
              >
                {formatCurrency(invoiceData.room_price)} đ
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.totalText}>Tổng số tiền:</Text>
              <Text style={[styles.rightText, styles.priceTextTotal]}>
                {formatCurrency(invoiceData.total_amount)} đ
              </Text>
            </View>
          </View>
        </ViewShot>
      </ScrollView>
      <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
        <Text style={styles.sendButtonText}>Gửi</Text>
      </TouchableOpacity>
    </View>
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
    paddingBottom: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
    marginLeft: 10,
  },
  content: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    margin: 20,
  },
  dateText: {
    fontSize: 16,
    marginBottom: 10,
  },
  label: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 3,
  },
  totalText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    marginTop: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
  },
  rightText: {
    textAlign: "right",
    flex: 1,
  },
  roomNameText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#E74C3C",
    marginBottom: 5,
    textAlign: "center",
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 5,
  },
  separatorText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3498DB",
    marginRight: 10,
  },
  separator: {
    height: 2,
    flex: 1,
    backgroundColor: "#E0E0E0",
  },
  textWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    fontSize: 16,
  },
  priceTextTotal: {
    color: "#E74C3C",
    fontWeight: "bold",
    fontSize: 20,
    marginTop: 20,
  },
  priceText: {
    color: "#20B2AA",
    fontWeight: "bold",
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#28A745",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    margin: 20,
  },
  sendButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default InvoiceDetailScreen;
