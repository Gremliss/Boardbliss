import { useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Dimensions,
  Keyboard,
  Modal,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import RoundIconBtn from "./RoundIconButton";
import AsyncStorage from "@react-native-async-storage/async-storage";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const NewPlayerModal = ({ visible, onClose, onSubmit }) => {
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState("");

  const fetchPlayers = async () => {
    const result = await AsyncStorage.getItem("players");
    if (result?.length) setPlayers(JSON.parse(result));
  };
  useEffect(() => {
    fetchPlayers();
  }, []);

  const handleModalClose = () => {
    Keyboard.dismiss();
  };

  const handleOnChangeTest = (text, valueFor) => {
    if (valueFor === "name") setName(text);
  };

  const handleSubmit = () => {
    if (players.some((obj) => obj.name === name)) {
      displayExistAlert();
    } else {
      onSubmit(name);
      setName("");
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
    setName("");
    onClose();
  };

  return (
    <>
      <StatusBar />
      <Modal visible={visible} animationType="fade" onRequestClose={closeModal}>
        <View style={styles.container}>
          <TextInput
            value={name}
            onChangeText={(text) => handleOnChangeTest(text, "name")}
            placeholder="Player name"
            style={[styles.input(windowHeight), styles.playerStyle]}
            multiline={true}
          />
          <TouchableWithoutFeedback onPress={handleModalClose}>
            <View style={[styles.modalBG, StyleSheet.absoluteFillObject]} />
          </TouchableWithoutFeedback>
        </View>
        <View style={styles.btnContainer}>
          {name.trim() ? (
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
    flex: 1,
    backgroundColor: "#222831",
  },
  input: (windowHeight) => {
    return {
      fontSize: 20,
      marginTop: windowHeight / 3,
      marginHorizontal: 20,
    };
  },
  playerStyle: {
    backgroundColor: "#393E46",
    color: "#EEEEEE",
    padding: 10,
    margin: 4,
  },
  modalBG: {
    flex: 1,
    zIndex: -1,
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
  },
  closeBtn: {
    position: "absolute",
    left: 25,
    bottom: 20,
    zIndex: 1,
    backgroundColor: "#9D9D9D",
  },
});

export default NewPlayerModal;
