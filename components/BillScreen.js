// components/InvoiceDetailScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { supabaseDB } from "../DBconfig"; // Thêm import supabaseDB

const InvoiceDetailScreen = ({ navigation, route }) => {
  const { invoices } = route.params; // Nhận danh sách hóa đơn từ params
  const [invoiceData, setInvoiceData] = useState([]); // Thêm state để lưu dữ liệu hóa đơn
  const [notification, setNotification] = useState(""); // Thêm state cho thông báo
  const [loading, setLoading] = useState(false); // Thêm state để quản lý trạng thái loading

  // Hàm để lấy dữ liệu từ bảng Invoiceto
  const fetchInvoices = async () => {
    setLoading(true); // Bắt đầu loading
    try {
      const { data, error } = await supabaseDB.from("Invoice").select("*");
      if (error) throw error;

      // Chuyển đổi service_id từ chuỗi thành mảng số
      const formattedData = data.map((invoice) => ({
        ...invoice,
        service_id: JSON.parse(invoice.service_id || "[]"), // Chuyển đổi chuỗi thành mảng
      }));

      setInvoiceData(formattedData); // Lưu dữ liệu vào state
    } catch (error) {
      console.error("Error fetching invoices:", error.message);
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };

  useEffect(() => {
    fetchInvoices(); // Gọi hàm khi màn hình được tải
  }, []);

  const renderInvoiceItem = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={styles.dateText}>
        {new Date(item.created_at).toLocaleDateString("vi-VN")}
      </Text>
      <Text style={styles.roomNameText}>{item.room_name}</Text>
      <Text style={styles.totalText}>
        {Number(item.total_amount).toLocaleString("en-US")} ₫
      </Text>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleView(item)}
      >
        <Text style={styles.actionText}>Xem</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleDelete(item)}
      >
        <Text style={styles.actionText}>Xóa</Text>
      </TouchableOpacity>
    </View>
  );

  // Hàm xử lý xem hóa đơn
  const handleView = (item) => {
    const numericId = parseInt(item.id_invoice, 10); // Chuyển đổi id_invoice thành số nguyên
    if (isNaN(numericId)) {
      console.error("ID is not a valid number:", item.id_invoice);
      return; // Ngừng thực hiện nếu ID không hợp lệ
    }
    // Chuyển hướng đến màn hình chi tiết hóa đơn
    navigation.navigate("InvoiceDetail", { invoiceData: item });
  };

  // Hàm xử lý xóa hóa đơn
  const handleDelete = async (item) => {
    try {
      const numericId = Number(item.id_invoice);
      const { error } = await supabaseDB
        .from("Invoice")
        .delete()
        .eq("id_invoice", numericId);
      if (error) throw error;
      // Cập nhật lại danh sách hóa đơn sau khi xóa
      fetchInvoices();
      setNotification("Xóa hóa đơn thành công!"); // Cập nhật thông báo
      setTimeout(() => setNotification(""), 3000); // Xóa thông báo sau 3 giây
    } catch (error) {
      console.error("Error deleting invoice:", error.message);
    }
  };

  return (
    <View style={styles.container}>
      {notification ? ( // Hiển thị thông báo nếu có
        <View style={styles.notification}>
          <Text style={styles.notificationText}>{notification}</Text>
        </View>
      ) : null}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={24} color="#2C3E50" />
          <Text style={styles.headerText}>Danh sách hóa đơn</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Ngày tạo</Text>
          <Text style={styles.tableHeaderText}>Tên Phòng</Text>
          <Text style={styles.tableHeaderText}>Tổng tiền</Text>
          <Text style={styles.tableHeaderText}></Text>
        </View>
        <FlatList
          data={invoiceData}
          keyExtractor={(item) =>
            item.id ? item.id.toString() : Math.random().toString()
          }
          renderItem={renderInvoiceItem}
          refreshControl={
            <RefreshControl
              refreshing={loading} // Trạng thái loading
              onRefresh={fetchInvoices} // Hàm gọi lại khi vuốt
            />
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFD2CC",
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  invoiceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  dateText: {
    flex: 1,
    textAlign: "center",
  },
  totalText: {
    flex: 1,
    textAlign: "center",
  },
  currencyText: {
    fontSize: 16,
  },
  viewButton: {
    backgroundColor: "#FF6347",
    padding: 10,
    borderRadius: 5,
  },
  viewButtonText: {
    color: "white",
  },
  headerContainer: {
    zIndex: 1,
    position: "sticky",
    paddingTop: 40,
    paddingHorizontal: 20,
    backgroundColor: "#FFD2CC",
    height: 80,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginLeft: 15,
    marginTop: -5,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    backgroundColor: "white",
    overflow: "hidden",
    marginTop: 20,
    maxHeight: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginLeft: -5,
    justifyContent: "space-between",
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    alignItems: "center",
    width: "100%",
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cell: { flex: 1, textAlign: "center" },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  viewText: { color: "#008080" },
  roomNameText: {
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
  },
  actionButton: {
    padding: 10,
    backgroundColor: "#3498DB",
    borderRadius: 5,
    marginLeft: 5,
  },
  actionText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
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

export default InvoiceDetailScreen;
