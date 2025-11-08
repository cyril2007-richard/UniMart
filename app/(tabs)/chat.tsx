
import { Ionicons } from "@expo/vector-icons";
import { Headset } from 'lucide-react-native';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Image, Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import Colors from "../../constants/Colors";
import { chats } from "../../constants/mockData";

export default function ChatScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredChats, setFilteredChats] = useState(chats);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text) {
      const filtered = chats.filter((chat) =>
        chat.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredChats(filtered);
    } else {
      setFilteredChats(chats);
    }
  };

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
        <TouchableOpacity onPress={() => router.push('/support')}>
          <Headset size={20} color={Colors.light.text} />
        </TouchableOpacity>
        <View style={{ flexDirection: "row", gap: 15 }}>
          <Ionicons name="camera-outline" size={22} color={Colors.light.text} />
          <TouchableOpacity onPress={() => router.push('/new-chat')}>
            <Ionicons name="add" size={26} color={Colors.light.text} />
          </TouchableOpacity>
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
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Chats */}
      <FlatList
        data={filteredChats}
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

