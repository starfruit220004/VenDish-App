import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  useColorScheme, 
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import api from '../../api/api'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth, Coupon } from '../context/AuthContext'; 
import FeedbackModal, { FeedbackAction, FeedbackVariant } from './FeedbackModal';
import { getTheme, spacing, typography, radii, layout, palette } from '../../constants/theme';

type DrawerParamList = {
  Tabs: undefined;
  Login: { redirect?: string; promoId?: string; promoTitle?: string };
  Signup: { redirect?: string; promoId?: string; promoTitle?: string };
  ForgotPassword: undefined;
};

type PromoNavigationProp = DrawerNavigationProp<DrawerParamList>;

export default function Promos() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = getTheme(isDark);
  const navigation = useNavigation<PromoNavigationProp>();
  
  const { isLoggedIn, userData, addToWallet, claimedCoupons, logout } = useAuth(); 

  // Per-user dismissed expired promos (persisted in AsyncStorage)
  const [dismissedPromoIds, setDismissedPromoIds] = useState<number[]>([]);

  const getDismissedKey = () => {
    if (!userData?.username) return null;
    return `dismissed_promos_${userData.username}`;
  };

  // Load dismissed IDs from AsyncStorage when user changes
  useEffect(() => {
    const loadDismissed = async () => {
      const key = getDismissedKey();
      if (!key) {
        setDismissedPromoIds([]);
        return;
      }
      try {
        const stored = await AsyncStorage.getItem(key);
        setDismissedPromoIds(stored ? JSON.parse(stored) : []);
      } catch {
        setDismissedPromoIds([]);
      }
    };
    loadDismissed();
  }, [userData?.username]);

  const dismissExpiredPromo = async (id: number) => {
    const updated = [...dismissedPromoIds, id];
    setDismissedPromoIds(updated);
    // Only hide from Promos UI — coupon wallet has its own X button
    const key = getDismissedKey();
    if (key) {
      await AsyncStorage.setItem(key, JSON.stringify(updated));
    }
  };

  const [promos, setPromos] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [claimModalVisible, setClaimModalVisible] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<Coupon | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    variant: FeedbackVariant;
    actions?: FeedbackAction[];
  }>({
    visible: false,
    title: '',
    message: '',
    variant: 'info',
  });

  const showFeedback = (
    title: string,
    message: string,
    variant: FeedbackVariant = 'info',
    actions?: FeedbackAction[]
  ) => {
    setFeedbackModal({ visible: true, title, message, variant, actions });
  };

  const closeFeedback = () => {
    setFeedbackModal(prev => ({ ...prev, visible: false }));
  };

  const fetchCoupons = async () => {
    try {
      const response = await api.get('/firstapp/coupons/'); 
      
      const formattedData = response.data.map((item: any) => ({
        ...item,
        status: item.status || 'Active', 
        description: item.description || `Enjoy this exclusive ${item.name} deal!`,
        terms: item.terms || 'Valid for dine-in only. One use per customer.',
        // ✅ FETCHING EXPIRATION: Map valid_to from criteria_details
        expiration: item.criteria_details?.valid_to || null 
      }))
      // .filter((item: any) => item.status !== 'Expired');

      setPromos(formattedData);
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCoupons();
  }, []);

  const handleClaimPromo = async (promo: Coupon) => {
    if (isLoggedIn) {
      try {
        // Token is automatically attached by the API interceptor
        await api.post(`/firstapp/coupons/${promo.id}/claim/`);

        // Update local state
        setPromos(prevPromos => 
          prevPromos.map(p => 
            p.id === promo.id ? { ...p, status: 'Claimed' as const } : p
          )
        );

        // Update Context
        const updatedPromo: Coupon = { ...promo, status: 'Claimed' };
        
        setSelectedPromo(updatedPromo);
        await addToWallet(updatedPromo);
        
        setClaimModalVisible(true);
    
      } catch (error: any) {
        console.error("Claim error:", error);
        
        if (error.response && error.response.status === 401) {
            logout(); 
            showFeedback('Session Expired', 'Please login again to claim this reward.', 'warning');
            return;
        }

        const errorMessage = error.response?.data?.error || "Unable to claim coupon. Please try again.";
        showFeedback('Error', errorMessage, 'error');
      }
    } else {
      setSelectedPromo(promo);
      setAuthModalVisible(true);
    }
  };

  const handleLoginPress = () => {
    setAuthModalVisible(false);
    if (selectedPromo) {
      navigation.navigate('Login', {
        redirect: 'promo-claim',
        promoId: selectedPromo.id.toString(),
        promoTitle: selectedPromo.product_name,
      });
    }
  };

  const handleSignupPress = () => {
    setAuthModalVisible(false);
    if (selectedPromo) {
      navigation.navigate('Signup', {
        redirect: 'promo-claim',
        promoId: selectedPromo.id.toString(),
        promoTitle: selectedPromo.product_name, 
      });
    }
  };

  // ✅ HELPER: Format Date
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'No Expiration';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'No Expiration';
    
    // Format: "Oct 25, 2024"
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatRate = (rate: any) => {
    if (!rate) return '';

    const str = String(rate).trim();

    if (str.toUpperCase() === 'FREE') return 'FREE ITEM';

    // Fixed amount (e.g. "₱50" or "₱50.00")
    if (str.includes('₱')) {
      const num = parseFloat(str.replace(/[^0-9.]/g, ''));
      return !isNaN(num) ? `₱${Math.trunc(num)} OFF` : `${str} OFF`;
    }

    // Percentage (e.g. "30%", "30.00%", or just "30")
    const num = parseFloat(str.replace(/[^0-9.]/g, ''));
    if (!isNaN(num)) {
      return `${Math.trunc(num)}% OFF`;
    }

    return `${str} OFF`;
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.scroll, { backgroundColor: theme.background }]} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.accent]} />
      }
    >
      <View style={styles.headerContainer}>
        <Text numberOfLines={1} style={[styles.header, { color: theme.accentText }]}>
          Available Promos
        </Text>
        <Text style={[styles.subheader, { color: theme.textMuted }]}>
          {isLoggedIn 
            ? `Welcome ${userData?.username || 'back'}! Tap to claim your exclusive deals!` 
            : 'Login or sign up to claim exclusive deals'}
        </Text>
      </View>

      {promos.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="ticket-outline" size={48} color={theme.textDisabled} />
          <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>No active promos</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>Check back soon for exclusive deals!</Text>
        </View>
      ) : (
        promos.filter(promo => !dismissedPromoIds.includes(promo.id)).map(promo => {
          const isLocallyClaimed = claimedCoupons.some(c => c.id === promo.id);
          const status = promo.status ? promo.status.toLowerCase() : 'active';

          const isRedeemed = status === 'redeemed';
          const isExpired = status === 'expired';
          const isClaimed = status === 'claimed' || isLocallyClaimed;
          const isUnavailable = isRedeemed || isClaimed || isExpired;

          let buttonText = 'Claim Now';
          let iconName: keyof typeof Ionicons.glyphMap = 'checkmark-circle-outline';

          if (isExpired) { buttonText = 'Expired'; iconName = 'time-sharp'; }
          else if (isRedeemed) { buttonText = 'Redeemed'; iconName = 'checkmark-circle-sharp'; }
          else if (isClaimed) { buttonText = 'Claimed'; iconName = 'checkmark-circle-sharp'; }
          else if (!isLoggedIn) { buttonText = 'Login to Claim'; iconName = 'lock-closed'; }

          return (
            <View
              key={promo.id}
              style={[
                styles.promoCard,
                { backgroundColor: theme.surface },
                theme.cardShadow,
                isExpired && { opacity: 0.6 },
              ]}
            >
              {isExpired && (
                <TouchableOpacity
                  style={styles.promoDismissBtn}
                  onPress={() => dismissExpiredPromo(promo.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={22} color={theme.textMuted} />
                </TouchableOpacity>
              )}

              <View style={[
                styles.discountBadge,
                { backgroundColor: isExpired ? theme.textMuted : theme.accent },
              ]}>
                <Text numberOfLines={1} style={styles.discountText}>
                  {isExpired ? 'EXPIRED' : formatRate(promo.rate)}
                </Text>
              </View>

              <View style={styles.promoInfo}>
                <Text style={[styles.promoTitle, { color: theme.accentText }]}>
                  {promo.product_name}
                </Text>

                <Text style={[styles.promoSubtitle, { color: theme.textPrimary }]}>
                  {promo.name}
                </Text>

                <Text style={[styles.promoDesc, { color: theme.textMuted }]}>
                  {promo.description}
                </Text>

                <View style={[styles.detailsContainer, { borderTopColor: theme.borderSubtle }]}>
                  <View style={styles.detailRow}>
                    <Ionicons name="information-circle-outline" size={15} color={theme.textMuted} />
                    <Text style={[styles.termsText, { color: theme.textMuted }]}>{promo.terms}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={15} color={theme.textMuted} />
                    <Text numberOfLines={1} style={[styles.expiryText, { color: theme.textMuted }]}>
                      {isExpired ? 'Expired on: ' : 'Expires: '}{formatDate(promo.expiration)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.claimButton,
                    { backgroundColor: isUnavailable ? theme.textDisabled : (!isLoggedIn ? theme.textMuted : theme.accent) },
                  ]}
                  onPress={() => !isUnavailable && handleClaimPromo(promo)}
                  activeOpacity={0.85}
                  disabled={isUnavailable}
                >
                  <Text numberOfLines={1} style={styles.claimButtonText}>{buttonText}</Text>
                  <Ionicons name={iconName} size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      {!isLoggedIn && (
        <View style={[styles.infoBanner, { backgroundColor: theme.surfaceElevated }, theme.cardShadow]}>
          <View style={[styles.infoBannerIconWrap, { backgroundColor: theme.accentSoft }]}>
            <Ionicons name="lock-closed" size={24} color={theme.accent} />
          </View>
          <View style={styles.infoBannerText}>
            <Text style={[styles.infoBannerTitle, { color: theme.accentText }]}>
              Account Required
            </Text>
            <Text style={[styles.infoBannerDesc, { color: theme.textMuted }]}>
              Create an account or log in to unlock exclusive deals!
            </Text>
          </View>
          <View style={styles.bannerButtonContainer}>
            <TouchableOpacity 
              style={[styles.loginBannerButton, { borderColor: theme.accent }]}
              onPress={() => navigation.navigate('Login', {})}
            >
              <Text style={[styles.loginBannerButtonText, { color: theme.accent }]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.signupBannerButton, { backgroundColor: theme.accent }]}
              onPress={() => navigation.navigate('Signup', {})}
            >
              <Text style={styles.signupBannerButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* ... Modals (keep existing modals) ... */}
      <Modal visible={authModalVisible} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.modalBox, { backgroundColor: theme.surface }, theme.cardShadowHeavy]}>
            <View style={[styles.modalIconWrap, { backgroundColor: theme.accentSoft }]}>
              <Ionicons name="lock-closed" size={28} color={theme.accent} />
            </View>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Account Required</Text>
            <Text style={[styles.modalText, { color: theme.textMuted }]}>
              You need an account to claim:{'\n\n'}
              <Text style={{ fontWeight: '700', color: theme.textPrimary }}>{selectedPromo?.product_name}</Text>
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { borderColor: theme.border }]}
                onPress={() => setAuthModalVisible(false)}
              >
                <Text style={[styles.modalCancelButtonText, { color: theme.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalActionButton, { backgroundColor: theme.accent }]}
                onPress={handleLoginPress}
              >
                <Text style={styles.modalActionButtonText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={claimModalVisible} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.modalBox, { backgroundColor: theme.surface }, theme.cardShadowHeavy]}>
            <View style={[styles.modalIconWrap, { backgroundColor: palette.successSoft }]}>
              <Ionicons name="checkmark-circle" size={32} color={palette.success} />
            </View>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Success!</Text>
            <Text style={[styles.modalText, { color: theme.textMuted }]}>
              You claimed the offer for:{'\n'}
              <Text style={{ fontWeight: '700', color: theme.textPrimary }}>{selectedPromo?.product_name}</Text>{'\n'}
              ({selectedPromo?.name})
            </Text>
            <Text style={[styles.modalText, { color: theme.textMuted }]}>Code: {selectedPromo?.code}</Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.accent }]}
              onPress={() => setClaimModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // ── Header ──────────────────────────────────────────
  headerContainer: { marginBottom: spacing['2xl'], alignItems: 'center' },
  header: { ...typography.displaySm, marginBottom: spacing.xs, textAlign: 'center' },
  subheader: { ...typography.bodyMd, textAlign: 'center', paddingHorizontal: spacing.md },

  // ── Promo Card ──────────────────────────────────────
  promoCard: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    position: 'relative' as const,
    paddingTop: spacing['4xl'],
  },
  discountBadge: {
    position: 'absolute' as const,
    top: spacing.lg,
    right: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.full,
    zIndex: 10,
  },
  discountText: { color: '#FFF', ...typography.labelMd, textAlign: 'center'},
  promoDismissBtn: { position: 'absolute' as const, top: spacing.sm, left: spacing.sm, zIndex: 20 },
  promoInfo: { padding: spacing.lg, paddingTop: spacing.sm },
  promoTitle: {
    ...typography.headingLg,
    marginBottom: spacing.xs,
    paddingRight: 80,
  },
  promoSubtitle: { ...typography.headingSm, marginBottom: spacing.sm },
  promoDesc: { ...typography.bodyMd, marginBottom: spacing.lg },
  detailsContainer: {
    marginBottom: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  detailRow: { flexDirection: 'row' as const, alignItems: 'center' as const, marginBottom: spacing.sm },
  termsText: { ...typography.bodySm, marginLeft: spacing.sm, flex: 1 },
  expiryText: { ...typography.bodySm, marginLeft: spacing.sm },
  claimButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    borderRadius: radii.lg,
  },
  claimButtonText: { ...typography.labelLg, color: '#FFF' },

  // ── Info Banner ─────────────────────────────────────
  infoBanner: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.xl,
    borderRadius: radii.xl,
    alignItems: 'center' as const,
  },
  infoBannerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: spacing.md,
  },
  infoBannerText: { alignItems: 'center' as const, marginBottom: spacing.lg },
  infoBannerTitle: { ...typography.headingMd, marginBottom: spacing.xs, textAlign: 'center' as const },
  infoBannerDesc: { ...typography.bodyMd, textAlign: 'center' as const },
  bannerButtonContainer: { flexDirection: 'row' as const, gap: spacing.md, width: '100%' },
  loginBannerButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1.5,
    alignItems: 'center' as const,
  },
  loginBannerButtonText: { ...typography.labelLg },
  signupBannerButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center' as const,
  },
  signupBannerButtonText: { color: '#FFF', ...typography.labelLg },

  // ── Modals ──────────────────────────────────────────
  modalOverlay: { flex: 1, justifyContent: 'center' as const, alignItems: 'center' as const },
  modalBox: {
    width: '85%',
    borderRadius: radii['2xl'],
    padding: spacing['3xl'],
    alignItems: 'center' as const,
  },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: spacing.lg,
  },
  modalTitle: { ...typography.headingLg, marginBottom: spacing.md, textAlign: 'center' as const },
  modalText: { ...typography.bodyLg, textAlign: 'center' as const, marginBottom: spacing.xl },
  modalButtonContainer: { width: '100%', gap: spacing.sm },
  modalCancelButton: {
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1.5,
    alignItems: 'center' as const,
  },
  modalCancelButtonText: { ...typography.labelLg },
  modalActionButton: { paddingVertical: spacing.md, borderRadius: radii.md, alignItems: 'center' as const },
  modalActionButtonText: { color: '#FFFFFF', ...typography.labelLg },
  modalButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['3xl'],
    borderRadius: radii.md,
    minWidth: 120,
  },
  modalButtonText: { color: '#FFFFFF', ...typography.labelLg, textAlign: 'center' as const },

  // ── Empty ───────────────────────────────────────────
  emptyState: {
    paddingVertical: spacing['5xl'],
    alignItems: 'center' as const,
    gap: spacing.sm,
  },
  emptyTitle: { ...typography.headingMd },
  emptySubtitle: { ...typography.bodyMd },
});