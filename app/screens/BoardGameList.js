import axios from "axios";
import xml2js from "react-native-xml2js";
import React, { useState, useEffect } from "react";
import { View, FlatList, Text, Image, StyleSheet } from "react-native";

const BoardGameList = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios
      .get("https://boardgamegeek.com/xmlapi2/thing?id=328871")
      .then((response) => {
        const xmlData = response.data;
        xml2js.parseString(xmlData, (error, result) => {
          if (error) {
            console.error(error);
          } else {
            setData(result);
          }
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  if (!data) {
    return <Text>Loading data...</Text>;
  }

  return (
    <View>
      {data.items.item.map((item, index) => (
        <View key={index}>
          <Text>{item.name[4].$.value}</Text>
          <Image
            style={styles.tinyLogo}
            source={{
              uri: "https://cf.geekdo-images.com/eT_Atcy_vRJvuUMgYakNrQ__original/img/upZwrb6k8zZMNTwB8VfpI372yuo=/0x0/filters:format(jpeg)/pic6260098.jpg",
            }}
          />
          {/* <Text>{item.yearpublished[0].toString()}</Text> */}
        </View>
      ))}
    </View>
  );
};

export default BoardGameList;

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
  },
  tinyLogo: {
    width: 300,
    height: 300,
  },
  logo: {
    width: 66,
    height: 58,
  },
});
