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

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const BoardGameDetail = (props) => {
  const [detailData, setDetailData] = useState(null);
  const gameId = props.route.params.stringGameId;
  const [collection, setCollection] = useState([]);

  useEffect(() => {
    axios
      .get(`https://boardgamegeek.com/xmlapi2/thing?id=${gameId}`)
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
    if (collection.some((obj) => obj.name === game.name[0].$.value)) {
      displayExistAlert();
    } else {
      const newGame = {
        name: game.name[0].$.value,
        yearpublished: game.yearpublished[0]?.$.value,
        minPlayers: game.minplayers[0]?.$.value,
        maxPlayers: game.maxplayers[0]?.$.value,
        minPlaytime: game.minplaytime[0]?.$.value,
        maxPlaytime: game.maxplaytime[0]?.$.value,
        bggImage: game.image,
        id: gameId,
        owner: owner,
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

  var game = detailData?.items?.item[0];
  var decodedDescription = decode(`${game.description}`);
  return (
    <>
      <StatusBar />
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.boargameImgContainer}>
            <Image
              style={styles.boargameImg}
              source={{
                uri: `${game.image}`,
              }}
            />
          </View>
          <Text style={styles.gameName}>{game.name[0].$.value}</Text>
          <View style={styles.horizontalView}>
            <Text style={styles.gameInfo}>Year published:</Text>
            <Text style={styles.gameInfoValue}>
              {game.yearpublished[0]?.$.value}
            </Text>
          </View>
          <View style={styles.horizontalContainer}>
            <View style={styles.horizontalView}>
              <Text style={styles.gameInfo}>Min players:</Text>
              <Text style={styles.gameInfoValue}>
                {game.minplayers[0]?.$.value}
              </Text>
            </View>
            <View style={styles.horizontalView}>
              <Text style={styles.gameInfo}>Max players:</Text>
              <Text style={styles.gameInfoValue}>
                {game.maxplayers[0]?.$.value}
              </Text>
            </View>
          </View>
          <View style={styles.horizontalContainer}>
            <View style={styles.horizontalView}>
              <Text style={styles.gameInfo}>Min playtime:</Text>
              <Text style={styles.gameInfoValue}>
                {game.minplaytime[0]?.$.value}
              </Text>
            </View>
            <View style={styles.horizontalView}>
              <Text style={styles.gameInfo}>Max playtime:</Text>
              <Text style={styles.gameInfoValue}>
                {game.maxplaytime[0]?.$.value}
              </Text>
            </View>
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
    backgroundColor: "#222831",
    flex: 1,
    textAlign: "center",
    color: "#EEEEEE",
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
    color: "#00ADB5",
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
    backgroundColor: "#393E46",
    borderRadius: 20,
    margin: 2,
  },
  gameInfo: {
    fontSize: 16,
    paddingVertical: 5,
    opacity: 0.7,
    color: "#00ADB5",
  },
  gameInfoValue: {
    fontSize: 16,
    paddingVertical: 5,
  },
  description: {
    fontSize: 14,
    backgroundColor: "#393E46",
    borderRadius: 20,
    padding: 15,
    marginTop: 10,
  },

  closeButton: {
    backgroundColor: "#00ADB5",
    fontSize: 20,
    textAlign: "center",
    color: "#EEEEEE",
    padding: 10,
    borderRadius: 50,
    elevation: 5,
    marginVertical: 20,
    marginHorizontal: 30,
  },
});

export default BoardGameDetail;
