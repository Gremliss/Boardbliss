import axios from "axios";
import XMLParser from "react-xml-parser";
import React, { useState, useEffect, useContext } from "react";
import {
  View,
  FlatList,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Keyboard,
  TouchableOpacity,
  BackHandler,
  Alert,
  ToastAndroid,
  ActivityIndicator,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { AntDesign, Fontisto } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ColorContext } from "../misc/ColorContext";

const SearchBgg = ({ navigation, renderedCollection, renderedPlayers }) => {
  const { currentColors } = useContext(ColorContext);
  const [collection, setCollection] = useState(renderedCollection);
  const [players, setPlayers] = useState(renderedPlayers);
  const [data, setData] = useState([]);
  const [updatedCollection, setUpdatedCollection] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchUserCollectionText, setSearchUserCollectionText] = useState("");
  const [loading, setLoading] = useState(false);
  let countUserGamesToAdd = 0;

  const handleSearchText = (text) => {
    setSearchText(text);
  };

  const handleSearchButton = async () => {
    setLoading(true);
    let searchLink = `https://boardgamegeek.com/xmlapi2/search?query=${searchText}`;

    try {
      const response = await fetch(searchLink);
      if (!response.ok) throw new Error("Network response was not ok");
      const xmlData = await response.text();
      const parsed = new XMLParser().parseFromString(xmlData);
      const items = parsed.getElementsByTagName("item");
      setData(items);
    } catch (error) {
      console.error("API Request Error:", error);
      ToastAndroid.show("Error fetching search results", 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUserCollectionButton = async () => {
    try {
      setLoading(true);
      let searchLink = `https://api.geekdo.com/xmlapi/collection/${searchUserCollectionText}`;
      const response = await axios.get(searchLink);
      const xmlData = response.data;

      const parsed = new XMLParser().parseFromString(xmlData);
      const items = parsed.getElementsByTagName("item");
      if (items.length > 0) {
        items.forEach((item) => addToCollection(item));
        displayAddAlert();
        countUserGamesToAdd = 0;
      } else {
        ToastAndroid.show("BGG user not found", 2000);
      }
    } catch (error) {
      console.error("API Request Error:", error);
      ToastAndroid.show("Error fetching user collection", 2000);
    } finally {
      setLoading(false);
    }
  };

  const addToCollection = async (item) => {
    if (!collection) {
      collection = [];
    }
    const nameNode = item.children.find((c) => c.name === "name");

    const nameValue = nameNode?.value;

    const isGameAlreadyExists = collection.some(
      (obj) => obj.name === nameValue
    );

    const statusNode = item.children.find((c) => c.name === "status");
    const isNotOwned = statusNode?.attributes?.own !== "1";

    if (!isGameAlreadyExists && !isNotOwned) {
      countUserGamesToAdd++;

      const statsNode = item.children.find((c) => c.name === "stats");

      const newGame = {
        name: nameValue,
        yearpublished: item.children.find((c) => c.name === "yearpublished")
          ?.value,
        minPlayers: statsNode?.attributes?.minplayers,
        maxPlayers: statsNode?.attributes?.maxplayers,
        minPlaytime: statsNode?.attributes?.minplaytime,
        maxPlaytime: statsNode?.attributes?.maxplaytime,
        bggImage: item.children.find((c) => c.name === "image")?.value,
        id: item.attributes?.objectid || item.attributes?.id,
        owner: "Yes",
        rating: statsNode?.children
          .find((c) => c.name === "rating")
          ?.children.find((c) => c.name === "average")?.attributes?.value,
        isChecked: false,
        expansion: false,
        stats: [],
      };

      updatedCollection.push(newGame);
    }
  };

  const displayAddAlert = () => {
    Alert.alert(
      `Are you sure you want to add ${countUserGamesToAdd} games to collection?`,
      "",
      [
        { text: "Cancel", onPress: () => null },
        {
          text: "Add as played game",
          onPress: () => addUserCollection(false),
        },
        {
          text: "Add to your collection",
          onPress: () => addUserCollection(true),
        },
      ],
      { cancelable: true }
    );
  };

  const addUserCollection = async (isYourCollection) => {
    const newCollection = isYourCollection
      ? [...collection, ...updatedCollection]
      : [
          ...collection,
          ...updatedCollection.map((item) => ({ ...item, owner: "No" })),
        ];
    await AsyncStorage.setItem("backupCollection", JSON.stringify(collection));
    await AsyncStorage.setItem("collection", JSON.stringify(newCollection));
    setCollection(newCollection);
  };

  const renderItem = ({ item, index }) => {
    if (!item?.attributes || item.attributes.type !== "boardgame") return null;
    console.log(item.children.find((c) => c.name === "yearpublished"));
    const nameValue = item.children.find((c) => c.name === "name")?.attributes
      ?.value;
    const yearPublished = item.children.find((c) => c.name === "yearpublished")
      ?.attributes?.value;

    return (
      <TouchableOpacity
        onPress={() => openBoardgameDetail(item.attributes.id, nameValue)}
      >
        <View style={styles.itemContainer}>
          <Text style={[{ color: currentColors.LIGHT }]}>
            {index + 1}. {nameValue}
          </Text>
          {yearPublished && (
            <Text style={[styles.yearText, { color: currentColors.LIGHT }]}>
              {yearPublished}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const fetchCollection = async () => {
    const result = await AsyncStorage.getItem("collection");
    if (result?.length) setCollection(JSON.parse(result));
  };
  useEffect(() => {
    fetchCollection();
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackButton
    );
    return () => backHandler.remove();
  }, [navigation]);

  const handleBackButton = () => {
    fetchCollection();
    return;
  };

  const openBoardgameDetail = (gameId, name) => {
    let stringGameId = gameId.toString();
    navigation.navigate("BoardGameDetail", { stringGameId, name });
  };

  const addPlayer = async (text) => {
    if (!players) {
      players = [];
    }
    const newPlayer = {
      name: text,
      id: Date.now(),
      isChecked: false,
    };

    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);
    await AsyncStorage.setItem("players", JSON.stringify(updatedPlayers));
  };

  const handleOnClear = () => {
    setSearchText("");
  };

  const styles = StyleSheet.create({
    loadingView: {
      textAlign: "center",
      justifyContent: "center",
      alignItems: "center",
      flex: 1,
    },
    container: {
      backgroundColor: currentColors.BACKGROUND,
      flex: 1,
    },
    searchRow: {
      flexDirection: "row",
      marginTop: 10,
      marginBottom: 4,
    },
    searchBar: {
      backgroundColor: currentColors.GRAY,
      fontSize: 20,
      color: currentColors.LIGHT,
      padding: 12,
      flex: 5,
    },
    icon: {
      textAlign: "center",
      flex: 1,
      backgroundColor: currentColors.PRIMARY,
      justifyContent: "center",
      alignItems: "center",
    },
    addButton: {
      backgroundColor: currentColors.PRIMARY,
      fontSize: 20,
      textAlign: "center",
      color: currentColors.LIGHT,
      padding: 10,
      borderRadius: 50,
      elevation: 5,
      marginVertical: 20,
      marginHorizontal: 30,
    },
    itemContainer: {
      backgroundColor: currentColors.PRIMARY,
      borderRadius: 15,
      padding: 12,
      margin: 1,
    },
    yearText: {
      fontSize: 12,
      opacity: 0.6,
      paddingLeft: 15,
    },
    clearIcon: {
      position: "absolute",
      right: 80,
      alignSelf: "center",
      color: currentColors.LIGHT,
      zIndex: 1,
    },
  });

  return (
    <>
      <View style={[styles.container]}>
        <View style={styles.searchRow}>
          <TextInput
            onChangeText={(text) => setSearchUserCollectionText(text)}
            placeholder="Add BGG user collection"
            style={[styles.searchBar]}
            placeholderTextColor={currentColors.PLACEHOLDER}
            value={searchUserCollectionText}
            onSubmitEditing={handleSearchUserCollectionButton}
          />
          <AntDesign
            name="close"
            size={20}
            onPress={() => setSearchUserCollectionText("")}
            style={styles.clearIcon}
          />
          <TouchableOpacity
            style={[styles.icon]}
            onPress={handleSearchUserCollectionButton}
          >
            <AntDesign name={"plus"} size={24} color={currentColors.LIGHT} />
          </TouchableOpacity>
        </View>
        <View style={styles.searchRow}>
          <TextInput
            onChangeText={(text) => handleSearchText(text)}
            placeholder="Search game online"
            style={[styles.searchBar]}
            placeholderTextColor={currentColors.PLACEHOLDER}
            value={searchText}
            onSubmitEditing={handleSearchButton}
          />
          <AntDesign
            name="close"
            size={20}
            onPress={handleOnClear}
            style={styles.clearIcon}
          />
          <TouchableOpacity style={[styles.icon]} onPress={handleSearchButton}>
            <Fontisto name={"zoom"} size={24} color={currentColors.LIGHT} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={[styles.loadingView]}>
            <ActivityIndicator size="large" />
            <Text>Loading data...</Text>
          </View>
        ) : (
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item, index) =>
              `${
                item?.attributes?.id || item?.attributes?.objectid || "no-id"
              }-${index}`
            }
            keyboardShouldPersistTaps="always"
            initialNumToRender={15}
          />
        )}
      </View>
    </>
  );
};

export default SearchBgg;
