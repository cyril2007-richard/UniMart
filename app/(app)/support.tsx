
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Linking,
  ScrollView,
} from "react-native";
import Colors from "../../constants/Colors";

export default function SupportScreen() {
  const router = useRouter();
  const theme = Colors.light;

  const handleEmail = () => {
    Linking.openURL('mailto:support@unimart.com');
  };

  const handleCall = () => {
    Linking.openURL('tel:+1234567890');
  };
 
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={{ flex: 1, backgroundColor: theme.background }}>
        {/* Custom Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingTop: Platform.OS === 'ios' ? 60 : 40,
            paddingBottom: 16,
            paddingHorizontal: 20,
            backgroundColor: theme.surface,
            borderBottomWidth: 1,
            borderColor: '#F1F5F9',
          }}
        >
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.text}
            />
          </TouchableOpacity>
          <Text style={{ fontWeight: "700", fontSize: 18, color: theme.text }}>Support</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: theme.text, marginBottom: 12}}>How can we help?</Text>
          <Text style={{ fontSize: 15, color: theme.secondaryText, marginBottom: 32, lineHeight: 22 }}>
            Our team is available to assist you with any questions about buying, selling, or deliveries in your area.
          </Text>

          <TouchableOpacity 
            onPress={handleEmail}
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              backgroundColor: theme.surface, 
              padding: 20, 
              borderRadius: 14, 
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#F1F5F9',
            }}
          >
            <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: theme.secondaryBackground, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                <Ionicons name="mail-outline" size={24} color={theme.primary} />
            </View>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>Email Support</Text>
              <Text style={{ color: theme.secondaryText, fontSize: 14, marginTop: 2 }}>support@unimart.com</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleCall}
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              backgroundColor: theme.surface, 
              padding: 20, 
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#F1F5F9',
            }}
          >
            <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: theme.secondaryBackground, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                <Ionicons name="call-outline" size={24} color={theme.primary} />
            </View>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>Phone Support</Text>
              <Text style={{ color: theme.secondaryText, fontSize: 14, marginTop: 2 }}>+234 800 UNIMART</Text>
            </View>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </>
  );
}
