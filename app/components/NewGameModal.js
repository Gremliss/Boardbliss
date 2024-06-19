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

const NewGameModal = ({ visible, onClose, onSubmit }) => {
  const [collection, setCollection] = useState([]);
  const [addGame, setAddGame] = useState({
    name: "",
    yearpublished: "",
    owner: "Yes",
    rating: "",
    minPlayers: "",
    maxPlayers: "",
    minPlaytime: "",
    maxPlaytime: "",
    bggImage: null,
    id: Date.now(),
    isChecked: false,
    expansion: false,
    stats: [],
  });

  // const handleModalClose = () => {
  //   Keyboard.dismiss();
  // };

  const handleSubmit = () => {
    if (collection.some((obj) => obj.name === addGame.name)) {
      displayExistAlert();
    } else {
      onSubmit(addGame);
      setAddGame({
        name: "",
        yearpublished: "",
        owner: "Yes",
        rating: "",
        minPlayers: "",
        maxPlayers: "",
        minPlaytime: "",
        maxPlaytime: "",
        bggImage: null,
        id: Date.now(),
        isChecked: false,
        expansion: false,
        stats: [],
      });
      onClose();
    }
  };

  const displayExistAlert = () => {
    Alert.alert(
      "Duplicate",
      "Player with that name already exists",
      [{ text: "Ok", onPress: () => null }],
      { cancelable: true }
    );
  };

  const closeModal = () => {
    setAddGame({
      name: "",
      yearpublished: "",
      owner: "Yes",
      rating: "",
      minPlayers: "",
      maxPlayers: "",
      minPlaytime: "",
      maxPlaytime: "",
      bggImage: null,
      id: Date.now(),
      isChecked: false,
      expansion: false,
      stats: [],
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
    addGame.owner === "Yes"
      ? setAddGame({ ...addGame, owner: "No" })
      : setAddGame({ ...addGame, owner: "Yes" });
  };

  const changeExpansion = () => {
    addGame.expansion === false
      ? setAddGame({ ...addGame, expansion: true })
      : setAddGame({ ...addGame, expansion: false });
  };

  return (
    <>
      <StatusBar />
      <Modal visible={visible} animationType="fade" onRequestClose={closeModal}>
        <View style={[styles.container]}>
          <ScrollView>
            <View style={[styles.flexRow]}>
              <Text style={[styles.nameOfInputStyle]}>Name:</Text>
              <TextInput
                onChangeText={(text) => setAddGame({ ...addGame, name: text })}
                placeholder="Name"
                placeholderTextColor={colors.PLACEHOLDER}
                style={[styles.inputTextStyle]}
                multiline={true}
              />
            </View>
            <View style={[styles.flexRow]}>
              <Text style={[styles.nameOfInputStyle]}>Year published:</Text>
              <TextInput
                onChangeText={(text) =>
                  setAddGame({ ...addGame, yearpublished: text })
                }
                placeholder="Year published"
                placeholderTextColor={colors.PLACEHOLDER}
                style={[styles.inputTextStyle]}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.flexRow]}>
              <Text style={[styles.nameOfInputStyle]}>Owned:</Text>
              <TouchableOpacity
                style={[styles.inputTextStyle, { padding: 14 }]}
                onPress={() => changeOwner()}
              >
                <Text style={[{ color: colors.LIGHT }]}>{addGame.owner}</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.flexRow]}>
              <Text style={[styles.nameOfInputStyle]}>Expansion:</Text>
              <TouchableOpacity
                style={[styles.inputTextStyle, { padding: 14 }]}
                onPress={() => changeExpansion()}
              >
                <Text style={[{ color: colors.LIGHT }]}>
                  {addGame?.expansion ? "Yes" : "No"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.flexRow]}>
              <Text style={[styles.nameOfInputStyle]}>Min players:</Text>
              <TextInput
                onChangeText={(text) =>
                  setAddGame({ ...addGame, minPlayers: text })
                }
                placeholder="Min players"
                placeholderTextColor={colors.PLACEHOLDER}
                style={[styles.inputTextStyle]}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.flexRow]}>
              <Text style={[styles.nameOfInputStyle]}>Max players:</Text>
              <TextInput
                onChangeText={(text) =>
                  setAddGame({ ...addGame, maxPlayers: text })
                }
                placeholder="Max players"
                placeholderTextColor={colors.PLACEHOLDER}
                style={[styles.inputTextStyle]}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.flexRow]}>
              <Text style={[styles.nameOfInputStyle]}>Min playtime:</Text>
              <TextInput
                onChangeText={(text) =>
                  setAddGame({ ...addGame, minPlaytime: text })
                }
                placeholder="Min playtime"
                placeholderTextColor={colors.PLACEHOLDER}
                style={[styles.inputTextStyle]}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.flexRow]}>
              <Text style={[styles.nameOfInputStyle]}>Max playtime:</Text>
              <TextInput
                onChangeText={(text) =>
                  setAddGame({ ...addGame, maxPlaytime: text })
                }
                placeholder="Max playtime"
                placeholderTextColor={colors.PLACEHOLDER}
                style={[styles.inputTextStyle]}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.flexRow]}>
              <Text style={[styles.nameOfInputStyle]}>Rating:</Text>
              <TextInput
                onChangeText={(text) => {
                  const changeCommaText = text.replace(",", ".");
                  setAddGame({ ...addGame, rating: changeCommaText });
                }}
                placeholder="Rating"
                placeholderTextColor={colors.PLACEHOLDER}
                style={[styles.inputTextStyle]}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.flexRow]}>
              <Text style={[styles.nameOfInputStyle]}>Img link:</Text>
              <TextInput
                onChangeText={(text) =>
                  setAddGame({ ...addGame, bggImage: text })
                }
                placeholder="Img link"
                placeholderTextColor={colors.PLACEHOLDER}
                style={[styles.inputTextStyle]}
                multiline={true}
              />
            </View>
          </ScrollView>

          <View style={styles.btnContainer}>
            {addGame.name.trim() ? (
              <RoundIconBtn
                antIconName="check"
                onPress={handleSubmit}
                style={styles.addBtn}
              />
            ) : null}
            <RoundIconBtn
              style={styles.closeBtn}
              antIconName="close"
              onPress={closeModal}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.BACKGROUND,
    flex: 1,
  },
  flexRow: {
    flexDirection: "row",
  },
  nameOfInputStyle: {
    padding: 10,
    flex: 2,
    margin: 4,
  },
  inputTextStyle: {
    backgroundColor: colors.GRAY,
    color: colors.LIGHT,
    padding: 11,
    flex: 5,
    margin: 2,
    borderRadius: 5,
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
    right: 25,
    bottom: 20,
    zIndex: 1,
    color: colors.LIGHT,
  },
  closeBtn: {
    position: "absolute",
    left: 25,
    bottom: 20,
    zIndex: 1,
    backgroundColor: colors.GRAY,
    color: colors.LIGHT,
  },
});

export default NewGameModal;
