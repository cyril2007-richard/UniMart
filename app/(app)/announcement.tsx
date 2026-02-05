import { useRouter } from 'expo-router';
import {
  AlertCircle,
  BellOff,
  CheckCircle,
  ChevronLeft,
  Info,
  X
} from 'lucide-react-native';
import React from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useNotification } from '../../contexts/NotificationContext';

type NotificationType = 'success' | 'error' | 'info';

export default function AnnouncementScreen() {
  const { notifications, removeNotification } = useNotification();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const theme = Colors.light;

  const getTypeStyles = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          color: '#27ae60',
          bg: 'rgba(39, 174, 96, 0.1)', // Light green
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: '#e74c3c',
          bg: 'rgba(231, 76, 60, 0.1)', // Light red
        };
      default:
        return {
          icon: Info,
          color: '#2980b9',
          bg: 'rgba(41, 128, 185, 0.1)', // Light blue
        };
    }
  };

  const renderNotification = ({ item }: { item: { id: string; message: string; type: NotificationType } }) => {
    const styleConfig = getTypeStyles(item.type);
    const IconComponent = styleConfig.icon;

    return (
      <View style={[styles.notificationCard, { backgroundColor: theme.background }]}>
        {/* Icon Container */}
        <View style={[styles.iconContainer, { backgroundColor: styleConfig.bg }]}>
          <IconComponent size={20} color={styleConfig.color} strokeWidth={2} />
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
            <Text style={[styles.messageText, { color: theme.text }]}>
                {item.message}
            </Text>
            <Text style={[styles.timeText, { color: theme.secondaryText }]}>Just now</Text>
        </View>
        
        {/* Dismiss Button */}
        <TouchableOpacity 
            onPress={() => removeNotification(item.id)}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={18} color={theme.secondaryText} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: theme.background }]}>
       <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconCircle, { backgroundColor: theme.surface }]}>
            <BellOff size={48} color={theme.secondaryText} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No Notifications</Text>
          <Text style={[styles.emptySub, { color: theme.secondaryText }]}>
            You're all caught up! Check back later for updates.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700' },

  // List
  listContent: { padding: 16 },
  
  // Notification Card
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    // Soft Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
    minHeight: 40,
  },
  messageText: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
  },
  closeButton: {
    padding: 4,
    opacity: 0.6,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});