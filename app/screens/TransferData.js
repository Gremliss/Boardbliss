import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Button,
  ToastAndroid,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { StorageAccessFramework } from "expo-file-system";
import { Platform } from "react-native";
import colors from "../misc/colors";

const TransferData = () => {
  const [appData, setAppData] = useState({ collection: {}, players: {} });

  const fetchCollection = async () => {
    const result = await AsyncStorage.getItem("collection");
    if (result?.length)
      setAppData((prevState) => ({
        ...prevState,
        collection: JSON.parse(result),
      }));
  };
  const fetchPlayers = async () => {
    const result = await AsyncStorage.getItem("players");
    if (result?.length)
      setAppData((prevState) => ({
        ...prevState,
        players: JSON.parse(result),
      }));
  };
  useEffect(() => {
    fetchCollection();
    fetchPlayers();
  }, []);

  async function createTextFile(filename) {
    const textContent = JSON.stringify(appData);

    try {
      if (Platform.OS === "android") {
        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (permissions.granted) {
          const downloadsDirectory = permissions.directoryUri;
          const uri = await FileSystem.StorageAccessFramework.createFileAsync(
            downloadsDirectory,
            filename,
            "text/plain"
          );

          if (!uri) {
            ToastAndroid.show("Error creating file.", 2000);
          }

          await FileSystem.writeAsStringAsync(uri, textContent, {
            encoding: FileSystem.EncodingType.UTF8,
          });
        } else {
          ToastAndroid.show("No directory permissions.", 2000);
        }
      } else {
        ToastAndroid.show(
          "The file creation functionality is only available on Android.",
          2000
        );
      }
    } catch (error) {
      ToastAndroid.show("Error saving file.", 2000);
      console.error("Error saving file:", error);
    }
  }

  const loadData = (filename) => {
    Alert.alert(
      "Are you sure?",
      `This will delete all your current collection and player data and load new ones`,
      [
        { text: "Load new data", onPress: () => loadTextFile(filename) },
        { text: "Cancel", onPress: () => null },
      ],
      { cancelable: true }
    );
  };

  async function loadTextFile(filename) {
    try {
      if (Platform.OS === "android") {
        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (permissions.granted) {
          const files = await StorageAccessFramework.readDirectoryAsync(
            permissions.directoryUri
          );
          const fileUri = files.find((file) => file.includes(filename));

          if (!fileUri) {
            ToastAndroid.show("File not found.", 2000);
            return;
          }

          const content = await FileSystem.readAsStringAsync(fileUri);
          const contentParsed = JSON.parse(content);
          await AsyncStorage.setItem(
            "collection",
            JSON.stringify(contentParsed.collection)
          );
          await AsyncStorage.setItem(
            "players",
            JSON.stringify(contentParsed.players)
          );
        } else {
          ToastAndroid.show("No directory permissions.", 2000);
        }
      } else {
        ToastAndroid.show(
          "The file reading function is only available on Android.",
          2000
        );
      }
    } catch (error) {
      ToastAndroid.show("Error reading file.", 2000);
      console.error("Error reading file:", error);
    }
  }

  return (
    <>
      <StatusBar />
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.addButton, styles.addButtonTopRadius]}
          onPress={() => createTextFile("BoardblissData.txt")}
        >
          <Text style={[styles.textBtn]}>
            Save app data to BoardblissData.txt
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addButton, styles.addButtonBottomRadius]}
          onPress={() => loadData("BoardblissData.txt")}
        >
          <Text style={[styles.textBtn]}>
            Load app data from BoardblissData.txt
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.BACKGROUND,
    flex: 1,
    justifyContent: "center",
  },
  addButton: {
    backgroundColor: colors.PRIMARY,
    color: colors.LIGHT,
    padding: 10,
    paddingBottom: 12,
    elevation: 5,
    marginHorizontal: 40,
    borderWidth: 1,
    borderColor: colors.PRIMARY_OPACITY,
  },
  addButtonTopRadius: {
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    marginTop: 10,
  },
  addButtonBottomRadius: {
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    marginBottom: 5,
  },
  textBtn: {
    fontSize: 20,
    textAlign: "center",
    color: colors.LIGHT,
  },
});
export default TransferData;
