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
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { Fontisto } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const Collection = (props) => {
  const [collection, setCollection] = useState(props.route.params.collection);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchCollection = async () => {
      const result = await AsyncStorage.getItem("collection");
      if (result?.length) setCollection(JSON.parse(result));
    };
    fetchCollection();
  }, []);

  const data = Object.entries(collection.yourGames).map(([name, info]) => {
    return { name, ...info };
  });

  const handleModalClose = () => {
    Keyboard.dismiss();
  };
  const handleSearchText = (text) => {
    console.log(text);
    setSearchText(text);
  };
  const handleSearchButton = () => {
    console.log("pressed");
  };

  const renderItem = ({ item, index }) => {
    const itemId = item.id;
    return (
      <TouchableOpacity onPress={() => openBoardgameDetail(itemId)}>
        <View style={[styles.itemContainer]}>
          <Text>
            {index + 1}. {item.name}
          </Text>
          <Text style={styles.yearText}>
            Year Published: {item.yearpublished}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const openBoardgameDetail = (gameId) => {
    console.log(gameId);
    var stringGameId = gameId.toString();
    props.navigation.navigate("BoardgameDetail", { stringGameId });
  };

  const openMainScreen = async () => {
    props.navigation.navigate("MainScreen");
  };

  return (
    <View style={[styles.container]}>
      <TouchableOpacity onPress={handleModalClose}>
        <View>
          <Text
            // onPress={onPress}
            style={[styles.addButton]}
          >
            Add game
          </Text>
        </View>
      </TouchableOpacity>
      <View style={styles.searchRow}>
        <TextInput
          onChangeText={(text) => handleSearchText(text)}
          placeholder="Search collection"
          style={[styles.searchBar]}
        />
        <View style={[styles.icon]} onPress={handleSearchButton}>
          <Fontisto
            name={"zoom"}
            size={24}
            color={"#EEEEEE"}
            onPress={handleSearchButton}
          />
        </View>
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${index}`}
      />

      <View style={[styles.bottomContainer]}>
        <TouchableOpacity
          style={[styles.buttonBottom]}
          onPress={openMainScreen}
        >
          <Text style={[styles.textBtn]}>Main screen</Text>
        </TouchableOpacity>
        <View style={[styles.buttonBottom]}>
          <Text style={[styles.textBtn]}>Collection</Text>
        </View>
        <TouchableOpacity style={[styles.buttonBottom]}>
          <Text style={[styles.textBtn]}>Game Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonBottom]}>
          <Text style={[styles.textBtn]}>Players</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    marginTop: 20,
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
    marginVertical: 10,
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
    // borderRadius: 20,
  },
  textBtn: {
    fontSize: 18,
    textAlign: "center",
    color: "#EEEEEE",
  },
});

export default Collection;
