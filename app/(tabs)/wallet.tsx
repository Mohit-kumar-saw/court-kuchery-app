import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppColors } from '@/constants/theme';
import { walletService } from '@/services/walletService';

type Transaction = {
  _id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  reason: string;
  createdAt: string;
};

export default function WalletScreen() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [rechargeLoading, setRechargeLoading] = useState(false);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const balanceData = await walletService.getBalance();
      const txnData = await walletService.getTransactions();

      setBalance(balanceData.balance);
      setTransactions(txnData.transactions || txnData);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleRecharge = async () => {
    const amount = Number(rechargeAmount);

    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount');
      return;
    }

    try {
      setRechargeLoading(true);
      await walletService.recharge(amount);

      setModalVisible(false);
      setRechargeAmount('');

      await fetchWallet(); // refresh wallet
      Alert.alert('Recharge Successful');
    } catch (error) {
      Alert.alert('Recharge Failed');
    } finally {
      setRechargeLoading(false);
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isCredit = item.type === 'CREDIT';

    return (
      <View style={styles.txnItem}>
        <View>
          <Text style={styles.txnReason}>{item.reason}</Text>
          <Text style={styles.txnDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <Text
          style={[
            styles.txnAmount,
            { color: isCredit ? 'green' : 'red' },
          ]}
        >
          {isCredit ? '+' : '-'} ₹ {item.amount.toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>

        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.balanceAmount}>
            ₹ {balance.toFixed(2)}
          </Text>
        )}

        <TouchableOpacity
          style={styles.addMoneyBtn}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addMoneyText}>Add Money</Text>
        </TouchableOpacity>
      </View>

      {/* Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>

        {loading ? (
          <ActivityIndicator />
        ) : transactions.length === 0 ? (
          <Text>No transactions yet</Text>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item._id}
            renderItem={renderTransaction}
          />
        )}
      </View>

      {/* Recharge Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Enter Amount</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              keyboardType="numeric"
              value={rechargeAmount}
              onChangeText={setRechargeAmount}
            />

            <TouchableOpacity
              style={styles.rechargeBtn}
              onPress={handleRecharge}
              disabled={rechargeLoading}
            >
              {rechargeLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.rechargeText}>Recharge</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.cancelBtn}
            >
              <Text style={{ color: 'red' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },

  balanceCard: {
    margin: 16,
    backgroundColor: AppColors.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },

  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },

  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: AppColors.white,
    marginBottom: 20,
  },

  addMoneyBtn: {
    backgroundColor: AppColors.white,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },

  addMoneyText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.primary,
  },

  section: { flex: 1, padding: 16 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },

  txnItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  txnReason: { fontWeight: '600' },
  txnDate: { fontSize: 12, color: '#777' },
  txnAmount: { fontWeight: '700' },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  modalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 24,
    borderRadius: 16,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },

  rechargeBtn: {
    backgroundColor: AppColors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  rechargeText: {
    color: '#fff',
    fontWeight: '600',
  },

  cancelBtn: {
    alignItems: 'center',
    marginTop: 12,
  },
});
