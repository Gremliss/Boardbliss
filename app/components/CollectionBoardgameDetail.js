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

const CollectionBoardgameDetail = (props) => {
  const [gameParams, setGameParams] = useState(props.route.params.item);

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
    fetchGameParams();
    return;
  };

  return (
    <>
      <StatusBar />
      <ScrollView style={styles.container}>
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
    color: "#EEEEEE",
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

export default CollectionBoardgameDetail;
