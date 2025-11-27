
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../constants/Colors";

export default function SupportScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const theme = Colors.light;

  const sendMessage = () => {
    if (!text.trim()) return;
    const newMsg = { id: Date.now(), sender: "You", text, time: "Now" };
    setMessages([...messages, newMsg]);
    setText("");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.surface }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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

        {/* Messages */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingVertical: 10 }}
          renderItem={({ item }) => (
            <View
              style={{
                alignSelf: item.sender === "You" ? "flex-end" : "flex-start",
                backgroundColor: item.sender === "You" ? theme.purple : theme.background,
                padding: 10,
                marginVertical: 4,
                marginHorizontal: 10,
                borderRadius: 10,
                maxWidth: "75%",
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 2,
              }}
            >
              <Text style={{ color: item.sender === "You" ? theme.white : theme.text }}>{item.text}</Text>
            </View>
          )}
        />

        {/* Input */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.background,
            padding: 10,
            borderTopWidth: 1,
            borderColor: theme.surface,
          }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message..."
            placeholderTextColor={theme.tabIconDefault}
            style={{
              flex: 1,
              backgroundColor: theme.surface,
              borderRadius: 20,
              paddingHorizontal: 15,
              paddingVertical: 8,
              marginRight: 8,
              color: theme.text,
            }}
          />
          <TouchableOpacity onPress={sendMessage}>
            <Ionicons name="send" size={22} color={theme.purple} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
