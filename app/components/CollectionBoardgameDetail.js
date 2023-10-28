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
import NewGameplayModal from "./NewGameplayModal";
import colors from "../misc/colors";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const CollectionBoardgameDetail = (props) => {
  const [gameParams, setGameParams] = useState(props.route.params.item);
  const [collection, setCollection] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchCollection = async () => {
    const result = await AsyncStorage.getItem("collection");
    const parsedResult = JSON.parse(result);
    if (result?.length) setCollection(parsedResult);

    var newGameParams;
    parsedResult.map((item) => {
      if (item.id === gameParams.id) {
        newGameParams = item;
      }
    });
    if (newGameParams) setGameParams(newGameParams);
  };

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
    fetchCollection();
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackButton
    );
    return () => backHandler.remove();
  }, [props.navigation]);

  useEffect(() => {
    setCollection((prevCollection) =>
      prevCollection.map((obj) =>
        obj.id === gameParams.id ? { ...obj, stats: gameParams.stats } : obj
      )
    );
  }, [gameParams]);

  useEffect(() => {
    asyncSetCollection();
  }, [collection]);

  const asyncSetCollection = async () => {
    await AsyncStorage.setItem("collection", JSON.stringify(collection));
  };

  // useFocusEffect(
  //   React.useCallback(() => {
  //     fetchGameParams();
  //   }, [])
  // );

  const handleBackButton = () => {
    fetchGameParams();
    return;
  };

  const addNewGameplay = async (newGameplay) => {
    if (!gameParams.stats) {
      gameParams.stats = [];
    }
    // console.log(newGameplay);
    setGameParams((prevState) => ({
      ...prevState,
      stats: [...prevState.stats, newGameplay],
    }));
    console.log(gameParams);
  };

  // useEffect(() => {
  //   setCollection((prevCollection) =>
  //     prevCollection.map((obj) =>
  //       obj.id === gameParams.id ? { ...obj, stats: gameParams.stats } : obj
  //     )
  //   );
  // }, [gameParams]);

  // useEffect(() => {
  //   asyncSetCollection();
  // }, [collection]);

  // const asyncSetCollection = async () => {
  //   console.log(collection);
  //   await AsyncStorage.setItem("collection", JSON.stringify(collection));
  // };

  return (
    <>
      <StatusBar />

      <ScrollView style={styles.container}>
        <View>
          <TouchableOpacity
            style={[styles.addButton]}
            onPress={() => setModalVisible(true)}
          >
            <Text
              style={[
                { fontSize: 20, textAlign: "center", color: colors.LIGHT },
              ]}
            >
              Add gameplay
            </Text>
          </TouchableOpacity>
        </View>
        <View>
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
          <Text style={styles.gameName}>{gameParams.name}</Text>
          <View style={styles.horizontalView}>
            <Text style={styles.gameInfo}>Year published:</Text>
            <Text style={styles.gameInfoValue}>{gameParams.yearpublished}</Text>
          </View>
          <View style={styles.horizontalContainer}>
            <View style={styles.horizontalView}>
              <Text style={styles.gameInfo}>Min players:</Text>
              <Text style={styles.gameInfoValue}>{gameParams.minPlayers}</Text>
            </View>
            <View style={styles.horizontalView}>
              <Text style={styles.gameInfo}>Max players:</Text>
              <Text style={styles.gameInfoValue}>{gameParams.maxPlayers}</Text>
            </View>
          </View>
          <View style={styles.horizontalContainer}>
            <View style={styles.horizontalView}>
              <Text style={styles.gameInfo}>Min playtime:</Text>
              <Text style={styles.gameInfoValue}>{gameParams.minPlaytime}</Text>
            </View>
            <View style={styles.horizontalView}>
              <Text style={styles.gameInfo}>Max playtime:</Text>
              <Text style={styles.gameInfoValue}>{gameParams.maxPlaytime}</Text>
            </View>
          </View>
          <View style={styles.horizontalView}>
            <Text style={styles.gameInfo}>Rating BGG:</Text>
            <Text style={styles.gameInfoValue}>{gameParams.rating}</Text>
          </View>

          <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <View>
              <Text style={styles.closeButton}>Close</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <View style={[styles.bottomContainer]}>
        <TouchableOpacity style={[styles.buttonBottom, { opacity: 1 }]}>
          <Text style={[styles.textBtn]}>{gameParams.name}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttonBottom]}
          onPress={() =>
            props.navigation.navigate("BoardGameStats", {
              gameParams,
            })
          }
        >
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
          <Text style={[styles.textBtn]}>Games played</Text>
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
      </View>
      <NewGameplayModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={addNewGameplay}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.LIGHT,
    flex: 1,
    textAlign: "center",
    color: colors.LIGHT,
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
    color: colors.DARK,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  horizontalContainer: {
    flexDirection: "row",
  },
  horizontalView: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
    padding: 10,
    backgroundColor: colors.GRAY,
    borderRadius: 20,
    margin: 2,
  },
  gameInfo: {
    fontSize: 16,
    paddingVertical: 5,
    opacity: 1,
    color: colors.PRIMARY,
  },
  gameInfoValue: {
    fontSize: 16,
    paddingVertical: 5,
    color: colors.LIGHT,
  },
  closeButton: {
    backgroundColor: colors.PRIMARY,
    fontSize: 20,
    textAlign: "center",
    color: colors.LIGHT,
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
    borderColor: colors.LIGHT,
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

export default CollectionBoardgameDetail;
