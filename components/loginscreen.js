import React, { useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Modal
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { supabaseDB } from '../DBconfig';

const LoginScreen = ({ navigation }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const showErrorMessage = (message) => {
    setErrorMessage(message);
    setShowError(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showErrorMessage('Vui lòng nhập đầy đủ Tài khoản và Mật khẩu');
      return;
    }

    try {
      setLoading(true);
      
      // Query đến bảng Account để kiểm tra thông tin đăng nhập
      const { data, error } = await supabaseDB
        .from('Account')
        .select('*')
        .eq('email', email)
        .eq('password', password);



      if (error) {
        showErrorMessage('Có lỗi xảy ra khi đăng nhập');
        return;
      }

      if (data && data.length > 0) {
        // Đăng nhập thành công
        navigation.navigate('Home');
        setEmail('');
        setPassword('');
      } else {
        // Không tìm thấy tài khoản phù hợp
        showErrorMessage('Tài khoản hoặc Mật khẩu không chính xác');
      }

    } catch (error) {
      showErrorMessage('Có lỗi xảy ra khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image source={require("../assets/house.png")} style={styles.houseImage} />
          </View>
          
          <View style={styles.content}>
            <Text style={styles.title}>Chủ trọ</Text>
            <Text style={styles.subtitle}>Quản lý nhà trọ thật dễ dàng</Text>

            <Text style={styles.label}>Email đăng nhập</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ví dụ: abc1234@gmail.com" 
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.passwordContainer}>
              <TextInput 
                style={styles.passwordInput} 
                placeholder="Nhập mật khẩu" 
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={24} 
                  color="#006D5B"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.registerButton}
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.registerButtonText}>Đăng ký</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.loginButton,
                  loading && styles.disabledButton
                ]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* Custom Error Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showError}
        onRequestClose={() => setShowError(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowError(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="alert-circle" size={30} color="#E74C3C" />
              <Text style={styles.modalTitle}>Lỗi đăng nhập</Text>
            </View>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowError(false)}
            >
              <Text style={styles.modalButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFD2CC",
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
    paddingBottom: 40,
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
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    alignSelf: "flex-start",
    marginLeft: 20,
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    width: "90%",
    height: 50,
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
  passwordContainer: {
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  passwordInput: {
    flex: 1,
    height: 50,
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
  eyeIcon: {
    position: "absolute",
    right: 15,
    height: 50,
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10, // Khoảng cách giữa icon và text
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  modalMessage: {
    fontSize: 16,
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;
