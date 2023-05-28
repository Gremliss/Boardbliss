import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import { AppRegistry } from "react-native";
import Collection from "./app/screens/Collection";
import MainScreen from "./app/screens/MainScreen";

const Stack = createStackNavigator();

export default function App() {
  const [collection, setCollection] = useState({
    yourGames: {
      Bosh: {
        yearpublished: "2024",
        minPlayers: "1",
        maxPlayers: "4",
        minPlaytime: "4",
        maxPlaytime: "4",
        id: 1,
      },
      Catan: {
        yearpublished: "1995",
        minPlayers: "1",
        maxPlayers: "4",
        minPlaytime: "4",
        maxPlaytime: "4",
        id: 2,
      },
    },
  });

  useEffect(() => {
    const fetchCollection = async () => {
      const result = await AsyncStorage.getItem("collection");
      if (result?.length) setCollection(JSON.parse(result));
    };
    fetchCollection();
  }, []);

  const RenderMainScreen = (props) => (
    <MainScreen {...props} renderedCollection={collection} />
  );

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          component={RenderMainScreen}
          name="MainScreen"
          options={{
            title: "Boardbliss",
          }}
        />
        <Stack.Screen
          component={Collection}
          name="Collection"
          options={{
            title: "Collection",
          }}
        />
        <Stack.Screen
          component={BoardgameDetail}
          name="BoardgameDetail"
          options={{
            title: "Board game Detail",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
