import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
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
import { FlatList, ScrollView } from "react-native-gesture-handler";
import colors from "../misc/colors";
import AddPlayersModal from "./AddPlayersModal";
import RoundIconBtn from "./RoundIconButton";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const NewGameplayModal = ({
  visible,
  onClose,
  onSubmit,
  isExisting,
  gameplayParams,
  navigation,
}) => {
  const currentDate = new Date();
  // const [collection, setCollection] = useState([]);
  const [players, setPlayers] = useState([]);
  const [chooseWinners, setChooseWinners] = useState(isExisting ? true : false);
  const [modalVisible, setModalVisible] = useState(false);
  const [addGameplay, setAddGameplay] = isExisting
    ? useState(gameplayParams)
    : useState({
        id: Date.now(),
        date: {
          day: currentDate.getDate(),
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
          hour: currentDate.getHours(),
          minutes: currentDate.getMinutes(),
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
  // const fetchCollection = async () => {
  //   const result = await AsyncStorage.getItem("collection");
  //   if (result?.length) setCollection(JSON.parse(result));
  // };

  const fetchPlayers = async () => {
    const result = await AsyncStorage.getItem("players");
    if (result?.length) setPlayers(JSON.parse(result));
  };

  // players.map((item) => {
  //   const matchingPlayer = addGameplay.players.find(
  //     (player) => player.id === item.id
  //   );
  //   // console.log(matchingPlayer);
  //   if (matchingPlayer) {
  //     item = { ...item, points: matchingPlayer.points };
  //     // console.log(item);
  //   }
  // });

  // addGameplay.players.map((player) => {
  //   if (player.id === item.id) {
  //     // Update points of existing player
  //     if (player?.points) {
  //       playerScore = player.points;
  //     }
  //   }
  // });

  if (isExisting) {
    useEffect(() => {
      // fetchCollection();
      updateIsChecked();
      // setPlayers((prevPlayers) =>
      //   prevPlayers.map((item) => {
      //     const matchingPlayer = addGameplay.players.find(
      //       (player) => player.id === item.id
      //     );

      //     return matchingPlayer
      //       ? { ...item, points: matchingPlayer.points || 0 }
      //       : item;
      //   })
      // );
    }, [addGameplay]);

    const updateIsChecked = async () => {
      const result = await AsyncStorage.getItem("players");
      const parsedResult = JSON.parse(result);
      parsedResult?.forEach((player) => {
        const playerInGameplay = addGameplay.players.find(
          (p) => p.name === player.name
        );
        if (playerInGameplay) {
          player.isChecked = true;
        } else {
          player.isChecked = false;
        }
      });
      if (result?.length) setPlayers(parsedResult);
    };
  } else {
    useEffect(() => {
      // fetchCollection();
      fetchPlayers();
      // const backHandler = BackHandler.addEventListener(
      //   "hardwareBackPress",
      //   handleBackButton
      // );
      // return () => backHandler.remove();
    }, []);

    // const handleBackButton = () => {
    //   fetchCollection();
    //   return;
    // };
  }

  const handleSubmit = () => {
    if (!isExisting) {
      addGameplay.id = Date.now();
    }
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
      onSubmit(addGameplay);
      setAddGameplay({
        id: Date.now(),
        date: {
          day: currentDate.getDate(),
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
          hour: currentDate.getHours(),
          minutes: currentDate.getMinutes(),
        },
        players: [],
        type: "Rivalry",
        scoreType: "Points",
        isChecked: false,
        duration: { hours: null, min: null },
      });
      onClose();
    }
    // changePlayersIsCheckedToFalse();
  };

  const closeModal = () => {
    onClose();
  };

  const changeType = () => {
    if (addGameplay.type === "Rivalry") {
      setAddGameplay({
        ...addGameplay,
        coop: { points: null, victory: "Yes" },
        type: "Co-Op",
      });
      // changePlayersIsCheckedToFalse();
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
          updatedPlayers.push({
            name: item.name,
            id: item.id,
            victory: false,
            points: 0,
          });
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
    // await AsyncStorage.setItem("players", JSON.stringify(players));
    // fetchPlayers();
  };

  const handleCheckWinner = async (item) => {
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
                color={colors.PRIMARY}
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

  return (
    <>
      <StatusBar />
      <Modal
        visible={visible}
        animationType="fade"
        onRequestClose={closeModal}
        onShow={isExisting ? () => setAddGameplay(gameplayParams) : null}
      >
        <View style={[styles.container]}>
          <ScrollView style={styles.keyboardContainer}>
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
                        <Text style={[{ color: colors.LIGHT }]}>
                          {addGameplay.coop?.victory}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.flexRow]}>
                      <Text style={[styles.nameOfInputStyle]}>Points:</Text>
                      <TextInput
                        defaultValue={addGameplay?.coop?.points?.toString()}
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

                <TouchableOpacity
                  style={[styles.addButton]}
                  onPress={() => setModalVisible(true)}
                >
                  <Text
                    style={[
                      {
                        fontSize: 20,
                        textAlign: "center",
                        color: colors.LIGHT,
                      },
                    ]}
                  >
                    Players
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
            <View>
              {players
                // .sort((a, b) => b.points - a.points)
                .map((item) => {
                  // console.log(item);
                  var playerScore = "";
                  addGameplay.players.map((player) => {
                    if (player.id === item.id) {
                      // Update points of existing player
                      if (player?.points) {
                        playerScore = player.points;
                      }
                    }
                  });
                  return (
                    <View key={item.id}>
                      {item.isChecked ? (
                        <>
                          {addGameplay?.type === "Rivalry" ? (
                            <>
                              <View style={[styles.flexRow]}>
                                <Text
                                  style={[
                                    styles.nameOfInputStyle,
                                    { fontWeight: "bold" },
                                  ]}
                                >
                                  {item.name}:
                                </Text>
                                {chooseWinners === true ? (
                                  <TouchableOpacity
                                    onPress={() => handleCheckWinner(item)}
                                  >
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
                                          color={colors.PRIMARY}
                                        />
                                      </View>
                                    </View>
                                  </TouchableOpacity>
                                ) : null}
                                <TextInput
                                  defaultValue={playerScore.toString()}
                                  onChangeText={(text) => {
                                    setAddGameplay((prevState) => {
                                      const updatedPlayers =
                                        prevState.players.map((player) => {
                                          if (player.id === item.id) {
                                            // Update points of existing player
                                            return {
                                              ...player,
                                              points: parseInt(text),
                                            };
                                          }
                                          return player;
                                        });

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
                                      return {
                                        ...prevState,
                                        players: updatedPlayers,
                                      };
                                    });
                                  }}
                                  placeholder={addGameplay.scoreType}
                                  style={[styles.inputTextStyle]}
                                  keyboardType="numeric"
                                  placeholderTextColor={colors.PLACEHOLDER}
                                />
                              </View>
                            </>
                          ) : (
                            <View style={[styles.flexRow]}>
                              <Text
                                style={[
                                  styles.nameOfInputStyle,
                                  { fontWeight: "bold" },
                                ]}
                              >
                                {item.name}
                              </Text>
                            </View>
                          )}
                        </>
                      ) : null}
                    </View>
                  );
                })}
            </View>

            <View style={[styles.flexRow]}>
              <Text style={[styles.nameOfInputStyle]}>Time:</Text>
              <TextInput
                defaultValue={addGameplay?.duration?.hours?.toString()}
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
                defaultValue={addGameplay?.duration?.min?.toString()}
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
            <TextInput
              defaultValue={addGameplay?.notes?.toString()}
              onChangeText={(text) =>
                setAddGameplay((prevState) => ({
                  ...prevState,
                  notes: text,
                }))
              }
              placeholder="Notes"
              style={[styles.inputTextStyle]}
              placeholderTextColor={colors.PLACEHOLDER}
              textAlignVertical="top"
              multiline
            />
          </ScrollView>
        </View>

        <AddPlayersModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          players={players}
          renderItem={renderItem}
          setPlayers={setPlayers}
        />

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
  keyboardContainer: {
    flex: 1,
  },
  container: {
    backgroundColor: colors.BACKGROUND,
    flex: 1,
    paddingBottom: 80,
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
    flex: 2,
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
    width: windowWidth / 2,
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
  addButton: {
    backgroundColor: colors.PRIMARY,
    color: colors.LIGHT,
    padding: 10,
    borderRadius: 50,
    elevation: 5,
    marginVertical: 20,
    marginHorizontal: 50,
  },
});

export default NewGameplayModal;
