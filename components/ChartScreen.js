import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { supabaseDB } from '../DBconfig';
import { AntDesign } from '@expo/vector-icons';

const ChartScreen = ({ route, navigation }) => {
  const { id_home } = route.params;
  const [revenueData, setRevenueData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);

  const fetchRevenueData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabaseDB
        .from('Invoice')
        .select('*')
        .eq('id_home', id_home)
        .gte('created_at', `${selectedYear}-01-01`)
        .lte('created_at', `${selectedYear}-12-31`);

      if (error) {
        console.error('Error fetching revenue data:', error);
        return;
      }

      // Khởi tạo mảng doanh thu cho 12 tháng
      const monthlyRevenue = Array(12).fill(0);
      const monthNames = [
        'T1', 'T2', 'T3', 'T4', 'T5', 'T6',
        'T7', 'T8', 'T9', 'T10', 'T11', 'T12'
      ];

      // Tính tổng doanh thu cho mỗi tháng
      data.forEach(invoice => {
        const date = new Date(invoice.created_at);
        const month = date.getMonth();
        monthlyRevenue[month] += parseFloat(invoice.total_amount || 0);
      });

      setRevenueData({
        labels: monthNames,
        datasets: [{ data: monthlyRevenue }],
      });
    } catch (error) {
      console.error('Error in fetchRevenueData:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [selectedYear, id_home]);

  const changeYear = (increment) => {
    setSelectedYear(prevYear => prevYear + increment);
  };

  // ₫ịnh dạng số tiền thành VND
  const formatMoney = (amount) => {
    try {
      // Làm tròn số về 0 chữ số thập phân và chuyển về string
      const roundedAmount = Math.round(amount).toString();
      
      // Thêm dấu phẩy ngăn cách hàng nghìn
      const formattedAmount = roundedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      
      return formattedAmount + ' ₫';
    } catch (error) {
      console.error('Error formatting money:', error);
      return '0 ₫';
    }
  };

  // ₫ịnh dạng label trục Y
  const formatYLabel = (value) => {
    // Thêm dấu phẩy ngăn cách hàng nghìn
    const millions = value / 1000000;
                if (millions >= 1) {
                  return millions.toFixed(1) + 'M';
                }
                const thousands = value / 1000;
                if (thousands >= 1) {
                  return Math.round(thousands) + 'K';
                }
                return Math.round(value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={24} color="#2C3E50" />
          <Text style={styles.headerTitle} allowFontScaling={false}>Biểu đồ Doanh Thu</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.yearSelector}>
        <TouchableOpacity onPress={() => changeYear(-1)}>
          <AntDesign name="leftcircle" size={24} color="#FF9999" />
        </TouchableOpacity>
        <Text style={styles.yearText} allowFontScaling={false}>{selectedYear}</Text>
        <TouchableOpacity onPress={() => changeYear(1)}>
          <AntDesign name="rightcircle" size={24} color="#FF9999" />
        </TouchableOpacity>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle} allowFontScaling={false}>Doanh Thu Theo Tháng (VNĐ)</Text>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <LineChart
            data={revenueData}
            width={Dimensions.get('window').width * 2}
            height={400}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#818CF8',
              },
              formatYLabel: (value) => {
                
                const millions = value / 1000000;
                if (millions >= 1) {
                  return millions.toFixed(1) + 'M';
                }
                const thousands = value / 1000;
                if (thousands >= 1) {
                  return Math.round(thousands) + 'K';
                }
                return Math.round(value);
              },
              propsForBackgroundLines: {
                strokeDasharray: '',
                strokeWidth: 1,
                stroke: "#E8ECF4",
              },
              propsForLabels: {
                fontSize: 12,
                fontWeight: 'bold',
              }
            }}
            formatYLabel={formatYLabel}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
            yLabelsOffset={10}
            withVerticalLines={true}
            withHorizontalLines={true}
            withDots={true}
            withShadow={false}
            withInnerLines={true}
            withOuterLines={true}
            fromZero={true}
            segments={5}
            // renderDotContent={({x, y, index}) => (
            //   <Text
            //     key={index}
            //     style={{
            //       position: 'absolute',
            //       top: y - 20,
            //       left: x - 30,
            //       width: 60,
            //       fontSize: 10,
            //       textAlign: 'center',
            //       color: '#2C3E50'
            //     }}
            //   >
            //     {new Intl.NumberFormat('vi-VN').format(revenueData.datasets[0].data[index])}
            //   </Text>
            // )}
          />
        </ScrollView>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel} allowFontScaling={false}>Tổng doanh thu năm:</Text>
          <Text style={styles.statValue} allowFontScaling={false}>
            {formatMoney(revenueData.datasets[0].data.reduce((a, b) => a + b, 0))}
          </Text>
        </View>
        <View style={[styles.statItem, { borderBottomWidth: 0 }]}>
          <Text style={styles.statLabel} allowFontScaling={false}>Doanh thu trung bình/tháng:</Text>
          <Text style={styles.statValue} allowFontScaling={false}>
            {formatMoney(revenueData.datasets[0].data.reduce((a, b) => a + b, 0) / 12)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: -20
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A237E",
    marginLeft: 15,
    marginTop: -2,
  },
  yearSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  yearText: {
    fontSize: 20,
    fontWeight: '700',
    marginHorizontal: 25,
    color: '#2C3E50',
    minWidth: 80,
    textAlign: 'center',
  },
  statsContainer: {
    marginTop: 10,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  statLabel: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  chartTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 10,
  }
});

export default ChartScreen; 