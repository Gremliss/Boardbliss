import { StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { ColorContext } from "../misc/ColorContext";
import { useContext } from "react";

const RoundIconBtn = ({ antIconName, size, color, style, onPress }) => {
  const { currentColors } = useContext(ColorContext);

  const styles = StyleSheet.create({
    icon: () => {
      return {
        backgroundColor: currentColors.PRIMARY,
        padding: 15,
        borderRadius: 50,
        elevation: 5,
      };
    },
  });

  return (
    <AntDesign
      name={antIconName}
      size={size || 24}
      color={color}
      style={[styles.icon(), { ...style }]}
      onPress={onPress}
    />
  );
};

export default RoundIconBtn;
