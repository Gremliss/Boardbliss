import axios from "axios";
import xml2js from "react-native-xml2js";
import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Keyboard,
  TouchableOpacity,
  Modal,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { Fontisto } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NewPlayerModal from "../components/NewPlayerModal";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const MainScreen = ({ navigation, renderedCollection, renderedPlayers }) => {
  const [collection, setCollection] = useState(renderedCollection);
  const [players, setPlayers] = useState(renderedPlayers);
  const [data, setData] = useState();
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const handleOnSubmitModal = async () => {
    console.log("submit Modal");
  };

  const handleKeyboardClose = () => {
    Keyboard.dismiss();
  };
  const handleSearchText = (text) => {
    setSearchText(text);
  };
  const handleSearchButton = () => {
    var searchLink = `https://boardgamegeek.com/xmlapi2/search?query=${searchText}`;
    axios
      .get(searchLink)
      .then((response) => {
        const xmlData = response.data;
        xml2js.parseString(xmlData, (error, result) => {
          if (error) {
            console.error(error);
          } else {
            setData(result);
          }
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };
  useEffect(() => {
    axios
      .get("https://boardgamegeek.com/xmlapi2/hot")
      .then((response) => {
        const xmlData = response.data;
        xml2js.parseString(xmlData, (error, result) => {
          if (error) {
            console.error(error);
          } else {
            setData(result);
          }
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  if (!data) {
    return (
      <View style={[styles.loadingView]}>
        <Text>Loading data...</Text>
      </View>
    );
  }

  const renderItem = ({ item, index }) => {
    if (!item?.name || item?.$?.type !== "boardgame") return null;

    const itemId = item.$.id;
    const yearPublished = item.yearpublished?.[0].$.value;

    return (
      <TouchableOpacity onPress={() => openBoardgameDetail(itemId)}>
        <View style={styles.itemContainer}>
          <Text>
            {index + 1}. {item.name[0].$.value}
          </Text>
          {yearPublished && (
            <Text style={styles.yearText}>Year published: {yearPublished}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const openBoardgameDetail = (gameId) => {
    var stringGameId = gameId.toString();
    navigation.navigate("BoardGameDetail", { stringGameId });
  };

  const openCollection = async () => {
    navigation.navigate("Collection");
  };

  const addPlayer = async (text) => {
    console.log("add player");
    console.log(text);
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
    console.log(updatedPlayers);
    await AsyncStorage.setItem("players", JSON.stringify(updatedPlayers));
  };

  const displayExistAlert = () => {
    Alert.alert(
      "Duplicate",
      "Item with that name already exists",
      [{ text: "Ok", onPress: () => null }],
      { cancelable: true }
    );
  };
  const displayAddedAlert = () => {
    Alert.alert("Player added", "", [{ text: "Ok", onPress: () => null }], {
      cancelable: true,
    });
  };

  return (
    <>
      <View style={[styles.container]}>
        <TouchableOpacity onPress={handleKeyboardClose}>
          {/* <View>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={[styles.addButton]}>Add player</Text>
            </TouchableOpacity>
          </View> */}
        </TouchableOpacity>
        <View style={styles.searchRow}>
          <TextInput
            onChangeText={(text) => handleSearchText(text)}
            placeholder="Search game"
            style={[styles.searchBar]}
            placeholderTextColor="#EEEEEE70"
          />
          <TouchableOpacity style={[styles.icon]} onPress={handleSearchButton}>
            <Fontisto name={"zoom"} size={24} color={"#EEEEEE"} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={data.items.item}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${index}`}
        />

        <View style={[styles.bottomContainer]}>
          <TouchableOpacity
            style={[styles.buttonBottom]}
            onPress={openCollection}
          >
            <Text style={[styles.textBtn]}>Collection</Text>
          </TouchableOpacity>
          <View style={[styles.buttonBottom, { opacity: 1 }]}>
            <Text style={[styles.textBtn]}>Search BGG</Text>
          </View>
          <TouchableOpacity style={[styles.buttonBottom]}>
            <Text style={[styles.textBtn]}>Game Calendar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.buttonBottom]}>
            <Text
              style={[styles.textBtn]}
              onPress={() => navigation.navigate("Players")}
            >
              Players
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <NewPlayerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={addPlayer}
        players={players}
      />
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
  },
  searchRow: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 4,
  },
  searchBar: {
    backgroundColor: "#393E46",
    fontSize: 20,
    textAlign: "center",
    color: "#EEEEEE",
    padding: 10,
    flex: 5,
  },
  icon: {
    textAlign: "center",
    flex: 1,
    backgroundColor: "#00ADB5",
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
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
  itemContainer: {
    backgroundColor: "#00ADB5",
    borderRadius: 50,
    padding: 12,
    margin: 1,
  },
  yearText: {
    fontSize: 12,
    opacity: 0.6,
    paddingLeft: 15,
  },
  bottomContainer: {
    // position: "absolute",
    // bottom: 0,
    // zIndex: 1,
    // height: windowHeight / 6,
    width: windowWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonBottom: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    alignSelf: "center",
    textAlign: "center",
    borderColor: "#222831",
    borderWidth: 1,
    backgroundColor: "#00ADB5",
    fontSize: 20,
    height: windowHeight / 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    opacity: 0.6,
  },
  textBtn: {
    fontSize: 18,
    textAlign: "center",
    color: "#EEEEEE",
  },
});

export default MainScreen;
