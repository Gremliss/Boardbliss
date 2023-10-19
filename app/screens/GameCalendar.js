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
} from "react-native";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RoundIconBtn from "../components/RoundIconButton";
import colors from "../misc/colors";
import { TouchableOpacity } from "react-native-gesture-handler";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const GameCalendar = (props) => {
  const [collection, setCollection] = useState([]);
  const [date, setDate] = useState(new Date());
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
    console.log(collection[0].stats[0].players);
  };
  const renderItem = ({ item, index }) => {
    const isCurrentDate =
      item.id ===
      `${dayNow.getDate()}.${dayNow.getMonth()}.${dayNow.getFullYear()}`;

    const backgroundColor =
      item.name.slice(-3) === "Sun" || item.name.slice(-3) === "Sat"
        ? isCurrentDate
          ? "#be8eb3"
          : colors.RED
        : isCurrentDate
        ? "#5e5ea1"
        : colors.GRAY;

    const fontWeight = isCurrentDate ? "bold" : "normal";

    return (
      <View>
        <View style={[styles.violetBackground, { backgroundColor }]}>
          <Text style={styles.dayStyle(backgroundColor, fontWeight)}>
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
        <View style={styles.dailyGames}>
          {gamesPlayedOnThisDate.map((game) => {
            const gameName = game.name;
            const gameSessions = game.stats.filter((session) => {
              const sessionDate = `${session.date.day}.${
                session.date.month - 1
              }.${session.date.year}`;
              return sessionDate === currentDate;
            });
            const gamePlayers = gameSessions.flatMap(
              (session) => session.players
            );

            return (
              <View key={`${game.id}`}>
                {gameSessions.map((session, sessionIndex) => (
                  <View
                    key={`${game.id}-${sessionIndex}`}
                    style={styles.gameItem}
                  >
                    <Text style={styles.gameName}>{gameName}</Text>

                    <Text style={styles.players}>
                      Players:{" "}
                      {session.players.map((player, playerIndex) => (
                        <Text key={playerIndex}>
                          {playerIndex > 0 && ", "}{" "}
                          {player.victory ? (
                            <Text style={styles.boldPlayer}>{player.name}</Text>
                          ) : (
                            player.name
                          )}
                        </Text>
                      ))}
                    </Text>
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

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };
  const ITEM_WIDTH = windowWidth / 4;
  const getItemLayout = (_, index) => {
    return {
      length: ITEM_WIDTH,
      offset: ITEM_WIDTH * (index - 1),
      index,
    };
  };
  const keyExtractor = (item) => item.id;
  return (
    <>
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.containerTop}>
            <Text style={styles.textTop}>{date.getFullYear()}</Text>
            <Text style={styles.textTop}>{months[date.getMonth()]}</Text>
          </View>
        </TouchableWithoutFeedback>
        <SafeAreaView style={styles.flatListContainer}>
          <FlatList
            data={numberOfDays}
            // horizontal={true}
            initialScrollIndex={date.getDate() - 1}
            renderItem={renderItem}
            getItemLayout={getItemLayout}
            keyExtractor={keyExtractor}
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

        <View style={[styles.bottomContainer]}>
          <TouchableOpacity
            style={[styles.buttonBottom]}
            onPress={() => props.navigation.navigate("Collection")}
          >
            <Text style={[styles.textBtn]}>Collection</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buttonBottom]}
            onPress={() => props.navigation.navigate("SearchBgg")}
          >
            <Text style={[styles.textBtn]}>Search BGG</Text>
          </TouchableOpacity>
          <View style={[styles.buttonBottom, { opacity: 1 }]}>
            <Text style={[styles.textBtn]}>Game Calendar</Text>
          </View>
          <TouchableOpacity
            style={[styles.buttonBottom]}
            onPress={() => props.navigation.navigate("Players")}
          >
            <Text style={[styles.textBtn]}>Players</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.LIGHT,
    flex: 1,
  },
  containerTop: {
    paddingBottom: 20,
    paddingTop: 20,
    backgroundColor: colors.LIGHT,
    color: "white",
    alignItems: "center",
  },
  textTop: {
    fontWeight: "bold",
    fontSize: 22,
    color: "white",
    letterSpacing: 1,
  },
  flatListContainer: {
    flex: 1,
    color: "white",
  },
  violetBackground: {
    backgroundColor: "#1c1c30",
  },
  lightVioletBackground: {
    backgroundColor: "#2f2f50",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    alignItems: "center",
  },
  dayStyle: (bcgColor, weight) => {
    return {
      borderTopLeftRadius: 50,
      borderTopRightRadius: 50,
      textAlign: "center",
      backgroundColor: bcgColor,
      borderColor: "#1c1c30",
      color: "white",
      fontWeight: weight,
    };
  },
  textInputStyle: (windowWidth) => {
    return {
      // flex: 1,
      width: windowWidth / 4,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: "#1c1c30",
      paddingTop: 5,
      paddingBottom: 0,
      paddingLeft: 3,
      paddingRight: 2,
    };
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
  bottomContainer: {
    width: windowWidth,
    flexDirection: "row",
    // alignItems: "center",
    justifyContent: "center",
  },
  buttonBottom: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    alignSelf: "center",
    textAlign: "center",
    borderColor: colors.LIGHT,
    borderWidth: 1,
    backgroundColor: colors.PRIMARY,
    fontSize: 20,
    height: windowHeight / 8,
    width: windowWidth / 4,
    opacity: 0.6,
  },
  textBtn: {
    fontSize: 18,
    textAlign: "center",
    color: colors.LIGHT,
  },
  dailyGames: {
    padding: 2,
  },
  boldPlayer: {
    fontWeight: "bold",
  },
  gameItem: { flex: 1 },
  gameName: {},
  players: {},
});
export default GameCalendar;
