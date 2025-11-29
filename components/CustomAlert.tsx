import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../constants/Colors';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ visible, title, message, onCancel, onConfirm }) => {
  const theme = Colors.light;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.modalMessage, { color: theme.text }]}>{message}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={onConfirm}>
              <Text style={[styles.buttonText, styles.confirmButtonText]}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 16, // Slightly more rounded for modern look
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Better spacing
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 14, // Increased height for touch target
    borderRadius: 12,
    flex: 1, // Equal width buttons
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5', // Light gray surface
  },
  confirmButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButtonText: {
    color: '#333333', // High contrast dark text
  },
  confirmButtonText: {
    color: 'white', // High contrast white text on red
  },
});

export default CustomAlert;
