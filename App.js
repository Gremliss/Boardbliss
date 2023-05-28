import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import BoardGameDetail from "./app/components/BoardGameDetail";
import CollectionBoardgameDetail from "./app/components/CollectionBoardgameDetail";
import EditBoardGame from "./app/components/EditBoardGame";
import Collection from "./app/screens/Collection";
import MainScreen from "./app/screens/MainScreen";
import Players from "./app/screens/Players";
import GamesPlayed from "./app/components/GamesPlayed";

const Stack = createStackNavigator();

export default function App() {
  const [collection, setCollection] = useState([]);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchCollection = async () => {
      // await AsyncStorage.setItem("collection", JSON.stringify(collection));
      const asyncCollection = await AsyncStorage.getItem("collection");
      if (asyncCollection?.length) setCollection(JSON.parse(asyncCollection));
      const asyncPlayers = await AsyncStorage.getItem("players");
      if (asyncPlayers?.length) setPlayers(JSON.parse(asyncPlayers));
    };
    fetchCollection();
  }, []);

  const RenderMainScreen = (props) => (
    <MainScreen
      {...props}
      renderedCollection={collection}
      renderedPlayers={players}
    />
  );

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          component={Collection}
          name="Collection"
          options={{
            title: "Collection",
          }}
        />
        <Stack.Screen
          component={RenderMainScreen}
          name="MainScreen"
          options={{
            title: "Boardbliss",
          }}
        />
        <Stack.Screen
          component={Players}
          name="Players"
          options={{
            title: "Players",
          }}
        />
        <Stack.Screen
          component={BoardGameDetail}
          name="BoardGameDetail"
          options={{
            title: "Board game detail",
          }}
        />
        <Stack.Screen
          component={CollectionBoardgameDetail}
          name="CollectionBoardgameDetail"
          options={{
            title: "Board game statistics",
          }}
        />
        <Stack.Screen
          component={EditBoardGame}
          name="EditBoardGame"
          options={{
            title: "Edit board game",
          }}
        />
        <Stack.Screen
          component={GamesPlayed}
          name="GamesPlayed"
          options={{
            title: "Games played",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
