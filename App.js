import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import {StackNavigator} from 'react-navigation';

import Login from './components/login/login';
import Home from './components/home/home';
import Upload from './components/task/upload';
import Detail from './components/task/detail';
import DetailAdmin from './components/taskadmin/detailadmin';

const Application = StackNavigator({
  // Loading: { screen: Loading },
  Login: { screen: Login },
  Home: { screen: Home },
  Upload: { screen: Upload },
  Detail: { screen: Detail },
  DetailAdmin: { screen: DetailAdmin }
}, {
    navigationOptions: {
      header: false
    }
  });

export default class App extends Component {
  render() {
    return (
      <Application />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  }
});
