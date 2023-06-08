import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Keyboard,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import RoundIconBtn from "./RoundIconButton";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const NewGameplayModal = ({ visible, onClose, onSubmit }) => {
  const currentDate = new Date();
  const [players, setPlayers] = useState([]);
  const [addGameplay, setAddGameplay] = useState({
    id: Date.now(),
    date: {
      day: currentDate.getDate(),
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
    },
    players: [],
    type: "Rivalry",
    scoreType: "Points",
    isChecked: false,
    duration: { hours: null, min: null },
  });

  const handleKeyboardDismiss = () => {
    Keyboard.dismiss();
  };

  const handleSubmit = () => {
    if (
      parseInt(addGameplay.date.day) < 1 ||
      parseInt(addGameplay.date.day) > 59
    ) {
      displayDateAlert(1, 59, "day");
    } else if (
      parseInt(addGameplay.date.month) > 12 ||
      parseInt(addGameplay.date.month) < 1
    ) {
      displayDateAlert(1, 12, "month");
    } else {
      let winningPlayers = [];
      if (addGameplay.players.length > 0) {
        if (addGameplay.type === "Rivalry") {
          var maxScore;
          if (addGameplay.scoreType === "Points") {
            maxScore = Math.max(
              ...addGameplay.players.map((player) => player.points)
            );
          } else {
            maxScore = Math.min(
              ...addGameplay.players.map((player) => player.points)
            );
          }
          winningPlayers = addGameplay.players.filter(
            (player) => player.points === maxScore
          );
          winningPlayers.forEach((player) => {
            player.victory = true;
          });
        }
      }

      onSubmit(addGameplay);
      setAddGameplay({
        id: Date.now(),
        date: {
          day: currentDate.getDate(),
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
        },
        players: [],
        type: "Rivalry",
        scoreType: "Points",
        isChecked: false,
        duration: { hours: null, min: null },
      });
      onClose();
    }
  };

  const closeModal = () => {
    onClose();
  };

  const fetchPlayers = async () => {
    const result = await AsyncStorage.getItem("players");
    if (result?.length) setPlayers(JSON.parse(result));
  };
  useEffect(() => {
    fetchPlayers();
  }, []);

  const changeType = () => {
    if (addGameplay.type === "Rivalry") {
      setAddGameplay({
        ...addGameplay,
        coop: { points: null, victory: "Yes" },
        type: "Co-Op",
      });
      changePlayersIsCheckedToFalse();
    } else {
      const { coop, ...updatedGameplay } = addGameplay;
      setAddGameplay({ ...updatedGameplay, type: "Rivalry" });
    }
  };

  const changeScoreType = () => {
    setAddGameplay((prevState) => ({
      ...prevState,
      scoreType: prevState.scoreType === "Points" ? "Place" : "Points",
    }));
  };

  const changeVictory = () => {
    setAddGameplay((prevState) => ({
      ...prevState,
      coop: {
        ...prevState.coop,
        victory: prevState.coop.victory === "No" ? "Yes" : "No",
      },
    }));
  };

  const handleCheckButton = async (item) => {
    if (item.isChecked === false) {
      item.isChecked = true;
      setAddGameplay((prevState) => {
        const updatedPlayers = [...prevState.players];

        // If player doesn't exist, add a new player object
        if (!updatedPlayers.some((player) => player.name === item.name)) {
          updatedPlayers.push({ name: item.name });
        }

        return { ...prevState, players: updatedPlayers };
      });
    } else {
      item.isChecked = false;
      setAddGameplay((prevState) => {
        const updatedPlayers = prevState.players.filter(
          (player) => player.name !== item.name
        );
        return { ...prevState, players: updatedPlayers };
      });
    }
    await AsyncStorage.setItem("players", JSON.stringify(players));
    fetchPlayers();
  };

  const displayDateAlert = (num1, num2, date) => {
    Alert.alert(
      `Wrong number for ${date}`,
      `You must enter a number between ${num1} and ${num2}`,
      [{ text: "Ok", onPress: () => null }],
      { cancelable: true }
    );
  };

  const changePlayersIsCheckedToFalse = async () => {
    const updatedPlayers = players.map((player) => {
      return { ...player, isChecked: false };
    });
    await AsyncStorage.setItem("players", JSON.stringify(updatedPlayers));
    fetchPlayers();
  };

  const renderItem = ({ item, index }) => {
    const backgroundColor = index % 2 === 0 ? "#00ADB5" : "#0b6c70";
    return (
      <TouchableOpacity key={index} onPress={() => handleCheckButton(item)}>
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
            {/* <View style={[styles.centerStyle, { flex: 1, padding: 2 }]}>
              <Text>{index + 1}</Text>
            </View> */}
            <View style={[styles.cellContainer]}>
              <Text>{item.name}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderActivePlayer = ({ item, index }) => {
    return (
      <View key={index}>
        {item.isChecked ? (
          <>
            {addGameplay?.type === "Rivalry" ? (
              <View style={[styles.flexRow]}>
                <Text style={[styles.nameOfInputStyle]}>{item.name}:</Text>
                <TextInput
                  onChangeText={(text) => {
                    setAddGameplay((prevState) => {
                      const updatedPlayers = prevState.players.map((player) => {
                        if (player.name === item.name) {
                          // Update points of existing player
                          return { ...player, points: parseInt(text) };
                        }
                        return player;
                      });

                      // If player doesn't exist, add a new player object
                      if (
                        !updatedPlayers.some(
                          (player) => player.name === item.name
                        )
                      ) {
                        updatedPlayers.push({
                          name: item.name,
                          points: parseInt(text),
                        });
                      }
                      return { ...prevState, players: updatedPlayers };
                    });
                  }}
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
          <TouchableWithoutFeedback onPress={handleKeyboardDismiss}>
            <View>
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
                      <Text>{addGameplay.coop?.victory}</Text>
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
            </View>
          </TouchableWithoutFeedback>
          <View style={[{}]}>
            <FlatList
              data={players}
              renderItem={renderItem}
              keyExtractor={(item, index) => `${index}`}
              horizontal
            />
          </View>
          <View style={[{}]}>
            <FlatList
              data={players}
              renderItem={renderActivePlayer}
              keyExtractor={(item, index) => `${index}`}
              horizontal
            />
          </View>

          <View style={[styles.flexRow]}>
            <Text style={[styles.nameOfInputStyle]}>Time:</Text>
            <TextInput
              onChangeText={(text) =>
                setAddGameplay((prevState) => ({
                  ...prevState,
                  duration: {
                    ...prevState.duration,
                    hours: text,
                  },
                }))
              }
              placeholder="Hours"
              style={[styles.inputTextStyle]}
              keyboardType="numeric"
            />
            <TextInput
              onChangeText={(text) => {
                // Remove any non-digit characters from the input
                const sanitizedText = text.replace(/[^0-9]/g, "");

                // Check if the sanitized text is a number between 1 and 59
                if (sanitizedText <= 59) {
                  setAddGameplay((prevState) => ({
                    ...prevState,
                    duration: {
                      ...prevState.duration,
                      min: parseInt(sanitizedText),
                    },
                  }));
                } else {
                  displayDateAlert(0, 59);
                }
              }}
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
                setAddGameplay((prevState) => ({
                  ...prevState,
                  date: { ...prevState.date, day: parseInt(sanitizedText) },
                }));
                // Check if the sanitized text is a number between 1 and 31
                // if (sanitizedText >= 1 && sanitizedText <= 31) {
                //   setAddGameplay((prevState) => ({
                //     ...prevState,
                //     date: { ...prevState.date, day: sanitizedText },
                //   }));
                // } else {
                //   displayDateAlert(1, 31);
                // }
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
                setAddGameplay((prevState) => ({
                  ...prevState,
                  date: { ...prevState.date, month: parseInt(sanitizedText) },
                }));
                // Check if the sanitized text is a number between 1 and 12
                // if (sanitizedText >= 1 && sanitizedText <= 12) {
                //   setAddGameplay((prevState) => ({
                //     ...prevState,
                //     date: { ...prevState.date, month: sanitizedText },
                //   }));
                // } else {
                //   displayDateAlert(1, 12);
                // }
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
  itemContainer: {
    backgroundColor: "#00ADB5",
    borderRadius: 8,
    margin: 1,
    padding: 10,
  },
  checkIcon: {
    justiftyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    width: 20,
    margin: 2,
  },
  cellContainer: {
    padding: 5,
  },
});

export default NewGameplayModal;
