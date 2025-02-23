// InvoiceDetailScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { supabaseDB } from "../DBconfig"; // Đảm bảo import supabaseDB

const InvoiceDetailScreen = ({ navigation, route }) => {
  const { invoiceData } = route.params;
  const [settings, setSettings] = useState({
    electric_price: 0,
    water_price: 0,
  });

  // Hàm định dạng ngày
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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

  useEffect(() => {
    fetchSettings();
  }, [invoiceData.id_home]);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={24} color="black" />
          <Text style={styles.headerText}>Hóa đơn</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.roomNameText}>
          Tên phòng: {invoiceData.room_name}
        </Text>
        <View style={styles.row}>
          <Text>Ngày lập hóa đơn:</Text>
          <Text style={styles.rightText}>
            {formatDate(invoiceData.created_at)}
          </Text>
        </View>
        <Text style={styles.label}>Thông tin</Text>
        <View style={styles.row}>
          <Text>Họ tên:</Text>
          <Text style={styles.rightText}>{invoiceData.roomer}</Text>
        </View>
        <View style={styles.row}>
          <Text>Số điện thoại:</Text>
          <Text style={styles.rightText}>{invoiceData.phone_number}</Text>
        </View>

        <Text style={styles.label}>Thông tin điện nước</Text>
        <Text style={styles.subHeader}>Nước</Text>
        <View style={styles.row}>
          <Text>Số người:</Text>
          <Text style={styles.rightText}>{invoiceData.quantity}</Text>
        </View>
        {/* <View style={styles.row}>
          <Text>Số nước mới:</Text>
          <Text style={styles.rightText}>{invoiceData.new_water_number}</Text>
        </View>
        <View style={styles.row}>
          <Text>Số nước sử dụng:</Text>
          <Text style={styles.rightText}>{invoiceData.total_water_use}</Text>
        </View> */}
        <View style={styles.row}>
          <Text>Giá nước:</Text>
          <Text style={styles.rightText}>{settings.water_price} đ</Text>
        </View>
        <View style={styles.row}>
          <Text>Tiền nước:</Text>
          <Text style={styles.rightText}>
            {invoiceData.total_water_price} đ
          </Text>
        </View>

        <Text style={styles.subHeader}>Điện</Text>
        <View style={styles.row}>
          <Text>Số điện cũ:</Text>
          <Text style={styles.rightText}>
            {invoiceData.old_electric_number}
          </Text>
        </View>
        <View style={styles.row}>
          <Text>Số điện mới:</Text>
          <Text style={styles.rightText}>
            {invoiceData.new_electric_number}
          </Text>
        </View>
        <View style={styles.row}>
          <Text>Số điện sử dụng:</Text>
          <Text style={styles.rightText}>{invoiceData.total_electric_use}</Text>
        </View>
        <View style={styles.row}>
          <Text>Giá điện:</Text>
          <Text style={styles.rightText}>{settings.electric_price} đ</Text>
        </View>
        <View style={styles.row}>
          <Text>Tiền điện:</Text>
          <Text style={styles.rightText}>
            {invoiceData.total_electric_price} đ
          </Text>
        </View>

        <View style={styles.row}>
          <Text>Tiền phòng:</Text>
          <Text style={styles.rightText}>{invoiceData.room_price} đ</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.totalText}>Tổng số tiền:</Text>
          <Text style={styles.rightText}>{invoiceData.total_amount} đ</Text>
        </View>
      </ScrollView>
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
    // backgroundColor: "#E74C3C",
    paddingBottom: 10,
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
    marginTop: 15,
    marginBottom: 5,
  },
  totalText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E74C3C",
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
});

export default InvoiceDetailScreen;
