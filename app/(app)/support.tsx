
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
        style={{ flex: 1, backgroundColor: "#f7f7f7" }}
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
            backgroundColor: "#fff",
            borderBottomWidth: 1,
            borderColor: "#eee",
            elevation: 3,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons
                name="arrow-back"
                size={24}
                color={Colors.light.purple}
                style={{ marginRight: 5 }}
              />
            </TouchableOpacity>
            <View>
              <Text style={{ fontWeight: "600", fontSize: 16 }}>Customer Support</Text>
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
                backgroundColor: item.sender === "You" ? Colors.light.purple : "#fff",
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
              <Text style={{ color: item.sender === "You" ? "#fff" : "#000" }}>{item.text}</Text>
            </View>
          )}
        />

        {/* Input */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff",
            padding: 10,
            borderTopWidth: 1,
            borderColor: "#eee",
          }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message..."
            style={{
              flex: 1,
              backgroundColor: "#f2f2f2",
              borderRadius: 20,
              paddingHorizontal: 15,
              paddingVertical: 8,
              marginRight: 8,
            }}
          />
          <TouchableOpacity onPress={sendMessage}>
            <Ionicons name="send" size={22} color={Colors.light.purple} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
