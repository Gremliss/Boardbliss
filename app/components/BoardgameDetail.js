import axios from "axios";
import { decode } from "html-entities";
import React, { useEffect, useState } from "react";
import {
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
import xml2js from "react-native-xml2js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../misc/colors";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const BoardGameDetail = (props) => {
  const [detailData, setDetailData] = useState(null);
  const gameId = props.route.params.stringGameId;
  const gameName = props.route.params.name;
  const [collection, setCollection] = useState([]);
  useEffect(() => {
    axios
      .get(`https://api.geekdo.com/xmlapi/boardgame/${gameId}?&stats=1`)
      .then((response) => {
        const xmlData = response.data;
        xml2js.parseString(xmlData, (error, result) => {
          if (error) {
            console.error(error);
          } else {
            setDetailData(result);
          }
        });
      })
      .catch((error) => {
        console.error(error);
      });
    fetchCollection();
  }, []);

  const fetchCollection = async () => {
    const result = await AsyncStorage.getItem("collection");
    if (result?.length) {
      setCollection(JSON.parse(result));
    }
  };

  if (!detailData) {
    return (
      <View style={[styles.loadingView]}>
        <Text>Loading data...</Text>
      </View>
    );
  }

  const addToCollection = async (owner) => {
    if (!collection) {
      collection = [];
    }
    if (collection.some((obj) => obj.name === gameName)) {
      displayExistAlert();
    } else {
      const newGame = {
        name: gameName,
        yearpublished: game.yearpublished[0],
        minPlayers: game.minplayers[0],
        maxPlayers: game.maxplayers[0],
        minPlaytime: game.minplaytime[0],
        maxPlaytime: game.maxplaytime[0],
        bggImage: game.image,
        id: gameId,
        owner: owner,
        expansion: false,
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
      [{ text: "Ok", onPress: () => null }],
      { cancelable: true }
    );
  };
  const displayAddedAlert = () => {
    Alert.alert(
      "Added to collection",
      "",
      [{ text: "Ok", onPress: () => null }],
      { cancelable: true }
    );
  };

  var game = detailData?.boardgames?.boardgame[0];
  var decodedDescription = decode(`${game.description}`);
  var ratingBgg = game.statistics[0].ratings[0].average;
  var fixedRating = parseFloat(ratingBgg).toFixed(2);

  return (
    <>
      <StatusBar />
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.boargameImgContainer}>
            <Image
              style={styles.boargameImg}
              resizeMode="contain"
              source={{
                uri: `${game.image}`,
              }}
            />
          </View>
          <Text style={styles.gameName}>{gameName}</Text>
          <View style={styles.horizontalView}>
            <Text style={styles.gameInfo}>Year published:</Text>
            <Text style={styles.gameInfoValue}>{game.yearpublished[0]}</Text>
          </View>
          <View style={styles.horizontalContainer}>
            <View style={styles.horizontalView}>
              <Text style={styles.gameInfo}>Min players:</Text>
              <Text style={styles.gameInfoValue}>{game.minplayers[0]}</Text>
            </View>
            <View style={styles.horizontalView}>
              <Text style={styles.gameInfo}>Max players:</Text>
              <Text style={styles.gameInfoValue}>{game.maxplayers[0]}</Text>
            </View>
          </View>
          <View style={styles.horizontalContainer}>
            <View style={styles.horizontalView}>
              <Text style={styles.gameInfo}>Min playtime:</Text>
              <Text style={styles.gameInfoValue}>{game.minplaytime[0]}</Text>
            </View>
            <View style={styles.horizontalView}>
              <Text style={styles.gameInfo}>Max playtime:</Text>
              <Text style={styles.gameInfoValue}>{game.maxplaytime[0]}</Text>
            </View>
          </View>
          <View style={styles.horizontalView}>
            <Text style={styles.gameInfo}>Rating BGG:</Text>
            <Text style={styles.gameInfoValue}>{fixedRating}</Text>
          </View>
          <Text style={styles.description}>{decodedDescription}</Text>
          <TouchableOpacity onPress={() => addToCollection("You")}>
            <View>
              <Text style={styles.closeButton}>Add to your collection</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => addToCollection("Friend")}>
            <View>
              <Text style={styles.closeButton}>Add to friends collection</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <View>
              <Text style={styles.closeButton}>Close</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  loadingView: {
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  container: {
    backgroundColor: colors.BACKGROUND,
    flex: 1,
    textAlign: "center",
    color: colors.LIGHT,
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
    fontSize: 26,
    paddingVertical: 5,
    color: colors.PRIMARY,
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
    backgroundColor: colors.GRAY,
    borderRadius: 20,
    margin: 2,
  },
  gameInfo: {
    fontSize: 16,
    paddingVertical: 5,
    opacity: 0.7,
    color: colors.PRIMARY,
  },
  gameInfoValue: {
    fontSize: 16,
    paddingVertical: 5,
  },
  description: {
    fontSize: 14,
    backgroundColor: colors.GRAY,
    borderRadius: 20,
    padding: 15,
    marginTop: 10,
  },

  closeButton: {
    backgroundColor: colors.PRIMARY,
    fontSize: 20,
    textAlign: "center",
    color: colors.LIGHT,
    padding: 10,
    borderRadius: 50,
    elevation: 5,
    marginVertical: 20,
    marginHorizontal: 30,
  },
});

export default BoardGameDetail;
