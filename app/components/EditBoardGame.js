import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../misc/colors";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const EditBoardGame = (props) => {
  const gameParams = props.route.params.gameParams;
  const [collection, setCollection] = useState([]);
  const [name, setName] = useState(gameParams.name);
  const [yearpublished, setYearpublished] = useState(gameParams.yearpublished);
  const [owner, setOwner] = useState(gameParams.owner);
  const [expansion, setExpansion] = useState(gameParams.expansion);
  const [rating, setRating] = useState(gameParams.rating);
  const [minPlayers, setMinPlayers] = useState(gameParams.minPlayers);
  const [maxPlayers, setMaxPlayers] = useState(gameParams.maxPlayers);
  const [minPlaytime, setMinPlaytime] = useState(gameParams.minPlaytime);
  const [maxPlaytime, setMaxPlaytime] = useState(gameParams.maxPlaytime);
  const [bggImage, setBggImage] = useState(`${gameParams.bggImage}`);

  const fetchCollection = async () => {
    const result = await AsyncStorage.getItem("collection");
    if (result?.length) setCollection(JSON.parse(result));
  };
  useEffect(() => {
    fetchCollection();
  }, []);

  const changeOwner = () => {
    owner === "You" ? setOwner("Friend") : setOwner("You");
  };

  const changeExpansion = () => {
    if (expansion === null) {
      setExpansion(false);
    }
    expansion === false ? setExpansion(true) : setExpansion(false);
  };

  const saveChanges = async () => {
    const updatedCollection = collection.map((item) => {
      if (item.name === gameParams.name) {
        return {
          ...item,
          name: name,
          yearpublished: yearpublished,
          minPlayers: minPlayers,
          maxPlayers: maxPlayers,
          minPlaytime: minPlaytime,
          maxPlaytime: maxPlaytime,
          bggImage: bggImage,
          owner: owner,
          expansion: expansion,
          rating: rating,
        };
      } else {
        return item;
      }
    });

    setCollection(updatedCollection);
    await AsyncStorage.setItem("collection", JSON.stringify(updatedCollection));
    // fetchCollection();
    props.navigation.goBack();
  };

  return (
    <>
      <StatusBar />
      <View style={[styles.container]}>
        <ScrollView>
          <View style={[styles.flexRow]}>
            <Text style={[styles.nameOfInputStyle]}>Name:</Text>
            <TextInput
              onChangeText={(text) => setName(text)}
              defaultValue={gameParams.name}
              placeholder="Name"
              style={[styles.inputTextStyle]}
              multiline={true}
            />
          </View>
          <View style={[styles.flexRow]}>
            <Text style={[styles.nameOfInputStyle]}>Year published:</Text>
            <TextInput
              onChangeText={(text) => setYearpublished(text)}
              defaultValue={gameParams.yearpublished}
              placeholder="Year published"
              style={[styles.inputTextStyle]}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.flexRow]}>
            <Text style={[styles.nameOfInputStyle]}>Owner:</Text>
            <TouchableOpacity
              style={[styles.inputTextStyle]}
              onPress={() => changeOwner()}
            >
              <Text style={[{ color: colors.LIGHT }]}>{owner}</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.flexRow]}>
            <Text style={[styles.nameOfInputStyle]}>Expansion:</Text>
            <TouchableOpacity
              style={[styles.inputTextStyle]}
              onPress={() => changeExpansion()}
            >
              <Text style={[{ color: colors.LIGHT }]}>
                {expansion ? "Yes" : "No"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.flexRow]}>
            <Text style={[styles.nameOfInputStyle]}>Min players:</Text>
            <TextInput
              onChangeText={(text) => setMinPlayers(text)}
              defaultValue={gameParams.minPlayers}
              placeholder="Min players"
              style={[styles.inputTextStyle]}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.flexRow]}>
            <Text style={[styles.nameOfInputStyle]}>Max players:</Text>
            <TextInput
              onChangeText={(text) => setMaxPlayers(text)}
              defaultValue={gameParams.maxPlayers}
              placeholder="Max players"
              style={[styles.inputTextStyle]}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.flexRow]}>
            <Text style={[styles.nameOfInputStyle]}>Min playtime:</Text>
            <TextInput
              onChangeText={(text) => setMinPlaytime(text)}
              defaultValue={gameParams.minPlaytime}
              placeholder="Min playtime"
              style={[styles.inputTextStyle]}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.flexRow]}>
            <Text style={[styles.nameOfInputStyle]}>Max playtime:</Text>
            <TextInput
              onChangeText={(text) => setMaxPlaytime(text)}
              defaultValue={gameParams.maxPlaytime}
              placeholder="Max playtime"
              style={[styles.inputTextStyle]}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.flexRow]}>
            <Text style={[styles.nameOfInputStyle]}>Rating:</Text>
            <TextInput
              onChangeText={(text) => {
                const changeCommaText = text.replace(",", ".");
                setRating(changeCommaText);
              }}
              defaultValue={gameParams.rating}
              placeholder="Rating"
              style={[styles.inputTextStyle]}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.flexRow]}>
            <Text style={[styles.nameOfInputStyle]}>Img link:</Text>
            <TextInput
              onChangeText={(text) => setBggImage(text)}
              defaultValue={`${gameParams.bggImage}`}
              placeholder="Img link"
              style={[styles.inputTextStyle]}
              multiline={true}
            />
          </View>
        </ScrollView>
        <TouchableOpacity onPress={() => saveChanges()}>
          <View>
            <Text style={styles.submitButton}>Submit</Text>
          </View>
        </TouchableOpacity>

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
          <View style={[styles.buttonBottom, { opacity: 1 }]}>
            <Text style={[styles.textBtn]}>Edit</Text>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.BACKGROUND,
    flex: 1,
  },
  flexRow: {
    flexDirection: "row",
  },
  nameOfInputStyle: {
    padding: 10,
    flex: 2,
    margin: 4,
  },
  inputTextStyle: {
    backgroundColor: colors.GRAY,
    color: colors.LIGHT,
    padding: 10,
    flex: 5,
    margin: 4,
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
  submitButton: {
    backgroundColor: colors.PRIMARY,
    fontSize: 20,
    textAlign: "center",
    color: colors.LIGHT,
    padding: 10,
    borderRadius: 50,
    elevation: 5,
    marginVertical: 20,
    marginHorizontal: 80,
  },
});

export default EditBoardGame;
