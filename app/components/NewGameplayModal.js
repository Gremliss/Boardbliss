import { AntDesign, MaterialIcons } from "@expo/vector-icons";
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
import colors from "../misc/colors";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const NewGameplayModal = ({ visible, onClose, onSubmit }) => {
  const currentDate = new Date();
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState("");
  const [chooseWinners, setChooseWinners] = useState(false);
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
      if (chooseWinners === false) {
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

            loosingPlayers = addGameplay.players.filter(
              (player) => player.points != maxScore
            );
            loosingPlayers.forEach((player) => {
              player.victory = false;
            });
          }
        }
      }
      console.log(addGameplay.players);
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

  const changeChooseWinners = () => {
    setChooseWinners(!chooseWinners);
  };

  const handleCheckButton = async (item) => {
    if (item.isChecked === false) {
      item.isChecked = true;
      setAddGameplay((prevState) => {
        const updatedPlayers = [...prevState.players];

        // If player doesn't exist, add a new player object
        if (!updatedPlayers.some((player) => player.id === item.id)) {
          updatedPlayers.push({ name: item.name, id: item.id, victory: false });
        }
        return { ...prevState, players: updatedPlayers };
      });
    } else {
      item.isChecked = false;
      setAddGameplay((prevState) => {
        const updatedPlayers = prevState.players.filter(
          (player) => player.id !== item.id
        );
        return { ...prevState, players: updatedPlayers };
      });
    }
    await AsyncStorage.setItem("players", JSON.stringify(players));
    fetchPlayers();
  };

  const handleCheckWinner = async (item) => {
    console.log(item.victory);
    // item.victory = !item.victory;
    var victoryValue;
    setAddGameplay((prevState) => {
      const updatedPlayers = addGameplay.players.map((player) => {
        if (player.id === item.id) {
          if (player.victory !== undefined && player.victory !== null) {
            victoryValue = !player.victory;
          } else {
            victoryValue = true;
          }
          return { ...player, victory: victoryValue };
        } else {
          return player;
        }
      });

      return { ...prevState, players: updatedPlayers };
    });
    console.log(addGameplay);

    // await AsyncStorage.setItem("players", JSON.stringify(players));
    // fetchPlayers();
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

  const renderItem = ({ item, index }) => {
    const backgroundColor =
      index % 2 === 0 ? colors.LIST_COLOR_ONE : colors.LIST_COLOR_TWO;
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
                color={colors.LIGHT}
              />
            </View>
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
              <>
                <View style={[styles.flexRow]}>
                  <Text style={[styles.nameOfInputStyle]}>{item.name}:</Text>
                  <TextInput
                    onChangeText={(text) => {
                      setAddGameplay((prevState) => {
                        const updatedPlayers = prevState.players.map(
                          (player) => {
                            if (player.name === item.name) {
                              // Update points of existing player
                              return { ...player, points: parseInt(text) };
                            }
                            return player;
                          }
                        );

                        // If player doesn't exist, add a new player object
                        if (
                          !updatedPlayers.some(
                            (player) => player.id === item.id
                          )
                        ) {
                          updatedPlayers.push({
                            name: item.name,
                            id: item.id,
                            points: parseInt(text),
                            victory: false,
                          });
                        }
                        console.log(updatedPlayers);
                        return { ...prevState, players: updatedPlayers };
                      });
                    }}
                    placeholder={addGameplay.scoreType}
                    style={[styles.inputTextStyle]}
                    keyboardType="numeric"
                    placeholderTextColor={colors.PLACEHOLDER}
                  />
                </View>
                {chooseWinners === true ? (
                  <TouchableOpacity onPress={() => handleCheckWinner(item)}>
                    <View style={[styles.flexRow]}>
                      <View style={[styles.cellContainer]}>
                        <Text>Win:</Text>
                      </View>
                      <View style={styles.checkIcon}>
                        <MaterialIcons
                          name={
                            addGameplay.players.some(
                              (player) =>
                                player.name === item.name &&
                                player.victory === true
                            )
                              ? "check-box"
                              : "check-box-outline-blank"
                          }
                          size={20}
                          color={colors.LIGHT}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                ) : null}
              </>
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
                  <Text style={[{ color: colors.LIGHT }]}>
                    {addGameplay.type}
                  </Text>
                </TouchableOpacity>
              </View>
              {addGameplay.type === "Rivalry" ? (
                <>
                  <View style={[styles.flexRow]}>
                    <Text style={[styles.nameOfInputStyle]}>Score type:</Text>
                    <TouchableOpacity
                      style={[styles.inputTextStyle]}
                      onPress={() => changeScoreType()}
                    >
                      <Text style={[{ color: colors.LIGHT }]}>
                        {addGameplay.scoreType}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.flexRow]}>
                    <Text style={[styles.nameOfInputStyle]}>
                      Pick the winners:
                    </Text>
                    <TouchableOpacity
                      style={[styles.inputTextStyle]}
                      onPress={() => changeChooseWinners()}
                    >
                      <Text style={[{ color: colors.LIGHT }]}>
                        {chooseWinners ? "Yes" : "No"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
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
                      placeholderTextColor={colors.PLACEHOLDER}
                    />
                  </View>
                </>
              )}

              <View style={[styles.flexRow]}>
                <Text style={[styles.nameOfInputStyle]}>Players:</Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
          <View>
            <FlatList
              data={players}
              renderItem={renderItem}
              keyExtractor={(item, index) => `${index}`}
              horizontal
              keyboardShouldPersistTaps="always"
            />
          </View>
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
          <View>
            <FlatList
              data={players}
              renderItem={renderActivePlayer}
              keyExtractor={(item, index) => `${index}`}
              horizontal
              keyboardShouldPersistTaps="always"
            />
          </View>

          <View style={[styles.flexRow]}>
            <Text style={[styles.nameOfInputStyle]}>Time:</Text>
            <TextInput
              onChangeText={(text) => {
                // Remove any non-digit characters from the input
                const sanitizedText = text.replace(/[^0-9]/g, "");

                // Check if the sanitized text isn't negative
                if (sanitizedText >= 0) {
                  setAddGameplay((prevState) => ({
                    ...prevState,
                    duration: {
                      ...prevState.duration,
                      hours: sanitizedText,
                    },
                  }));
                } else {
                  displayDateAlert(0, 999);
                }
              }}
              placeholder="Hours"
              style={[styles.inputTextStyle]}
              keyboardType="numeric"
              placeholderTextColor={colors.PLACEHOLDER}
            />
            <TextInput
              onChangeText={(text) => {
                // Remove any non-digit characters from the input
                const sanitizedText = text.replace(/[^0-9]/g, "");

                // Check if the sanitized text is a number between 0 and 59
                if (sanitizedText <= 59 && sanitizedText >= 0) {
                  setAddGameplay((prevState) => ({
                    ...prevState,
                    duration: {
                      ...prevState.duration,
                      min: sanitizedText,
                    },
                  }));
                } else {
                  displayDateAlert(0, 59);
                }
              }}
              placeholder="Minutes"
              style={[styles.inputTextStyle]}
              keyboardType="numeric"
              placeholderTextColor={colors.PLACEHOLDER}
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
                  date: { ...prevState.date, day: sanitizedText },
                }));
              }}
              placeholder="Day"
              style={[styles.inputTextStyle]}
              keyboardType="numeric"
              defaultValue={addGameplay?.date?.day?.toString()}
              placeholderTextColor={colors.PLACEHOLDER}
            />

            <TextInput
              onChangeText={(text) => {
                // Remove any non-digit characters from the input
                const sanitizedText = text.replace(/[^0-9]/g, "");
                setAddGameplay((prevState) => ({
                  ...prevState,
                  date: { ...prevState.date, month: sanitizedText },
                }));
              }}
              placeholder="Month"
              style={[styles.inputTextStyle]}
              keyboardType="numeric"
              defaultValue={addGameplay?.date?.month?.toString()}
              placeholderTextColor={colors.PLACEHOLDER}
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
              placeholderTextColor={colors.PLACEHOLDER}
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
    backgroundColor: colors.DARK,
    flex: 1,
    textAlign: "center",
    color: colors.LIGHT,
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
    backgroundColor: colors.GRAY,
    color: colors.LIGHT,
    padding: 8,
    flex: 5,
    margin: 4,
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
  itemContainer: {
    backgroundColor: colors.PRIMARY,
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
  addNewPlayer: {
    padding: 9,
    color: colors.LIGHT,
    borderRadius: 5,
  },
});

export default NewGameplayModal;
