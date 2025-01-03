import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
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
import { ScrollView } from "react-native-gesture-handler";
import AddPlayersModal from "./AddPlayersModal";
import RoundIconBtn from "./RoundIconButton";
import { ColorContext } from "../misc/ColorContext";

const windowWidth = Dimensions.get("window").width;
// const windowHeight = Dimensions.get("window").height;

const NewGameplayModal = ({
  visible,
  onClose,
  onSubmit,
  isExisting,
  gameplayParams,
  navigation,
  gameParams,
  chosenDate,
}) => {
  const { currentColors } = useContext(ColorContext);
  const currentDate = new Date();
  // const [collection, setCollection] = useState([]);
  const [players, setPlayers] = useState([]);
  const [chooseWinners, setChooseWinners] = useState(isExisting ? true : false);
  const [modalVisible, setModalVisible] = useState(false);
  const initialGameplayState = useMemo(() => {
    if (isExisting) {
      return gameplayParams;
    } else if (chosenDate) {
      const parts = chosenDate.id.split(".");
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      return {
        id: Date.now(),
        date: {
          day: day,
          month: month + 1,
          year: year,
          hour: currentDate.getHours(),
          minutes: currentDate.getMinutes(),
        },
        players: players.filter((player) => player.isChecked),
        type: "Rivalry",
        scoreType: "Points",
        isChecked: false,
        duration: { hours: null, min: null },
      };
    } else {
      return {
        id: Date.now(),
        date: {
          day: currentDate.getDate(),
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
          hour: currentDate.getHours(),
          minutes: currentDate.getMinutes(),
        },
        players: players.filter((player) => player.isChecked),
        type: "Rivalry",
        scoreType: "Points",
        isChecked: false,
        duration: { hours: null, min: null },
      };
    }
  }, [isExisting, chosenDate, gameplayParams, currentDate, players]);

  const [addGameplay, setAddGameplay] = useState(initialGameplayState);

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
  //   if (matchingPlayer) {
  //     item = { ...item, points: matchingPlayer.points };
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
      parseInt(addGameplay.date.day) > 59 ||
      addGameplay.date.day.length > 2
    ) {
      displayDateAlert(1, 59, "day");
    } else if (
      parseInt(addGameplay.date.month) > 12 ||
      parseInt(addGameplay.date.month) < 1 ||
      addGameplay.date.month.length > 2
    ) {
      displayDateAlert(1, 12, "month");
    } else {
      if (chooseWinners === false) {
        let winningPlayers = [];
        let loosingPlayers = [];
        if (addGameplay.players.length > 0) {
          if (addGameplay.type === "Rivalry") {
            let maxScore;
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

      if (chosenDate) {
        const parts = chosenDate.id.split(".");
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        setAddGameplay({
          id: Date.now(),
          date: {
            day: day,
            month: month + 1,
            year: year,
            hour: currentDate.getHours(),
            minutes: currentDate.getMinutes(),
          },
          players: players.filter((player) => player.isChecked),
          type: "Rivalry",
          scoreType: "Points",
          isChecked: false,
          duration: { hours: null, min: null },
        });
      } else {
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
      }
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
            points: null,
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
    let victoryValue;
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

  const addCheckedPlayers = () => {
    setAddGameplay((prevState) => {
      const updatedPlayers = players.filter((player) => player.isChecked);

      return { ...prevState, players: updatedPlayers };
    });
  };

  const renderItem = ({ item, index }) => {
    const backgroundColor = currentColors.LIST_COLOR_TWO;
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
                color={currentColors.PRIMARY}
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

  const styles = StyleSheet.create({
    keyboardContainer: {
      flex: 1,
    },
    container: {
      backgroundColor: currentColors.BACKGROUND,
      flex: 1,
      paddingBottom: 80,
    },
    flexRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    playerRow: {
      backgroundColor: currentColors.LIST_COLOR_ONE,
      borderRadius: 8,
      margin: 1,
    },
    nameOfInputStyle: {
      padding: 8,
      flex: 2,
      margin: 4,
    },
    inputTextStyle: {
      backgroundColor: currentColors.GRAY,
      color: currentColors.LIGHT,
      padding: 11,
      flex: 2,
      margin: 2,
      borderRadius: 5,
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
      color: currentColors.LIGHT,
    },
    closeBtn: {
      position: "absolute",
      left: 25,
      bottom: 20,
      zIndex: 1,
      backgroundColor: currentColors.GRAY,
      color: currentColors.LIGHT,
    },
    itemContainer: {
      backgroundColor: currentColors.PRIMARY,
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
      color: currentColors.LIGHT,
      borderRadius: 5,
    },
    addButton: {
      backgroundColor: currentColors.PRIMARY,
      color: currentColors.LIGHT,
      padding: 8,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      elevation: 5,
      marginHorizontal: 1,
    },
    boargameImgContainer: {
      alignItems: "center",
    },
    boargameImg: {
      width: windowWidth,
      height: 120,
    },
    gameNameStyle: {
      flex: 1,
      textAlign: "center",
      fontWeight: "bold",
      padding: 5,
      fontSize: 18,
      backgroundColor: currentColors.GRAY,
      color: currentColors.LIGHT,
    },
  });

  return (
    <>
      <StatusBar />
      <Modal
        visible={visible}
        animationType="fade"
        onRequestClose={closeModal}
        onShow={
          isExisting ? () => setAddGameplay(gameplayParams) : addCheckedPlayers
        }
      >
        <View style={[styles.container]}>
          <ScrollView style={styles.keyboardContainer}>
            <TouchableWithoutFeedback onPress={handleKeyboardDismiss}>
              <View>
                <View style={[styles.flexRow]}>
                  <Text style={[styles.gameNameStyle]}>{gameParams.name}</Text>
                </View>
                {gameParams.bggImage?.length ? (
                  <View style={styles.boargameImgContainer}>
                    <Image
                      style={styles.boargameImg}
                      resizeMode="contain"
                      source={{
                        uri: `${gameParams.bggImage}`,
                      }}
                    />
                  </View>
                ) : null}
                <View style={[styles.flexRow]}>
                  <Text style={[styles.nameOfInputStyle]}>Type:</Text>
                  <TouchableOpacity
                    style={[styles.inputTextStyle]}
                    onPress={() => changeType()}
                  >
                    <Text style={[{ color: currentColors.LIGHT }]}>
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
                        <Text style={[{ color: currentColors.LIGHT }]}>
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
                        <Text style={[{ color: currentColors.LIGHT }]}>
                          {chooseWinners ? "Manually" : "Automatic"}
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
                        <Text style={[{ color: currentColors.LIGHT }]}>
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
                        placeholderTextColor={currentColors.PLACEHOLDER}
                      />
                    </View>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
            <View
              style={[
                {
                  marginVertical: 5,
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.addButton]}
                onPress={() => setModalVisible(true)}
              >
                <Text
                  style={[
                    {
                      fontSize: 18,
                      textAlign: "center",
                      color: currentColors.LIGHT,
                    },
                  ]}
                >
                  Players
                </Text>
              </TouchableOpacity>
              {players
                // .sort((a, b) => b.points - a.points)
                .map((item) => {
                  let playerScore = "";
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
                              <View style={[styles.flexRow, styles.playerRow]}>
                                <Text
                                  style={[
                                    styles.nameOfInputStyle,
                                    { fontWeight: "bold" },
                                  ]}
                                >
                                  {item.name}
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
                                          color={currentColors.PRIMARY}
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
                                  placeholderTextColor={
                                    currentColors.PLACEHOLDER
                                  }
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
              <Text style={[styles.nameOfInputStyle]}>Time played:</Text>
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
                placeholderTextColor={currentColors.PLACEHOLDER}
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
                placeholderTextColor={currentColors.PLACEHOLDER}
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
                placeholderTextColor={currentColors.PLACEHOLDER}
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
                placeholderTextColor={currentColors.PLACEHOLDER}
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
                placeholderTextColor={currentColors.PLACEHOLDER}
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
              placeholderTextColor={currentColors.PLACEHOLDER}
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

export default NewGameplayModal;
