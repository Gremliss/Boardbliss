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

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const EditBoardGame = (props) => {
  const gameParams = props.route.params.gameParams;
  const [collection, setCollection] = useState([]);
  const [name, setName] = useState(gameParams.name);
  const [yearpublished, setYearpublished] = useState(gameParams.yearpublished);
  const [owner, setOwner] = useState(gameParams.owner);
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

  const saveChanges = async () => {
    console.log(yearpublished);
    console.log(minPlayers);
    const updatedCollection = collection.map((item) => {
      if (item.name === gameParams.name) {
        console.log(item);
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
          rating: rating,
        };
      } else {
        return item;
      }
    });

    setCollection(updatedCollection);
    console.log(updatedCollection);
    await AsyncStorage.setItem("collection", JSON.stringify(updatedCollection));
    fetchCollection();
    props.navigation.goBack();
  };

  return (
    <>
      <StatusBar />
      <ScrollView>
        <View style={[styles.flexRow]}>
          <Text style={[styles.nameOfInputStyle]}>Name:</Text>
          <TextInput
            onChangeText={(text) => setName(text)}
            defaultValue={gameParams.name}
            placeholder="Name"
            textAlignVertical="top"
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
            textAlignVertical="top"
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
            <Text>{owner}</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.flexRow]}>
          <Text style={[styles.nameOfInputStyle]}>Min players:</Text>
          <TextInput
            onChangeText={(text) => setMinPlayers(text)}
            defaultValue={gameParams.minPlayers}
            placeholder="Min players"
            textAlignVertical="top"
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
            textAlignVertical="top"
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
            textAlignVertical="top"
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
            textAlignVertical="top"
            style={[styles.inputTextStyle]}
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.flexRow]}>
          <Text style={[styles.nameOfInputStyle]}>Rating:</Text>
          <TextInput
            onChangeText={(text) => setRating(text)}
            defaultValue={gameParams.rating}
            placeholder="Rating"
            textAlignVertical="top"
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
            textAlignVertical="top"
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
        <View style={[styles.buttonBottom, { opacity: 1 }]}>
          <Text style={[styles.textBtn]}>Edit</Text>
        </View>
        <TouchableOpacity style={[styles.buttonBottom]}>
          <Text style={[styles.textBtn]}>Stats?</Text>
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
  flexRow: {
    flexDirection: "row",
  },
  nameOfInputStyle: {
    padding: 10,
    flex: 2,
    margin: 4,
  },
  inputTextStyle: {
    backgroundColor: "#393E46",
    // textAlign: "center",
    color: "#EEEEEE",
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
    borderColor: "#222831",
    borderWidth: 1,
    backgroundColor: "#00ADB5",
    fontSize: 20,
    height: windowHeight / 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    opacity: 0.6,
  },
  textBtn: {
    fontSize: 18,
    textAlign: "center",
    color: "#EEEEEE",
  },
  submitButton: {
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
});

export default EditBoardGame;