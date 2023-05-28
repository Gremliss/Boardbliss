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

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const NewGameModal = ({ visible, onClose, onSubmit }) => {
  const [collection, setCollection] = useState([]);
  const [addGame, setAddGame] = useState({
    name: "",
    yearpublished: "",
    owner: "you",
    rating: "",
    minPlayers: "",
    maxPlayers: "",
    minPlaytime: "",
    maxPlaytime: "",
    bggImage: null,
    id: Date.now(),
    stats: [],
  });

  // const handleModalClose = () => {
  //   Keyboard.dismiss();
  // };

  const handleSubmit = () => {
    if (collection.some((obj) => obj.name === addGame.name)) {
      displayExistAlert();
      console.log("nope");
    } else {
      onSubmit(addGame);
      setAddGame({
        name: "",
        yearpublished: "",
        owner: "You",
        rating: "",
        minPlayers: "",
        maxPlayers: "",
        minPlaytime: "",
        maxPlaytime: "",
        bggImage: null,
        id: Date.now(),
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
      owner: "you",
      rating: "",
      minPlayers: "",
      maxPlayers: "",
      minPlaytime: "",
      maxPlaytime: "",
      bggImage: null,
      id: Date.now(),
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
    addGame.owner === "You"
      ? setAddGame({ ...addGame, owner: "Friend" })
      : setAddGame({ ...addGame, owner: "You" });
  };

  // const saveChanges = async () => {
  //   console.log(yearpublished);
  //   console.log(minPlayers);
  //   const updatedCollection = collection.map((item) => {
  //     if (item.name === gameParams.name) {
  //       console.log(item);
  //       return {
  //         ...item,
  //         name: name,
  //         yearpublished: yearpublished,
  //         minPlayers: minPlayers,
  //         maxPlayers: maxPlayers,
  //         minPlaytime: minPlaytime,
  //         maxPlaytime: maxPlaytime,
  //         bggImage: bggImage,
  //         owner: owner,
  //         rating: rating,
  //       };
  //     } else {
  //       return item;
  //     }
  //   });

  //   setCollection(updatedCollection);
  //   console.log(updatedCollection);
  //   await AsyncStorage.setItem("collection", JSON.stringify(updatedCollection));
  //   fetchCollection();
  // };

  return (
    <>
      <StatusBar />
      <Modal visible={visible} animationType="fade" onRequestClose={closeModal}>
        <ScrollView>
          <View style={[styles.flexRow]}>
            <Text style={[styles.nameOfInputStyle]}>Name:</Text>
            <TextInput
              onChangeText={(text) => setAddGame({ ...addGame, name: text })}
              placeholder="Name"
              textAlignVertical="top"
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
              textAlignVertical="top"
              style={[styles.inputTextStyle]}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.flexRow]}>
            <Text style={[styles.nameOfInputStyle]}>Owner:</Text>
            <TouchableOpacity
              style={[styles.inputTextStyle]}
              onPress={() => changeOwner()}
            >
              <Text>{addGame.owner}</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.flexRow]}>
            <Text style={[styles.nameOfInputStyle]}>Min players:</Text>
            <TextInput
              onChangeText={(text) =>
                setAddGame({ ...addGame, minPlayers: text })
              }
              placeholder="Min players"
              textAlignVertical="top"
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
              textAlignVertical="top"
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
              textAlignVertical="top"
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
              textAlignVertical="top"
              style={[styles.inputTextStyle]}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.flexRow]}>
            <Text style={[styles.nameOfInputStyle]}>Rating:</Text>
            <TextInput
              onChangeText={(text) => setAddGame({ ...addGame, rating: text })}
              placeholder="Rating"
              textAlignVertical="top"
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
              textAlignVertical="top"
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
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#222831",
    flex: 1,
    textAlign: "center",
    color: "#EEEEEE",
    paddingHorizontal: 30,
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
    backgroundColor: "#393E46",
    // textAlign: "center",
    color: "#EEEEEE",
    padding: 10,
    flex: 5,
    margin: 4,
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    opacity: 0.6,
  },
  textBtn: {
    fontSize: 18,
    textAlign: "center",
    color: "#EEEEEE",
  },
  closeButton: {
    backgroundColor: "#00ADB5",
    fontSize: 20,
    textAlign: "center",
    color: "#EEEEEE",
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
  },
  closeBtn: {
    position: "absolute",
    right: 25,
    bottom: 20,
    zIndex: 1,
    backgroundColor: "#9D9D9D",
  },
});

export default NewGameModal;
