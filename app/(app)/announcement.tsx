import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';
import { useNotification } from '../../contexts/NotificationContext';

type NotificationType = 'success' | 'error' | 'info';

export default function AnnouncementScreen() {
  const { notifications, removeNotification } = useNotification();
  
  // Forced Light Mode
  const theme = Colors.light;
  const cardBg = '#FFFFFF'; 

  const notificationBorders = {
    success: '#27ae60', // Green
    error: '#c0392b',   // Red
    info: '#2980b9',    // Blue
  };
  
  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      default:
        return 'information-circle';
    }
  };

  const renderNotification = ({ item }: { item: { id: string; message: string; type: NotificationType } }) => (
    <View style={[
      styles.notification, 
      { 
        backgroundColor: cardBg, 
        borderColor: notificationBorders[item.type],
      }
    ]}>
      <Ionicons 
        name={getIconForType(item.type)} 
        size={20} 
        color={notificationBorders[item.type]} 
        style={styles.notificationIcon}
      />

      <Text style={[styles.notificationMessage, { color: theme.text }]}>{item.message}</Text>
      
      <TouchableOpacity onPress={() => removeNotification(item.id)}>
        <Ionicons name="close-outline" size={24} color={theme.tabIconDefault} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => { /* navigation.goBack() */ }}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Notifications</Text>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={100} color={theme.tabIconDefault} />
          <Text style={[styles.emptyText, { color: theme.tabIconDefault }]}>No new notifications</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50, 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    // --- REMOVED: Border bottom properties ---
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 1, 
  },
  title: {
    fontSize: 20,
    fontWeight: '600', 
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    marginTop: 20,
  },
  list: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12, 
    borderWidth: 1, 
    marginBottom: 10,
  },
  notificationIcon: {
    marginRight: 10,
  },
  notificationMessage: {
    flex: 1,
    fontSize: 14, 
    marginRight: 10,
  },
});