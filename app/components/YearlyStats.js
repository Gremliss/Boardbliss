import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useContext, useEffect, useState } from "react";
import {
  Dimensions,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import RoundIconBtn from "../components/RoundIconButton";
import { ColorContext } from "../misc/ColorContext";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const YearlyStats = (props) => {
  const { currentColors } = useContext(ColorContext);
  const [collection, setCollection] = useState([]);
  const [date, setDate] = useState(new Date());

  const fetchCollection = async () => {
    const result = await AsyncStorage.getItem("collection");
    if (result?.length) setCollection(JSON.parse(result));
  };
  useEffect(() => {
    fetchCollection();
  }, []);
  useFocusEffect(
    React.useCallback(() => {
      fetchCollection();
    }, [])
  );

  const changeYear = async (n) => {
    let newDateMs = date.setFullYear(date.getFullYear() + n);
    const newDate = new Date(newDateMs);
    setDate(newDate);
  };

  const findOldestStat = (stats) => {
    if (stats.length === 0) return null;

    return stats.reduce((oldest, current) => {
      const oldestDate = new Date(
        oldest.date.year,
        oldest.date.month - 1,
        oldest.date.day
      );
      const currentDate = new Date(
        current.date.year,
        current.date.month - 1,
        current.date.day
      );

      return currentDate < oldestDate ? current : oldest;
    });
  };

  let totalHours = 0;
  let totalMinutes = 0;
  let numOfCoop = 0;
  let numOfRivalry = 0;
  let newGamesCount = 0;
  let yearlyPlayers = [];
  let yearlyGames = [];
  // Iterate through games
  for (const game of collection) {
    // Check if the game has stats
    if (game.stats && game.stats.length > 0) {
      // Filter stats for the target month and year
      const targetYearlyStats = game.stats.filter(
        (stat) => parseInt(stat.date.year) === date.getFullYear()
      );

      // Iterate through stats for the target month
      targetYearlyStats.forEach((stat) => {
        // Extract hours and minutes
        const hours = stat.duration.hours || 0;
        const minutes = stat.duration.min || 0;

        // Update totals
        totalHours += parseInt(hours);
        totalMinutes += parseInt(minutes);
        if (stat.type == "Rivalry") {
          numOfRivalry += 1;
        } else {
          numOfCoop += 1;
        }

        // Players
        stat.players.forEach((player) => {
          const playerIndex = yearlyPlayers.findIndex(
            (item) => item.name === player.name
          );

          if (playerIndex === -1) {
            // Player doesn't exist
            yearlyPlayers.push({
              name: player.name,
              games: 1,
              victories: player.victory ? 1 : 0,
            });
          } else {
            // Player exists
            yearlyPlayers[playerIndex].games += 1;
            if (player.victory) {
              yearlyPlayers[playerIndex].victories += 1;
            }
          }
        });
        // Games
        let gameIndex = yearlyGames.findIndex(
          (item) => item.name === game.name
        );
        if (gameIndex === -1) {
          // Boardgame doesn't exist
          yearlyGames.push({ name: game.name, games: 1, new: false });
        } else {
          // Boardgame exists
          yearlyGames[gameIndex].games += 1;
        }
        // Mark new games
        const oldestStat = findOldestStat(game.stats);

        gameIndex = yearlyGames.findIndex((item) => item.name === game.name);

        if (stat.date.year === oldestStat.date.year) {
          yearlyGames[gameIndex].new = true;
        }
      });
    }
  }

  // Sort
  yearlyGames?.sort((a, b) => {
    if (a.games > b.games) {
      return -1;
    } else if (a.games < b.games) {
      return 1;
    } else {
      return 0;
    }
  });

  yearlyPlayers?.sort((a, b) => {
    if (a.games > b.games) {
      return -1;
    } else if (a.games < b.games) {
      return 1;
    } else {
      return 0;
    }
  });

  // Count new games
  yearlyGames.forEach((game) => {
    if (game.new === true) {
      newGamesCount++;
    }
  });

  totalHours += Math.floor(totalMinutes / 60);
  totalMinutes = totalMinutes % 60;

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: currentColors.BACKGROUND,
      flex: 1,
      textAlign: "center",
      color: currentColors.LIGHT,
      paddingHorizontal: 30,
    },
    containerTop: {
      paddingBottom: 20,
      paddingTop: 20,
      color: "white",
      alignItems: "center",
    },
    textTop: {
      fontWeight: "bold",
      fontSize: 40,
      color: currentColors.PRIMARY,
      letterSpacing: 1,
    },
    leftBtn: {
      position: "absolute",
      left: 25,
      top: 20,
      zIndex: 1,
      backgroundColor: currentColors.PRIMARY,
      color: "white",
    },
    rightBtn: {
      position: "absolute",
      right: 25,
      top: 20,
      zIndex: 1,
      backgroundColor: currentColors.PRIMARY,
      color: "white",
    },
    horizontalView: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 10,
    },
    gameInfo: {
      fontSize: 16,
      paddingVertical: 5,
      opacity: 1,
      color: currentColors.DARK,
      fontWeight: "bold",
    },
    gameInfoValue: {
      fontSize: 16,
      paddingVertical: 5,
      color: currentColors.DARK,
    },
    group: {
      backgroundColor: currentColors.LIST_COLOR_ONE,
      padding: 10,
      margin: 2,
      borderRadius: 5,
    },

    itemContainer: {
      backgroundColor: currentColors.PRIMARY,
      borderRadius: 8,
      margin: 1,
    },

    flexRow: {
      flexDirection: "row",
    },
    cellContainer: {
      borderRightWidth: 1,
      paddingHorizontal: 0.3,
      borderColor: currentColors.BACKGROUND,
      paddingVertical: 4,
    },
    textStyle: {
      color: currentColors.LIGHT,
      fontSize: 12,
      flexWrap: "wrap",
    },
    centerStyle: {
      justifyContent: "center",
      alignItems: "center",
      flex: 1,
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
      borderColor: currentColors.BACKGROUND,
      borderWidth: 1,
      backgroundColor: currentColors.PRIMARY,
      fontSize: 20,
      height: windowHeight / 8,
      opacity: 0.6,
    },
    textBtn: {
      fontSize: 18,
      textAlign: "center",
      color: currentColors.LIGHT,
    },
  });

  return (
    <>
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.containerTop}>
            <Text style={styles.textTop}>{date.getFullYear()}</Text>
          </View>
        </TouchableWithoutFeedback>
        <ScrollView>
          <View style={styles.group}>
            <View style={styles.horizontalView}>
              <Text style={styles.gameInfo}>Games:</Text>
              <Text style={styles.gameInfoValue}>
                {numOfCoop + numOfRivalry}
              </Text>
            </View>
            <View style={styles.horizontalView}>
              <Text style={styles.gameInfo}>Rivalry:</Text>
              <Text style={styles.gameInfoValue}>{numOfRivalry}</Text>
            </View>
            <View style={styles.horizontalView}>
              <Text style={styles.gameInfo}>Coop:</Text>
              <Text style={styles.gameInfoValue}>{numOfCoop}</Text>
            </View>
            <View style={styles.horizontalView}>
              <Text style={styles.gameInfo}>New games:</Text>
              <Text style={styles.gameInfoValue}>{newGamesCount}</Text>
            </View>
            <View style={styles.horizontalView}>
              <Text style={styles.gameInfo}>Time:</Text>
              <Text style={styles.gameInfoValue}>
                {totalHours} h {totalMinutes} min
              </Text>
            </View>
          </View>

          <View style={[styles.itemContainer, { opacity: 0.8, marginTop: 5 }]}>
            <View style={[styles.flexRow]}>
              <View
                style={[
                  styles.centerStyle,
                  styles.cellContainer,
                  { flex: 0.8 },
                ]}
              >
                <Text style={[styles.textStyle]}>Nr</Text>
              </View>
              <View
                style={[
                  styles.cellContainer,
                  { flex: 3, justifyContent: "center" },
                ]}
              >
                <Text style={[styles.textStyle]}>Name</Text>
              </View>
              <View style={[styles.centerStyle, styles.cellContainer]}>
                <Text style={[styles.textStyle]}>Games</Text>
              </View>
              <View
                style={[
                  styles.centerStyle,
                  styles.cellContainer,
                  { borderRightWidth: 0 },
                ]}
              >
                <Text style={[styles.textStyle]}>New</Text>
              </View>
            </View>
          </View>
          {yearlyGames.map((game, index) => {
            const backgroundColor =
              index % 2 === 0
                ? currentColors.LIST_COLOR_ONE
                : currentColors.LIST_COLOR_TWO;

            return (
              <View
                key={index}
                style={[
                  styles.itemContainer,
                  { backgroundColor: backgroundColor },
                ]}
              >
                <View style={[styles.flexRow]}>
                  <View
                    style={[
                      styles.centerStyle,
                      styles.cellContainer,
                      { flex: 0.8 },
                    ]}
                  >
                    <Text style={[{ color: "#1b232e" }]}>{index + 1}</Text>
                  </View>
                  <View style={[styles.cellContainer, { flex: 3 }]}>
                    <Text style={[{ paddingHorizontal: 8 }]}>{game.name}</Text>
                  </View>
                  <View style={[styles.centerStyle, styles.cellContainer]}>
                    <Text>{game.games}</Text>
                  </View>
                  <View
                    style={[
                      styles.centerStyle,
                      styles.cellContainer,
                      { borderRightWidth: 0 },
                    ]}
                  >
                    <Text>{game.new ? "✔" : null}</Text>
                  </View>
                </View>
              </View>
            );
          })}

          <View style={[styles.itemContainer, { opacity: 0.8, marginTop: 5 }]}>
            <View style={[styles.flexRow]}>
              <View
                style={[
                  styles.centerStyle,
                  styles.cellContainer,
                  { flex: 0.8 },
                ]}
              >
                <Text style={[styles.textStyle]}>Nr</Text>
              </View>
              <View
                style={[
                  styles.cellContainer,
                  { flex: 3, justifyContent: "center" },
                ]}
              >
                <Text style={[styles.textStyle]}>Player</Text>
              </View>
              <View style={[styles.centerStyle, styles.cellContainer]}>
                <Text style={[styles.textStyle]}>Win</Text>
              </View>
              <View
                style={[
                  styles.centerStyle,
                  styles.cellContainer,
                  { borderRightWidth: 0 },
                ]}
              >
                <Text style={[styles.textStyle]}>Games</Text>
              </View>
            </View>
          </View>
          {yearlyPlayers.map((player, index) => {
            const backgroundColor =
              index % 2 === 0
                ? currentColors.LIST_COLOR_ONE
                : currentColors.LIST_COLOR_TWO;

            return (
              <View
                key={index}
                style={[
                  styles.itemContainer,
                  { backgroundColor: backgroundColor },
                ]}
              >
                <View style={[styles.flexRow]}>
                  <View
                    style={[
                      styles.centerStyle,
                      styles.cellContainer,
                      { flex: 0.8 },
                    ]}
                  >
                    <Text style={[{ color: "#1b232e" }]}>{index + 1}</Text>
                  </View>
                  <View style={[styles.cellContainer, { flex: 3 }]}>
                    <Text style={[{ paddingHorizontal: 8 }]}>
                      {player.name}
                    </Text>
                  </View>
                  <View style={[styles.centerStyle, styles.cellContainer]}>
                    <Text>{player.victories}</Text>
                  </View>
                  <View
                    style={[
                      styles.centerStyle,
                      styles.cellContainer,
                      { borderRightWidth: 0 },
                    ]}
                  >
                    <Text>{player.games}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <RoundIconBtn
          onPress={() => changeYear(-1)}
          antIconName={"left"}
          style={styles.leftBtn}
        />
        <RoundIconBtn
          onPress={() => changeYear(+1)}
          antIconName={"right"}
          style={styles.rightBtn}
        />
      </View>
      <View style={[styles.bottomContainer]}>
        <TouchableOpacity
          style={[styles.buttonBottom]}
          onPress={() => props.navigation.navigate("Stats")}
        >
          <Text style={[styles.textBtn]}>Monthly stats</Text>
        </TouchableOpacity>
        <View style={[styles.buttonBottom, { opacity: 1 }]}>
          <Text style={[styles.textBtn]}>Yearly stats</Text>
        </View>
      </View>
    </>
  );
};

export default YearlyStats;
