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
import { FlatList } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const NewGameplayModal = ({ visible, onClose, onSubmit }) => {
  const [collection, setCollection] = useState([]);
  const [players, setPlayers] = useState([]);
  const currentDate = new Date();
  const [addGameplay, setAddGameplay] = useState({
    id: Date.now(),
    date: {
      day: currentDate.getDate(),
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
    },
    players: {},
    type: "Rivalry",
    scoreType: "Points",
    coop: { victory: "Yes", points: null },
    isChecked: false,
    duration: { hours: null, min: null },
  });

  const handleKeyboardDismiss = () => {
    Keyboard.dismiss();
  };

  const handleSubmit = () => {
    onSubmit(addGameplay);
    setAddGameplay({
      id: Date.now(),
      date: {
        day: currentDate.getDate(),
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
      },
      players: {},
      type: "Rivalry",
      scoreType: "Points",
      coop: { victory: "Yes", points: null },
      isChecked: false,
      duration: { hours: null, min: null },
    });
    onClose();
  };

  const closeModal = () => {
    onClose();
  };

  const fetchCollection = async () => {
    const result = await AsyncStorage.getItem("collection");
    if (result?.length) setCollection(JSON.parse(result));
  };
  const fetchPlayers = async () => {
    const result = await AsyncStorage.getItem("players");
    if (result?.length) setPlayers(JSON.parse(result));
  };
  useEffect(() => {
    fetchCollection();
    fetchPlayers();
  }, []);

  const changeType = () => {
    addGameplay.type === "Rivalry"
      ? setAddGameplay({ ...addGameplay, type: "Co-Op" })
      : setAddGameplay({ ...addGameplay, type: "Rivalry" });
  };
  const changeScoreType = () => {
    addGameplay.scoreType === "Points"
      ? setAddGameplay({ ...addGameplay, scoreType: "Place" })
      : setAddGameplay({ ...addGameplay, scoreType: "Points" });
  };

  const changeVictory = () => {
    addGameplay.coop.victory === "No"
      ? setAddGameplay((prevState) => ({
          ...prevState,
          coop: { ...prevState.coop, victory: "Yes" },
        }))
      : setAddGameplay((prevState) => ({
          ...prevState,
          coop: { ...prevState.coop, victory: "No" },
        }));
  };

  const handleCheckButton = async (item) => {
    if (item.isChecked === false) {
      item.isChecked = true;
      addGameplay.players[item.name] = null;
    } else {
      item.isChecked = false;
      delete addGameplay.players[item.name];
    }
    await AsyncStorage.setItem("players", JSON.stringify(players));
    fetchPlayers();
  };

  const displayDateAlert = (num1, num2) => {
    Alert.alert(
      "Wrong number",
      `You must enter a number between ${num1} and ${num2}`,
      [{ text: "Ok", onPress: () => null }],
      { cancelable: true }
    );
  };

  const renderItem = ({ item, index }) => {
    const backgroundColor = index % 2 === 0 ? "#00ADB5" : "#0b6c70";
    if (item.isChecked === true) {
      addGameplay.players[item.name] = null;
    }
    return (
      <TouchableOpacity onPress={() => handleCheckButton(item)}>
        <View
          style={[styles.itemContainer, { backgroundColor: backgroundColor }]}
        >
          <View style={[styles.flexRow]}>
            <View style={styles.checkIcon}>
              <MaterialIcons
                name={item.isChecked ? "check-box" : "check-box-outline-blank"}
                size={20}
                color="white"
              />
            </View>
            <View
              style={[styles.centerStyle, styles.cellContainer, { flex: 0.5 }]}
            >
              <Text>{index + 1}</Text>
            </View>
            <View style={[styles.cellContainer, { flex: 4 }]}>
              <Text style={[{ paddingHorizontal: 8 }]}>{item.name}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderActivePlayer = ({ item, index }) => {
    return (
      <View>
        {item.isChecked ? (
          <>
            {addGameplay?.type === "Rivalry" ? (
              <View style={[styles.flexRow]}>
                <Text style={[styles.nameOfInputStyle]}>{item.name}:</Text>
                <TextInput
                  onChangeText={(text) =>
                    (addGameplay.players[item.name] = text)
                  }
                  placeholder={addGameplay.scoreType}
                  style={[styles.inputTextStyle]}
                  keyboardType="numeric"
                />
              </View>
            ) : (
              <View style={[styles.flexRow]}>
                <Text style={[styles.nameOfInputStyle]}>{item.name}</Text>
              </View>
            )}
          </>
        ) : null}
      </View>
    );
  };

  return (
    <>
      <StatusBar />
      <Modal visible={visible} animationType="fade" onRequestClose={closeModal}>
        <View style={[{ flex: 1, paddingBottom: 80 }]}>
          <View style={[styles.flexRow]}>
            <Text style={[styles.nameOfInputStyle]}>Type:</Text>
            <TouchableOpacity
              style={[styles.inputTextStyle]}
              onPress={() => changeType()}
            >
              <Text>{addGameplay.type}</Text>
            </TouchableOpacity>
          </View>
          {addGameplay.type === "Rivalry" ? (
            <View style={[styles.flexRow]}>
              <Text style={[styles.nameOfInputStyle]}>Score type:</Text>
              <TouchableOpacity
                style={[styles.inputTextStyle]}
                onPress={() => changeScoreType()}
              >
                <Text>{addGameplay.scoreType}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={[styles.flexRow]}>
                <Text style={[styles.nameOfInputStyle]}>Victory:</Text>
                <TouchableOpacity
                  style={[styles.inputTextStyle]}
                  onPress={() => changeVictory()}
                >
                  <Text>{addGameplay.coop.victory}</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.flexRow]}>
                <Text style={[styles.nameOfInputStyle]}>Points:</Text>
                <TextInput
                  onChangeText={(text) =>
                    setAddGameplay((prevState) => ({
                      ...prevState,
                      coop: { ...prevState.coop, points: text },
                    }))
                  }
                  placeholder="Points"
                  style={[styles.inputTextStyle]}
                  keyboardType="numeric"
                />
              </View>
            </>
          )}

          <View style={[styles.flexRow]}>
            <Text style={[styles.nameOfInputStyle]}>Players:</Text>
          </View>
          <View style={[{ flex: 1 }]}>
            <FlatList
              data={players}
              renderItem={renderItem}
              keyExtractor={(item, index) => `${index}`}
            />
          </View>
          <View style={[{ flex: 2, backgroundColor: "#00ADB5" }]}>
            <FlatList
              data={players}
              renderItem={renderActivePlayer}
              keyExtractor={(item, index) => `${index}`}
            />
          </View>

          <View style={[styles.flexRow]}>
            <Text style={[styles.nameOfInputStyle]}>Time:</Text>
            <TextInput
              onChangeText={(text) => (addGameplay.duration.hours = text)}
              placeholder="Hours"
              style={[styles.inputTextStyle]}
              keyboardType="numeric"
            />
            {/* </View>
          <View style={[styles.flexRow]}> */}
            {/* <Text style={[styles.nameOfInputStyle]}>:</Text> */}
            <TextInput
              onChangeText={(text) => (addGameplay.duration.min = text)}
              placeholder="Minutes"
              style={[styles.inputTextStyle]}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.flexRow]}>
            <Text style={[styles.nameOfInputStyle]}>Day:</Text>
            <Text style={[styles.nameOfInputStyle]}>Month:</Text>
            <Text style={[styles.nameOfInputStyle]}>Year:</Text>
          </View>
          <View style={[styles.flexRow]}>
            <TextInput
              onChangeText={(text) => {
                // Remove any non-digit characters from the input
                const sanitizedText = text.replace(/[^0-9]/g, "");

                // Check if the sanitized text is a number between 1 and 31
                if (sanitizedText >= 1 && sanitizedText <= 31) {
                  setAddGameplay((prevState) => ({
                    ...prevState,
                    date: { ...prevState.date, day: sanitizedText },
                  }));
                } else {
                  displayDateAlert(1, 31);
                }
              }}
              placeholder="Day"
              style={[styles.inputTextStyle]}
              keyboardType="numeric"
              defaultValue={addGameplay?.date?.day?.toString()}
            />

            <TextInput
              onChangeText={(text) => {
                // Remove any non-digit characters from the input
                const sanitizedText = text.replace(/[^0-9]/g, "");

                // Check if the sanitized text is a number between 1 and 12
                if (sanitizedText >= 1 && sanitizedText <= 12) {
                  setAddGameplay((prevState) => ({
                    ...prevState,
                    date: { ...prevState.date, month: sanitizedText },
                  }));
                } else {
                  displayDateAlert(1, 12);
                }
              }}
              placeholder="Month"
              style={[styles.inputTextStyle]}
              keyboardType="numeric"
              defaultValue={addGameplay?.date?.month?.toString()}
            />
            <TextInput
              onChangeText={(text) =>
                setAddGameplay((prevState) => ({
                  ...prevState,
                  date: { ...prevState.date, year: text },
                }))
              }
              placeholder="Year"
              style={[styles.inputTextStyle]}
              keyboardType="numeric"
              defaultValue={addGameplay?.date?.year?.toString()}
            />
          </View>
        </View>

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
    backgroundColor: "#222831",
    flex: 1,
    textAlign: "center",
    color: "#EEEEEE",
    paddingHorizontal: 30,
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  nameOfInputStyle: {
    padding: 8,
    flex: 2,
    margin: 4,
  },
  inputTextStyle: {
    backgroundColor: "#393E46",
    // textAlign: "center",
    color: "#EEEEEE",
    padding: 8,
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
  itemContainer: {
    backgroundColor: "#00ADB5",
    borderRadius: 8,
    margin: 1,
  },
  checkIcon: {
    justiftyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    width: 20,
    margin: 2,
  },
  cellContainer: {
    borderRightWidth: 1,
    paddingHorizontal: 1,
    borderColor: "#222831",
    paddingVertical: 4,
  },
});

export default NewGameplayModal;
