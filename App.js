import { StatusBar } from "react-native";
import { ColorProvider } from "./app/misc/ColorContext";
import MainApp from "./MainApp";

export default function App() {
  return (
    <ColorProvider>
      <MainApp />
    </ColorProvider>
  );
}
