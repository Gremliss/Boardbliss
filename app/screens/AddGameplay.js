import { AntDesign, Fontisto } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  BackHandler,
  Dimensions,
  FlatList,
  Keyboard,
  StatusBar,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import {
  TextInput,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import FilterModal from "../components/FilterModal";
import NewGameplayModal from "../components/NewGameplayModal";
import NewGameModal from "../components/NewGameModal";
import colors from "../misc/colors";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const AddGameplay = (props) => {
  const [collection, setCollection] = useState();
  const [gameParams, setGameParams] = useState();
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [newGameModalVisible, setNewGameModalVisible] = useState(false);
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

  collection?.sort((a, b) => {
    const nameA = a.name?.toLowerCase();
    const nameB = b.name?.toLowerCase();
    if (nameA < nameB) {
      return -1;
    } else if (nameA > nameB) {
      return 1;
    } else {
      return 0;
    }
  });

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

  const addNewGame = async (newGame) => {
    const result = await AsyncStorage.getItem("collection");
    const parsedResult = JSON.parse(result);
    if (!parsedResult) {
      parsedResult = [];
    }
    const updatedCollection = [...parsedResult, newGame];
    setCollection(updatedCollection);
    await AsyncStorage.setItem("collection", JSON.stringify(updatedCollection));
  };

  const renderItem = ({ item, index }) => {
    const backgroundColor =
      index % 2 === 0 ? colors.LIST_COLOR_ONE : colors.LIST_COLOR_TWO;
    return (
      <TouchableOpacity onPress={() => handleItemPressed(item)}>
        <View
          style={[styles.itemContainer, { backgroundColor: backgroundColor }]}
        >
          <View style={[styles.flexRow]}>
            <View
              style={[styles.centerStyle, styles.cellContainer, { flex: 0.8 }]}
            >
              <Text style={[{ color: "#1b232e" }]}>{index + 1}</Text>
            </View>
            <View style={[styles.cellContainer, { flex: 4 }]}>
              <Text style={[{ paddingHorizontal: 8 }]}>{item.name}</Text>
              <Text style={styles.yearText}>{item.yearpublished}</Text>
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
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleItemPressed = async (item) => {
    setGameParams(item);
    setModalVisible(true);
  };

  const addNewGameplay = async (newGameplay) => {
    const result = await AsyncStorage.getItem("collection");
    const parsedResult = JSON.parse(result);
    if (!parsedResult) {
      parsedResult = [];
    }

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

    const updatedCollection = parsedResult.map((item) => {
      if (item.id === newGameParams.id) {
        return {
          ...item,
          stats: newGameParams.stats,
        };
      } else {
        return item;
      }
    });
    setCollection(updatedCollection);
    await AsyncStorage.setItem("collection", JSON.stringify(updatedCollection));
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

  const handleFilter = async (filterItems) => {
    const result = await AsyncStorage.getItem("collection");
    var filteredCollection = JSON.parse(result);
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
        if (item.expansion === false) {
          return item;
        }
      });
    }

    if (filteredCollection.length) {
      setCollection(filteredCollection);
    } else {
      fetchCollection;
      ToastAndroid.show("Games not found", 2000);
    }
  };

  return (
    <>
      <StatusBar />
      <View style={[styles.container]}>
        <TouchableWithoutFeedback onPress={handleKeyboardDismiss}>
          <View>
            <TouchableOpacity
              style={[styles.addButton, styles.addButtonTopRadius]}
              onPress={() => setNewGameModalVisible(true)}
            >
              <Text style={[styles.textBtn]}>Add game</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.addButton, styles.addButtonBottomRadius]}
              onPress={() => props.navigation.navigate("SearchBgg")}
            >
              <Text style={[styles.textBtn]}>Search BGG</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
        <Text style={styles.blueText}>Choose game:</Text>
        <View style={styles.searchRow}>
          <TextInput
            value={searchText}
            onChangeText={(text) => handleSearchText(text)}
            placeholder="Search game"
            style={[styles.searchBar, { color: colors.LIGHT }]}
            placeholderTextColor={colors.PLACEHOLDER}
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
            <Fontisto name={"filter"} size={20} color={colors.LIGHT} />
          </TouchableOpacity>
        </View>

        <View style={[styles.itemContainer, { opacity: 0.8 }]}>
          <View style={[styles.flexRow]}>
            <View
              style={[styles.centerStyle, styles.cellContainer, { flex: 0.8 }]}
            >
              <Text style={[{ color: colors.LIGHT }]}>Nr</Text>
            </View>
            <View style={[styles.cellContainer, { flex: 4 }]}>
              <Text style={[{ paddingHorizontal: 8, color: colors.LIGHT }]}>
                Name
              </Text>
            </View>
            <View style={[styles.centerStyle, styles.cellContainer]}>
              <Text style={[{ color: colors.LIGHT }]}>Rating</Text>
            </View>
            <View style={[styles.centerStyle, styles.cellContainer]}>
              <Text style={[{ color: colors.LIGHT }]}>Players</Text>
            </View>
            <View style={[styles.centerStyle, styles.cellContainer]}>
              <Text style={[{ color: colors.LIGHT }]}>Time</Text>
            </View>
          </View>
        </View>

        <FlatList
          data={collection}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${index}`}
          showsVerticalScrollIndicator={true}
          showsHorizontalScrollIndicator={true}
          initialNumToRender={15}
        />

        <FilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onSubmit={handleFilter}
        />

        <NewGameplayModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={addNewGameplay}
          isExisting={false}
        />

        <NewGameModal
          visible={newGameModalVisible}
          onClose={() => setNewGameModalVisible(false)}
          onSubmit={addNewGame}
        />
      </View>
    </>
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
  cellContainer: {
    borderRightWidth: 1,
    paddingHorizontal: 1,
    borderColor: colors.BACKGROUND,
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
    color: colors.LIGHT,
  },
  addButton: {
    backgroundColor: colors.PRIMARY,
    color: colors.LIGHT,
    padding: 10,
    paddingBottom: 12,
    elevation: 5,
    marginHorizontal: 80,
    borderWidth: 1,
    borderColor: colors.PRIMARY_OPACITY,
  },
  addButtonTopRadius: {
    borderTopRightRadius: 50,
    borderTopLeftRadius: 50,
    marginTop: 10,
  },
  addButtonBottomRadius: {
    borderBottomRightRadius: 50,
    borderBottomLeftRadius: 50,
    marginBottom: 5,
  },
  blueText: {
    fontSize: 20,
    padding: 10,
    color: colors.PRIMARY,
    fontWeight: "bold",
  },
  textBtn: {
    fontSize: 20,
    textAlign: "center",
    color: colors.LIGHT,
  },
});

export default AddGameplay;
