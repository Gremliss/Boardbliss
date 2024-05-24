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
import colors from "../misc/colors";

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

  const handleKeyboardDismiss = () => {
    Keyboard.dismiss();
  };

  const handleOnChangeText = (text, valueFor) => {
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
            onChangeText={(text) => handleOnChangeText(text, "name")}
            placeholder="Player name"
            style={[styles.input(windowHeight), styles.playerStyle]}
            placeholderTextColor={colors.PLACEHOLDER}
            onSubmitEditing={handleSubmit}
          />
          <TouchableWithoutFeedback onPress={handleKeyboardDismiss}>
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
    backgroundColor: colors.BACKGROUND,
  },
  input: (windowHeight) => {
    return {
      fontSize: 20,
      marginTop: windowHeight / 3,
      marginHorizontal: 20,
    };
  },
  playerStyle: {
    backgroundColor: colors.GRAY,
    color: "#EEEEEE",
    padding: 12,
    margin: 4,
    borderRadius: 5,
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

export default NewPlayerModal;
