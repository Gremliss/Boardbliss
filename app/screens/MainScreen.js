import React, { useContext, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ColorContext } from "../misc/ColorContext";
import OptionsModal from "../components/OptionsModal";
import { AntDesign } from "@expo/vector-icons";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const MainScreen = (props) => {
  const { currentColors } = useContext(ColorContext);
  const [modalVisible, setModalVisible] = useState(false);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: currentColors.BACKGROUND,
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    btnContainer: {
      backgroundColor: currentColors.PRIMARY,
      padding: 20,
      paddingBottom: 22,
      elevation: 5,
      width: windowWidth / 1.3,
      borderWidth: 1,
      borderRadius: 1,
      borderColor: currentColors.PRIMARY_OPACITY,
    },
    textBtn: {
      fontSize: 20,
      textAlign: "center",
      color: currentColors.LIGHT,
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
    options: {
      position: "absolute",
      right: 0,
      top: 0,
      zIndex: 1,
      backgroundColor: currentColors.PRIMARY,
      color: "white",
      padding: 10,
      borderBottomLeftRadius: 25,
    },
  });

  return (
    <View style={[styles.container]}>
      <AntDesign
        name={"setting"}
        size={36}
        style={[styles.options]}
        onPress={() => setModalVisible(true)}
      />
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
        style={[styles.btnContainer]}
        onPress={() => props.navigation.navigate("Stats")}
      >
        <Text style={[styles.textBtn]}>Stats</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btnContainer]}
        onPress={() => props.navigation.navigate("TransferData")}
      >
        <Text style={[styles.textBtn]}>Transfer data</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btnContainer, styles.addButtonBottomRadius]}
        onPress={() => props.navigation.navigate("Players")}
      >
        <Text style={[styles.textBtn]}>Players</Text>
      </TouchableOpacity>

      <OptionsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

export default MainScreen;
