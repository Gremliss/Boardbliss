import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
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
import colors from "../misc/colors";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const Stats = (props) => {
  const [collection, setCollection] = useState([]);
  const [date, setDate] = useState(new Date());
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

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

  setMonth = (month) => {
    let monthNo = months.indexOf(month); // get month number
    let dateObject = Object.assign({}, this.state.dateObject);
    dateObject = moment(dateObject).set("month", monthNo); // change month value
  };
  changeMonth = async (n) => {
    var newDateMs = date.setMonth(date.getMonth() + n);
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
  let monthlyPlayers = [];
  let monthlyGames = [];
  // Iterate through games
  for (const game of collection) {
    // Check if the game has stats
    if (game.stats && game.stats.length > 0) {
      // Filter stats for the target month and year
      const targetMonthStats = game.stats.filter(
        (stat) =>
          parseInt(stat.date.month) === date.getMonth() + 1 &&
          parseInt(stat.date.year) === date.getFullYear()
      );

      // Iterate through stats for the target month
      targetMonthStats.forEach((stat) => {
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
          const playerIndex = monthlyPlayers.findIndex(
            (item) => item.name === player.name
          );

          if (playerIndex === -1) {
            // Player doesn't exist
            monthlyPlayers.push({
              name: player.name,
              games: 1,
              victories: player.victory ? 1 : 0,
            });
          } else {
            // Player exists
            monthlyPlayers[playerIndex].games += 1;
            if (player.victory) {
              monthlyPlayers[playerIndex].victories += 1;
            }
          }
        });
        // Games
        let gameIndex = monthlyGames.findIndex(
          (item) => item.name === game.name
        );
        if (gameIndex === -1) {
          // Boardgame doesn't exist
          monthlyGames.push({ name: game.name, games: 1, new: false });
        } else {
          // Boardgame exists
          monthlyGames[gameIndex].games += 1;
        }
        // Mark new games
        const oldestStat = findOldestStat(game.stats);

        gameIndex = monthlyGames.findIndex((item) => item.name === game.name);

        if (
          (stat.date.month === oldestStat.date.month) &
          (stat.date.year === oldestStat.date.year)
        ) {
          monthlyGames[gameIndex].new = true;
        }
      });
    }
  }

  // Sort
  monthlyGames?.sort((a, b) => {
    if (a.games > b.games) {
      return -1;
    } else if (a.games < b.games) {
      return 1;
    } else {
      return 0;
    }
  });

  monthlyPlayers?.sort((a, b) => {
    if (a.games > b.games) {
      return -1;
    } else if (a.games < b.games) {
      return 1;
    } else {
      return 0;
    }
  });

  // Count new games
  monthlyGames.forEach((game) => {
    if (game.new === true) {
      newGamesCount++;
    }
  });

  totalHours += Math.floor(totalMinutes / 60);
  totalMinutes = totalMinutes % 60;

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.containerTop}>
            <Text style={styles.textTop}>{date.getFullYear()}</Text>
            <Text style={styles.textTop}>{months[date.getMonth()]}</Text>
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
          {monthlyGames.map((game, index) => {
            const backgroundColor =
              index % 2 === 0 ? colors.LIST_COLOR_ONE : colors.LIST_COLOR_TWO;

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
          {monthlyPlayers.map((player, index) => {
            const backgroundColor =
              index % 2 === 0 ? colors.LIST_COLOR_ONE : colors.LIST_COLOR_TWO;

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
          onPress={() => changeMonth(-1)}
          antIconName={"left"}
          style={styles.leftBtn}
        />
        <RoundIconBtn
          onPress={() => changeMonth(+1)}
          antIconName={"right"}
          style={styles.rightBtn}
        />
      </View>
      <View style={[styles.bottomContainer]}>
        <View style={[styles.buttonBottom, { opacity: 1 }]}>
          <Text style={[styles.textBtn]}>Monthly stats</Text>
        </View>
        <TouchableOpacity
          style={[styles.buttonBottom]}
          onPress={() => props.navigation.navigate("YearlyStats")}
        >
          <Text style={[styles.textBtn]}>Yearly stats</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.BACKGROUND,
    flex: 1,
    textAlign: "center",
    color: colors.LIGHT,
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
    fontSize: 22,
    color: colors.PRIMARY,
    letterSpacing: 1,
  },
  leftBtn: {
    position: "absolute",
    left: 25,
    top: 20,
    zIndex: 1,
    backgroundColor: colors.PRIMARY,
    color: "white",
  },
  rightBtn: {
    position: "absolute",
    right: 25,
    top: 20,
    zIndex: 1,
    backgroundColor: colors.PRIMARY,
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
    color: colors.DARK,
    fontWeight: "bold",
  },
  gameInfoValue: {
    fontSize: 16,
    paddingVertical: 5,
    color: colors.DARK,
  },
  group: {
    backgroundColor: colors.LIST_COLOR_ONE,
    padding: 10,
    margin: 2,
    borderRadius: 5,
  },
  itemContainer: {
    backgroundColor: colors.PRIMARY,
    borderRadius: 8,
    margin: 1,
  },
  flexRow: {
    flexDirection: "row",
  },
  cellContainer: {
    borderRightWidth: 1,
    paddingHorizontal: 0.3,
    borderColor: colors.BACKGROUND,
    paddingVertical: 4,
  },
  textStyle: {
    color: colors.LIGHT,
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
    borderColor: colors.BACKGROUND,
    borderWidth: 1,
    backgroundColor: colors.PRIMARY,
    fontSize: 20,
    height: windowHeight / 8,
    opacity: 0.6,
  },
  textBtn: {
    fontSize: 18,
    textAlign: "center",
    color: colors.LIGHT,
  },
});
export default Stats;
