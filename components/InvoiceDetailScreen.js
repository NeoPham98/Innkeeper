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
import { supabaseDB } from "../DBconfig"; // ₫ảm bảo import supabaseDB
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
        format: "png", // Sử dụng ₫ịnh dạng PNG
        quality: 1.0, // Chất lượng cao nhất
      });

      // Chia sẻ ảnh
      await Sharing.shareAsync(uri, {
        dialogTitle: "Chia sẻ hóa đơn",
        UTI: "public.image", // ₫ịnh dạng file
      });
      navigation.pop(2);
    } catch (error) {
      console.error("Chụp ảnh thất bại: ", error);
      Alert.alert("Thông báo", "Chụp ảnh thất bại!");
    }
  };

  // Hàm định dạng ngày
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  // Hàm ₫ịnh dạng số với dấu phẩy
  const formatCurrency = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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
          <Text style={styles.headerText} allowFontScaling={false}>
            Hóa đơn
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <ViewShot ref={viewRef} options={{ format: "png", quality: 1.0 }}>
          <View style={{ padding: 20, backgroundColor: "white" }}>
            <Text style={styles.roomNameText} allowFontScaling={false}>
              {invoiceData.room_name}
            </Text>
            <View style={styles.row}>
              <Text allowFontScaling={false}>
                <FontAwesome name="calendar" size={16} color="black" /> Ngày lập
                hóa đơn:
              </Text>
              <Text style={styles.rightText} allowFontScaling={false}>
                {formatDate(invoiceData.created_at)}
              </Text>
            </View>
            <View
              style={[
                styles.separatorContainer,
                { justifyContent: "flex-start" },
              ]}
            >
              <Text style={styles.separatorText} allowFontScaling={false}>
                Thông tin cá nhân
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.textWithBorder} allowFontScaling={false}>
                <MaterialCommunityIcons
                  name="face-man"
                  size={16}
                  color="#28A745"
                />{" "}
                Họ tên:
              </Text>

              <Text
                style={[styles.rightText, styles.textWithBorder, { fontWeight: "bold" }]}
                allowFontScaling={false}
              >
                {invoiceData.roomer}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.textWithBorder} allowFontScaling={false}>
                <MaterialCommunityIcons
                  name="phone-classic"
                  size={16}
                  color="#FFC107"
                />{" "}
                Số điện thoại:
              </Text>
              <Text
                style={[styles.rightText, styles.textWithBorder]}
                allowFontScaling={false}
              >
                {invoiceData.phone_number}
              </Text>
            </View>

            <View
              style={[
                styles.separatorContainer,
                { justifyContent: "flex-start" },
              ]}
            >
              <Text
                style={[styles.separatorText, { marginTop: 10 }]}
                allowFontScaling={false}
              >
                Thông tin điện nước
              </Text>
            </View>
            <Text style={styles.subHeader} allowFontScaling={false}>
              1. Nước
            </Text>
            <View style={styles.row}>
              <Text style={styles.textWithBorder} allowFontScaling={false}>
                <AntDesign name="github" size={16} color="black" />
                {""} Số người:
              </Text>
              <Text
                style={[styles.rightText, styles.textWithBorder]}
                allowFontScaling={false}
              >
                {invoiceData.quantity}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.textWithBorder} allowFontScaling={false}>
                <Ionicons name="pricetags" size={16} color="#2ECC71" /> Giá
                nước:
              </Text>
              <Text
                style={[styles.rightText, styles.textWithBorder]}
                allowFontScaling={false}
              >
                {formatCurrency(settings.water_price)} ₫
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.textWithBorder} allowFontScaling={false}>
                <Ionicons name="water" size={16} color="#3498DB" /> Tiền nước:
              </Text>
              <Text
                style={[
                  styles.rightText,
                  styles.textWithBorder,
                  styles.priceText,
                ]}
                allowFontScaling={false}
              >
                {formatCurrency(invoiceData.total_water_price)} ₫
              </Text>
            </View>

            <Text style={styles.subHeader} allowFontScaling={false}>
              2. Điện
            </Text>
            <View style={styles.row}>
              <Text style={styles.textWithBorder} allowFontScaling={false}>
                <MaterialIcons name="electric-bolt" size={16} color="#E67E22" />{" "}
                Số điện:
              </Text>
              <Text
                style={[styles.rightText, styles.textWithBorder]}
                allowFontScaling={false}
              >
                {invoiceData.new_electric_number} - {invoiceData.old_electric_number} = {invoiceData.total_electric_use}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.textWithBorder} allowFontScaling={false}>
                <FontAwesome5 name="hot-tub" size={16} color="#E74C3C" /> Số
                BNL:
              </Text>
              <Text
                style={[styles.rightText, styles.textWithBorder]}
                allowFontScaling={false}
              >
                {invoiceData.total_bnl_use && invoiceData.divideByPeople
                  ? `(${invoiceData.new_bnl} - ${invoiceData.old_bnl}) : ${invoiceData.divideByPeople} x ${invoiceData.quantity} = ${formatCurrency((invoiceData.total_bnl_use / invoiceData.divideByPeople) * invoiceData.quantity)}`
                  : invoiceData.total_bnl_use && invoiceData.new_bnl && invoiceData.old_bnl
                  ? `${invoiceData.new_bnl} - ${invoiceData.old_bnl} = ${invoiceData.total_bnl_use}`
                  : "0"
                }
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.textWithBorder} allowFontScaling={false}>
                <MaterialIcons name="electric-bolt" size={16} color="#E74C3C" /> Tổng số điện đã dùng:
              </Text>
              <Text
                style={[styles.rightText, styles.textWithBorder]}
                allowFontScaling={false}
              >
                {Number(invoiceData.total_electric_use || 0) + (invoiceData.total_bnl_use && invoiceData.divideByPeople ? Number(invoiceData.total_bnl_use / invoiceData.divideByPeople * invoiceData.quantity) : Number(invoiceData.total_bnl_use || 0))}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.textWithBorder} allowFontScaling={false}>
                <Ionicons name="pricetags" size={16} color="#2ECC71" /> Giá
                điện:
              </Text>
              <Text
                style={[styles.rightText, styles.textWithBorder]}
                allowFontScaling={false}
              >
                {formatCurrency(settings.electric_price)} ₫
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.textWithBorder} allowFontScaling={false}>
                <MaterialIcons
                  name="electrical-services"
                  size={16}
                  color="black"
                />{" "}
                Tiền điện:
              </Text>
              <Text
                style={[
                  styles.rightText,
                  styles.textWithBorder,
                  styles.priceText,
                ]}
                allowFontScaling={false}
              >
                {formatCurrency(invoiceData.number_price)} ₫
              </Text>
            </View>

            <View
              style={[
                styles.separatorContainer,
                { justifyContent: "flex-start" },
              ]}
            >
              <Text
                style={[styles.separatorText, { marginTop: 10 }]}
                allowFontScaling={false}
              >
                Thông tin dịch vụ
              </Text>
            </View>
            {services.map((service) => (
              <View key={service.service_id} style={styles.row}>
                <Text style={styles.textWithBorder} allowFontScaling={false}>
                  <Entypo name="pin" size={16} color="#FF4D4D" />{" "}
                  {service.service_name}:
                </Text>

                <Text
                  style={[styles.rightText, styles.textWithBorder]}
                  allowFontScaling={false}
                >
                  {formatCurrency(service.service_price)} ₫
                </Text>
              </View>
            ))}
                        <View style={styles.row}>
              <Text style={styles.textWithBorder} allowFontScaling={false}>
              <Entypo name="pin" size={16} color="#FF4D4D" />{" "}
                Tiền phòng:
              </Text>
              <Text
                style={[
                  styles.rightText,
                  styles.textWithBorder,
                  // styles.priceText,
                ]}
                allowFontScaling={false}
              >
                {formatCurrency(invoiceData.room_price)} ₫
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.textWithBorder} allowFontScaling={false}>
                <FontAwesome6
                  name="money-bill-1-wave"
                  size={16}
                  color="green"
                />{" "}
                Tiền dịch vụ:
              </Text>
              <Text
                style={[styles.rightText, styles.textWithBorder, styles.priceText]}
                allowFontScaling={false}
              >
                {formatCurrency(Number(invoiceData.room_price || 0) + services.reduce((total, service) => total + Number(service.service_price || 0), 0))} ₫
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.totalText} allowFontScaling={false}>
                Tổng số tiền:
              </Text>
              <Text
                style={[styles.rightText, styles.priceTextTotal]}
                allowFontScaling={false}
              >
                {formatCurrency(invoiceData.total_amount)} ₫
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
    flexDirection: "row",
    alignItems: "center",
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
    marginLeft: 10,
    marginTop: -2,
  },
  content: {
    padding: 25,
    paddingBottom: 120,
    backgroundColor: "white",
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 100,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
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
    fontSize: 28,
    fontWeight: "700",
    color: "#3F51B5",
    marginBottom: 10,
    textAlign: "center",
    marginTop: -10
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 5,
  },
  separatorText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3F51B5",
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
    backgroundColor: "#3F51B5",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    margin: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  sendButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default InvoiceDetailScreen;
