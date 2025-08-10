import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  RefreshControl,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { CheckBox } from "react-native-elements";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Entypo from "@expo/vector-icons/Entypo";

import { supabaseDB } from "../DBconfig";

const CreateInvoiceScreen = ({
  navigation,
  route,
  room_name = "",
  room_price = "",
  roomer = "",
  phone_number = "",
  room_id = "",
  id_home = "",
}) => {
  const {
    room_name: paramRoomName = room_name,
    room_price: paramRoomPrice = room_price,
    roomer: paramRoomer = roomer,
    phone_number: paramPhoneNumber = phone_number,
    room_id: paramRoomId = room_id,
    id_home: paramIdHome = id_home,
  } = route.params || {};
  const effectiveRoomName = paramRoomName || room_name;
  const effectiveRoomPrice = paramRoomPrice || room_price;
  const effectiveRoomer = paramRoomer || roomer;
  const effectivePhoneNumber = paramPhoneNumber || phone_number;
  const effectiveRoomId = paramRoomId || room_id;
  const effectiveIdHome = paramIdHome || id_home;

  if (
    !effectiveRoomName &&
    !effectiveRoomPrice &&
    !effectiveRoomer &&
    !effectivePhoneNumber &&
    !effectiveRoomId &&
    !effectiveIdHome
  ) {
    console.error("params is undefined");
    return null;
  }

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNotificationVisible, setNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [roomName, setRoomName] = useState("");
  const [creationDate, setCreationDate] = useState(new Date());
  const [tenantName, setTenantName] = useState(effectiveRoomer);
  const [phoneNumber, setPhoneNumber] = useState(effectivePhoneNumber);
  const [oldElectricity, setOldElectricity] = useState("");
  const [oldWater, setOldWater] = useState("");
  const [oldWaterHeater, setOldWaterHeater] = useState("");
  const [newElectricity, setNewElectricity] = useState("");
  const [newWater, setNewWater] = useState("");
  const [newWaterHeater, setNewWaterHeater] = useState("");
  const [additionalServices, setAdditionalServices] = useState("");
  const [roomCost, setRoomCost] = useState(effectiveRoomPrice);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [newInputValue, setNewInputValue] = useState("");
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState({});
  const [servicePrices, setServicePrices] = useState({});
  const [electricPrice, setElectricPrice] = useState(0);
  const [waterPrice, setWaterPrice] = useState(0);
  const [quantity, setQuantity] = useState(route.params.quantity);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [totalServicePrice, setTotalServicePrice] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState("");

  // Tính số ₫iện
  const calculateElectricity = () => {
    const oldElectricityValue = parseFloat(oldElectricity) || 0;
    const newElectricityValue = parseFloat(newElectricity) || 0;
    return newElectricityValue - oldElectricityValue;
  };
  // Tính số nước
  const calculateWater = () => {
    const oldWaterValue = parseFloat(oldWater) || 0;
    const newWaterValue = parseFloat(newWater) || 0;
    return newWaterValue - oldWaterValue;
  };

  // Tính số BNL
  const calculateWaterHeater = () => {
    const oldWaterHeaterValue = parseFloat(oldWaterHeater) || 0;
    const newWaterHeaterValue = parseFloat(newWaterHeater) || 0;
    return newWaterHeaterValue - oldWaterHeaterValue;
  };
  //Tính thành tiền ₫iện và nước
  const totalElectricPrice = calculateElectricity() * electricPrice;
  const totalWaterPrice = calculateWater() * waterPrice;
  const totalWaterHeaterPrice = isChecked
    ? ((calculateWaterHeater() * electricPrice) / parseFloat(newInputValue)) *
      quantity
    : calculateWaterHeater() * electricPrice;

  // Làm tròn totalWaterHeaterPrice ₫ến 3 chữ số sau dấu phẩy
  const roundedTotalWaterHeaterPrice = totalWaterHeaterPrice.toFixed(0);

  // Tính tổng tiền
  const totalAmount =
    Math.floor(totalElectricPrice) +
    Math.floor(totalWaterPrice) +
    Math.floor(totalWaterHeaterPrice) +
    Math.floor(parseFloat(roomCost || 0)) +
    Math.floor(totalServicePrice);

  const totalElectricityQuantity =
    calculateElectricity() + calculateWaterHeater(); // Tổng số lượng ₫iện
  const totalElectricityAmount =
    Math.floor(totalElectricPrice) + Math.floor(roundedTotalWaterHeaterPrice); // Tổng tiền ₫iện

  const handleSave = async () => {
    // Tạo ₫ối tượng hóa ₫ơn
    const invoiceData = {
      id_room: effectiveRoomId,
      created_at: new Date(
        new Date().getTime() + 7 * 60 * 60 * 1000
      ).toISOString(), // Chuyển ₫ổi sang UTC+7
      roomer: effectiveRoomer,
      phone_number: effectivePhoneNumber,
      new_water_number: newWater,
      old_water_number: oldWater,
      quantity: quantity,
      total_water_use: calculateWater(),
      total_water_price: totalWaterPrice,
      new_electric_number: newElectricity,
      old_electric_number: oldElectricity,
      total_electric_use: calculateElectricity(),
      old_bnl: oldWaterHeater,
      new_bnl: newWaterHeater,
      total_bnl_use: calculateWaterHeater(),
      service_id: Object.keys(selectedServices)
        .filter((serviceId) => selectedServices[serviceId])
        .map(Number), // Chuyển ₫ổi thành mảng số nguyên
      room_price: roomCost,
      total_amount: totalAmount,
      room_name: effectiveRoomName,
      id_home: effectiveIdHome,
      number_electric: totalElectricityQuantity,
      number_price: totalElectricityAmount,
      isShared: isChecked,
      divideByPeople: isChecked ? parseFloat(newInputValue) : null, // Lưu số người để chia
    };

    try {
      setIsLoading(true);

      // Kiểm tra và chuyển ₫ổi service_id thành mảng số nguyên
      if (Array.isArray(invoiceData.service_id)) {
        invoiceData.service_id = invoiceData.service_id.map((id) =>
          parseInt(id, 10)
        );
      }

      const { error } = await supabaseDB.from("Invoice").insert(invoiceData);

      if (error) throw error;

      setIsLoading(false);
      setNotification("Đã tạo hóa đơn thành công!");

      // Chuyển hướng ₫ến màn hình thông tin hóa ₫ơn
      navigation.navigate("InvoiceDetail", {
        invoiceData,
        isShared: isChecked,
      });

      setTimeout(() => setNotification(""), 3000); // Tự ₫ộng xóa thông báo sau 3 giây
    } catch (error) {
      setIsLoading(false);
      console.error("Error creating invoice:", error.message);
      setNotification("Tạo hóa đơn thất bại!");
      setTimeout(() => setNotification(""), 3000); // Tự ₫ộng xóa thông báo sau 3 giây
    }
  };

  const fetchServices = async () => {
    setIsLoadingServices(true);
    if (!effectiveIdHome) {
      console.error("id_home is invalid");
      return;
    }

    try {
      const { data, error } = await supabaseDB
        .from("Service")
        .select("*")
        .eq("id_home", effectiveIdHome);

      if (error) {
        console.error("Error fetching services:", error.message);
        return;
      }

      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error.message);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const fetchSettings = async () => {
    if (!effectiveIdHome) {
      console.error("id_home is invalid");
      return;
    }

    try {
      const { data, error } = await supabaseDB
        .from("Setting")
        .select("*")
        .eq("id_home", effectiveIdHome);

      if (error) {
        console.error("Error fetching settings:", error.message);
        return;
      }

      if (data && data.length > 0) {
        setElectricPrice(data[0].electric_price);
        setWaterPrice(data[0].water_price);
      }
    } catch (error) {
      console.error("Error fetching settings:", error.message);
    }
  };

  const fetchLatestInvoice = async () => {
    if (!effectiveRoomId) {
      console.error("id_room is invalid");
      return;
    }

    try {
      const { data, error } = await supabaseDB
        .from("Invoice")
        .select("*")
        .eq("id_room", effectiveRoomId)
        .order("created_at", { ascending: false }) // Sắp xếp theo ngày tạo giảm dần
        .limit(1); // Lấy hóa đơn gần nhất

      if (error) {
        console.error("Error fetching latest invoice:", error.message);
        return;
      }

      // Cập nhật state với dữ liệu từ hóa đơn gần nhất
      if (data[0]) {
        const latestInvoice = data[0];
        
        setOldElectricity(latestInvoice.new_electric_number);
        setOldWaterHeater(latestInvoice.new_bnl);
        setNewWater(quantity.toString()); // Chuyển quantity thành chuỗi và điền vào ô số nước mới
        
        // Tự động tích vào những dịch vụ đã sử dụng trong hóa đơn trước
        if (latestInvoice.service_id) {
          let serviceIds = latestInvoice.service_id;
          
          // Đảm bảo service_id là array
          if (!Array.isArray(serviceIds)) {
            // Nếu là string, thử parse JSON
            if (typeof serviceIds === 'string') {
              try {
                serviceIds = JSON.parse(serviceIds);
              } catch (e) {
                serviceIds = [];
              }
            } else {
              // Nếu là số đơn lẻ, chuyển thành array
              serviceIds = [serviceIds];
            }
          }
            
          if (serviceIds.length > 0) {
            const previousServices = {};
            const previousServicePrices = {};
            
            serviceIds.forEach(serviceId => {
              // Chuyển serviceId thành số nếu cần
              const numericServiceId = typeof serviceId === 'string' ? parseInt(serviceId) : serviceId;
              previousServices[numericServiceId] = true;
              
              // Tìm thông tin dịch vụ để lấy giá
              const service = services.find(s => s.service_id === numericServiceId);
              if (service) {
                previousServicePrices[numericServiceId] = service.service_price;
              }
            });
            
            setSelectedServices(previousServices);
            setServicePrices(previousServicePrices);
            
            // Tính lại tổng giá dịch vụ
            const newTotalServicePrice = Object.keys(previousServices).reduce((total, serviceId) => {
              const service = services.find(s => s.service_id === parseInt(serviceId));
              if (service) {
                return total + parseFloat(service.service_price);
              }
              return total;
            }, 0);
            
            setTotalServicePrice(newTotalServicePrice);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching latest invoice:", error.message);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await fetchServices();
      await fetchSettings();
    };
    
    initializeData();
  }, [effectiveIdHome]);

  // Gọi fetchLatestInvoice sau khi services đã được load
  useEffect(() => {
    if (services.length > 0 && effectiveRoomId) {
      fetchLatestInvoice();
    }
  }, [services, effectiveRoomId]);

  const handleCheckboxToggle = (serviceId) => {
    setSelectedServices((prev) => {
      const newSelected = {
        ...prev,
        [serviceId]: !prev[serviceId],
      };

      // Tính toán tổng giá dịch vụ
      const newTotalServicePrice = services.reduce((total, service) => {
        if (newSelected[service.service_id]) {
          return (
            total +
            parseFloat(
              servicePrices[service.service_id] || service.service_price
            )
          );
        }
        return total;
      }, 0);

      setTotalServicePrice(newTotalServicePrice); // Cập nhật tổng giá dịch vụ
      return newSelected;
    });
  };

  const handleServicePriceChange = (serviceId, value) => {
    setServicePrices((prev) => ({
      ...prev,
      [serviceId]: value,
    }));
  };

  const formatNumber = (value) => {
    return (value !== undefined && value !== null ? value : "")
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchServices();
    await fetchSettings();
    await fetchLatestInvoice(); // Gọi lại để lấy hóa đơn gần nhất

    setInvoiceNumber("");
    setCustomerName("");
    setAmount("");
    setNote("");
    setOldElectricity("");
    setOldWater("");
    setOldWaterHeater("");
    setNewElectricity("");
    setNewWater("");
    setNewWaterHeater("");
    setNewInputValue("");
    setTenantName(effectiveRoomer);
    setPhoneNumber(effectivePhoneNumber);
    setSelectedServices({}); // Reset selected services
    setServicePrices({}); // Reset service prices
    setTotalServicePrice(0); // Reset total service price

    setIsRefreshing(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {notification ? (
        <View style={styles.notification}>
          <Text style={styles.notificationText}>{notification}</Text>
        </View>
      ) : null}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          stickyHeaderIndices={[0]}
        >
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <AntDesign name="arrowleft" size={24} color="black" />
              <Text style={styles.headerText} allowFontScaling={false}>
                Tạo hóa đơn
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.title} allowFontScaling={false}>
              {effectiveRoomName}
            </Text>

            <Text style={styles.label} allowFontScaling={false}>
              <FontAwesome name="calendar" size={16} color="black" /> Ngày tạo
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{ width: "100%" }}
            >
              <TextInput
                allowFontScaling={false}
                style={styles.input}
                placeholder="Chọn ngày tạo"
                value={creationDate.toLocaleDateString()}
                editable={false}
              />
              <AntDesign
                name="calendar"
                size={20}
                color="#3498DB"
                style={styles.dateIcon}
              />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={creationDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  setCreationDate(selectedDate || creationDate);
                }}
              />
            )}

            <View style={styles.row}>
              <View style={styles.inputContainer}>
                <Text style={styles.label} allowFontScaling={false}>
                  <MaterialIcons name="people-alt" size={16} color="#28A745" />{" "}
                  Người thuê
                </Text>
                <TextInput
                  allowFontScaling={false}
                  style={styles.rowInput}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={tenantName}
                  onChangeText={setTenantName}
                  editable={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label} allowFontScaling={false}>
                  <MaterialCommunityIcons
                    name="phone-classic"
                    size={16}
                    color="#FFC107"
                  />{" "}
                  Số điện thoại
                </Text>
                <TextInput
                  allowFontScaling={false}
                  style={styles.rowInput}
                  placeholder="Ví dụ: 0123456789"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  editable={false}
                />
              </View>
            </View>

            <View style={styles.separatorContainer}>
              <Text style={styles.separatorText} allowFontScaling={false}>
                1. Thông số đầu kỳ
              </Text>
              <View style={styles.separator} />
            </View>

            <View style={styles.row}>
              <View style={styles.inputContainer}>
                <Text style={styles.label} allowFontScaling={false}>
                  <MaterialIcons
                    name="electric-bolt"
                    size={16}
                    color="#E67E22"
                  />{" "}
                  Số điện cũ
                </Text>
                <TextInput
                  allowFontScaling={false}
                  style={styles.rowInput}
                  placeholder="Nhập số..."
                  value={oldElectricity}
                  onChangeText={setOldElectricity}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label} allowFontScaling={false}>
                  <Ionicons name="water" size={16} color="#3498DB" /> Số nước cũ
                </Text>
                <TextInput
                  allowFontScaling={false}
                  style={styles.rowInput}
                  placeholder="Nhập số..."
                  value={oldWater}
                  onChangeText={setOldWater}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label} allowFontScaling={false}>
                  <FontAwesome5 name="hot-tub" size={16} color="#E74C3C" /> Số
                  BNL cũ
                </Text>
                <TextInput
                  allowFontScaling={false}
                  style={styles.rowInput}
                  placeholder="Nhập số..."
                  value={oldWaterHeater}
                  onChangeText={setOldWaterHeater}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.separatorContainer}>
              <Text style={styles.separatorText} allowFontScaling={false}>
                2. Thông số cuối kỳ
              </Text>
              <View style={styles.separator} />
            </View>

            <View style={styles.row}>
              <View style={styles.inputContainer}>
                <Text style={styles.label} allowFontScaling={false}>
                  <MaterialIcons
                    name="electric-bolt"
                    size={16}
                    color="#E67E22"
                  />{" "}
                  Số điện mới
                </Text>
                <TextInput
                  allowFontScaling={false}
                  style={styles.rowInput}
                  placeholder="Nhập số..."
                  value={newElectricity}
                  onChangeText={setNewElectricity}
                  keyboardType="numeric"
                  placeholderTextColor="#A9A9A9"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label} allowFontScaling={false}>
                  <Ionicons name="water" size={16} color="#3498DB" /> Số nước
                  mới
                </Text>
                <TextInput
                  allowFontScaling={false}
                  style={styles.rowInput}
                  placeholder="Nhập số..."
                  value={newWater}
                  onChangeText={setNewWater}
                  keyboardType="numeric"
                  placeholderTextColor="#A9A9A9"
                />
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Text style={styles.label} allowFontScaling={false}>
                  {"  "}
                  <FontAwesome5 name="hot-tub" size={16} color="#E74C3C" /> Số
                  BNL mới
                </Text>

                <CheckBox
                allowFontScaling={false}
                  checked={isChecked}
                  onPress={() => {
                    setIsChecked(!isChecked);
                    if (isChecked) {
                      // Nếu checkbox ₫ang ₫ược check, xóa dữ liệu ô input
                      setNewInputValue("");
                    }
                  }}
                  containerStyle={{ margin: 0, padding: 0 }}
                  checkedIcon="check-square"
                  uncheckedIcon="square-o"
                  title="Chia đầu người"
                  textStyle={{ marginLeft: 10, fontSize: 14 }}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.inputContainer}>
                <TextInput
                  allowFontScaling={false}
                  style={[styles.rowInput, { width: "100%" }]}
                  placeholder="Nhập số..."
                  value={newWaterHeater}
                  onChangeText={setNewWaterHeater}
                  keyboardType="numeric"
                  placeholderTextColor="#A9A9A9"
                />
              </View>
              <View style={styles.inputContainer}>
                {isChecked && (
                  <TextInput
                    allowFontScaling={false}
                    style={[styles.rowInput, { width: "100%" }]}
                    placeholder="Nhập số..."
                    value={newInputValue}
                    onChangeText={setNewInputValue}
                    keyboardType="numeric"
                    placeholderTextColor="#A9A9A9"
                  />
                )}
              </View>
            </View>

            <View style={styles.separatorContainer}>
              <Text style={styles.separatorText} allowFontScaling={false}>
                3. Dịch vụ thêm
              </Text>
              <View style={styles.separator} />
            </View>

            {isLoadingServices ? (
              <Text>Đang tải dịch vụ...</Text>
            ) : (
              <>
                {services.map((service) => (
                  <View key={service.service_id} style={styles.serviceContainer}>
                    <CheckBox
                      checked={!!selectedServices[service.service_id]}
                      onPress={() => handleCheckboxToggle(service.service_id)}
                      containerStyle={{ margin: 0, padding: 0 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.serviceName}>
                        {service.service_name}
                      </Text>
                      <TextInput
                        allowFontScaling={false}
                        style={[styles.rowInput, { width: "80%" }]}
                        placeholder="Nhập giá dịch vụ"
                        value={
                          formatNumber(
                            servicePrices[service.service_id] ||
                              service.service_price.toString()
                          ) + " ₫"
                        }
                        onChangeText={(value) =>
                          handleServicePriceChange(
                            service.service_id,
                            value.replace(/,/g, "")
                          )
                        }
                        keyboardType="numeric"
                        editable={false}
                      />
                    </View>
                  </View>
                ))}
              </>
            )}

            <Text style={styles.label} allowFontScaling={false}>
              <FontAwesome6 name="money-bill-alt" size={16} color="green" />{" "}
              Tiền phòng
            </Text>
            <TextInput
              allowFontScaling={false}
              style={styles.input}
              placeholder="Ví dụ: 1,000,000 ₫"
              value={formatNumber(roomCost) + " ₫"}
              onChangeText={(value) => setRoomCost(value.replace(/,/g, ""))}
              keyboardType="numeric"
              editable={false}
            />
            <View style={styles.separatorContainer} >
              <Text style={styles.separatorText} allowFontScaling={false}>
                4. Bảng tính giá tiền
              </Text>
              <View style={styles.separator} />
            </View>

            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText} allowFontScaling={false}></Text>
                <Text style={styles.tableHeaderText} allowFontScaling={false}>Số lượng</Text>
                <Text style={styles.tableHeaderText} allowFontScaling={false}>Đơn giá</Text>
                <Text style={styles.tableHeaderText} allowFontScaling={false}>Thành tiền</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { textAlign: "left" }]} allowFontScaling={false}>
                  Tiền điện
                </Text>
                <Text style={styles.tableCell} allowFontScaling={false}>{calculateElectricity()}</Text>
                <Text style={styles.tableCell} allowFontScaling={false}>
                  {formatNumber(electricPrice) + " ₫"}
                </Text>
                <Text style={styles.tableCell} allowFontScaling={false}>
                  {formatNumber(totalElectricPrice) + " ₫"}
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { textAlign: "left" }]} allowFontScaling={false}>
                  Tiền BNL
                </Text>
                <Text style={styles.tableCell} allowFontScaling={false}>
                  {isChecked && newInputValue ? 
                    `${(calculateWaterHeater() / parseFloat(newInputValue) * quantity)}` : 
                    calculateWaterHeater()
                  }
                </Text>
                <Text style={styles.tableCell} allowFontScaling={false}>
                  {formatNumber(electricPrice) + " ₫"}
                </Text>
                <Text style={styles.tableCell} allowFontScaling={false}>
                  {formatNumber(roundedTotalWaterHeaterPrice) + " ₫"}
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { textAlign: "left" }]} allowFontScaling={false}>
                  Tiền nước
                </Text>
                <Text style={styles.tableCell} allowFontScaling={false}>{calculateWater()}</Text>
                <Text style={styles.tableCell} allowFontScaling={false}>
                  {formatNumber(waterPrice) + " ₫"}
                </Text>
                <Text style={styles.tableCell} allowFontScaling={false}>
                  {formatNumber(totalWaterPrice) + " ₫"}
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { textAlign: "left" }]} allowFontScaling={false}>
                  Tiền phòng
                </Text>
                <Text style={styles.tableCell} allowFontScaling={false}>-</Text>
                <Text style={styles.tableCell} allowFontScaling={false}>-</Text>
                <Text style={styles.tableCell} allowFontScaling={false}>
                  {formatNumber(roomCost) + " ₫"}
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { textAlign: "left" }]} allowFontScaling={false}>
                  Dịch vụ
                </Text>
                <Text style={styles.tableCell} allowFontScaling={false}>-</Text>
                <Text style={styles.tableCell} allowFontScaling={false}>-</Text>
                <Text style={styles.tableCell} allowFontScaling={false}>
                  {formatNumber(totalServicePrice) + " ₫"}
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text
                  style={[
                    styles.tableCell,
                    { textAlign: "left", fontSize: 14, fontWeight: "bold" },
                    ]}
                  allowFontScaling={false}
                >
                  Tổng tiền
                </Text>
                <Text style={styles.tableCell} allowFontScaling={false}>-</Text>
                <Text style={styles.tableCell} allowFontScaling={false}>-</Text>
                <Text
                  style={[
                    styles.tableCell,
                    { fontSize: 14, fontWeight: "bold", color: "#E74C3C" },
                  ]}
                  allowFontScaling={false}
                >
                  {formatNumber(totalAmount) + " ₫"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isLoading && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={styles.saveText} allowFontScaling={false}>
                {isLoading ? "Đang lưu..." : "Tạo hóa đơn"}
              </Text>
            </TouchableOpacity>
          </View>

          <Modal
            animationType="slide"
            transparent={true}
            visible={isNotificationVisible}
            onRequestClose={() => setNotificationVisible(false)}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Thông báo</Text>
                  <Text style={styles.modalMessage}>{notificationMessage}</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setNotificationVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Đóng</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFD2CC",
  },
  headerContainer: {
    position: "sticky",
    // paddingTop: 40,
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
  content: {
    // marginTop: 20,
    paddingTop: 10,
    paddingBottom: 30,
    height: "auto",
    width: "100%", // IOS
    backgroundColor: "white",
    borderRadius: 20,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    alignSelf: "flex-start",
    marginLeft: 5,
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    width: "100%",
    height: "auto",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
    fontSize: 16,
    backgroundColor: "#F8F9FA",
  },
  saveButton: {
    backgroundColor: "#006D5B",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "90%",
    marginTop: 30,
  },
  saveText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
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
    width: "90%",
    height: "auto",
    maxHeight: "67%",
    alignItems: "center",
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
  closeButton: {
    backgroundColor: "#006D5B",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#E74C3C",
    marginBottom: 5,
    marginTop: 10,
  },
  required: {
    color: "red",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  rowInputBNL: {
    width: "50%",
    height: "auto",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
    fontSize: 16,
    backgroundColor: "#F8F9FA",
    alignItems: "flex-start",
  },

  rowInput: {
    width: "100%",
    height: "auto",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
    fontSize: 16,
    backgroundColor: "#F8F9FA",
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 15,
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
  dateIcon: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 10,
    marginTop: 20,
  },
  serviceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    // borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginLeft: 40,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 5,
    marginLeft: 10,
  },
  servicePrice: {
    fontSize: 16,
    color: "#2C3E50",
  },
  tableContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    marginTop: 10,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    padding: 10,
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
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
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

export default CreateInvoiceScreen;
