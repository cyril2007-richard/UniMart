
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

      <View style={{ flex: 1, backgroundColor: theme.surface }}>
        {/* Custom Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: StatusBar.currentHeight || 40,
            paddingBottom: 10,
            paddingHorizontal: 15,
            backgroundColor: theme.background,
            borderBottomWidth: 1,
            borderColor: theme.surface,
            elevation: 3,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons
                name="arrow-back"
                size={24}
                color={theme.purple}
                style={{ marginRight: 5 }}
              />
            </TouchableOpacity>
            <View>
              <Text style={{ fontWeight: "600", fontSize: 16, color: theme.text }}>Customer Support</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 10 }}>How can we help you?</Text>
          <Text style={{ fontSize: 16, color: theme.secondaryText, marginBottom: 30, lineHeight: 24 }}>
            We are here to assist you with any issues or questions you may have about UniMart. Please reach out to us using the methods below.
          </Text>

          <TouchableOpacity 
            onPress={handleEmail}
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              backgroundColor: theme.background, 
              padding: 20, 
              borderRadius: 12, 
              marginBottom: 15,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 2
            }}
          >
            <Ionicons name="mail-outline" size={28} color={theme.purple} style={{ marginRight: 15 }} />
            <View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>Email Support</Text>
              <Text style={{ color: theme.secondaryText }}>support@unimart.com</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleCall}
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              backgroundColor: theme.background, 
              padding: 20, 
              borderRadius: 12,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 2
            }}
          >
            <Ionicons name="call-outline" size={28} color={theme.purple} style={{ marginRight: 15 }} />
            <View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>Phone Support</Text>
              <Text style={{ color: theme.secondaryText }}>+1 (234) 567-890</Text>
            </View>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </>
  );
}
