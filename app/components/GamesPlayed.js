import { MaterialIcons } from "@expo/vector-icons";
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
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import colors from "../misc/colors";
import NewGameplayModal from "./NewGameplayModal";
import RoundIconBtn from "./RoundIconButton";
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
const GamesPlayed = (props) => {
  const [gameParams, setGameParams] = useState(props.route.params.gameParams);
  const [collection, setCollection] = useState([]);
  const currentDate = new Date();
  const [gameplayParams, setGameplayParams] = useState({
    id: Date.now(),
    date: {
      day: currentDate.getDate(),
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
      hour: currentDate.getHours(),
      minutes: currentDate.getMinutes(),
    },
    players: [],
    type: "Rivalry",
    scoreType: "Points",
    isChecked: false,
    duration: { hours: null, min: null },
  });
  const [searchText, setSearchText] = useState("");
  const [longPressActive, setLongPressActive] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editGameplaymodalVisible, setEditGameplaymodalVisible] =
    useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const fetchCollection = async () => {
    const result = await AsyncStorage.getItem("collection");
    const parsedResult = JSON.parse(result);
    if (result?.length) setCollection(parsedResult);
    var newGameParams;
    parsedResult.map((item) => {
      if (item.id === gameParams.id) {
        newGameParams = item;
      }
    });
    if (newGameParams) setGameParams(newGameParams);
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
              {
                borderBottomWidth: 0,
                borderRightWidth: 0,
                alignItems: "flex-start",
              },
            ]}
          >
            {item.victory ? (
              <View style={[styles.flexRow, { justifyContent: "center" }]}>
                <View
                  style={[
                    styles.centerStyle,
                    {
                      flex: 0.3,
                      borderBottomWidth: 0,
                      borderRightWidth: 0,
                    },
                  ]}
                >
                  <Text>🏆 </Text>
                </View>
                <Text style={[{ flex: 1 }]}>{item.name} </Text>
              </View>
            ) : (
              <Text>{item.name}</Text>
            )}
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
    const backgroundColor =
      index % 2 === 0 ? colors.LIST_COLOR_ONE : colors.LIST_COLOR_TWO;
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
    setGameplayParams(item);
    setEditGameplaymodalVisible(true);
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

    const updatedCollection = collection.map((item) => {
      if (item.id === gameParams.id) {
        return {
          ...item,
          stats: newGameplay,
        };
      } else {
        return item;
      }
    });

    setCollection(updatedCollection);
    await AsyncStorage.setItem("collection", JSON.stringify(updatedCollection));
  };

  const addNewGameplay = async (newGameplay) => {
    if (!gameParams.stats) {
      gameParams.stats = [];
    }
    var newGameParams = { ...gameParams };
    const isExists = gameParams.stats.some(
      (item) => item.id === newGameplay.id
    );

    if (isExists) {
      newGameParams = {
        ...gameParams,
        stats: gameParams.stats.map((obj) =>
          obj.id === newGameplay.id ? newGameplay : obj
        ),
      };
    } else {
      newGameParams = {
        ...gameParams,
        stats: [...gameParams.stats, newGameplay],
      };
    }

    const updatedCollection = collection.map((item) => {
      if (item.id === newGameParams.id) {
        return {
          ...item,
          stats: newGameParams.stats,
        };
      } else {
        return item;
      }
    });
    setGameParams(newGameParams);
    setCollection(updatedCollection);
    await AsyncStorage.setItem("collection", JSON.stringify(updatedCollection));
  };

  const sortedStats = gameParams.stats.sort((a, b) => {
    // Compare the dates
    const dateComparison = compareDates(a.date, b.date);
    if (dateComparison !== 0) {
      return dateComparison; // Sort by date
    } else {
      // Dates are the same, compare IDs
      return a.id - b.id;
    }
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
            <Text
              style={[
                { fontSize: 20, textAlign: "center", color: colors.LIGHT },
              ]}
            >
              Add gameplay
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
      <View style={[styles.itemContainer, { opacity: 0.8 }]}>
        <View style={[styles.flexRow]}>
          <View
            style={[styles.centerStyle, styles.cellContainer, { flex: 0.5 }]}
          >
            <Text style={[{ color: colors.LIGHT }]}>Nr</Text>
          </View>
          <View style={[styles.centerStyle, styles.cellContainer, { flex: 2 }]}>
            <Text style={[{ paddingHorizontal: 8, color: colors.LIGHT }]}>
              Info
            </Text>
          </View>
          <View style={[styles.centerStyle, styles.cellContainer, { flex: 2 }]}>
            <Text style={[{ paddingHorizontal: 8, color: colors.LIGHT }]}>
              Players
            </Text>
          </View>
          <View style={[styles.centerStyle, styles.cellContainer, { flex: 2 }]}>
            <Text style={[{ paddingHorizontal: 8, color: colors.LIGHT }]}>
              Result
            </Text>
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
        </View>
      )}
      <NewGameplayModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={addNewGameplay}
        gameplayParams={gameplayParams}
        isExisting={false}
      />
      <NewGameplayModal
        visible={editGameplaymodalVisible}
        onClose={() => setEditGameplaymodalVisible(false)}
        onSubmit={addNewGameplay}
        gameplayParams={gameplayParams}
        isExisting={true}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.BACKGROUND,
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
    backgroundColor: colors.GRAY,
    fontSize: 20,
    color: colors.LIGHT,
    padding: 10,
    flex: 5,
    paddingRight: 40,
  },
  icon: {
    textAlign: "center",
    flex: 1,
    backgroundColor: colors.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: colors.PRIMARY,
    color: colors.LIGHT,
    padding: 10,
    borderRadius: 50,
    elevation: 5,
    marginVertical: 20,
    marginHorizontal: 80,
  },
  itemContainer: {
    backgroundColor: colors.PRIMARY,
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
    borderColor: colors.BACKGROUND,
    borderWidth: 1,
    backgroundColor: colors.PRIMARY,
    fontSize: 20,
    height: windowHeight / 8,
    opacity: 0.6,
  },
  textBtn: {
    fontSize: 18,
    textAlign: "center",
    color: colors.LIGHT,
  },
  deleteBtn: {
    position: "absolute",
    left: 25,
    bottom: 60,
    zIndex: 1,
    backgroundColor: colors.RED,
    color: colors.LIGHT,
  },
  closeBtn: {
    position: "absolute",
    right: 25,
    bottom: 60,
    zIndex: 1,
    backgroundColor: colors.GRAY,
    color: colors.LIGHT,
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
    // borderColor: colors.DARK,
    // paddingVertical: 4,
  },
  centerStyle: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    borderRightWidth: 1,
    paddingBottom: 1,
    borderColor: colors.BACKGROUND,
  },
  clearIcon: {
    position: "absolute",
    right: 70,
    alignSelf: "center",
  },
});
export default GamesPlayed;
