import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../misc/colors";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const MainScreen = (props) => {
  return (
    <View style={[styles.container]}>
      <TouchableOpacity
        onPress={() => props.navigation.navigate("AddGameplay")}
      >
        <Text style={[styles.textBtn]}>Add Gameplay</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => props.navigation.navigate("Collection")}>
        <Text style={[styles.textBtn]}>Collection</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => props.navigation.navigate("SearchBgg")}>
        <Text style={[styles.textBtn]}>Search BGG</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => props.navigation.navigate("GameCalendar")}
      >
        <Text style={[styles.textBtn]}>Game Calendar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => props.navigation.navigate("Players")}>
        <Text style={[styles.textBtn]}>Players</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.BACKGROUND,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  textBtn: {
    backgroundColor: colors.PRIMARY,
    fontSize: 20,
    textAlign: "center",
    color: colors.LIGHT,
    padding: 10,
    borderRadius: 50,
    elevation: 5,
    marginVertical: 10,
    marginHorizontal: 30,
    width: windowWidth / 1.5,
  },
});

export default MainScreen;
