import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContext, useState } from "react";
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

import RoundIconBtn from "./RoundIconButton";
import { ColorContext } from "../misc/ColorContext";

// const windowWidth = Dimensions.get("window").width;
// const windowHeight = Dimensions.get("window").height;

const AddPlayersModal = ({
  visible,
  onClose,
  players,
  setPlayers,
  renderItem,
}) => {
  const { currentColors } = useContext(ColorContext);
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentColors.BACKGROUND,
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
    btnContainer: {
      flexDirection: "row",
      justifyContent: "center",
    },
    closeBtn: {
      position: "absolute",
      left: 25,
      bottom: 20,
      zIndex: 1,
      backgroundColor: currentColors.GRAY,
      color: currentColors.LIGHT,
    },
    addBtn: {
      position: "absolute",
      right: 25,
      bottom: 20,
      zIndex: 1,
      color: currentColors.LIGHT,
    },
    flexRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    nameOfInputStyle: {
      padding: 8,
      flex: 2,
      margin: 4,
      color: currentColors.DARK,
    },
    inputTextStyle: {
      backgroundColor: currentColors.GRAY,
      color: currentColors.LIGHT,
      padding: 11,
      flex: 5,
      margin: 2,
      borderRadius: 5,
    },
    addNewPlayer: {
      padding: 9,
      color: currentColors.LIGHT,
      borderRadius: 5,
    },
  });

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
              placeholderTextColor={currentColors.PLACEHOLDER}
              onSubmitEditing={handleNewPlayer}
            />
            {name !== "" ? (
              <AntDesign
                name={"check"}
                size={24}
                style={[styles.addNewPlayer]}
                onPress={() => handleNewPlayer()}
                backgroundColor={currentColors.PRIMARY}
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
          {name === "" ? (
            <RoundIconBtn
              antIconName="check"
              onPress={closeModal}
              style={styles.addBtn}
            />
          ) : null}
        </View>
      </Modal>
    </>
  );
};

export default AddPlayersModal;
