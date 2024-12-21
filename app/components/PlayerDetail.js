import { useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Dimensions,
  FlatList,
  Keyboard,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import RoundIconBtn from "./RoundIconButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../misc/colors";
import NewGameplayModal from "./NewGameplayModal";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const PlayerDetail = (props) => {
  const [collection, setCollection] = useState(props.route.params.collection);
  const [filteredCollection, setFilteredCollection] = useState([]);
  const [players, setPlayers] = useState([]);
  const [playerParams, setPlayerParams] = useState(props.route.params.item);
  const [name, setName] = useState(playerParams.name);

  const [gameParams, setGameParams] = useState({
    name: "",
    yearpublished: "",
    owner: "Yes",
    rating: "",
    minPlayers: "",
    maxPlayers: "",
    minPlaytime: "",
    maxPlaytime: "",
    bggImage: null,
    id: Date.now(),
    isChecked: false,
    expansion: false,
    stats: [],
  });
  const [gameplayParams, setGameplayParams] = useState({
    id: Date.now(),
    date: {},
    players: [],
    type: "Rivalry",
    scoreType: "Points",
    isChecked: false,
    duration: { hours: null, min: null },
  });
  const [editGameplaymodalVisible, setEditGameplaymodalVisible] =
    useState(false);
  const fetchPlayers = async () => {
    const result = await AsyncStorage.getItem("players");
    if (result?.length) setPlayers(JSON.parse(result));
  };
  const fetchCollection = async () => {
    const result = await AsyncStorage.getItem("collection");
    const parsedResult = JSON.parse(result);
    if (parsedResult?.length) {
      setCollection(parsedResult);
      setFilteredCollection(
        parsedResult.filter((item) => {
          return item.stats.some((stat) => {
            return stat.players.some((player) => player.name === name);
          });
        })
      );
    }
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
    setFilteredCollection(
      updatedCollection.filter((item) => {
        return item.stats.some((stat) => {
          return stat.players.some((player) => player.name === name);
        });
      })
    );
    await AsyncStorage.setItem("collection", JSON.stringify(updatedCollection));

    setPlayers(updatedPlayers);
    await AsyncStorage.setItem("players", JSON.stringify(updatedPlayers));

    props.navigation.goBack();
  };

  let victories = 0;
  let gamesPlayed = 0;
  let coopGames = 0;
  let coopVictories = 0;
  filteredCollection.forEach((gameParams) => {
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

  const handleItemPressed = async (game, session) => {
    setGameplayParams(session);
    setGameParams(game);
    setEditGameplaymodalVisible(true);
  };

  const addNewGameplay = async (newGameplay) => {
    const result = await AsyncStorage.getItem("collection");
    const parsedResult = JSON.parse(result);
    if (!parsedResult) {
      parsedResult = [];
    }

    if (!gameParams.stats) {
      gameParams.stats = [];
    }
    let newGameParams = { ...gameParams };
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
    await AsyncStorage.setItem("backupCollection", JSON.stringify(collection));
    setCollection(updatedCollection);
    setFilteredCollection(
      updatedCollection.filter((item) => {
        return item.stats.some((stat) => {
          return stat.players.some((player) => player.name === name);
        });
      })
    );
    await AsyncStorage.setItem("collection", JSON.stringify(updatedCollection));
  };

  const renderGames = (item, index) => {
    const gameName = item.item.name;
    const gamesWithChosenPlayer = item.item.stats.filter((stat) => {
      return stat.players.some((player) => player.name == name);
    });
    if (
      Array.isArray(gamesWithChosenPlayer) &&
      gamesWithChosenPlayer.length > 0
    ) {
      return (
        <View style={styles.gamesContainer}>
          {gamesWithChosenPlayer.map((session, sessionIndex) => (
            <View key={`${item.id}-${sessionIndex}`} style={styles.gameItem}>
              <TouchableOpacity
                onPress={() => handleItemPressed(item.item, session)}
                onLongPress={() => displayDeleteAlert(item.item, session)}
              >
                {session.coop?.victory == "Yes" ? (
                  <View style={styles.horizontalViewGames}>
                    <Text style={styles.coopVictory}>{gameName}</Text>
                    <Text>
                      {session.date.day.toString().padStart(2, "0")}.
                      {session.date.month.toString().padStart(2, "0")}.
                      {session.date.year}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.horizontalViewGames}>
                    <Text style={styles.gameName}>{gameName}</Text>
                    <Text>
                      {session.date.day.toString().padStart(2, "0")}.
                      {session.date.month.toString().padStart(2, "0")}.
                      {session.date.year}
                    </Text>
                  </View>
                )}

                <Text style={styles.players}>
                  👥{" "}
                  {session.players.map((player, playerIndex) => (
                    <Text key={playerIndex}>
                      {playerIndex > 0 && ", "}{" "}
                      {player.victory ? (
                        <Text style={styles.winPlayer}>{player.name}</Text>
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
    } else {
      return null;
    }
  };

  return (
    <>
      <StatusBar />
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
        <View style={styles.flatListContainer}>
          <Text style={[styles.horizontalContainer, styles.gameInfo]}>
            Games
          </Text>
          <FlatList
            data={filteredCollection}
            renderItem={renderGames}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={true}
            showsHorizontalScrollIndicator={true}
          />
        </View>
        <TouchableWithoutFeedback onPress={handleKeyboardDismiss}>
          <View />
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

      <NewGameplayModal
        visible={editGameplaymodalVisible}
        onClose={() => setEditGameplaymodalVisible(false)}
        onSubmit={addNewGameplay}
        gameplayParams={gameplayParams}
        isExisting={true}
        gameParams={gameParams}
      />
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
      // marginTop: windowHeight / 6,
      marginHorizontal: 20,
    };
  },
  playerStyle: {
    backgroundColor: colors.GRAY,
    color: colors.LIGHT,
    padding: 12,
    margin: 2,
    borderRadius: 5,
  },
  flexBackground: {
    flex: 1,
    // zIndex: -1,
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
    padding: 6,
    paddingVertical: 2,
    backgroundColor: colors.BACKGROUND,
    borderRadius: 10,
    margin: 1,
  },

  horizontalViewGames: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
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
  flatListContainer: {
    flex: 1,
    marginBottom: 80,
    margin: 2,
    padding: 2,
    borderRadius: 5,
    backgroundColor: colors.LIGHT_YELLOW,
  },
  gamesContainer: {
    padding: 5,
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
});

export default PlayerDetail;
