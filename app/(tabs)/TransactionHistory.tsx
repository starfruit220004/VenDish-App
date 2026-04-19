import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import api from '../../api/api';
import { getTheme, radii, spacing, typography } from '../../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useReviews } from './ReviewsContext';

type ApiReceiptItem = {
  id: number;
  product?: number | null;
  product_name?: string;
  price?: number | string;
  quantity?: number;
  subtotal?: number | string;
};

type ApiReceiptCoupon = {
  id: number;
  code?: string;
  name?: string;
};

type ApiReceipt = {
  id: number;
  subtotal?: number | string;
  vat?: number | string;
  total?: number | string;
  created_at?: string;
  payment_method?: string;
  payment_status?: string;
  status?: string;
  cashier_name?: string;
  void_reason?: string | null;
  items?: ApiReceiptItem[];
  coupon_details?: ApiReceiptCoupon[];
};

type ReviewableFoodItem = {
  key: string;
  productId: number;
  productName: string;
  quantity: number;
};

const normalizeUsername = (value?: string | null): string => String(value || '').trim().toLowerCase();

const toNumber = (value: unknown): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseDateMs = (value?: string): number => {
  if (!value) return 0;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : 0;
};

const extractArrayPayload = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (value && typeof value === 'object') {
    const results = (value as { results?: unknown }).results;
    if (Array.isArray(results)) {
      return results as T[];
    }
  }

  return [];
};

const formatCurrency = (value: unknown): string => {
  const safe = toNumber(value);
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe);
};

