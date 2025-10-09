import { Entypo, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import Colors from "../../constants/Colors";
import { chats } from "../../constants/mockData";

export default function ChatScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.background, paddingHorizontal: 10 }}>
      {/* Top bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 50,
          marginBottom: 10,
          paddingHorizontal: 10,
        }}
      >
        <Entypo name="dots-three-horizontal" size={20} color={Colors.light.text} />
        <View style={{ flexDirection: "row", gap: 15 }}>
          <Ionicons name="camera-outline" size={22} color={Colors.light.text} />
          <Ionicons name="add" size={26} color={Colors.light.text} />
        </View>
      </View>


        <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 10, color: Colors.light.text, paddingHorizontal: 10 }}>
        Chats
        </Text>

      {/* Search Bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#fff",
          borderWidth: 1.5,
          borderColor: Colors.light.purple,
          borderRadius: 12,
          paddingHorizontal: 10,
          height: 40,
          marginBottom: 15,
        }}
      >
        <Ionicons name="search-outline" size={18} color={Colors.light.text} />
        <TextInput
          placeholder="Search"
          placeholderTextColor="#888"
          style={{ flex: 1, marginLeft: 6, color: Colors.light.text }}
        />
      </View>

      {/* Chats */}
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 10,
              borderBottomWidth: 0.5,
              borderColor: "#ddd",
            }}
            onPress={() => router.push(`/chat/${item.id}`)}
          >
            <Image
              source={{ uri: item.avatar }}
              style={{ width: 55, height: 55, borderRadius: 50, marginRight: 10 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "600", fontSize: 16 }}>{item.name}</Text>
              <Text numberOfLines={1} style={{ color: "#666" }}>
                {item.lastMessage}
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: "#aaa" }}>{item.lastSeen}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
