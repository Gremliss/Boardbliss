import { AntDesign, Fontisto, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Dimensions,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import FilterModal from "../components/FilterModal";
import NewGameModal from "../components/NewGameModal";
import RoundIconBtn from "../components/RoundIconButton";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const Collection = (props) => {
  const [collection, setCollection] = useState();
  const [searchText, setSearchText] = useState("");
  const [longPressActive, setLongPressActive] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const fetchCollection = async () => {
    const result = await AsyncStorage.getItem("collection");
    if (result?.length) setCollection(JSON.parse(result));
  };
  useEffect(() => {
    console.log(collection);
    fetchCollection();
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackButton
    );
    return () => backHandler.remove();
  }, [props.navigation]);

  useFocusEffect(
    React.useCallback(() => {
      fetchCollection();
    }, [])
  );

  const handleBackButton = () => {
    fetchCollection();
    return;
  };

  const handleKeyboardDismiss = () => {
    Keyboard.dismiss();
  };

  const handleLongPress = async (item) => {
    if (!longPressActive) {
      collection.forEach((item) => {
        item.isChecked = false;
      });
      handleCheckButton(item);
      setLongPressActive(true);
    }
  };

  const handleCheckButton = async (item) => {
    item.isChecked == false
      ? (item.isChecked = true)
      : (item.isChecked = false);
    await AsyncStorage.setItem("collection", JSON.stringify(collection));
    fetchCollection();
  };

  const renderItem = ({ item, index }) => {
    const backgroundColor = index % 2 === 0 ? "#a5bec0" : "#c3d4d5";
    return (
      <TouchableOpacity
        onPress={() => handleItemPressed(item)}
        onLongPress={() => handleLongPress(item)}
      >
        <View
          style={[styles.itemContainer, { backgroundColor: backgroundColor }]}
        >
          <View style={[styles.flexRow]}>
            {longPressActive ? (
              <View style={styles.checkIcon}>
                <MaterialIcons
                  name={
                    item.isChecked ? "check-box" : "check-box-outline-blank"
                  }
                  size={20}
                />
              </View>
            ) : null}
            <View
              style={[styles.centerStyle, styles.cellContainer, { flex: 0.5 }]}
            >
              <Text style={[{ color: "#1b232e" }]}>{index + 1}</Text>
            </View>
            <View style={[styles.cellContainer, { flex: 4 }]}>
              <Text style={[{ paddingHorizontal: 8 }]}>{item.name}</Text>
              <Text style={styles.yearText}>{item.yearpublished}</Text>
            </View>
            <View style={[styles.centerStyle, styles.cellContainer]}>
              <Text>{item.rating}</Text>
            </View>
            <View style={[styles.centerStyle, styles.cellContainer]}>
              <Text>{item.maxPlayers}</Text>
            </View>
            <View style={[styles.centerStyle, styles.cellContainer]}>
              <Text>{item.maxPlaytime}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleItemPressed = async (item) => {
    longPressActive
      ? handleCheckButton(item)
      : openCollectionBoardgameDetail(item);
  };

  const openCollectionBoardgameDetail = (item) => {
    props.navigation.navigate("CollectionBoardgameDetail", { item });
  };

  const handleExitButton = async () => {
    collection.forEach((item) => {
      item.isChecked = false;
    });
    setLongPressActive(false);
  };

  const displayDeleteAlert = () => {
    var count = 0;
    collection.forEach((item) => {
      item.isChecked ? count++ : null;
    });
    Alert.alert(
      "Are you sure?",
      `This will delete ${count} checked games from collection with all their stats`,
      [
        { text: "Delete", onPress: () => deleteCheckedGames() },
        { text: "Cancel", onPress: () => null },
      ],
      { cancelable: true }
    );
  };

  const deleteCheckedGames = async () => {
    const newCollection = collection.filter((n) => n.isChecked !== true);
    setCollection(newCollection);
    await AsyncStorage.setItem("collection", JSON.stringify(newCollection));
  };

  const openMainScreen = async () => {
    props.navigation.navigate("MainScreen");
  };

  const handleSearchText = async (text) => {
    setSearchText(text);
    if (!text.trim()) {
      setSearchText("");
      fetchCollection();
    }
    const filteredCollection = collection.filter((item) => {
      if (item.name?.toLowerCase().includes(text.toLowerCase())) {
        return item;
      }
    });

    if (filteredCollection.length) {
      setCollection([...filteredCollection]);
    } else {
      ToastAndroid.show("Games not found", 2000);
    }
  };

  const handleOnClear = async () => {
    setSearchText("");
    await fetchCollection();
  };

  const addNewGame = async (newGame) => {
    if (!collection) {
      collection = [];
    }
    const updatedCollection = [...collection, newGame];
    setCollection(updatedCollection);
    await AsyncStorage.setItem("collection", JSON.stringify(updatedCollection));
  };

  const handleFilter = async (filterItems) => {
    var filteredCollection = collection;
    if (filterItems.yearpublished) {
      filteredCollection = filteredCollection.filter((item) => {
        if (item.yearpublished) {
          if (item.yearpublished.includes(filterItems.yearpublished)) {
            return item;
          }
        }
      });
    }

    if (filterItems.players) {
      filteredCollection = filteredCollection.filter((item) => {
        if (item.maxPlayers) {
          if (
            item.minPlayers <= filterItems.players &&
            filterItems.players <= item.maxPlayers
          ) {
            return item;
          }
        }
      });
    }
    if (filterItems.maxPlaytime) {
      filteredCollection = filteredCollection.filter((item) => {
        if (item.maxPlaytime) {
          if (Number(item.maxPlaytime) <= Number(filterItems.maxPlaytime)) {
            return item;
          }
        }
      });
    }
    if (filterItems.minPlaytime) {
      filteredCollection = filteredCollection.filter((item) => {
        if (item.minPlaytime) {
          if (Number(item.minPlaytime) >= Number(filterItems.minPlaytime)) {
            return item;
          }
        }
      });
    }
    if (filterItems.rating) {
      filteredCollection = filteredCollection.filter((item) => {
        if (item.rating) {
          if (Number(item.rating) >= Number(filterItems.rating)) {
            return item;
          }
        }
      });
    }

    if (filterItems.owner) {
      if (filterItems.owner !== "All") {
        filteredCollection = filteredCollection.filter((item) => {
          if (item.owner) {
            if (item.owner === filterItems.owner) {
              return item;
            }
          }
        });
      }
    }

    if (filteredCollection.length) {
      setCollection(filteredCollection);
    } else {
      fetchCollection;
      ToastAndroid.show("Games not found", 2000);
    }
  };

  return (
    <View style={[styles.container]}>
      <TouchableWithoutFeedback onPress={handleKeyboardDismiss}>
        <View>
          <TouchableOpacity
            style={[styles.addButton]}
            onPress={() => setModalVisible(true)}
          >
            <Text
              style={[{ fontSize: 20, textAlign: "center", color: "#EEEEEE" }]}
            >
              Add game
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
      <View style={styles.searchRow}>
        <TextInput
          value={searchText}
          onChangeText={(text) => handleSearchText(text)}
          placeholder="Search collection"
          style={[styles.searchBar, { color: "#EEEEEE" }]}
          placeholderTextColor="#EEEEEE70"
        />
        <AntDesign
          name="close"
          size={20}
          onPress={handleOnClear}
          style={styles.clearIcon}
        />
        <TouchableOpacity
          style={[styles.icon]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Fontisto name={"filter"} size={20} color={"#EEEEEE"} />
        </TouchableOpacity>
      </View>

      <View style={[styles.itemContainer, { opacity: 0.4 }]}>
        <View style={[styles.flexRow]}>
          <View
            style={[styles.centerStyle, styles.cellContainer, { flex: 0.5 }]}
          >
            <Text style={[{ color: "#EEEEEE" }]}>Nr</Text>
          </View>
          <View style={[styles.cellContainer, { flex: 4 }]}>
            <Text style={[{ paddingHorizontal: 8, color: "#EEEEEE" }]}>
              Name
            </Text>
          </View>
          <View style={[styles.centerStyle, styles.cellContainer]}>
            <Text style={[{ color: "#EEEEEE" }]}>Rating</Text>
          </View>
          <View style={[styles.centerStyle, styles.cellContainer]}>
            <Text style={[{ color: "#EEEEEE" }]}>Players</Text>
          </View>
          <View style={[styles.centerStyle, styles.cellContainer]}>
            <Text style={[{ color: "#EEEEEE" }]}>Time</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={collection}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${index}`}
        showsVerticalScrollIndicator={true}
        showsHorizontalScrollIndicator={true}
      />
      {longPressActive ? (
        <View>
          <RoundIconBtn
            onPress={displayDeleteAlert}
            antIconName={"delete"}
            style={styles.deleteBtn}
          />
          <RoundIconBtn
            onPress={() => handleExitButton()}
            antIconName={"close"}
            style={styles.closeBtn}
          />
        </View>
      ) : (
        <View style={[styles.bottomContainer]}>
          <View style={[styles.buttonBottom, { opacity: 1 }]}>
            <Text style={[styles.textBtn]}>Collection</Text>
          </View>
          <TouchableOpacity
            style={[styles.buttonBottom]}
            onPress={openMainScreen}
          >
            <Text style={[styles.textBtn]}>Search BGG</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity style={[styles.buttonBottom]}>
            <Text style={[styles.textBtn]}>Game Calendar</Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            style={[styles.buttonBottom]}
            onPress={() => props.navigation.navigate("Players")}
          >
            <Text style={[styles.textBtn]}>Players</Text>
          </TouchableOpacity>
        </View>
      )}

      <NewGameModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={addNewGame}
      />
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onSubmit={handleFilter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#222831",
    flex: 1,
  },
  searchRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  flexRow: {
    flexDirection: "row",
  },
  searchBar: {
    backgroundColor: "#393E46",
    fontSize: 20,
    color: "#EEEEEE",
    padding: 10,
    flex: 5,
    paddingRight: 40,
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
    color: "#EEEEEE",
    padding: 10,
    paddingBottom: 12,
    borderRadius: 50,
    elevation: 5,
    marginVertical: 15,
    marginHorizontal: 120,
  },
  itemContainer: {
    backgroundColor: "#00ADB5",
    borderRadius: 8,
    margin: 1,
  },
  yearText: {
    fontSize: 12,
    opacity: 0.6,
    paddingLeft: 8,
    fontStyle: "italic",
  },
  bottomContainer: {
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
    opacity: 0.6,
  },
  textBtn: {
    fontSize: 18,
    textAlign: "center",
    color: "#EEEEEE",
  },
  deleteBtn: {
    position: "absolute",
    left: 25,
    bottom: 60,
    zIndex: 1,
    backgroundColor: "#943737",
  },
  closeBtn: {
    position: "absolute",
    right: 25,
    bottom: 60,
    zIndex: 1,
    backgroundColor: "#393E46",
  },
  checkIcon: {
    justiftyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    width: 20,
    margin: 2,
  },
  cellContainer: {
    borderRightWidth: 1,
    paddingHorizontal: 1,
    borderColor: "#222831",
    paddingVertical: 4,
  },
  centerStyle: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  clearIcon: {
    position: "absolute",
    right: 70,
    alignSelf: "center",
    color: "#EEEEEE",
  },
});

export default Collection;
