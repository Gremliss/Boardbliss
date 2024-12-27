import { useContext, useState } from "react";
import {
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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

const OptionsModal = ({ visible, onClose }) => {
  const { currentColors, setCurrentColors } = useContext(ColorContext);
  const [showModal, setShowModal] = useState(false);
  let selectedColor = currentColors.PRIMARY;

  const onSelectColor = ({ hex }) => {
    selectedColor = hex;
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
      color: currentColors.LIGHT,
      padding: 10,
      borderRadius: 15,
      elevation: 5,
      marginVertical: 15,
      marginHorizontal: 40,
    },
    textStyle: {
      fontSize: 20,
      textAlign: "center",
      color: currentColors.LIGHT,
    },
    coloredText: {
      marginTop: 50,
      fontSize: 20,
      padding: 10,
      color: currentColors.PRIMARY,
      fontWeight: "bold",
    },
    // swatchesStyle: {
    //   margin: 10,
    // },
    hueSliderStyle: {
      marginVertical: 15,
    },
  });

  return (
    <>
      <StatusBar />
      <Modal visible={visible} animationType="fade" onRequestClose={closeModal}>
        <View style={styles.container}>
          <Text style={styles.coloredText}>Theme:</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#007980" }]}
            onPress={() => changePrimaryColor("#007980")}
          >
            <Text style={styles.textStyle}>Reset to default</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: currentColors.PRIMARY }]}
            onPress={() => setShowModal(true)}
          >
            <Text style={styles.textStyle}>Change main color</Text>
          </TouchableOpacity>

          <Modal visible={showModal} animationType="slide">
            <View style={styles.container}>
              <ColorPicker
                style={{
                  marginTop: 40,
                  width: "80%",
                  alignSelf: "center",
                }}
                value={currentColors.PRIMARY}
                onComplete={onSelectColor}
              >
                <Preview />
                <Panel1 />
                <HueSlider style={styles.hueSliderStyle} />
                {/* <OpacitySlider /> */}
                {/* <Swatches
                  colors={SWATCHES_COLORS}
                  style={styles.swatchesStyle}
                /> */}
              </ColorPicker>

              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: currentColors.PRIMARY },
                ]}
                onPress={() => {
                  changePrimaryColor(selectedColor);
                  setShowModal(false);
                }}
              >
                <Text style={styles.textStyle}>Change color</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: currentColors.GRAY }]}
                onPress={() => {
                  setShowModal(false);
                }}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
            </View>
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
