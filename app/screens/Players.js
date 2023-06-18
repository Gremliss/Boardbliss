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
import RoundIconBtn from "../components/RoundIconButton";
import NewPlayerModal from "../components/NewPlayerModal";
import colors from "../misc/colors";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const Players = (props) => {
  const [players, setPlayers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [longPressActive, setLongPressActive] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const fetchPlayers = async () => {
    const result = await AsyncStorage.getItem("players");
    if (result?.length) setPlayers(JSON.parse(result));
  };
  useEffect(() => {
    fetchPlayers();
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackButton
    );
    return () => backHandler.remove();
  }, [props.navigation]);

  useFocusEffect(
    React.useCallback(() => {
      fetchPlayers();
    }, [])
  );

  const handleBackButton = () => {
    fetchPlayers();
    return;
  };

  const handleKeyboardDismiss = () => {
    Keyboard.dismiss();
  };

  const handleLongPress = async (item) => {
    if (!longPressActive) {
      players.forEach((item) => {
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
    await AsyncStorage.setItem("players", JSON.stringify(players));
    fetchPlayers();
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
            <View style={[styles.cellContainer, { flex: 4 }]}>
              <Text style={[{ paddingHorizontal: 8 }]}>{item.name}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleItemPressed = async (item) => {
    longPressActive ? handleCheckButton(item) : openPlayerDetail(item);
  };

  const openPlayerDetail = (item) => {
    // props.navigation.navigate("CollectionBoardgameDetail", { item });
  };

  const handleExitButton = async () => {
    players.forEach((item) => {
      item.isChecked = false;
    });
    setLongPressActive(false);
  };

  const displayDeleteAlert = () => {
    var count = 0;
    players.forEach((item) => {
      item.isChecked ? count++ : null;
    });
    Alert.alert(
      "Are you sure?",
      `This will delete ${count} checked players with all their stats`,
      [
        { text: "Delete", onPress: () => deleteCheckedPlayers() },
        { text: "Cancel", onPress: () => null },
      ],
      { cancelable: true }
    );
  };

  const deleteCheckedPlayers = async () => {
    const newPlayers = players.filter((n) => n.isChecked !== true);
    setPlayers(newPlayers);
    await AsyncStorage.setItem("players", JSON.stringify(newPlayers));
  };

  const handleSearchText = async (text) => {
    setSearchText(text);
    if (!text.trim()) {
      setSearchText("");
      fetchPlayers();
    }
    const filteredPlayers = players.filter((item) => {
      if (item.name.toLowerCase().includes(text.toLowerCase())) {
        return item;
      }
    });

    if (filteredPlayers.length) {
      setPlayers([...filteredPlayers]);
    } else {
      ToastAndroid.show("Players not found", 2000);
    }
  };

  const handleOnClear = async () => {
    setSearchText("");
    await fetchPlayers();
  };

  const addNewPlayer = async (text) => {
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

  // const handleFilter = async (filterItems) => {
  //   var filteredPlayers = players;
  //   if (filterItems.yearpublished) {
  //     filteredPlayers = filteredPlayers.filter((item) => {
  //       if (item.yearpublished) {
  //         if (item.yearpublished.includes(filterItems.yearpublished)) {
  //           return item;
  //         }
  //       }
  //     });
  //   }

  //   if (filterItems.players) {
  //     filteredPlayers = filteredPlayers.filter((item) => {
  //       if (item.maxPlayers) {
  //         if (
  //           item.minPlayers <= filterItems.players &&
  //           filterItems.players <= item.maxPlayers
  //         ) {
  //           return item;
  //         }
  //       }
  //     });
  //   }
  //   if (filterItems.maxPlaytime) {
  //     filteredPlayers = filteredPlayers.filter((item) => {
  //       if (item.maxPlaytime) {
  //         if (Number(item.maxPlaytime) <= Number(filterItems.maxPlaytime)) {
  //           return item;
  //         }
  //       }
  //     });
  //   }
  //   if (filterItems.minPlaytime) {
  //     filteredPlayers = filteredPlayers.filter((item) => {
  //       if (item.minPlaytime) {
  //         if (Number(item.minPlaytime) >= Number(filterItems.minPlaytime)) {
  //           return item;
  //         }
  //       }
  //     });
  //   }
  //   if (filterItems.rating) {
  //     filteredPlayers = filteredPlayers.filter((item) => {
  //       if (item.rating) {
  //         if (Number(item.rating) >= Number(filterItems.rating)) {
  //           return item;
  //         }
  //       }
  //     });
  //   }

  //   if (filterItems.owner) {
  //     if (filterItems.owner !== "All") {
  //       filteredPlayers = filteredPlayers.filter((item) => {
  //         if (item.owner) {
  //           if (item.owner === filterItems.owner) {
  //             return item;
  //           }
  //         }
  //       });
  //     }
  //   }

  //   if (filteredPlayers.length) {
  //     setPlayers(filteredPlayers);
  //   } else {
  //     fetchPlayers;
  //     ToastAndroid.show("Games not found", 2000);
  //   }
  // };

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
              Add player
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
      <View style={styles.searchRow}>
        <TextInput
          value={searchText}
          onChangeText={(text) => handleSearchText(text)}
          placeholder="Search player"
          style={[styles.searchBar]}
          placeholderTextColor="#EEEEEE70"
        />
        <AntDesign
          name="close"
          size={20}
          onPress={handleOnClear}
          style={styles.clearIcon}
        />
        {/* <TouchableOpacity
          style={[styles.icon]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Fontisto name={"filter"} size={20} color={colors.LIGHT} />
        </TouchableOpacity> */}
      </View>

      <View style={[styles.itemContainer, { opacity: 0.8 }]}>
        <View style={[styles.flexRow]}>
          <View
            style={[styles.centerStyle, styles.cellContainer, { flex: 0.5 }]}
          >
            <Text style={[{ color: colors.LIGHT }]}>Nr</Text>
          </View>
          <View style={[styles.cellContainer, { flex: 4 }]}>
            <Text style={[{ paddingHorizontal: 8, color: colors.LIGHT }]}>
              Name
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={players}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${index}`}
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
          <TouchableOpacity
            style={[styles.buttonBottom]}
            onPress={() => props.navigation.navigate("Collection")}
          >
            <Text style={[styles.textBtn]}>Collection</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buttonBottom]}
            onPress={() => props.navigation.navigate("SearchBgg")}
          >
            <Text style={[styles.textBtn]}>Search BGG</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity style={[styles.buttonBottom]}>
            <Text style={[styles.textBtn]}>Game Calendar</Text>
          </TouchableOpacity> */}
          <TouchableOpacity style={[styles.buttonBottom, { opacity: 1 }]}>
            <Text style={[styles.textBtn]}>Players</Text>
          </TouchableOpacity>
        </View>
      )}
      <NewPlayerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={addNewPlayer}
      />
      {/* <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onSubmit={handleFilter}
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.LIGHT,
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
    paddingBottom: 12,
    borderRadius: 50,
    elevation: 5,
    marginVertical: 15,
    marginHorizontal: 120,
  },
  itemContainer: {
    backgroundColor: colors.PRIMARY,
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
    borderColor: colors.LIGHT,
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
  },
  closeBtn: {
    position: "absolute",
    right: 25,
    bottom: 60,
    zIndex: 1,
    backgroundColor: colors.GRAY,
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
    borderColor: colors.LIGHT,
    paddingVertical: 4,
  },
  centerStyle: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  clearIcon: {
    position: "absolute",
    right: 20,
    alignSelf: "center",
    color: colors.LIGHT,
  },
});

export default Players;
