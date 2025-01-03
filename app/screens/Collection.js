import { AntDesign, Fontisto, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Dimensions,
  FlatList,
  Keyboard,
  StatusBar,
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
import { ColorContext } from "../misc/ColorContext";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const Collection = (props) => {
  const { currentColors } = useContext(ColorContext);
  const [collection, setCollection] = useState();
  const [searchText, setSearchText] = useState("");
  const [longPressActive, setLongPressActive] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [checkAllItems, setCheckAllItems] = useState(false);
  let todayDate = new Date();
  const [sortBy, setSortBy] = useState("Name");
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

  const checkDaysAgo = (item) => {
    const allDates = item.stats.map((stat) => stat.date);

    const todayDate = new Date();

    const newestDate = allDates.reduce((maxDate, currentDate) => {
      const current = new Date(
        currentDate.year,
        currentDate.month - 1,
        currentDate.day,
        currentDate.hour || 0,
        currentDate.minutes || 0
      );
      return maxDate === null || current > maxDate ? current : maxDate;
    }, null);

    const daysDifference = newestDate
      ? Math.floor((todayDate - newestDate) / (1000 * 60 * 60 * 24))
      : null;

    return daysDifference;
  };

  const sortCollection = (key, comparator, ascending = false) => {
    collection?.sort((a, b) => {
      const value_A =
        key === "Days ago" ? comparator(a) : a[key]?.toString().toLowerCase();
      const value_B =
        key === "Days ago" ? comparator(b) : b[key]?.toString().toLowerCase();

      if (value_A > value_B) {
        return ascending ? 1 : -1;
      } else if (value_A < value_B) {
        return ascending ? -1 : 1;
      } else {
        return 0;
      }
    });
  };

  switch (sortBy) {
    case "Rating":
      sortCollection("rating");
      break;
    case "Players":
      sortCollection("maxPlayers");
      break;
    case "Time":
      sortCollection("maxPlaytime", null, true);
      break;
    case "Days ago":
      sortCollection("Days ago", checkDaysAgo);
      break;
    default:
      sortCollection("name", null, true);
  }

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
    const updatedItems = collection.map((collectionItem) => {
      if (collectionItem.id === item.id) {
        return {
          ...collectionItem,
          isChecked: !collectionItem.isChecked,
        };
      }
      return collectionItem;
    });
    setCheckAllItems(false);
    setCollection(updatedItems);
  };

  const renderItem = ({ item, index }) => {
    const backgroundColor =
      index % 2 === 0
        ? currentColors.LIST_COLOR_ONE
        : currentColors.LIST_COLOR_TWO;

    const allDates = item.stats.map((stat) => stat.date);

    const newestDate = allDates.reduce((maxDate, currentDate) => {
      const current = new Date(
        currentDate.year,
        currentDate.month - 1,
        currentDate.day,
        currentDate.hour,
        currentDate.minutes
      );
      return current > maxDate ? current : maxDate;
    }, null);

    const daysDifference = newestDate
      ? Math.floor((todayDate - newestDate) / (1000 * 60 * 60 * 24))
      : null;

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
                  color={currentColors.LIGHT}
                />
              </View>
            ) : null}
            <View
              style={[styles.centerStyle, styles.cellContainer, { flex: 0.8 }]}
            >
              <Text style={[{ color: "#1b232e" }]}>{index + 1}</Text>
            </View>
            <View style={[styles.cellContainer, { flex: 3 }]}>
              <Text style={[{ paddingHorizontal: 8 }]}>{item.name}</Text>
              <View
                style={[styles.flexRow, { justifyContent: "space-between" }]}
              >
                <Text style={styles.yearText}>{item.yearpublished}</Text>
                {item.owner === "Yes" ? (
                  <Text style={styles.yearText}>✔ </Text>
                ) : null}
              </View>
            </View>
            <View style={[styles.centerStyle, styles.cellContainer]}>
              {!isNaN(parseFloat(item.rating).toFixed(2)) ? (
                <Text>{parseFloat(item.rating).toFixed(2)}</Text>
              ) : null}
            </View>
            <View style={[styles.centerStyle, styles.cellContainer]}>
              <Text>{item.maxPlayers}</Text>
            </View>
            <View style={[styles.centerStyle, styles.cellContainer]}>
              <Text>{item.maxPlaytime}</Text>
            </View>
            <View style={[styles.centerStyle, styles.cellContainer]}>
              <Text>{daysDifference != null ? daysDifference : "-"}</Text>
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
    let count = 0;
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
    const result = await AsyncStorage.getItem("collection");
    const parsedResult = JSON.parse(result);
    const itemsToDelete = collection.filter((n) => n.isChecked === true);
    const updatedResult = parsedResult.filter((item) => {
      return !itemsToDelete.some((deleteItem) => deleteItem.id === item.id);
    });
    await AsyncStorage.setItem("backupCollection", JSON.stringify(collection));
    setCollection(updatedResult);
    await AsyncStorage.setItem("collection", JSON.stringify(updatedResult));
    setCheckAllItems(false);
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
      fetchCollection();
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
    await AsyncStorage.setItem("backupCollection", JSON.stringify(collection));
    setCollection(updatedCollection);
    await AsyncStorage.setItem("collection", JSON.stringify(updatedCollection));
  };

  const handleFilter = async (filterItems, sortBy) => {
    const result = await AsyncStorage.getItem("collection");
    let filteredCollection = JSON.parse(result);
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

    if (filterItems.expansion !== true) {
      filteredCollection = filteredCollection.filter((item) => {
        if (item.expansion !== true) {
          return item;
        }
      });
    }

    if (filteredCollection.length) {
      setCollection(filteredCollection);
      setSortBy(sortBy);
    } else {
      fetchCollection();
      ToastAndroid.show("Games not found", 2000);
    }
  };

  const handleCheckAllItems = async () => {
    if (checkAllItems) {
      collection.forEach((item) => {
        item.isChecked = false;
      });
      setCheckAllItems(false);
    } else {
      collection.forEach((item) => {
        item.isChecked = true;
      });
      setCheckAllItems(true);
    }
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
      elevation: 5,
      marginHorizontal: 40,
      borderWidth: 1,
      borderColor: currentColors.PRIMARY_OPACITY,
    },
    addButtonTopRadius: {
      borderTopRightRadius: 30,
      borderTopLeftRadius: 30,
      marginTop: 10,
    },
    addButtonBottomRadius: {
      borderBottomRightRadius: 30,
      borderBottomLeftRadius: 30,
      marginBottom: 10,
    },
    textBtn: {
      fontSize: 20,
      textAlign: "center",
      color: currentColors.LIGHT,
    },
    itemContainer: {
      backgroundColor: currentColors.PRIMARY,
      borderRadius: 8,
      margin: 1,
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
    closeBtn: {
      position: "absolute",
      right: 25,
      bottom: 60,
      zIndex: 1,
      backgroundColor: currentColors.GRAY,
      color: currentColors.LIGHT,
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
      paddingHorizontal: 0.3,
      borderColor: currentColors.BACKGROUND,
      paddingVertical: 4,
    },
    textStyle: {
      color: currentColors.LIGHT,
      fontSize: 12,
      flexWrap: "wrap",
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
      color: currentColors.LIGHT,
    },
  });

  return (
    <>
      <StatusBar />
      <View style={[styles.container]}>
        <TouchableWithoutFeedback onPress={handleKeyboardDismiss}>
          <View>
            <TouchableOpacity
              style={[styles.addButton, styles.addButtonTopRadius]}
              onPress={() => setModalVisible(true)}
            >
              <Text style={[styles.textBtn]}>Add custom game</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.addButton, styles.addButtonBottomRadius]}
              onPress={() => props.navigation.navigate("SearchBgg")}
            >
              <Text style={[styles.textBtn]}>Search game online</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>

        {longPressActive ? null : (
          <View style={styles.searchRow}>
            <TextInput
              value={searchText}
              onChangeText={(text) => handleSearchText(text)}
              placeholder="Search collection"
              style={[styles.searchBar, { color: currentColors.LIGHT }]}
              placeholderTextColor={currentColors.PLACEHOLDER}
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
              <Fontisto name={"filter"} size={20} color={currentColors.LIGHT} />
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.itemContainer, { opacity: 0.8 }]}>
          <View style={[styles.flexRow]}>
            {longPressActive ? (
              <TouchableOpacity
                onPress={() => handleCheckAllItems()}
                style={styles.checkIcon}
              >
                <MaterialIcons
                  name={checkAllItems ? "check-box" : "check-box-outline-blank"}
                  size={20}
                  color={currentColors.LIGHT}
                />
              </TouchableOpacity>
            ) : null}
            <View
              style={[styles.centerStyle, styles.cellContainer, { flex: 0.8 }]}
            >
              <Text style={[styles.textStyle]}>Nr</Text>
            </View>
            <View
              style={[
                styles.cellContainer,
                { flex: 3, justifyContent: "center" },
              ]}
            >
              <Text style={[styles.textStyle]}>Name</Text>
            </View>
            <View style={[styles.centerStyle, styles.cellContainer]}>
              <Text style={[styles.textStyle]}>Rating</Text>
            </View>
            <View style={[styles.centerStyle, styles.cellContainer]}>
              <Text style={[styles.textStyle]}>Players</Text>
            </View>
            <View style={[styles.centerStyle, styles.cellContainer]}>
              <Text style={[styles.textStyle]}>Time</Text>
            </View>
            <View
              style={[styles.centerStyle, styles.cellContainer, { flex: 1 }]}
            >
              <Text style={[styles.textStyle]}>Days ago</Text>
            </View>
          </View>
        </View>

        <FlatList
          data={collection}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${index}`}
          showsVerticalScrollIndicator={true}
          showsHorizontalScrollIndicator={true}
          keyboardShouldPersistTaps="always"
          initialNumToRender={15}
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
        ) : null}

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
    </>
  );
};

export default Collection;
