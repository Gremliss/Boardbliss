import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Keyboard,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  SafeAreaView,
  Alert,
} from "react-native";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RoundIconBtn from "../components/RoundIconButton";
import colors from "../misc/colors";
import { TouchableOpacity } from "react-native-gesture-handler";
import NewGameplayModal from "../components/NewGameplayModal";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const GameCalendar = (props) => {
  const [collection, setCollection] = useState([]);
  const [date, setDate] = useState(new Date());
  const currentDate = new Date();
  const [gameParams, setGameParams] = useState();
  const [gameplayParams, setGameplayParams] = useState({
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
  const [editGameplaymodalVisible, setEditGameplaymodalVisible] =
    useState(false);
  const dayNow = new Date();
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
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const nDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var year = date.getFullYear();
  var month = date.getMonth();
  var firstDay = new Date(year, month, 1).getDay();
  var maxDays = nDays[month];

  const fetchCollection = async () => {
    const result = await AsyncStorage.getItem("collection");
    if (result?.length) setCollection(JSON.parse(result));
  };
  useEffect(() => {
    fetchCollection();
  }, []);

  if (month == 1) {
    // February
    if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
      maxDays += 1;
    }
  }
  var numberOfDays = [];
  var n = firstDay;
  for (var i = 1; i < maxDays + 1; i++) {
    if (n > 6) {
      n = 0;
    }
    var day = weekDays[n];
    numberOfDays.push({
      name: i + ". " + day,
      id: i + "." + month + "." + year,
    });
    n++;
  }
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

  const displayDeleteAlert = (game, session) => {
    Alert.alert(
      "Do you want to delete this gameplay?",
      "Gameplay will be deleted permanently",
      [
        { text: "Delete", onPress: () => deleteCheckedGameplay(game, session) },
        { text: "Cancel", onPress: () => null },
      ],
      { cancelable: true }
    );
  };
  const deleteCheckedGameplay = async (game, session) => {
    const newGameplay = game.stats.filter((n) => n.id !== session.id);

    const updatedCollection = collection.map((item) => {
      if (item.id === game.id) {
        return {
          ...item,
          stats: newGameplay,
        };
      } else {
        return item;
      }
    });

    setCollection(updatedCollection);
    await AsyncStorage.setItem("collection", JSON.stringify(updatedCollection));
  };

  const renderItem = ({ item, index }) => {
    const isCurrentDate =
      item.id ===
      `${dayNow.getDate()}.${dayNow.getMonth()}.${dayNow.getFullYear()}`;

    const backgroundColor =
      item.name.slice(-3) === "Sun" || item.name.slice(-3) === "Sat"
        ? isCurrentDate
          ? "#cc3e72"
          : colors.RED
        : isCurrentDate
        ? colors.PRIMARY
        : colors.PRIMARY_OPACITY;

    const fontWeight = isCurrentDate ? "bold" : "normal";

    return (
      <View style={[styles.flatListItemContainer, {}]}>
        <View>
          <Text style={styles.headingFlatListItem(backgroundColor, fontWeight)}>
            {item.name}
          </Text>
        </View>
        {renderGames(item, index)}
      </View>
    );
  };

  const renderGames = (item, index) => {
    const currentDate = item.id; // Date "day.month.year"

    const gamesPlayedOnThisDate = collection.filter((game) => {
      const stats = game.stats;
      return (
        stats &&
        stats.some((session) => {
          const sessionDate = `${session.date.day}.${session.date.month - 1}.${
            session.date.year
          }`;
          return sessionDate === currentDate;
        })
      );
    });

    if (
      Array.isArray(gamesPlayedOnThisDate) &&
      gamesPlayedOnThisDate.length > 0
    ) {
      return (
        <View style={styles.dailyGamesContainer}>
          {gamesPlayedOnThisDate.map((game) => {
            const gameName = game.name;
            const gameSessions = game.stats.filter((session) => {
              const sessionDate = `${session.date.day}.${
                session.date.month - 1
              }.${session.date.year}`;
              return sessionDate === currentDate;
            });

            return (
              <View key={`${game.id}`}>
                {gameSessions.map((session, sessionIndex) => (
                  <View
                    key={`${game.id}-${sessionIndex}`}
                    style={styles.gameItem}
                  >
                    <TouchableOpacity
                      onPress={() => handleItemPressed(game, session)}
                      onLongPress={() => displayDeleteAlert(game, session)}
                    >
                      {session.coop?.victory == "Yes" ? (
                        <Text style={styles.coopVictory}>{gameName}</Text>
                      ) : (
                        <Text style={styles.gameName}>{gameName}</Text>
                      )}

                      <Text style={styles.players}>
                        👥{" "}
                        {session.players.map((player, playerIndex) => (
                          <Text key={playerIndex}>
                            {playerIndex > 0 && ", "}{" "}
                            {player.victory ? (
                              <Text style={styles.winPlayer}>
                                {player.name}
                              </Text>
                            ) : (
                              player.name
                            )}
                          </Text>
                        ))}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      );
    } else {
      return null;
    }
  };

  let totalHours = 0;
  let totalMinutes = 0;
  let numOfGames = 0;
  // Iterate through games
  for (const game of collection) {
    // Check if the game has stats
    if (game.stats && game.stats.length > 0) {
      // Filter stats for the target month
      const targetMonthStats = game.stats.filter(
        (stat) => stat.date.month === date.getMonth() + 1
      );

      // Iterate through stats for the target month
      targetMonthStats.forEach((stat) => {
        // Extract hours and minutes
        const hours = stat.duration.hours || 0;
        const minutes = stat.duration.min || 0;

        // Update totals
        totalHours += parseInt(hours);
        totalMinutes += parseInt(minutes);
        numOfGames += 1;
      });
    }
  }
  totalHours += Math.floor(totalMinutes / 60);
  totalMinutes = totalMinutes % 60;

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };
  const ITEM_WIDTH = windowWidth / 4;
  // const getItemLayout = (_, index) => {
  //   return {
  //     length: ITEM_WIDTH,
  //     offset: ITEM_WIDTH * (index - 1),
  //     index,
  //   };
  // };

  const addNewGameplay = async (newGameplay) => {
    const result = await AsyncStorage.getItem("collection");
    const parsedResult = JSON.parse(result);
    if (!parsedResult) {
      parsedResult = [];
    }

    if (!gameParams.stats) {
      gameParams.stats = [];
    }
    var newGameParams = { ...gameParams };
    const isExists = gameParams.stats.some(
      (item) => item.id === newGameplay.id
    );

    if (isExists) {
      newGameParams = {
        ...gameParams,
        stats: gameParams.stats.map((obj) =>
          obj.id === newGameplay.id ? newGameplay : obj
        ),
      };
    } else {
      newGameParams = {
        ...gameParams,
        stats: [...gameParams.stats, newGameplay],
      };
    }

    const updatedCollection = parsedResult.map((item) => {
      if (item.id === newGameParams.id) {
        return {
          ...item,
          stats: newGameParams.stats,
        };
      } else {
        return item;
      }
    });
    setCollection(updatedCollection);
    await AsyncStorage.setItem("collection", JSON.stringify(updatedCollection));
  };

  const handleItemPressed = async (game, session) => {
    setGameplayParams(session);
    setGameParams(game);
    setEditGameplaymodalVisible(true);
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.containerTop}>
            <Text style={styles.textTop}>{date.getFullYear()}</Text>
            <Text style={styles.textTop}>{months[date.getMonth()]}</Text>
            <Text style={styles.statsTop}>Games: {numOfGames}</Text>
            <Text style={styles.statsTop}>
              Time: {totalHours} h {totalMinutes} min
            </Text>
          </View>
        </TouchableWithoutFeedback>
        <SafeAreaView style={styles.flatListContainer}>
          <FlatList
            data={numberOfDays}
            renderItem={renderItem}
            // getItemLayout={getItemLayout}
            keyExtractor={(item) => item.id}
            numColumns={2}
          />
        </SafeAreaView>
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

        <NewGameplayModal
          visible={editGameplaymodalVisible}
          onClose={() => setEditGameplaymodalVisible(false)}
          onSubmit={addNewGameplay}
          gameplayParams={gameplayParams}
          isExisting={true}
        />
      </View>
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.BACKGROUND,
    flex: 1,
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
  statsTop: {
    fontWeight: "bold",
    fontSize: 14,
    color: colors.PRIMARY,
  },
  flatListContainer: {
    flex: 1,
    color: "white",
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
  flatListItemContainer: {
    width: windowWidth / 2,
    padding: 2,
  },
  headingFlatListItem: (bcgColor, weight) => {
    return {
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
      backgroundColor: bcgColor,
      borderColor: colors.BACKGROUND,
      borderTopWidth: 1,
      color: "white",
      fontWeight: weight,
      flex: 1,
      paddingLeft: 30,
    };
  },
  dailyGamesContainer: {
    padding: 5,
    backgroundColor: "#F9F3CC80",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  winPlayer: {
    textDecorationLine: "underline",
  },
  coopVictory: {
    fontSize: 14,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  gameItem: {
    paddingBottom: 4,
    borderWidth: 1,
    backgroundColor: colors.PRIMARY_OPACITY,
    padding: 2,
    borderRadius: 8,
    margin: 1,
    borderColor: colors.PRIMARY,
  },
  gameName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  players: {},
});
export default GameCalendar;
