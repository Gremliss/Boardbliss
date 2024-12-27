import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useEffect, useState, createContext, useContext } from "react";
import BoardGameDetail from "./app/components/BoardGameDetail";
import CollectionBoardgameDetail from "./app/components/CollectionBoardgameDetail";
import EditBoardGame from "./app/components/EditBoardGame";
import Collection from "./app/screens/Collection";
import MainScreen from "./app/screens/MainScreen";
import SearchBgg from "./app/screens/SearchBgg";
import Players from "./app/screens/Players";
import GamesPlayed from "./app/components/GamesPlayed";
import BoardGameStats from "./app/components/BoardGameStats";
import PlayerDetail from "./app/components/PlayerDetail";
import GameCalendar from "./app/screens/GameCalendar";
import Stats from "./app/screens/Stats";
import YearlyStats from "./app/components/YearlyStats";
import AddGameplay from "./app/screens/AddGameplay";
import * as NavigationBar from "expo-navigation-bar";
import TransferData from "./app/screens/TransferData";
import { ColorContext, ColorProvider } from "./app/misc/ColorContext";

const Stack = createStackNavigator();

const MainApp = () => {
  const [collection, setCollection] = useState([]);
  // const [backupCollection, setBackupCollection] = useState([]);
  const [players, setPlayers] = useState([]);
  const { currentColors, setCurrentColors } = useContext(ColorContext);

  useEffect(() => {
    const fetchCollection = async () => {
      // await AsyncStorage.setItem("collection", JSON.stringify(collection));
      const asyncCollection = await AsyncStorage.getItem("collection");
      if (asyncCollection?.length) setCollection(JSON.parse(asyncCollection));
      // const asyncBackupCollection = await AsyncStorage.getItem(
      //   "backupCollection"
      // );
      // if (asyncBackupCollection?.length)
      //   setBackupCollection(JSON.parse(asyncBackupCollection));
      // console.log("Backup:");
      // console.log(asyncBackupCollection);
      const asyncPlayers = await AsyncStorage.getItem("players");
      if (asyncPlayers?.length) setPlayers(JSON.parse(asyncPlayers));

      const asyncUserColors = await AsyncStorage.getItem("userColors");
      if (asyncUserColors?.length) {
        const userColors = JSON.parse(asyncUserColors);
        if (userColors.PRIMARY) {
          setCurrentColors((prevColors) => ({
            ...prevColors,
            PRIMARY: userColors.PRIMARY,
            PRIMARY_OPACITY: `${userColors.PRIMARY}70`,
            BACKGROUND: `${userColors.PRIMARY}50`,
            LIST_COLOR_ONE: `${userColors.PRIMARY}30`,
            LIST_COLOR_TWO: `${userColors.PRIMARY}10`,
          }));
          NavigationBar.setBackgroundColorAsync(userColors.PRIMARY);
        } else {
          NavigationBar.setBackgroundColorAsync(currentColors.PRIMARY);
        }
      }
    };
    fetchCollection();
  }, []);

  const RenderSearchBgg = (props) => (
    <SearchBgg
      {...props}
      renderedCollection={collection}
      renderedPlayers={players}
    />
  );

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: currentColors.PRIMARY,
            },
            headerTintColor: currentColors.LIGHT,
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        >
          <Stack.Screen
            component={MainScreen}
            name="Boardbliss"
            options={{
              title: "Boardbliss",
            }}
          />
          <Stack.Screen
            component={AddGameplay}
            name="AddGameplay"
            options={{
              title: "Add Gameplay",
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
            component={RenderSearchBgg}
            name="SearchBgg"
            options={{
              title: "Search game online (BGG)",
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
            component={GameCalendar}
            name="GameCalendar"
            options={{
              title: "Game Calendar",
            }}
          />
          <Stack.Screen
            component={Stats}
            name="Stats"
            options={{
              title: "Monthly Stats",
            }}
          />
          <Stack.Screen
            component={YearlyStats}
            name="YearlyStats"
            options={{
              title: "Yearly Stats",
            }}
          />
          <Stack.Screen
            component={PlayerDetail}
            name="PlayerDetail"
            options={{
              title: "Player detail",
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
              title: "Board game detail",
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
            component={BoardGameStats}
            name="BoardGameStats"
            options={{
              title: "Board game stats",
            }}
          />
          <Stack.Screen
            component={GamesPlayed}
            name="GamesPlayed"
            options={{
              title: "Games played",
            }}
          />
          <Stack.Screen
            component={TransferData}
            name="TransferData"
            options={{
              title: "Transfer data",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};
export default MainApp;
