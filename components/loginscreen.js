import React from "react";
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const LoginScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require("../assets/house.png")} style={styles.houseImage} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Chủ trọ</Text>
        <Text style={styles.subtitle}>Quản lý nhà trọ thật dễ dàng</Text>

        <Text style={styles.label}>Email đăng nhập</Text>
        <TextInput style={styles.input} placeholder="Ví dụ: abc1234@gmail.com" keyboardType="email-address" />

        <Text style={styles.label}>Mật khẩu</Text>
        <TextInput style={styles.input} placeholder="Nhập mật khẩu" secureTextEntry />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.registerButton}>
            <Text style={styles.registerButtonText}>Đăng ký</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFD2CC",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
  },
  houseImage: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginTop: 60,
  },
  content: {
    flex: 1,
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#E74C3C",
  },
  subtitle: {
    fontSize: 20,
    color: "#7F8C8D",
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
    alignSelf: "flex-start",
    marginLeft: 20,
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    width: "90%",
    height: 60,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 18,
    backgroundColor: "#F8F9FA",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 30,
    width: "90%",
    justifyContent: "space-between",
  },
  registerButton: {
    borderWidth: 2,
    borderColor: "#006D5B",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "48%",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  loginButton: {
    backgroundColor: "#006D5B",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "48%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  registerButtonText: {
    color: "#006D5B",
    fontSize: 16,
    fontWeight: "700",
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default LoginScreen;
