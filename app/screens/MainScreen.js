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
        style={[styles.btnContainer, styles.addButtonTopRadius]}
        onPress={() => props.navigation.navigate("AddGameplay")}
      >
        <Text style={[styles.textBtn]}>Add Gameplay</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btnContainer]}
        onPress={() => props.navigation.navigate("Collection")}
      >
        <Text style={[styles.textBtn]}>Collection</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btnContainer]}
        onPress={() => props.navigation.navigate("SearchBgg")}
      >
        <Text style={[styles.textBtn]}>Search game online</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btnContainer]}
        onPress={() => props.navigation.navigate("GameCalendar")}
      >
        <Text style={[styles.textBtn]}>Game Calendar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btnContainer, styles.addButtonBottomRadius]}
        onPress={() => props.navigation.navigate("Players")}
      >
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
  btnContainer: {
    backgroundColor: colors.PRIMARY,
    padding: 25,
    paddingBottom: 27,
    elevation: 5,
    width: windowWidth / 1.3,
    borderWidth: 1,
    borderRadius: 1,
    borderColor: colors.PRIMARY_OPACITY,
  },
  textBtn: {
    fontSize: 20,
    textAlign: "center",
    color: colors.LIGHT,
  },
  addButtonTopRadius: {
    borderTopRightRadius: 50,
    borderTopLeftRadius: 50,
    marginTop: 10,
  },
  addButtonBottomRadius: {
    borderBottomRightRadius: 50,
    borderBottomLeftRadius: 50,
    marginBottom: 5,
  },
});

export default MainScreen;
