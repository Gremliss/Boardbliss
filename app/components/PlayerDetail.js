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

const PlayerDetail = (props) => {
  const [players, setPlayers] = useState([]);
  const [playerParams, setPlayerParams] = useState(props.route.params.item);
  const [name, setName] = useState(playerParams.name);
  console.log(name);
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

  const handleSubmit = async (text) => {
    const updatedPlayers = players.map((item) => {
      if (item.id === playerParams.id) {
        return {
          ...item,
          name: name,
        };
      } else {
        return item;
      }
    });

    setPlayers(updatedPlayers);
    await AsyncStorage.setItem("players", JSON.stringify(updatedPlayers));
    props.navigation.goBack();
  };

  return (
    <>
      <StatusBar />
      <View style={styles.flexBackground}>
        <View style={styles.container}>
          <TextInput
            value={name}
            onChangeText={(text) => handleOnChangeTest(text, "name")}
            placeholder="Player name"
            style={[styles.input(windowHeight), styles.playerStyle]}
            multiline={true}
          />
          <TouchableWithoutFeedback onPress={handleModalClose}>
            <View
              style={[styles.flexBackground, StyleSheet.absoluteFillObject]}
            />
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
            onPress={() => props.navigation.goBack()}
          />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.DARK,
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
  flexBackground: {
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
    backgroundColor: colors.GRAY,
  },
});

export default PlayerDetail;
