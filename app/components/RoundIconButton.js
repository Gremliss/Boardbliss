import { StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";

const RoundIconBtn = ({ antIconName, size, color, style, onPress }) => {
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

const styles = StyleSheet.create({
  icon: () => {
    return {
      backgroundColor: "#00ADB5",
      padding: 15,
      borderRadius: 50,
      elevation: 5,
    };
  },
});

export default RoundIconBtn;
