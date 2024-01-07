import { useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Dimensions,
  Keyboard,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import RoundIconBtn from "./RoundIconButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../misc/colors";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const PlayerDetail = (props) => {
  const [collection, setCollection] = useState(props.route.params.collection);
  const [players, setPlayers] = useState([]);
  const [playerParams, setPlayerParams] = useState(props.route.params.item);
  const [name, setName] = useState(playerParams.name);
  const fetchPlayers = async () => {
    const result = await AsyncStorage.getItem("players");
    if (result?.length) setPlayers(JSON.parse(result));
  };
  const fetchCollection = async () => {
    const result = await AsyncStorage.getItem("collection");
    if (result?.length) setCollection(JSON.parse(result));
  };
  useEffect(() => {
    fetchPlayers();
    fetchCollection();
  }, []);

  const handleKeyboardDismiss = () => {
    Keyboard.dismiss();
  };

  const handleOnChangeTest = (text, valueFor) => {
    if (valueFor === "name") setName(text);
  };

  const handleSubmit = async (text) => {
    const updatedPlayers = players.map((item) =>
      item.id === playerParams.id ? { ...item, name: name } : item
    );

    const updatedCollection = collection.map((gameParams) => ({
      ...gameParams,
      stats: gameParams.stats.map((game) => ({
        ...game,
        players: game.players.map((player) =>
          player.id === playerParams.id ? { ...player, name: name } : player
        ),
      })),
    }));
    await AsyncStorage.setItem("backupCollection", JSON.stringify(collection));
    setCollection(updatedCollection);
    await AsyncStorage.setItem("collection", JSON.stringify(updatedCollection));

    setPlayers(updatedPlayers);
    await AsyncStorage.setItem("players", JSON.stringify(updatedPlayers));

    props.navigation.goBack();
  };

  let victories = 0;
  let gamesPlayed = 0;
  let coopGames = 0;
  let coopVictories = 0;
  collection.forEach((gameParams) => {
    // Count the number of games and victories for player
    gameParams.stats.map((game) => {
      if (game.type !== "Co-Op") {
        game.players
          .filter((player) => player.name === name)
          .forEach((player) => {
            gamesPlayed++;
            if (player.victory) {
              victories++;
            }
          });
      } else {
        game.players
          .filter((player) => player.name === name)
          .forEach((player) => {
            coopGames++;
            if (game?.coop?.victory === "Yes") {
              coopVictories++;
            }
          });
      }
    });
  });

  return (
    <>
      <StatusBar />
      <View style={styles.flexBackground}>
        <View style={styles.container}>
          <TextInput
            value={name}
            onChangeText={(text) => handleOnChangeTest(text, "name")}
            placeholder="Player name"
            style={[styles.input(windowHeight), styles.playerStyle]}
            multiline={true}
            placeholderTextColor={colors.PLACEHOLDER}
          />
          {gamesPlayed ? (
            <View>
              <Text style={[styles.horizontalContainer, styles.gameInfo]}>
                Rivalry
              </Text>
              <View style={styles.horizontalContainer}>
                <View style={styles.horizontalView}>
                  <Text style={styles.gameInfo}>Games played:</Text>
                  <Text style={styles.gameInfoValue}>{gamesPlayed}</Text>
                </View>
              </View>
              <View style={styles.horizontalContainer}>
                <View style={styles.horizontalView}>
                  <Text style={styles.gameInfo}>Victories:</Text>
                  <Text style={styles.gameInfoValue}>{victories}</Text>
                </View>
              </View>
              <View style={styles.horizontalContainer}>
                <View style={styles.horizontalView}>
                  <Text style={styles.gameInfo}>Winning percentage:</Text>
                  <Text style={styles.gameInfoValue}>
                    {((victories / gamesPlayed) * 100).toFixed(2)}%
                  </Text>
                </View>
              </View>
            </View>
          ) : null}
          {coopGames ? (
            <View>
              <Text style={[styles.horizontalContainer, styles.gameInfo]}>
                Co-Op
              </Text>
              <View style={styles.horizontalContainer}>
                <View style={styles.horizontalView}>
                  <Text style={styles.gameInfo}>Games played:</Text>
                  <Text style={styles.gameInfoValue}>{coopGames}</Text>
                </View>
              </View>
              <View style={styles.horizontalContainer}>
                <View style={styles.horizontalView}>
                  <Text style={styles.gameInfo}>Victories:</Text>
                  <Text style={styles.gameInfoValue}>{coopVictories}</Text>
                </View>
              </View>
              <View style={styles.horizontalContainer}>
                <View style={styles.horizontalView}>
                  <Text style={styles.gameInfo}>Winning percentage:</Text>
                  <Text style={styles.gameInfoValue}>
                    {((coopVictories / coopGames) * 100).toFixed(2)}%
                  </Text>
                </View>
              </View>
            </View>
          ) : null}
          <TouchableWithoutFeedback onPress={handleKeyboardDismiss}>
            <View
              style={[styles.flexBackground, StyleSheet.absoluteFillObject]}
            />
          </TouchableWithoutFeedback>
        </View>
        <View style={styles.btnContainer}>
          {name.trim() ? (
            <RoundIconBtn
              antIconName="check"
              onPress={handleSubmit}
              style={styles.addBtn}
            />
          ) : null}
          <RoundIconBtn
            style={styles.closeBtn}
            antIconName="close"
            onPress={() => props.navigation.goBack()}
          />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  input: (windowHeight) => {
    return {
      fontSize: 20,
      marginTop: windowHeight / 6,
      marginHorizontal: 20,
    };
  },
  playerStyle: {
    backgroundColor: colors.GRAY,
    color: colors.LIGHT,
    padding: 10,
    margin: 8,
    borderRadius: 5,
  },
  flexBackground: {
    flex: 1,
    zIndex: -1,
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
  horizontalContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
  },
  horizontalView: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
    padding: 10,
    backgroundColor: colors.BACKGROUND,
    borderRadius: 20,
    margin: 2,
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
});

export default PlayerDetail;