const formatDateTime = (value?: string): string => {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return date.toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusColors = (status: string) => {
  if (status === 'VOIDED') {
    return {
      bg: '#FEE2E2',
      text: '#B91C1C',
    };
  }

  if (status === 'COMPLETED') {
    return {
      bg: '#DCFCE7',
      text: '#166534',
    };
  }

  return {
    bg: '#E5E7EB',
    text: '#374151',
  };
};

export default function TransactionHistory() {
  const navigation = useNavigation<any>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = getTheme(isDark);
  const { isLoggedIn, isAuthLoading, userData } = useAuth();
  const { foodReviews, shopReviews, refreshReviews } = useReviews();

  const [transactions, setTransactions] = useState<ApiReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [foodPickerTransaction, setFoodPickerTransaction] = useState<ApiReceipt | null>(null);
  const requestCounterRef = useRef(0);
  const activeUsernameRef = useRef('');
  const currentUsername = useMemo(() => normalizeUsername(userData?.username), [userData?.username]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingLeft: 16, paddingVertical: 4 }}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const fetchTransactions = useCallback(async (showRefresh = false) => {
    const usernameSnapshot = currentUsername;
    const requestId = ++requestCounterRef.current;

    if (!isLoggedIn || !usernameSnapshot) {
      setTransactions([]);
      setErrorMessage('');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMessage('');

    try {
      const response = await api.get('/firstapp/receipt/my-transactions/');

      // Ignore stale responses from previous users or previous requests.
      if (requestId !== requestCounterRef.current || activeUsernameRef.current !== usernameSnapshot) {
        return;
      }

      const rows = extractArrayPayload<ApiReceipt>(response.data).sort(
        (left, right) => parseDateMs(right.created_at) - parseDateMs(left.created_at)
      );
      setTransactions(rows);
    } catch (error) {
      if (requestId !== requestCounterRef.current || activeUsernameRef.current !== usernameSnapshot) {
        return;
      }

      console.error('Failed to fetch POS transaction history:', error);
      setErrorMessage('Unable to load your POS transactions right now. Please try again.');
      setTransactions([]);
    } finally {
      if (requestId === requestCounterRef.current && activeUsernameRef.current === usernameSnapshot) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [currentUsername, isLoggedIn]);

  useEffect(() => {
    activeUsernameRef.current = currentUsername;
  }, [currentUsername]);

  useEffect(() => {
    if (!isLoggedIn || !currentUsername) {
      requestCounterRef.current += 1;
      setTransactions([]);
      setErrorMessage('');
      setLoading(false);
      setRefreshing(false);
      setFoodPickerTransaction(null);
      return;
    }

    fetchTransactions();
    void refreshReviews();
  }, [currentUsername, fetchTransactions, isLoggedIn, refreshReviews]);

  useFocusEffect(
    useCallback(() => {
      if (!isLoggedIn || !currentUsername || isAuthLoading) {
        return;
      }
      fetchTransactions();
    }, [currentUsername, fetchTransactions, isAuthLoading, isLoggedIn])
  );

  const hasReviewedFoodItem = useCallback(
    (productId: number) => {
      if (!currentUsername || productId <= 0) {
        return false;
      }

      return foodReviews.some(
        (review) => review.foodId === productId && normalizeUsername(review.username) === currentUsername
      );
    },
    [foodReviews, currentUsername]
  );

  const hasShopReviewToday = useMemo(() => {
    if (!currentUsername) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();

    return shopReviews.some((review) => {
      if (normalizeUsername(review.username) !== currentUsername) {
        return false;
      }

      const reviewDate = new Date(review.timestamp);
      reviewDate.setHours(0, 0, 0, 0);
      return reviewDate.getTime() === todayMs;
    });
  }, [shopReviews, currentUsername]);

  const completedCount = useMemo(() => {
    return transactions.filter((entry) => String(entry.status || '').toUpperCase() === 'COMPLETED').length;
  }, [transactions]);

  const totalCompletedSpend = useMemo(() => {
    return transactions.reduce((sum, entry) => {
      if (String(entry.status || '').toUpperCase() !== 'COMPLETED') {
        return sum;
      }
      return sum + toNumber(entry.total);
    }, 0);
  }, [transactions]);

  const onRefresh = useCallback(() => {
    fetchTransactions(true);
  }, [fetchTransactions]);

  const handleReviewShop = useCallback(() => {
    navigation.navigate(
      'Tabs',
      {
        screen: 'ShopReviews',
        params: {
          screen: 'WriteShopReview',
        },
      } as any
    );
  }, [navigation]);

  const getReviewableFoodItems = useCallback((transaction: ApiReceipt): ReviewableFoodItem[] => {
    const lineItems = Array.isArray(transaction.items) ? transaction.items : [];
    const itemMap = new Map<number, ReviewableFoodItem>();

    lineItems.forEach((line) => {
      const productId = Math.trunc(toNumber(line.product));
      if (!Number.isFinite(productId) || productId <= 0) {
        return;
      }

      const quantity = Math.max(1, Math.trunc(toNumber(line.quantity) || 1));
      const productName = String(line.product_name || 'Food Item').trim() || 'Food Item';

      if (!itemMap.has(productId)) {
        itemMap.set(productId, {
          key: `${transaction.id}-${productId}`,
          productId,
          productName,
          quantity,
        });
        return;
      }

      const existing = itemMap.get(productId);
      if (!existing) {
        return;
      }

      itemMap.set(productId, {
        ...existing,
        quantity: existing.quantity + quantity,
      });
    });

    return [...itemMap.values()];
  }, []);

  const selectedReviewableItems = useMemo(() => {
    if (!foodPickerTransaction) {
      return [];
    }
    return getReviewableFoodItems(foodPickerTransaction);
  }, [foodPickerTransaction, getReviewableFoodItems]);

  const openFoodPicker = useCallback((transaction: ApiReceipt) => {
    setFoodPickerTransaction(transaction);
  }, []);

  const closeFoodPicker = useCallback(() => {
    setFoodPickerTransaction(null);
  }, []);

  const handleReviewFoodItem = useCallback(
    (transaction: ApiReceipt, foodItem: ReviewableFoodItem) => {
      closeFoodPicker();

      navigation.navigate(
        'Tabs',
        {
          screen: 'Feed',
          params: {
            screen: 'WriteReview',
            params: {
              food: {
                id: foodItem.productId,
                name: foodItem.productName,
                description: `Review from Receipt #${transaction.id}`,
                image: require('../../assets/images/Logo2.jpg'),
                category: 'Food',
              },
            },
          },
        } as any
      );
    },
    [closeFoodPicker, navigation]
  );

  const renderTransaction = ({ item }: { item: ApiReceipt }) => {
    const statusCode = String(item.status || 'UNKNOWN').toUpperCase();
    const statusColors = getStatusColors(statusCode);
    const paymentMethod = String(item.payment_method || 'UNKNOWN').toUpperCase();
    const paymentStatus = String(item.payment_status || 'UNKNOWN').toUpperCase();
    const lineItems = Array.isArray(item.items) ? item.items : [];
    const coupons = Array.isArray(item.coupon_details) ? item.coupon_details : [];
    const reviewableFoodItems = getReviewableFoodItems(item);
    const canReviewTransaction = statusCode === 'COMPLETED';
    const unreviewedFoodItems = reviewableFoodItems.filter(
      (foodItem) => !hasReviewedFoodItem(foodItem.productId)
    );
    const allFoodItemsReviewed = reviewableFoodItems.length > 0 && unreviewedFoodItems.length === 0;
    const canReviewFoodItems = canReviewTransaction && unreviewedFoodItems.length > 0;
    const canReviewShop = canReviewTransaction && !hasShopReviewToday;

    return (
      <View style={[styles.card, { backgroundColor: theme.surface }, theme.cardShadow]}>
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.receiptId, { color: theme.textPrimary }]}>Receipt #{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}> 
            <Text style={[styles.statusText, { color: statusColors.text }]}>{statusCode}</Text>
          </View>
        </View>

        <Text style={[styles.cardDate, { color: theme.textMuted }]}>{formatDateTime(item.created_at)}</Text>

        <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

        <View style={styles.rowBetween}>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Total Amount</Text>
          <Text style={[styles.metricValue, { color: theme.accent }]}>{formatCurrency(item.total)}</Text>
        </View>

        <View style={styles.metaRowWrap}>
          <View style={[styles.metaPill, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
            <Ionicons name="wallet-outline" size={13} color={theme.textMuted} />
            <Text style={[styles.metaPillText, { color: theme.textSecondary }]}>{paymentMethod}</Text>
          </View>
          <View style={[styles.metaPill, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
            <Ionicons name="checkmark-done-outline" size={13} color={theme.textMuted} />
            <Text style={[styles.metaPillText, { color: theme.textSecondary }]}>{paymentStatus}</Text>
          </View>
          <View style={[styles.metaPill, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
            <Ionicons name="person-outline" size={13} color={theme.textMuted} />
            <Text style={[styles.metaPillText, { color: theme.textSecondary }]}>{item.cashier_name || 'Cashier'}</Text>
          </View>
        </View>

        <View style={[styles.lineItemsWrap, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}> 
          <Text style={[styles.sectionMiniTitle, { color: theme.textSecondary }]}>Items</Text>

          {lineItems.length === 0 ? (
            <Text style={[styles.emptyLineItems, { color: theme.textMuted }]}>No item details recorded.</Text>
          ) : (
            lineItems.map((line) => {
              const quantity = Math.max(0, Number(line.quantity || 0));
              const itemName = String(line.product_name || 'Unknown item').trim() || 'Unknown item';
              const fallbackSubtotal = toNumber(line.price) * quantity;
              const subtotal = line.subtotal ?? fallbackSubtotal;

              return (
                <View key={`${item.id}-${line.id}`} style={styles.rowBetween}>
                  <Text style={[styles.itemName, { color: theme.textPrimary }]}>
                    {quantity}x {itemName}
                  </Text>
                  <Text style={[styles.itemSubtotal, { color: theme.textSecondary }]}>{formatCurrency(subtotal)}</Text>
                </View>
              );
            })
          )}
        </View>

        {coupons.length > 0 && (
          <View style={styles.couponWrap}>
            <Ionicons name="pricetag-outline" size={14} color={theme.accent} />
            <Text style={[styles.couponText, { color: theme.accent }]}> 
              Coupons Used: {coupons.map((coupon) => coupon.code || coupon.name || `#${coupon.id}`).join(', ')}
            </Text>
          </View>
        )}

        {statusCode === 'VOIDED' && item.void_reason ? (
          <View style={[styles.voidNoteWrap, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}> 
            <Ionicons name="alert-circle-outline" size={14} color="#B91C1C" />
            <Text style={styles.voidNoteText}>Voided: {item.void_reason}</Text>
          </View>
        ) : null}

        <View style={styles.reviewActionsWrap}>
          <Text style={[styles.sectionMiniTitle, { color: theme.textSecondary }]}>Leave a Review</Text>

          <View style={styles.reviewActionsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleReviewShop}
              disabled={!canReviewShop}
              style={[
                styles.reviewButton,
                {
                  backgroundColor: theme.accentSoft,
                  borderColor: theme.borderSubtle,
                },
                !canReviewShop && styles.reviewButtonDisabled,
              ]}
            >
              <Ionicons name="chatbubbles-outline" size={16} color={canReviewShop ? theme.accent : theme.textMuted} />
              <Text style={[styles.reviewButtonText, { color: canReviewShop ? theme.accent : theme.textMuted }]}>
                {canReviewTransaction && hasShopReviewToday ? 'Reviewed Today' : 'Review Shop'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => openFoodPicker(item)}
              disabled={!canReviewFoodItems}
              style={[
                styles.reviewButton,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.borderSubtle,
                },
                !canReviewFoodItems && styles.reviewButtonDisabled,
              ]}
            >
              <Ionicons name="restaurant-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.reviewButtonText, { color: theme.textSecondary }]}>
                {allFoodItemsReviewed ? 'Food Reviewed' : 'Review Food(s)'}
              </Text>
            </TouchableOpacity>
          </View>

          {!canReviewTransaction && (
            <Text style={[styles.reviewHintText, { color: theme.textMuted }]}>
              Reviews are available for completed transactions only.
            </Text>
          )}

          {canReviewTransaction && hasShopReviewToday && (
            <Text style={[styles.reviewHintText, { color: theme.textMuted }]}>
              You already submitted a shop review today.
            </Text>
          )}

          {canReviewTransaction && reviewableFoodItems.length === 0 && (
            <Text style={[styles.reviewHintText, { color: theme.textMuted }]}>
              No reviewable food items found for this receipt.
            </Text>
          )}

          {canReviewTransaction && allFoodItemsReviewed && (
            <Text style={[styles.reviewHintText, { color: theme.textMuted }]}>
              You already reviewed all food items from this receipt.
            </Text>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: isDark ? theme.background : 'transparent' }]}> 
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.textMuted }]}>Loading transaction history...</Text>
      </View>
    );
  }

  if (errorMessage && transactions.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: isDark ? theme.background : 'transparent', paddingHorizontal: spacing['2xl'] }]}> 
        <Ionicons name="cloud-offline-outline" size={46} color={theme.textDisabled} />
        <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>Unable to Load Transactions</Text>
        <Text style={[styles.errorBody, { color: theme.textMuted }]}>{errorMessage}</Text>
        <TouchableOpacity
          onPress={() => fetchTransactions()}
          style={[styles.retryButton, { backgroundColor: theme.accent }]}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? theme.background : 'transparent' }]}> 
      <FlatList
        data={transactions}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderTransaction}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.accent]} />}
        ListHeaderComponent={
          <View style={[styles.summaryCard, { backgroundColor: theme.surface }, theme.cardShadow]}>
            <Text style={[styles.summaryTitle, { color: theme.textPrimary }]}>Your POS Transaction History</Text>

            <View style={styles.summaryGrid}>
              <View style={[styles.summaryMetric, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}> 
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>All Transactions</Text>
                <Text style={[styles.summaryMetricValue, { color: theme.textPrimary }]}>{transactions.length}</Text>
              </View>
              <View style={[styles.summaryMetric, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}> 
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Completed</Text>
                <Text style={[styles.summaryMetricValue, { color: '#166534' }]}>{completedCount}</Text>
              </View>
            </View>

            <View style={[styles.totalSpendWrap, { backgroundColor: theme.accentSoft, borderColor: theme.borderSubtle }]}> 
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Total Completed Spend</Text>
              <Text style={[styles.totalSpendValue, { color: theme.accent }]}>{formatCurrency(totalCompletedSpend)}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={54} color={theme.textDisabled} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No transactions yet</Text>
            <Text style={[styles.emptyBody, { color: theme.textMuted }]}>Ask the cashier to select your account during checkout so your purchases are recorded here.</Text>
          </View>
        }
      />

      <Modal
        visible={Boolean(foodPickerTransaction)}
        transparent
        animationType="fade"
        onRequestClose={closeFoodPicker}
      >
        <View style={[styles.foodPickerOverlay, { backgroundColor: theme.modalOverlay }]}> 
          <View style={[styles.foodPickerCard, { backgroundColor: theme.surface }, theme.cardShadowHeavy]}> 
            <Text style={[styles.foodPickerTitle, { color: theme.textPrimary }]}>Choose Food to Review</Text>
            <Text style={[styles.foodPickerSubtitle, { color: theme.textMuted }]}> 
              Receipt #{foodPickerTransaction?.id}
            </Text>

            <View style={styles.foodPickerList}>
              {selectedReviewableItems.length === 0 ? (
                <Text style={[styles.reviewHintText, { color: theme.textMuted }]}>
                  No reviewable food items found for this receipt.
                </Text>
              ) : (
                selectedReviewableItems.map((foodItem) => {
                  const isFoodReviewed = hasReviewedFoodItem(foodItem.productId);

                  return (
                    <TouchableOpacity
                      key={foodItem.key}
                      activeOpacity={0.85}
                      disabled={isFoodReviewed}
                      onPress={() => {
                        if (!foodPickerTransaction) return;
                        handleReviewFoodItem(foodPickerTransaction, foodItem);
                      }}
                      style={[
                        styles.foodPickerItemButton,
                        {
                          backgroundColor: theme.surfaceElevated,
                          borderColor: theme.borderSubtle,
                        },
                        isFoodReviewed && styles.foodPickerItemButtonDisabled,
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} style={[styles.foodPickerItemName, { color: theme.textPrimary }]}> 
                          {foodItem.productName}
                        </Text>
                        <Text style={[styles.foodPickerItemMeta, { color: theme.textMuted }]}> 
                          Ordered Qty: {foodItem.quantity}
                        </Text>
                      </View>

                      {isFoodReviewed ? (
                        <View style={[styles.reviewedBadge, { backgroundColor: theme.accentSoft }]}> 
                          <Ionicons name="checkmark-circle" size={14} color={theme.accent} />
                          <Text style={[styles.reviewedBadgeText, { color: theme.accent }]}>Reviewed</Text>
                        </View>
                      ) : (
                        <Ionicons name="create-outline" size={18} color={theme.accent} />
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={closeFoodPicker}
              style={[styles.foodPickerCloseButton, { borderColor: theme.borderSubtle }]}
            >
              <Text style={[styles.foodPickerCloseText, { color: theme.textSecondary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodyMd,
    marginTop: spacing.md,
  },
  errorTitle: {
    ...typography.headingMd,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  errorBody: {
    ...typography.bodyMd,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.lg,
    borderRadius: radii.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  retryButtonText: {
    color: '#FFF',
    ...typography.labelMd,
  },
  summaryCard: {
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    ...typography.headingMd,
    marginBottom: spacing.md,
  },
  summarySubtitle: {
    ...typography.bodySm,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryMetric: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  summaryMetricValue: {
    ...typography.headingMd,
    marginTop: spacing.xs,
  },
  totalSpendWrap: {
    marginTop: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  totalSpendValue: {
    ...typography.headingLg,
    marginTop: spacing.xs,
  },
  card: {
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  receiptId: {
    ...typography.headingSm,
  },
  statusBadge: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  statusText: {
    ...typography.labelSm,
    letterSpacing: 0.7,
  },
  cardDate: {
    ...typography.bodySm,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    marginVertical: spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metricLabel: {
    ...typography.bodySm,
  },
  metricValue: {
    ...typography.headingMd,
  },
  metaRowWrap: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  metaPillText: {
    ...typography.labelMd,
  },
  lineItemsWrap: {
    marginTop: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  sectionMiniTitle: {
    ...typography.labelMd,
    marginBottom: spacing.xxs,
  },
  emptyLineItems: {
    ...typography.bodySm,
  },
  itemName: {
    ...typography.bodySm,
    flex: 1,
  },
  itemSubtotal: {
    ...typography.bodySm,
    fontWeight: '600',
  },
  couponWrap: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  couponText: {
    ...typography.bodySm,
    flex: 1,
  },
  voidNoteWrap: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  voidNoteText: {
    ...typography.bodySm,
    color: '#B91C1C',
    flex: 1,
  },
  reviewActionsWrap: {
    marginTop: spacing.md,
  },
  reviewActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  reviewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  reviewButtonDisabled: {
    opacity: 0.45,
  },
  reviewButtonText: {
    ...typography.labelMd,
  },
  reviewHintText: {
    ...typography.bodySm,
    marginTop: spacing.xs,
  },
  foodPickerOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  foodPickerCard: {
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  foodPickerTitle: {
    ...typography.headingMd,
  },
  foodPickerSubtitle: {
    ...typography.bodySm,
    marginTop: spacing.xxs,
    marginBottom: spacing.md,
  },
  foodPickerList: {
    gap: spacing.sm,
  },
  foodPickerItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  foodPickerItemButtonDisabled: {
    opacity: 0.6,
  },
  foodPickerItemName: {
    ...typography.bodyMd,
    fontWeight: '600',
  },
  foodPickerItemMeta: {
    ...typography.bodySm,
  },
  reviewedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  reviewedBadgeText: {
    ...typography.labelSm,
  },
  foodPickerCloseButton: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  foodPickerCloseText: {
    ...typography.labelMd,
  },
  emptyState: {
    marginTop: spacing['5xl'],
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    gap: spacing.sm,
  },
  emptyTitle: {
    ...typography.headingMd,
    marginTop: spacing.sm,
  },
  emptyBody: {
    ...typography.bodyMd,
    textAlign: 'center',
  },
});
