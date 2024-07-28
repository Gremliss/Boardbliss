import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Keyboard,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import RoundIconBtn from "./RoundIconButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../misc/colors";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const FilterModal = ({ visible, onClose, onSubmit }) => {
  const [collection, setCollection] = useState([]);
  const [filterGames, setFilterGames] = useState({
    yearpublished: null,
    owner: "All",
    expansion: true,
    rating: null,
    players: null,
    minPlaytime: null,
    maxPlaytime: null,
  });
  const [sortBy, setSortBy] = useState("Name");

  const handleKeyboardDismiss = () => {
    Keyboard.dismiss();
  };

  const handleSubmit = () => {
    onSubmit(filterGames, sortBy);
    onClose();
  };

  const closeModal = () => {
    setFilterGames({
      yearpublished: null,
      owner: "All",
      expansion: true,
      rating: null,
      players: null,
      minPlaytime: null,
      maxPlaytime: null,
    });
    onClose();
  };

  const fetchCollection = async () => {
    const result = await AsyncStorage.getItem("collection");
    if (result?.length) setCollection(JSON.parse(result));
  };
  useEffect(() => {
    fetchCollection();
  }, []);

  const changeOwner = () => {
    setFilterGames({
      ...filterGames,
      owner:
        filterGames.owner === "Yes"
          ? "No"
          : filterGames.owner === "No"
          ? "All"
          : "Yes",
    });
  };
  const changeSortBy = () => {
    setSortBy(
      sortBy === "Name"
        ? "Rating"
        : sortBy === "Rating"
        ? "Players"
        : sortBy === "Players"
        ? "Time"
        : sortBy === "Time"
        ? "Days ago"
        : "Name"
    );
  };

  const changeExpansion = () => {
    setFilterGames({
      ...filterGames,
      expansion: filterGames.expansion === false ? true : false,
    });
  };

  return (
    <>
      <StatusBar />
      <Modal visible={visible} animationType="fade">
        <TouchableWithoutFeedback onPress={handleKeyboardDismiss}>
          <View style={[styles.container]}>
            <View style={[styles.flexRow]}>
              <Text style={[styles.nameOfInputStyle]}>Year published:</Text>
              <TextInput
                defaultValue={filterGames?.yearpublished}
                onChangeText={(text) =>
                  setFilterGames({ ...filterGames, yearpublished: text })
                }
                placeholder="Year published"
                style={[styles.inputTextStyle]}
                keyboardType="numeric"
                placeholderTextColor={colors.PLACEHOLDER}
              />
            </View>
            <View style={[styles.flexRow]}>
              <Text style={[styles.nameOfInputStyle]}>Owned:</Text>
              <TouchableOpacity
                style={[styles.inputTextStyle]}
                onPress={() => changeOwner()}
              >
                <Text style={[styles.changeOnClickText]}>
                  {filterGames.owner}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.flexRow]}>
              <Text style={[styles.nameOfInputStyle]}>Expansions:</Text>
              <TouchableOpacity
                style={[styles.inputTextStyle]}
                onPress={() => changeExpansion()}
              >
                <Text style={[styles.changeOnClickText]}>
                  {filterGames.expansion ? "Yes" : "No"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.flexRow]}>
              <Text style={[styles.nameOfInputStyle]}>Players:</Text>
              <TextInput
                defaultValue={filterGames?.players}
                onChangeText={(text) =>
                  setFilterGames({ ...filterGames, players: text })
                }
                placeholder="Players"
                style={[styles.inputTextStyle]}
                keyboardType="numeric"
                placeholderTextColor={colors.PLACEHOLDER}
              />
            </View>
            <View style={[styles.flexRow]}>
              <Text style={[styles.nameOfInputStyle]}>Min playtime:</Text>
              <TextInput
                defaultValue={filterGames?.minPlaytime}
                onChangeText={(text) =>
                  setFilterGames({ ...filterGames, minPlaytime: text })
                }
                placeholder="Min playtime"
                style={[styles.inputTextStyle]}
                keyboardType="numeric"
                placeholderTextColor={colors.PLACEHOLDER}
              />
            </View>
            <View style={[styles.flexRow]}>
              <Text style={[styles.nameOfInputStyle]}>Max playtime:</Text>
              <TextInput
                defaultValue={filterGames?.maxPlaytime}
                onChangeText={(text) =>
                  setFilterGames({ ...filterGames, maxPlaytime: text })
                }
                placeholder="Max playtime"
                style={[styles.inputTextStyle]}
                keyboardType="numeric"
                placeholderTextColor={colors.PLACEHOLDER}
              />
            </View>
            <View style={[styles.flexRow]}>
              <Text style={[styles.nameOfInputStyle]}>Rating:</Text>
              <TextInput
                defaultValue={filterGames?.rating}
                onChangeText={(text) =>
                  setFilterGames({ ...filterGames, rating: text })
                }
                placeholder="Rating"
                style={[styles.inputTextStyle]}
                keyboardType="numeric"
                placeholderTextColor={colors.PLACEHOLDER}
              />
            </View>
            <View style={[styles.flexRow]}>
              <Text style={[styles.nameOfInputStyle]}>Sort by:</Text>
              <TouchableOpacity
                style={[styles.inputTextStyle]}
                onPress={() => changeSortBy()}
              >
                <Text style={[styles.changeOnClickText]}>{sortBy}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>

        <View style={styles.btnContainer}>
          <RoundIconBtn
            antIconName="check"
            onPress={handleSubmit}
            style={styles.addBtn}
          />
          <RoundIconBtn
            style={styles.closeBtn}
            antIconName="close"
            onPress={closeModal}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.BACKGROUND,
    flex: 1,
    color: colors.LIGHT,
    paddingVertical: 80,
  },
  flexRow: {
    flexDirection: "row",
  },
  nameOfInputStyle: {
    padding: 10,
    flex: 2,
    margin: 4,
    color: colors.DARK,
  },
  inputTextStyle: {
    backgroundColor: colors.GRAY,
    color: colors.LIGHT,
    padding: 11,
    flex: 5,
    margin: 2,
    borderRadius: 5,
  },
  changeOnClickText: {
    color: colors.LIGHT,
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
    borderColor: colors.DARK,
    borderWidth: 1,
    backgroundColor: colors.PRIMARY,
    fontSize: 20,
    height: windowHeight / 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    opacity: 0.6,
  },
  textBtn: {
    fontSize: 18,
    textAlign: "center",
    color: colors.LIGHT,
  },
  closeButton: {
    backgroundColor: colors.PRIMARY,
    fontSize: 20,
    textAlign: "center",
    color: colors.LIGHT,
    padding: 10,
    borderRadius: 50,
    elevation: 5,
    marginVertical: 20,
    marginHorizontal: 30,
  },

  btnContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  addBtn: {
    position: "absolute",
    left: 25,
    bottom: 20,
    zIndex: 1,
    color: colors.LIGHT,
  },
  closeBtn: {
    position: "absolute",
    right: 25,
    bottom: 20,
    zIndex: 1,
    backgroundColor: colors.GRAY,
    color: colors.LIGHT,
  },
});

export default FilterModal;
