import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Keyboard,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import colors from "../misc/colors";
import RoundIconBtn from "./RoundIconButton";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const AddPlayersModal = ({
  visible,
  onClose,
  players,
  setPlayers,
  renderItem,
}) => {
  const [name, setName] = useState("");

  const handleKeyboardDismiss = () => {
    Keyboard.dismiss();
  };

  const handleNewPlayer = () => {
    if (players.some((obj) => obj.name === name)) {
      displayExistAlert();
    } else {
      addNewPlayer(name);
      setName("");
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

  const closeModal = () => {
    setName("");
    onClose();
  };

  return (
    <>
      <StatusBar />
      <Modal visible={visible} animationType="fade" onRequestClose={closeModal}>
        <View style={[styles.container]}>
          <View style={[styles.flexRow]}>
            <Text style={[styles.nameOfInputStyle]}>New player:</Text>
            <TextInput
              value={name}
              onChangeText={(text) => setName(text)}
              placeholder="Player name"
              style={[styles.inputTextStyle]}
              placeholderTextColor={colors.PLACEHOLDER}
            />
            {name !== "" ? (
              <AntDesign
                name={"check"}
                size={24}
                style={[styles.addNewPlayer]}
                onPress={() => handleNewPlayer()}
                backgroundColor={colors.PRIMARY}
              />
            ) : null}
          </View>
          <TouchableWithoutFeedback onPress={handleKeyboardDismiss}>
            <View style={[styles.flexRow]}>
              <Text style={[styles.nameOfInputStyle]}>Players:</Text>
            </View>
          </TouchableWithoutFeedback>
          <View
            style={[styles.flatListContainer]}
            onPress={handleKeyboardDismiss}
          >
            <FlatList
              data={players}
              renderItem={renderItem}
              keyExtractor={(item, index) => `${index}`}
              // horizontal
              // keyboardShouldPersistTaps="always"
              numColumns={2}
              initialNumToRender={20}
            />
          </View>
        </View>

        <View style={styles.btnContainer}>
          {/* <RoundIconBtn
            style={styles.closeBtn}
            antIconName="close"
            onPress={closeModal}
          /> */}
          <RoundIconBtn
            antIconName="check"
            onPress={closeModal}
            style={styles.addBtn}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.DARK,
  },
  flatListContainer: {
    marginBottom: 200,
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
  closeBtn: {
    position: "absolute",
    left: 25,
    bottom: 20,
    zIndex: 1,
    backgroundColor: colors.GRAY,
    color: colors.LIGHT,
  },
  addBtn: {
    position: "absolute",
    right: 25,
    bottom: 20,
    zIndex: 1,
    color: colors.LIGHT,
  },

  flexRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  nameOfInputStyle: {
    padding: 8,
    flex: 2,
    margin: 4,
    color: colors.LIGHT,
  },
  inputTextStyle: {
    backgroundColor: colors.GRAY,
    color: colors.LIGHT,
    padding: 8,
    flex: 5,
    margin: 4,
  },
  addNewPlayer: {
    padding: 9,
    color: colors.LIGHT,
    borderRadius: 5,
  },
});

export default AddPlayersModal;
