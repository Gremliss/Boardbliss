import { useContext, useState } from "react";
import {
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Button,
} from "react-native";
import RoundIconBtn from "./RoundIconButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as NavigationBar from "expo-navigation-bar";
import { ColorContext } from "../misc/ColorContext";
import ColorPicker, {
  Panel1,
  Swatches,
  Preview,
  OpacitySlider,
  HueSlider,
} from "reanimated-color-picker";
// import { ColorPicker } from "react-native-color-picker";
// import Slider from "@react-native-community/slider";

// const windowWidth = Dimensions.get("window").width;
// const windowHeight = Dimensions.get("window").height;

const OptionsModal = ({ visible, onClose }) => {
  const { currentColors, setCurrentColors } = useContext(ColorContext);
  const [selectedColor, setSelectedColor] = useState("#007980");
  // const [isModalVisible, setIsModalVisible] = useState(false);
  // const [red, setRed] = useState(0);
  // const [green, setGreen] = useState(121);
  // const [blue, setBlue] = useState(128);
  const [showModal, setShowModal] = useState(false);
  const onSelectColor = ({ hex }) => {
    // do something with the selected color.
    setSelectedColor(hex);
  };

  const closeModal = () => {
    onClose();
  };

  const changePrimaryColor = async (newColor) => {
    NavigationBar.setBackgroundColorAsync(newColor);

    const updatedColors = {
      ...currentColors,
      PRIMARY: newColor,
      PRIMARY_OPACITY: `${newColor}70`,
      BACKGROUND: `${newColor}50`,
      LIST_COLOR_ONE: `${newColor}30`,
      LIST_COLOR_TWO: `${newColor}10`,
    };
    setCurrentColors(updatedColors);
    await AsyncStorage.setItem("userColors", JSON.stringify(updatedColors));
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentColors.BACKGROUND,
    },
    // input: (windowHeight) => {
    //   return {
    //     fontSize: 20,
    //     marginTop: windowHeight / 3,
    //     marginHorizontal: 20,
    //   };
    // },
    btnContainer: {
      flexDirection: "row",
      justifyContent: "center",
    },
    addBtn: {
      position: "absolute",
      right: 25,
      bottom: 20,
      zIndex: 1,
      color: currentColors.LIGHT,
    },
    button: {
      padding: 10,
      borderRadius: 5,
      alignItems: "center",
      justifyContent: "center",
    },
    coloredText: {
      marginTop: 50,
      fontSize: 20,
      padding: 10,
      color: currentColors.PRIMARY,
      fontWeight: "bold",
    },
  });

  return (
    <>
      <StatusBar />
      <Modal visible={visible} animationType="fade" onRequestClose={closeModal}>
        <View style={styles.container}>
          <Text style={styles.coloredText}>Choose theme:</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#007980" }]}
            onPress={() => changePrimaryColor("#007980")}
          >
            <Text style={{ color: currentColors.LIGHT }}>Theme 1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#95DE3A" }]}
            onPress={() => console.log(currentColors)}
          >
            <Text style={{ color: currentColors.LIGHT }}>Test</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#B271F0" }]}
            onPress={() => changePrimaryColor("#B271F0")}
          >
            <Text style={{ color: currentColors.LIGHT }}>Theme 3</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.container}>
          <Button title="Color Picker" onPress={() => setShowModal(true)} />
          <Modal visible={showModal} animationType="slide">
            <ColorPicker
              style={{
                width: "70%",
                alignSelf: "center",
              }}
              value={currentColors.PRIMARY}
              onComplete={onSelectColor}
            >
              <Preview />
              <Panel1 />
              <HueSlider />
              <OpacitySlider />
              <Swatches />
            </ColorPicker>
            <Button
              title="Ok"
              onPress={() => {
                changePrimaryColor(selectedColor);
                setShowModal(false);
              }}
            />
          </Modal>
        </View>

        <View style={styles.btnContainer}>
          <RoundIconBtn
            antIconName="check"
            onPress={closeModal}
            style={styles.addBtn}
            color={currentColors.PRIMARY}
          />
        </View>
      </Modal>
    </>
  );
};

export default OptionsModal;
