import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';

import { Map } from './components/Map';
import Points from './assets/Points.json';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 80,
    backgroundColor: 'blue',
  },
  headerText: {
    alignSelf: 'center',
    textAlign: 'center',
    height: 50,
    marginTop: 35,
    color: 'white',
  },
});

class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <StatusBar translucent={false} barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.headerText}>
            Simple example for React Native Example and Clusters
          </Text>
        </View>
        <Map mapPoints={Points} />
      </View>
    );
  }
}

export default App;
