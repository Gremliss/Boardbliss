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
              placeholderTextColor="#EEEEEE70"
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
              placeholderTextColor="#EEEEEE70"
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
              <Text style={[{ color: colors.LIGHT }]}>{addGame.owner}</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.flexRow]}>
            <Text style={[styles.nameOfInputStyle]}>Min players:</Text>
            <TextInput
              onChangeText={(text) =>
                setAddGame({ ...addGame, minPlayers: text })
              }
              placeholder="Min players"
              placeholderTextColor="#EEEEEE70"
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
              placeholderTextColor="#EEEEEE70"
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
              placeholderTextColor="#EEEEEE70"
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
              placeholderTextColor="#EEEEEE70"
              style={[styles.inputTextStyle]}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.flexRow]}>
            <Text style={[styles.nameOfInputStyle]}>Rating:</Text>
            <TextInput
              onChangeText={(text) => setAddGame({ ...addGame, rating: text })}
              placeholder="Rating"
              placeholderTextColor="#EEEEEE70"
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
              placeholderTextColor="#EEEEEE70"
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
    backgroundColor: colors.DARK,
    flex: 1,
    textAlign: "center",
    color: colors.LIGHT,
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
    backgroundColor: colors.GRAY,
    color: colors.LIGHT,
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
