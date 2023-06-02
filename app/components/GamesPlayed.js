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
import FilterModal from "./FilterModal";
import RoundIconBtn from "./RoundIconButton";
import NewGameplayModal from "./NewGameplayModal";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const GamesPlayed = (props) => {
  const [gameParams, setGameParams] = useState(props.route.params.gameParams);
  const [collection, setCollection] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [longPressActive, setLongPressActive] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

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
      gameParams.stats.forEach((item) => {
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

  const renderPlayers = (players, type, scoreType) => {
    // Convert the players object into an array of [name, value] pairs
    var sortedPlayers;

    if (type == "Rivalry") {
      if (scoreType == "Points") {
        // Sort the player array based on the values in descending order
        sortedPlayers = players.sort((a, b) => b.points - a.points);
      } else {
        // Sort the player array based on the values in asscending order
        sortedPlayers = players.sort((a, b) => a.points - b.points);
      }

      return sortedPlayers.map((item) => (
        <View key={item.name} style={[styles.flexRow]}>
          <View
            style={[
              styles.centerStyle,
              { borderBottomWidth: 0, borderRightWidth: 0 },
            ]}
          >
            {item.victory ? (
              <Text>{item.name} 🏆</Text>
            ) : (
              <Text>{item.name}</Text>
            )}
            {/* <Text>{item.name}</Text> */}
          </View>
          <View
            style={[
              styles.centerStyle,
              { borderBottomWidth: 0, borderRightWidth: 0 },
            ]}
          >
            <Text>{item.points}</Text>
          </View>
        </View>
      ));
    } else {
      // Sort the player array based on the names in alphabetical order
      sortedPlayers = players.sort((a, b) => a.name.localeCompare(b.name));
      return sortedPlayers.map((item) => (
        <View key={item.name} style={[styles.flexRow]}>
          <View
            style={[
              styles.centerStyle,
              { borderBottomWidth: 0, borderRightWidth: 0 },
            ]}
          >
            <Text>{item.name}</Text>
          </View>
        </View>
      ));
    }
  };

  const formatDate = (enteredDay, enteredMonth, enteredYear) => {
    const day = checkFormat(enteredDay);
    const month = checkFormat(enteredMonth);
    const year = checkFormat(enteredYear);
    return `${day}/${month}/${year}`;
  };

  const checkFormat = (value) => {
    if (value > 9) {
      var newValue = value;
    } else {
      var newValue = "0" + value;
    }
    return newValue;
  };

  const renderItem = ({ item, index }) => {
    const backgroundColor = index % 2 === 0 ? "#00ADB5" : "#0b6c70";

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
                  color="white"
                />
              </View>
            ) : null}
            <View
              style={[styles.centerStyle, styles.cellContainer, { flex: 0.5 }]}
            >
              <Text>{index + 1}</Text>
            </View>
            <View
              style={[styles.centerStyle, styles.cellContainer, { flex: 2 }]}
            >
              <Text>
                {formatDate(item.date.day, item.date.month, item.date.year)}
              </Text>
              {item.type == "Rivalry" ? (
                <Text style={[styles.opacityText]}>{item.scoreType}</Text>
              ) : null}
              {item.duration ? (
                <View style={[styles.flexRow]}>
                  {item.duration.hours ? (
                    <Text style={[styles.opacityText, { paddingRight: 2 }]}>
                      {item.duration.hours} h
                    </Text>
                  ) : null}
                  {item.duration.min ? (
                    <Text style={[styles.opacityText]}>
                      {item.duration.min} min
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
            {item.type == "Co-Op" ? (
              <>
                <View style={[styles.cellContainer, { flex: 2 }]}>
                  {renderPlayers(item.players, item.type, item.scoreType)}
                </View>
                <View
                  style={[
                    styles.centerStyle,
                    styles.cellContainer,
                    { flex: 2 },
                  ]}
                >
                  <Text>
                    {item.coop.victory == "Yes" ? "Victory" : "Loose"}
                  </Text>
                  {item.coop.points ? (
                    <Text>Score: {item.coop.points}</Text>
                  ) : null}
                </View>
              </>
            ) : (
              <View style={[styles.cellContainer, { flex: 4 }]}>
                {renderPlayers(item.players, item.type, item.scoreType)}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleItemPressed = async (item) => {
    longPressActive ? handleCheckButton(item) : openGameplayDetail(item);
  };

  const openGameplayDetail = (item) => {
    // props.navigation.navigate("CollectionBoardgameDetail", { item });
  };

  const handleExitButton = async () => {
    gameParams.stats.forEach((item) => {
      item.isChecked = false;
    });
    setLongPressActive(false);
  };

  const displayDeleteAlert = () => {
    var count = 0;
    gameParams.stats.forEach((item) => {
      item.isChecked ? count++ : null;
    });
    Alert.alert(
      "Are you sure?",
      `This will delete ${count} checked gameplays with all their stats`,
      [
        { text: "Delete", onPress: () => deleteCheckedGameplays() },
        { text: "Cancel", onPress: () => null },
      ],
      { cancelable: true }
    );
  };

  const deleteCheckedGameplays = async () => {
    const newGameplay = gameParams.stats.filter((n) => n.isChecked !== true);

    setGameParams({ ...gameParams, stats: newGameplay });
    setCollection((prevCollection) =>
      prevCollection.map((obj) =>
        obj.id === gameParams.id ? (obj.stats = newGameplay) : obj
      )
    );
    // setCollection(newGameplay);
    // await AsyncStorage.setItem("players", JSON.stringify(newGameplay));
  };

  useEffect(() => {
    setCollection((prevCollection) =>
      prevCollection.map((obj) =>
        obj.id === gameParams.id ? { ...obj, stats: gameParams.stats } : obj
      )
    );
  }, [gameParams]);

  useEffect(() => {
    asyncSetCollection();
  }, [collection]);

  const asyncSetCollection = async () => {
    await AsyncStorage.setItem("collection", JSON.stringify(collection));
  };

  const addNewGameplay = async (newGameplay) => {
    if (!gameParams.stats) {
      gameParams.stats = [];
    }
    setGameParams((prevState) => ({
      ...prevState,
      stats: [...prevState.stats, newGameplay],
    }));
  };

  // Sort the gameParams.stats array by date
  // const sortedStats = gameParams.stats.sort((a, b) => {
  //   const dateA = new Date(a.date.year, a.date.month - 1, a.date.day);
  //   const dateB = new Date(b.date.year, b.date.month - 1, b.date.day);
  //   return dateA - dateB;
  // });

  const sortedStats = gameParams.stats.sort((a, b) => {
    // Compare the dates
    const dateComparison = compareDates(a.date, b.date);
    if (dateComparison !== 0) {
      return dateComparison; // Sort by date
    }

    // Dates are the same, compare IDs
    return a.id - b.id;
  });

  function compareDates(date1, date2) {
    // Compare years
    if (date1.year !== date2.year) {
      return date1.year - date2.year;
    }
    // Compare months
    if (date1.month !== date2.month) {
      return date1.month - date2.month;
    }
    // Compare days
    return date1.day - date2.day;
  }

  return (
    <View style={[styles.container]}>
      <TouchableWithoutFeedback onPress={handleKeyboardDismiss}>
        <View>
          <TouchableOpacity
            style={[styles.addButton]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={[{ fontSize: 20, textAlign: "center" }]}>
              Add gameplay
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>

      <View style={[styles.itemContainer, { opacity: 0.4 }]}>
        <View style={[styles.flexRow]}>
          <View
            style={[styles.centerStyle, styles.cellContainer, { flex: 0.5 }]}
          >
            <Text>Nr</Text>
          </View>
          <View style={[styles.centerStyle, styles.cellContainer, { flex: 2 }]}>
            <Text style={[{ paddingHorizontal: 8 }]}>Info</Text>
          </View>
          <View style={[styles.centerStyle, styles.cellContainer, { flex: 2 }]}>
            <Text style={[{ paddingHorizontal: 8 }]}>Players</Text>
          </View>
          <View style={[styles.centerStyle, styles.cellContainer, { flex: 2 }]}>
            <Text style={[{ paddingHorizontal: 8 }]}>Result</Text>
          </View>
        </View>
      </View>
      <View style={[{ flex: 1 }]}>
        {gameParams.stats ? (
          <FlatList
            data={sortedStats.reverse()}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${index}`}
            // inverted
          />
        ) : null}
      </View>

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
          <TouchableOpacity
            style={[styles.buttonBottom]}
            onPress={() =>
              props.navigation.navigate("CollectionBoardgameDetail", {
                gameParams,
              })
            }
          >
            <Text style={[styles.textBtn]}>{gameParams.name}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buttonBottom]}
            onPress={() =>
              props.navigation.navigate("EditBoardGame", {
                gameParams,
              })
            }
          >
            <Text style={[styles.textBtn]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buttonBottom]}
            onPress={() =>
              props.navigation.navigate("BoardGameStats", {
                gameParams,
              })
            }
          >
            <Text style={[styles.textBtn]}>Stats</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.buttonBottom, { opacity: 1 }]}>
            <Text style={[styles.textBtn]}>Games played</Text>
          </TouchableOpacity>
        </View>
      )}
      <NewGameplayModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={addNewGameplay}
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
    borderRadius: 50,
    elevation: 5,
    marginVertical: 20,
    marginHorizontal: 80,
  },
  itemContainer: {
    backgroundColor: "#00ADB5",
    borderRadius: 8,
    margin: 1,
  },
  opacityText: {
    fontSize: 12,
    opacity: 0.6,
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
    // borderRightWidth: 1,
    // paddingHorizontal: 1,
    // borderColor: "#222831",
    // paddingVertical: 4,
  },
  centerStyle: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    borderRightWidth: 1,
    paddingBottom: 1,
  },
  clearIcon: {
    position: "absolute",
    right: 70,
    alignSelf: "center",
  },
});

export default GamesPlayed;
