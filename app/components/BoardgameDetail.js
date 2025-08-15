import axios from "axios";
import { decode } from "html-entities";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import XMLParser from "react-xml-parser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ColorContext } from "../misc/ColorContext";

const windowWidth = Dimensions.get("window").width;
// const windowHeight = Dimensions.get("window").height;

const BoardGameDetail = (props) => {
  const { currentColors } = useContext(ColorContext);
  const [detailData, setDetailData] = useState(null);
  const [collection, setCollection] = useState([]);

  const gameId = props.route.params.stringGameId;
  const gameName = props.route.params.name;

  const fetchCollection = async () => {
    const result = await AsyncStorage.getItem("collection");
    if (result?.length) {
      setCollection(JSON.parse(result));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://api.geekdo.com/xmlapi/boardgame/${gameId}?&stats=1`
        );

        const parsed = new XMLParser().parseFromString(response.data);
        setDetailData(parsed);
      } catch (error) {
        console.error("API Request Error:", error);
      }
    };

    fetchData();
    fetchCollection();
  }, []);

  const styles = StyleSheet.create({
    loadingView: {
      textAlign: "center",
      justifyContent: "center",
      alignItems: "center",
      flex: 1,
      backgroundColor: currentColors.BACKGROUND,
    },
    container: {
      backgroundColor: currentColors.BACKGROUND,
      flex: 1,
      textAlign: "center",
      color: currentColors.LIGHT,
      paddingHorizontal: 30,
    },
    boargameImgContainer: {
      alignItems: "center",
    },
    boargameImg: {
      width: windowWidth,
      height: 300,
    },
    gameName: {
      textAlign: "center",
      fontSize: 26,
      paddingVertical: 5,
      color: currentColors.PRIMARY,
      fontWeight: "bold",
      marginVertical: 10,
    },
    horizontalContainer: {
      flexDirection: "row",
    },
    horizontalView: {
      flexDirection: "row",
      justifyContent: "space-between",
      flex: 1,
      padding: 10,
      backgroundColor: currentColors.BACKGROUND,
      borderRadius: 10,
      margin: 2,
    },
    gameInfo: {
      fontSize: 16,
      paddingVertical: 5,
      color: currentColors.DARK,
      fontWeight: "bold",
    },
    gameInfoValue: {
      fontSize: 16,
      paddingVertical: 5,
      color: currentColors.DARK,
    },
    description: {
      fontSize: 14,
      backgroundColor: currentColors.BACKGROUND,
      borderRadius: 15,
      padding: 15,
      marginTop: 10,
      color: currentColors.DARK,
    },
    closeButton: {
      backgroundColor: currentColors.PRIMARY,
      fontSize: 20,
      textAlign: "center",
      color: currentColors.LIGHT,
      padding: 10,
      borderRadius: 15,
      elevation: 5,
      marginVertical: 10,
      marginHorizontal: 10,
    },
  });

  if (!detailData) {
    return (
      <View style={[styles.loadingView]}>
        <ActivityIndicator size="large" />
        <Text>Loading data...</Text>
      </View>
    );
  }

  // ------------------------
  // Getting data from XML
  // ------------------------
  const gameNode = detailData.children.find((c) => c.name === "boardgame");

  const getValue = (name) =>
    gameNode?.children.find((c) => c.name === name)?.value || "";

  const yearPublished = getValue("yearpublished");
  const minPlayers = getValue("minplayers");
  const maxPlayers = getValue("maxplayers");
  const minPlaytime = getValue("minplaytime");
  const maxPlaytime = getValue("maxplaytime");
  const imageUrl = getValue("image");
  const description = decode(getValue("description")).replace(/<[^>]*>/g, "");

  // Rating
  const statisticsNode = gameNode.children.find((c) => c.name === "statistics");
  let fixedRating = "";
  if (statisticsNode) {
    const ratingsNode = statisticsNode.children
      .find((c) => c.name === "ratings")
      ?.children.find((c) => c.name === "average");
    fixedRating = parseFloat(ratingsNode?.value || 0).toFixed(2);
  }

  // Expansion
  const isExpansion = gameNode.children
    .filter((c) => c.name === "boardgamecategory")
    .some((cat) => cat.value?.toLowerCase().includes("expansion"));

  // ------------------------
  // Add to collection
  // ------------------------
  const addToCollection = async (owner) => {
    if (!collection) {
      collection = [];
    }
    if (collection.some((obj) => obj.name === gameName)) {
      displayExistAlert();
    } else {
      const newGame = {
        name: gameName,
        yearpublished: yearPublished,
        minPlayers,
        maxPlayers,
        minPlaytime,
        maxPlaytime,
        bggImage: imageUrl,
        id: gameId,
        owner: owner,
        expansion: isExpansion,
        rating: fixedRating,
        isChecked: false,
        stats: [],
      };

      const updatedCollection = [...collection, newGame];
      setCollection(updatedCollection);
      displayAddedAlert();
      await AsyncStorage.setItem(
        "collection",
        JSON.stringify(updatedCollection)
      );
    }
  };

  const displayExistAlert = () => {
    Alert.alert(
      "Duplicate",
      "Board game with that name already exists in collection",
      [{ text: "Ok" }],
      { cancelable: true }
    );
  };
  const displayAddedAlert = () => {
    Alert.alert("Added to collection", "", [{ text: "Ok" }], {
      cancelable: true,
    });
  };

  // ------------------------
  // RENDER
  // ------------------------
  return (
    <>
      <StatusBar />
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.boargameImgContainer}>
            <Image
              style={styles.boargameImg}
              resizeMode="contain"
              source={{ uri: imageUrl }}
            />
          </View>
          <Text style={styles.gameName}>{gameName}</Text>

          <View style={styles.horizontalView}>
            <Text style={styles.gameInfo}>Year published:</Text>
            <Text style={styles.gameInfoValue}>{yearPublished}</Text>
          </View>

          <View style={styles.horizontalContainer}>
            <View style={styles.horizontalView}>
              <Text style={styles.gameInfo}>Min players:</Text>
              <Text style={styles.gameInfoValue}>{minPlayers}</Text>
            </View>
            <View style={styles.horizontalView}>
              <Text style={styles.gameInfo}>Max players:</Text>
              <Text style={styles.gameInfoValue}>{maxPlayers}</Text>
            </View>
          </View>

          <View style={styles.horizontalContainer}>
            <View style={styles.horizontalView}>
              <Text style={styles.gameInfo}>Min playtime:</Text>
              <Text style={styles.gameInfoValue}>{minPlaytime}</Text>
            </View>
            <View style={styles.horizontalView}>
              <Text style={styles.gameInfo}>Max playtime:</Text>
              <Text style={styles.gameInfoValue}>{maxPlaytime}</Text>
            </View>
          </View>

          <View style={styles.horizontalView}>
            <Text style={styles.gameInfo}>Rating BGG:</Text>
            <Text style={styles.gameInfoValue}>{fixedRating}</Text>
          </View>

          <Text style={styles.description}>{description}</Text>

          <TouchableOpacity onPress={() => addToCollection("Yes")}>
            <View>
              <Text style={styles.closeButton}>Add to your collection</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => addToCollection("No")}>
            <View>
              <Text style={styles.closeButton}>Add as played game</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};

export default BoardGameDetail;
