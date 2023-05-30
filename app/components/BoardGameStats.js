import React, { useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import GamesPlayed from "./GamesPlayed";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const BoardGameStats = (props) => {
  const [gameParams, setGameParams] = useState(props.route.params.gameParams);

  const fetchGameParams = async () => {
    const result = await AsyncStorage.getItem("collection");
    if (result?.length) {
      JSON.parse(result).map((item) => {
        if (item.id === gameParams.id) {
          setGameParams(item);
        }
      });
    }
  };

  useEffect(() => {
    fetchGameParams();
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackButton
    );
    return () => backHandler.remove();
  }, [props.navigation]);

  useFocusEffect(
    React.useCallback(() => {
      fetchGameParams();
    }, [])
  );

  const handleBackButton = () => {
    console.log("backbutt");
    fetchGameParams();
    return;
  };

  const countGamesWithTime = gameParams.stats.reduce(
    (accumulator, currentObject) => {
      const { hours, min } = currentObject.duration;
      if ((hours && !isNaN(hours)) || (min && !isNaN(min))) {
        return accumulator + 1;
      }
      return accumulator;
    },
    0
  );

  const sumHours = gameParams.stats.reduce((accumulator, currentObject) => {
    const { hours } = currentObject.duration;
    return accumulator + (hours && !isNaN(hours) ? parseInt(hours) : 0);
  }, 0);

  const sumMin = gameParams.stats.reduce((accumulator, currentObject) => {
    const { min } = currentObject.duration;
    return accumulator + (min && !isNaN(min) ? parseInt(min) : 0);
  }, 0);

  const sumTotalMin = sumMin + sumHours * 60;
  const sumTotalHours = Math.floor(sumTotalMin / 60);
  const sumMinRest = sumTotalMin % 60;

  const avgTotalMin = sumTotalMin / countGamesWithTime;
  const avgTotalHours = Math.floor(avgTotalMin / 60);
  const avgMinRest = Math.floor(avgTotalMin % 60);

  const playerScores = gameParams.stats
    .filter((item) => item.players && typeof item.players === "object")
    .map((item) => item.players)
    .map((players) => Object.values(players))
    .flat()
    .map((score) => parseInt(score))
    .filter((score) => !isNaN(score));

  const averageScore =
    playerScores.length > 0
      ? playerScores.reduce((sum, score) => sum + score, 0) /
        playerScores.length
      : 0;

  const bestScore = Math.max(...playerScores, 0);

  // const sumCoopPoints = gameParams.stats
  // .filter(item => item.type === "Co-Op")
  // .reduce((sum, game) => {
  //   const coopPoints = game.coop.points;
  //   return sum + (coopPoints !== null ? parseInt(coopPoints) : 0);
  // }, 0);

  const coOpGames = gameParams.stats.filter((game) => game.type === "Co-Op");
  let totalPoints = 0;
  let coOpGamesCount = 0;
  let coOpGamesWithPointsCount = 0;
  let coOpWinCount = 0;

  coOpGames.forEach((game) => {
    coOpGamesCount++;
    if (game.coop.victory == "Yes") {
      coOpWinCount++;
    }
    const coopPoints = game.coop.points;
    if (coopPoints !== null) {
      totalPoints += parseInt(coopPoints);
      coOpGamesWithPointsCount++;
    }
  });

  const averageCoOpPoints =
    coOpGamesWithPointsCount > 0 ? totalPoints / coOpGamesWithPointsCount : 0;

  const coOpScores = gameParams.stats
    .filter((item) => item.type === "Co-Op" && item.coop.points)
    .map((item) => item.coop.points)
    .flat()
    .map((score) => parseInt(score))
    .filter((score) => !isNaN(score));

  console.log(coOpScores);

  const bestScoreCoOp = Math.max(...coOpScores, 0);

  return (
    <>
      <StatusBar />
      <ScrollView style={styles.container}>
        <View>
          <Text style={styles.gameName}>{gameParams.name}</Text>
          <View style={styles.horizontalView}>
            <Text style={styles.gameInfo}>Games played:</Text>
            <Text style={styles.gameInfoValue}>{gameParams.stats?.length}</Text>
          </View>
          <View style={styles.horizontalContainer}>
            <View style={styles.horizontalView}>
              <Text style={styles.gameInfo}>Time played:</Text>
              <Text style={styles.gameInfoValue}>
                {sumTotalHours} h {sumMinRest} min
              </Text>
            </View>
          </View>
          {sumHours / countGamesWithTime ? (
            <View style={styles.horizontalContainer}>
              <View style={styles.horizontalView}>
                <Text style={styles.gameInfo}>Average time played:</Text>
                <Text style={styles.gameInfoValue}>
                  {avgTotalHours} h {avgMinRest} min
                </Text>
              </View>
            </View>
          ) : null}

          {gameParams.stats?.length - coOpGamesCount > 0 ? (
            <View>
              <Text style={styles.gameInfo}>Rivalry</Text>
              <View style={styles.horizontalContainer}>
                <View style={styles.horizontalView}>
                  <Text style={styles.gameInfo}>Games:</Text>
                  <Text style={styles.gameInfoValue}>
                    {gameParams.stats?.length - coOpGamesCount}
                  </Text>
                </View>
              </View>
              <View style={styles.horizontalContainer}>
                <View style={styles.horizontalView}>
                  <Text style={styles.gameInfo}>Average points:</Text>
                  <Text style={styles.gameInfoValue}>{averageScore}</Text>
                </View>
              </View>
              <View style={styles.horizontalContainer}>
                <View style={styles.horizontalView}>
                  <Text style={styles.gameInfo}>Best score:</Text>
                  <Text style={styles.gameInfoValue}>{bestScore}</Text>
                </View>
              </View>
            </View>
          ) : null}

          {coOpGamesCount ? (
            <View>
              <Text style={styles.gameInfo}>Co-Op</Text>
              <View style={styles.horizontalContainer}>
                <View style={styles.horizontalView}>
                  <Text style={styles.gameInfo}>Games:</Text>
                  <Text style={styles.gameInfoValue}>{coOpGamesCount}</Text>
                </View>
              </View>
              <View style={styles.horizontalContainer}>
                <View style={styles.horizontalView}>
                  <Text style={styles.gameInfo}>Win:</Text>
                  <Text style={styles.gameInfoValue}>{coOpWinCount}</Text>
                </View>
              </View>
              <View style={styles.horizontalContainer}>
                <View style={styles.horizontalView}>
                  <Text style={styles.gameInfo}>Loose:</Text>
                  <Text style={styles.gameInfoValue}>
                    {coOpGamesCount - coOpWinCount}
                  </Text>
                </View>
              </View>
              <View style={styles.horizontalContainer}>
                <View style={styles.horizontalView}>
                  <Text style={styles.gameInfo}>Win percentage:</Text>
                  <Text style={styles.gameInfoValue}>
                    {((coOpWinCount / coOpGamesCount) * 100).toFixed(2)}%
                  </Text>
                </View>
              </View>
              <View style={styles.horizontalContainer}>
                <View style={styles.horizontalView}>
                  <Text style={styles.gameInfo}>Average points:</Text>
                  <Text style={styles.gameInfoValue}>{averageCoOpPoints}</Text>
                </View>
              </View>
              <View style={styles.horizontalContainer}>
                <View style={styles.horizontalView}>
                  <Text style={styles.gameInfo}>Best score:</Text>
                  <Text style={styles.gameInfoValue}>{bestScoreCoOp}</Text>
                </View>
              </View>
            </View>
          ) : null}

          <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <View>
              <Text style={styles.closeButton}>Close</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <View style={[styles.bottomContainer]}>
        <TouchableOpacity
          style={[styles.buttonBottom]}
          onPress={() =>
            props.navigation.navigate("CollectionBoardgameDetail", {
              gameParams,
            })
          }
        >
          <Text style={[styles.textBtn]}>{gameParams.name}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttonBottom]}
          onPress={() =>
            props.navigation.navigate("EditBoardGame", {
              gameParams,
            })
          }
        >
          <Text style={[styles.textBtn]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonBottom, { opacity: 1 }]}>
          <Text style={[styles.textBtn]}>Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttonBottom]}
          onPress={() =>
            props.navigation.navigate("GamesPlayed", {
              gameParams,
            })
          }
        >
          <Text style={[styles.textBtn]}>Games Played</Text>
        </TouchableOpacity>
      </View>
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
  boargameImgContainer: {
    alignItems: "center",
  },
  boargameImg: {
    width: windowWidth,
    height: 300,
  },
  gameName: {
    fontSize: 26,
    paddingVertical: 5,
    color: "#00ADB5",
    fontWeight: "bold",
    marginVertical: 10,
  },
  horizontalContainer: {
    flexDirection: "row",
  },
  horizontalView: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
    padding: 10,
    backgroundColor: "#393E46",
    borderRadius: 20,
    margin: 2,
  },
  gameInfo: {
    fontSize: 16,
    paddingVertical: 5,
    opacity: 0.7,
    color: "#00ADB5",
  },
  gameInfoValue: {
    fontSize: 16,
    paddingVertical: 5,
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
    opacity: 0.6,
  },
  textBtn: {
    fontSize: 18,
    textAlign: "center",
    color: "#EEEEEE",
  },
});

export default BoardGameStats;
