import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useContext, useEffect, useState } from "react";
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
import RoundIconBtn from "../components/RoundIconButton";
import NewPlayerModal from "../components/NewPlayerModal";
import { ColorContext } from "../misc/ColorContext";

// const windowWidth = Dimensions.get("window").width;
// const windowHeight = Dimensions.get("window").height;

const Players = (props) => {
  const { currentColors } = useContext(ColorContext);
  const [collection, setCollection] = useState([]);
  const [players, setPlayers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [longPressActive, setLongPressActive] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchCollection = async () => {
    const result = await AsyncStorage.getItem("collection");
    if (result?.length) setCollection(JSON.parse(result));
  };
  const fetchPlayers = async () => {
    const result = await AsyncStorage.getItem("players");
    if (result?.length) setPlayers(JSON.parse(result));
  };
  useEffect(() => {
    fetchPlayers();
    fetchCollection();
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
      index % 2 === 0
        ? currentColors.LIST_COLOR_ONE
        : currentColors.LIST_COLOR_TWO;
    return (
      <TouchableOpacity
        onPress={() => handleItemPressed(item)}
        onLongPress={() => handleLongPress(item)}
      >
        <View
          style={[styles.itemContainer, { backgroundColor: backgroundColor }]}
        >
          <View style={[styles.flexRow]}>
            <View
              style={[styles.centerStyle, styles.cellContainer, { flex: 0.5 }]}
            >
              <Text>{index + 1}</Text>
            </View>
            <View style={[styles.cellContainer, { flex: 3 }]}>
              <Text style={[{ paddingHorizontal: 8 }]}>{item.name}</Text>
            </View>
            {!longPressActive ? (
              <View style={[styles.buttonContainer]}>
                <AntDesign
                  name="arrowup"
                  size={20}
                  onPress={() => movePlayer(index, "up")}
                  style={styles.arrowButton}
                />
                <AntDesign
                  name="arrowdown"
                  size={20}
                  onPress={() => movePlayer(index, "down")}
                  style={styles.arrowButton}
                />
              </View>
            ) : (
              <View style={styles.checkIcon}>
                <MaterialIcons
                  name={
                    item.isChecked ? "check-box" : "check-box-outline-blank"
                  }
                  size={25}
                  color={currentColors.LIGHT}
                />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const movePlayer = async (index, direction) => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === players.length - 1)
    ) {
      return;
    }

    const newPlayers = [...players];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    [newPlayers[index], newPlayers[targetIndex]] = [
      newPlayers[targetIndex],
      newPlayers[index],
    ];
    setPlayers(newPlayers);
    await AsyncStorage.setItem("players", JSON.stringify(newPlayers));
  };

  const handleItemPressed = async (item) => {
    longPressActive ? handleCheckButton(item) : openPlayerDetail(item);
  };

  const openPlayerDetail = (item) => {
    props.navigation.navigate("PlayerDetail", { item, collection });
  };

  const handleExitButton = async () => {
    players.forEach((item) => {
      item.isChecked = false;
    });
    setLongPressActive(false);
  };

  const displayDeleteAlert = () => {
    let count = 0;
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
      fetchPlayers();
      ToastAndroid.show("Player not found", 1500);
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

  const styles = StyleSheet.create({
    container: {
      backgroundColor: currentColors.BACKGROUND,
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
      backgroundColor: currentColors.GRAY,
      fontSize: 20,
      color: currentColors.LIGHT,
      padding: 12,
      flex: 5,
      paddingRight: 40,
      borderRadius: 5,
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
      color: currentColors.LIGHT,
      padding: 10,
      paddingBottom: 12,
      borderRadius: 15,
      elevation: 5,
      marginVertical: 15,
      marginHorizontal: 8,
    },
    itemContainer: {
      backgroundColor: currentColors.PRIMARY,
      borderRadius: 8,
      margin: 1,
      padding: 3,
    },
    yearText: {
      fontSize: 12,
      opacity: 0.6,
      paddingLeft: 8,
      fontStyle: "italic",
    },
    deleteBtn: {
      position: "absolute",
      left: 25,
      bottom: 60,
      zIndex: 1,
      backgroundColor: currentColors.RED,
      color: currentColors.LIGHT,
    },
    checkBtn: {
      position: "absolute",
      right: 25,
      bottom: 60,
      zIndex: 1,
      backgroundColor: currentColors.PRIMARY,
      color: currentColors.LIGHT,
    },
    checkIcon: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      width: 20,
      margin: 2,
    },
    cellContainer: {
      borderRightWidth: 1,
      paddingHorizontal: 1,
      borderColor: currentColors.BACKGROUND,
      paddingVertical: 11,
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
      color: currentColors.LIGHT,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    arrowButton: {
      backgroundColor: currentColors.PRIMARY,
      color: currentColors.LIGHT,
      padding: 8,
      paddingTop: 11,
      borderRadius: 4,
      marginHorizontal: 4,
    },
  });

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
                {
                  fontSize: 20,
                  textAlign: "center",
                  color: currentColors.LIGHT,
                },
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
          placeholderTextColor={currentColors.PLACEHOLDER}
        />
        <AntDesign
          name="close"
          size={20}
          onPress={handleOnClear}
          style={styles.clearIcon}
        />
      </View>

      <View style={[styles.itemContainer, { opacity: 0.8 }]}>
        <View style={[styles.flexRow]}>
          <View
            style={[styles.centerStyle, styles.cellContainer, { flex: 0.5 }]}
          >
            <Text style={[{ color: currentColors.LIGHT }]}>Nr</Text>
          </View>
          <View style={[styles.cellContainer, { flex: 3 }]}>
            <Text
              style={[{ paddingHorizontal: 8, color: currentColors.LIGHT }]}
            >
              {longPressActive ? "Default Player" : "Player"}
            </Text>
          </View>
          <View style={[styles.centerStyle, styles.cellContainer, { flex: 1 }]}>
            <Text style={[{ color: currentColors.LIGHT }]}>
              {longPressActive ? "Check mark" : "Position"}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={players}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${index}`}
        initialNumToRender={16}
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
            antIconName={"check"}
            style={styles.checkBtn}
          />
        </View>
      ) : null}
      <NewPlayerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={addNewPlayer}
      />
    </View>
  );
};

export default Players;
