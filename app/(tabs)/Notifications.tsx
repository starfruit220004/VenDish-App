import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, TouchableOpacity, FlatList, 
  StyleSheet, useColorScheme, ActivityIndicator, RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/api';
import { getTheme, spacing, typography, radii } from '../../constants/theme';
import { useAuth } from '../context/AuthContext';

type NotificationItem = {
  id: number;
  category: string; // Will primarily be 'PROMO'
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function Notifications() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme === 'dark');
  const { isLoggedIn, decrementUnreadCount } = useAuth();
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  const fetchNotifications = async () => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    try {
      const response = await api.get('/firstapp/notifications/');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [isLoggedIn]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

  const markAsRead = async (id: number) => {
  try {
    await api.post(`/firstapp/notifications/${id}/mark-read/`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    decrementUnreadCount(); // <-- Update the global badge
  } catch (error) {
    console.log('Failed to mark as read', error);
  }
};

  // Filter out any other categories just in case, ensuring only promos show up
  const promoNotifications = notifications.filter(notif => notif.category === 'PROMO');

  const renderNotification = ({ item }: { item: NotificationItem }) => {
    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: item.is_read ? theme.background : theme.surfaceElevated }]}
        onPress={() => !item.is_read && markAsRead(item.id)}
        activeOpacity={0.8}
      >
        <View style={[styles.iconWrap, { backgroundColor: '#FFE4E6' }]}>
          <Ionicons 
              name="ticket" 
              size={24} 
              color="#E11D48" 
          />
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>{item.title}</Text>
          <Text style={[styles.message, { color: theme.textMuted }]}>{item.message}</Text>
        </View>
        {!item.is_read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  if (!isLoggedIn) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <Ionicons name="notifications-off-outline" size={64} color={theme.textDisabled} />
        <Text style={[styles.emptyTitle, { color: theme.textSecondary, marginTop: spacing.md }]}>Login Required</Text>
        <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>Please login to view promo notifications.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* LIST */}
      {loading ? (
        <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
        </View>
      ) : (
        <FlatList
          data={promoNotifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.accent]} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
                <Ionicons name="checkmark-done-circle-outline" size={48} color={theme.textDisabled} />
                <Text style={[styles.emptyTitle, { color: theme.textMuted }]}>
                  No promo alerts yet.
                </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  listContent: { padding: spacing.md },
  card: { flexDirection: 'row', padding: spacing.md, borderRadius: radii.md, marginBottom: spacing.sm, alignItems: 'center' },
  iconWrap: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  textWrap: { flex: 1 },
  title: { ...typography.headingSm, marginBottom: 2 },
  message: { ...typography.bodySm },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444', marginLeft: spacing.sm },
  emptyState: { alignItems: 'center', marginTop: spacing['4xl'], gap: spacing.sm },
  emptyTitle: { ...typography.headingSm },
  emptySubtitle: { ...typography.bodyMd, textAlign: 'center' },
});