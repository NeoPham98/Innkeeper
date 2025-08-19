// components/InvoiceDetailScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Modal,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { supabaseDB } from "../DBconfig"; // Thêm import supabaseDB

const InvoiceDetailScreen = ({ navigation, route }) => {
  const { invoices } = route.params; // Nhận danh sách hóa ₫ơn từ params
  const [invoiceData, setInvoiceData] = useState([]); // Thêm state ₫ể lưu dữ liệu hóa ₫ơn
  const [notification, setNotification] = useState(""); // Thêm state cho thông báo
  const [loading, setLoading] = useState(false); // Thêm state ₫ể quản lý trạng thái loading
  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Hàm ₫ể lấy dữ liệu từ bảng Invoiceto
  const fetchInvoices = async () => {
    setLoading(true); // Bắt ₫ầu loading
    try {
      const { data, error } = await supabaseDB.from("Invoice").select("*");
      if (error) throw error;

      // Chuyển ₫ổi service_id từ chuỗi thành mảng số
      const formattedData = data.map((invoice) => ({
        ...invoice,
        service_id: JSON.parse(invoice.service_id || "[]"), // Chuyển ₫ổi chuỗi thành mảng
      }));

      // Sắp xếp theo created_at giảm dần (mới nhất lên đầu)
      const sortedData = formattedData.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );

      setInvoiceData(sortedData); // Lưu dữ liệu đã sắp xếp vào state
    } catch (error) {
      console.error("Error fetching invoices:", error.message);
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };

  useEffect(() => {
    fetchInvoices(); // Gọi hàm khi màn hình ₫ược tải
  }, []);

  const renderInvoiceItem = ({ item }) => (
    <View style={styles.tableRow}>
      <View style={styles.dateColumn}>
        <Text style={styles.dateText} allowFontScaling={false} numberOfLines={1} ellipsizeMode="tail">
          {new Date(item.created_at).toLocaleDateString("vi-VN")}
        </Text>
      </View>
      <View style={styles.roomColumn}>
        <Text style={styles.roomNameText} allowFontScaling={false} numberOfLines={1} ellipsizeMode="tail">
          {item.room_name}
        </Text>
      </View>
      <View style={styles.totalColumn}>
        <Text style={styles.totalText} allowFontScaling={false} numberOfLines={1} ellipsizeMode="tail">
          {Number(item.total_amount).toLocaleString("en-US")} ₫
        </Text>
      </View>
      <View style={styles.actionColumn}>
        <TouchableOpacity
          style={[styles.actionButton, { marginLeft: 0 }]}
          onPress={() => handleView(item)}
        >
          <AntDesign name="eye" size={14} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#F44336" }]}
          onPress={() => handleDelete(item)}
        >
          <AntDesign name="delete" size={14} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Hàm xử lý xem hóa ₫ơn
  const handleView = (item) => {
    const numericId = parseInt(item.id_invoice, 10); // Chuyển ₫ổi id_invoice thành số nguyên
    if (isNaN(numericId)) {
      console.error("ID is not a valid number:", item.id_invoice);
      return; // Ngừng thực hiện nếu ID không hợp lệ
    }
    // Chuyển hướng ₫ến màn hình chi tiết hóa ₫ơn
    navigation.navigate("InvoiceDetail", { invoiceData: item });
  };

  // Mở modal xác nhận xóa hóa đơn
  const handleDelete = (item) => {
    setSelectedInvoice(item);
    setConfirmVisible(true);
  };

  // Thực hiện xóa hóa đơn
  const confirmDelete = async () => {
    try {
      if (!selectedInvoice) return;
      const numericId = Number(selectedInvoice.id_invoice);
      const { error } = await supabaseDB
        .from("Invoice")
        .delete()
        .eq("id_invoice", numericId);
      if (error) throw error;

      // Cập nhật lại danh sách hóa ₫ơn sau khi xóa
      fetchInvoices();
      setNotification("Xóa hóa đơn thành công!"); // Cập nhật thông báo
      setTimeout(() => setNotification(""), 3000); // Xóa thông báo sau 3 giây
    } catch (error) {
      console.error("Error deleting invoice:", error.message);
    } finally {
      setConfirmVisible(false);
      setSelectedInvoice(null);
    }
  };

  return (
    <View style={styles.container}>
      {notification ? ( // Hiển thị thông báo nếu có
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
          <AntDesign name="arrowleft" size={24} color="#2C3E50" />
          <Text style={styles.headerText} allowFontScaling={false}>
            Danh sách hóa đơn
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 1, paddingLeft: 15 }]} allowFontScaling={false}>
            Ngày tạo
          </Text>
          <Text style={[styles.tableHeaderText, { flex: 1.25, paddingLeft: 8 }]} allowFontScaling={false}>
            Tên Phòng
          </Text>
          <Text style={[styles.tableHeaderText, { flex: 1.2, paddingLeft: 8 }]} allowFontScaling={false}>
            Tổng tiền
          </Text>
          <Text style={[styles.tableHeaderText, { flex: 1.5, paddingLeft: 8 }]} allowFontScaling={false}>
            Thao tác
          </Text>
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

      {/* Modal xác nhận xóa */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isConfirmVisible}
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle} allowFontScaling={false}>Xác nhận xóa</Text>
            <Text style={styles.modalMessage} allowFontScaling={false}>
              Bạn có chắc muốn xóa hóa đơn này không?
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.modalButtonText} allowFontScaling={false}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#F44336" }]}
                onPress={confirmDelete}
              >
                <Text style={styles.modalButtonText} allowFontScaling={false}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 0,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
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
    textAlign: "left",
    fontSize: 12,
    color: "#555",
    fontWeight: "500",
  },
  totalText: {
    textAlign: "left",
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "600",
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
  tableContainer: {
    backgroundColor: "white",
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
    maxHeight: "85%",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#3F51B5",
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: "600",
    textAlign: "left",
    color: "white",
    fontSize: 14,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    alignItems: "center",
    backgroundColor: "white",
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
    textAlign: "left",
    fontWeight: "600",
    fontSize: 12,
    color: "#333",
  },
  actionButton: {
    padding: 8,
    backgroundColor: "#4CAF50",
    borderRadius: 6,
    marginLeft: 10,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  actionText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 13,
  },
  notification: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 12,
    position: "absolute",
    top: 120,
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
  dateColumn: {
    flex: 1,
    justifyContent: "center",
    paddingLeft: 8,
  },
  roomColumn: {
    flex: 1.5,
    justifyContent: "center",
    paddingLeft: 8,
  },
  totalColumn: {
    flex: 1.2,
    justifyContent: "center",
    paddingLeft: 8,
  },
  actionColumn: {
    paddingLeft: 8,
    flex: 1.5,
    flexDirection: "row",
    justifyContent: "flex-start",
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
    marginBottom: 12,
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
    marginTop: 10,
  },
  modalButton: {
    backgroundColor: "#3F51B5",
    paddingVertical: 12,
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
});

export default InvoiceDetailScreen;
