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

  // Định dạng số tiền thành VND
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

  // Định dạng label trục Y
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={26} color="#2C3E50" />
          <Text style={styles.headerTitle} allowFontScaling={false}>Biểu Đồ Doanh Thu</Text>
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
                console.log("Y-Axis Value");
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
    backgroundColor: '#F5F7FA',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 0,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 20,
    color: '#2C3E50',
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  yearText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginHorizontal: 25,
    color: '#000000',
    minWidth: 80,
    textAlign: 'center',
  },
  statsContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  statLabel: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9999',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    // padding: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  chartTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 15,
  }
});

export default ChartScreen; 