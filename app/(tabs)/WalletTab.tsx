import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTheme, spacing, typography, radii, palette } from '../../constants/theme';
import { useAuth, Coupon } from '../context/AuthContext';
import FeedbackModal from './FeedbackModal';

// Utility function to calculate exact days remaining
const getDaysRemainingText = (dateString?: string) => {
  if (!dateString) return null;
  
  const expDate = new Date(dateString);
  const now = new Date();
  
  // Strip time values to do a strict day-by-day comparison
  const utcExp = Date.UTC(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());
  const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffDays = Math.floor((utcExp - utcNow) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return null; // Already passed (handled by isExpired state)
  if (diffDays === 0) return 'Expires today!';
  if (diffDays === 1) return 'Expires tomorrow!';
  return `Expires in ${diffDays} days`;
};

export default function WalletTab() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = getTheme(isDark);

  const {
    isLoggedIn,
    isAuthLoading,
    claimedCoupons,
    removeFromWallet,
    fetchMyCoupons,
    isCouponRefreshing,
  } = useAuth();

  const [posModalVisible, setPosModalVisible] = useState(false);
  const [selectedPosCoupon, setSelectedPosCoupon] = useState<Coupon | null>(null);
  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    title: '',
    message: '',
    variant: 'info' as any,
    actions: [] as any[],
  });

  const showFeedback = (title: string, message: string, variant: 'info' | 'success' | 'warning' | 'error' = 'info', actions: any[] = []) => {
    setFeedbackModal({ visible: true, title, message, variant, actions });
  };

  const closeFeedback = () => {
    setFeedbackModal(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchMyCoupons(false);
    }
  }, [isLoggedIn, fetchMyCoupons]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleRemoveCoupon = (couponId: number) => {
    showFeedback(
      'Remove Coupon',
      'Are you sure you want to remove this coupon from your wallet?',
      'warning',
      [
        { label: 'Cancel', style: 'secondary' },
        { label: 'Remove', style: 'danger', onPress: async () => { await removeFromWallet(couponId); } },
      ]
    );
  };

  const openPosModal = (item: Coupon) => {
    setSelectedPosCoupon(item);
    setPosModalVisible(true);
  };

  const renderCouponItem = ({ item }: { item: Coupon }) => {
    const isRedeemed = item.status === 'Redeemed';
    const isExpired = item.status === 'Expired';
    const isDisabled = isRedeemed || isExpired;

    const buttonLabel = isRedeemed ? 'USED' : isExpired ? 'EXPIRED' : 'USE NOW';
    const buttonBg = isRedeemed ? theme.textDisabled : isExpired ? theme.textMuted : theme.accent;
    
    // Determine countdown string
    const daysRemainingText = !isDisabled ? getDaysRemainingText(item.expiration) : null;

    return (
      <View style={[styles.couponItem, { backgroundColor: theme.surfaceElevated, opacity: isDisabled ? 0.65 : 1 }, theme.cardShadow]}>
        {isDisabled && (
          <TouchableOpacity
            style={styles.dismissBtn}
            onPress={() => handleRemoveCoupon(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={24} color={theme.textMuted} />
          </TouchableOpacity>
        )}

        <View style={styles.couponLeft}>
          <Text style={[styles.couponProduct, { color: theme.accentText }]}>{item.product_name}</Text>
          <Text style={[styles.couponName, { color: theme.textSecondary }]}>{item.name}</Text>
          <Text style={[styles.couponCode, { color: theme.textMuted }]}>Discount: <Text style={{ fontWeight: '700' }}>{item.rate === 'FREE' ? 'FREE ITEM' : `${item.rate} OFF`}</Text></Text>
          
          {item.expiration && (
             <View style={{ marginTop: spacing.xxs }}>
               <Text style={[typography.caption, { color: theme.textDisabled }]}>
                  Expires: {formatDate(item.expiration)}
               </Text>
               {/* ⏳ Days Remaining Counter */}
               {daysRemainingText && (
                 <Text style={[typography.caption, { color: palette?.warning || theme.accentText, fontWeight: '700', marginTop: 2 }]}>
                    ⏳ {daysRemainingText}
                 </Text>
               )}
             </View>
          )}

          {isRedeemed && <Text style={[typography.caption, { color: theme.textMuted, marginTop: spacing.xxs, fontWeight: '700' }]}>STATUS: REDEEMED</Text>}
          {isExpired && <Text style={[typography.caption, { color: palette.warning, marginTop: spacing.xxs, fontWeight: '700' }]}>STATUS: EXPIRED</Text>}
        </View>
        <View style={styles.couponRight}>
           <TouchableOpacity 
              style={[styles.useBtn, { backgroundColor: buttonBg }]} 
              onPress={() => !isDisabled && openPosModal(item)}
              disabled={isDisabled}
              activeOpacity={0.85}
           >
              <Text style={styles.useBtnText}>{buttonLabel}</Text>
           </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!isLoggedIn) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: isDark ? theme.background : 'transparent' }]}>
        <Ionicons name="wallet-outline" size={64} color={theme.textDisabled} />
        <Text numberOfLines={1} style={[styles.emptyTitle, { color: theme.textSecondary, marginTop: spacing.md }]}>Login Required</Text>
        <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>Please login to view your wallet.</Text>
      </View>
    );
  }

  if (isAuthLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: isDark ? theme.background : 'transparent' }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? theme.background : 'transparent' }]}>
      {claimedCoupons.length === 0 ? (
          <View style={styles.emptyWallet}>
                <Ionicons name="ticket-outline" size={48} color={theme.textDisabled} />
                <Text style={[typography.bodyMd, { color: theme.textMuted, marginTop: spacing.md }]}>No coupons collected yet.</Text>
          </View>
      ) : (
          <FlatList 
              data={claimedCoupons}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderCouponItem}
              contentContainerStyle={{ padding: spacing.lg }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                  <RefreshControl 
                      refreshing={isCouponRefreshing} 
                      onRefresh={() => fetchMyCoupons(true)} 
                      colors={[theme.accent]} 
                  />
              }
          />
      )}

      {/* POS Redemption Modal */}
      <Modal
        visible={posModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setPosModalVisible(false)}
      >
        <View style={styles.posModalOverlay}>
            <View style={[styles.posModalBox, { backgroundColor: theme.surface }, theme.cardShadowHeavy]}>
                <Text style={[styles.posModalTitle, { color: theme.textPrimary }]}>POS REDEMPTION</Text>
                <Text style={[typography.bodySm, { color: theme.textMuted, marginBottom: spacing.xl }]}>Show this screen to the cashier</Text>

                <View style={[styles.posCodeContainer, { backgroundColor: isDark ? theme.surfaceElevated : '#F9F9F9', borderColor: theme.borderSubtle }]}>
                    <Text style={[styles.posProductText, { color: theme.textPrimary }]}>{selectedPosCoupon?.product_name}</Text>
                    <Text style={[styles.posDiscountText, { color: theme.accent }]}>{selectedPosCoupon?.rate === 'FREE' ? 'FREE ITEM' : `${selectedPosCoupon?.rate} OFF`}</Text>
                    
                    <View style={[styles.dashedLine, { backgroundColor: theme.borderSubtle }]} />
                    
                    <Text style={[styles.posLabel, { color: theme.textDisabled }]}>COUPON CODE</Text>
                    <Text style={[styles.posCodeText, { color: theme.textPrimary }]}>{selectedPosCoupon?.code}</Text>
                </View>

                <TouchableOpacity 
                    style={[styles.posDoneBtn, { backgroundColor: theme.accent }]} 
                    onPress={() => setPosModalVisible(false)}
                >
                    <Text style={styles.posDoneBtnText}>DONE</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

      <FeedbackModal
        visible={feedbackModal.visible}
        title={feedbackModal.title}
        message={feedbackModal.message}
        variant={feedbackModal.variant}
        actions={feedbackModal.actions}
        onClose={closeFeedback}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { ...typography.headingSm },
  emptySubtitle: { ...typography.bodyMd, textAlign: 'center' },
  emptyWallet: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  couponItem: {
    flexDirection: 'row', borderRadius: radii.xl, marginBottom: spacing.md,
    padding: spacing.md, alignItems: 'center',
  },
  couponLeft: { flex: 1 },
  couponProduct: { ...typography.labelLg, marginBottom: 2 },
  couponName: { ...typography.bodyMd, marginBottom: spacing.xxs },
  couponCode: { ...typography.caption },
  couponRight: { alignItems: 'center', justifyContent: 'center', marginLeft: spacing.md },
  useBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radii.md },
  useBtnText: { color: '#FFF', ...typography.labelSm },
  dismissBtn: { position: 'absolute' as const, top: spacing.sm, right: spacing.sm, zIndex: 10 },

  posModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  posModalBox: { width: '100%', borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center' },
  posModalTitle: { ...typography.headingMd, marginBottom: spacing.xs, letterSpacing: 1 },
  posCodeContainer: { width: '100%', borderWidth: 2, borderStyle: 'dashed', borderRadius: radii.lg, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.xl },
  posProductText: { ...typography.labelLg, textAlign: 'center', marginBottom: spacing.xs },
  posDiscountText: { ...typography.headingLg, textAlign: 'center' },
  dashedLine: { width: '100%', height: 1, marginVertical: spacing.lg },
  posLabel: { ...typography.labelSm, marginBottom: spacing.xs, letterSpacing: 1 },
  posCodeText: { ...typography.headingMd, letterSpacing: 2, textAlign: 'center' },
  posDoneBtn: { width: '100%', paddingVertical: spacing.lg, borderRadius: radii.lg, alignItems: 'center' },
  posDoneBtnText: { color: '#FFF', ...typography.labelLg },
});