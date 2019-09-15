import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, AsyncStorage, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { urlApiLogin, urlApiGetInfoUser } from '../global';

import OrientationLoadingOverlay from 'react-native-orientation-loading-overlay';
class Login extends Component {

  static navigationOptions = { header: null };

  constructor(props) {
    super(props);
    this.state = {
      username: null,
      password: null,
      isLoading: false,
    };
  };

  componentDidMount() {
    this.loadInitialState()
      .done();
  }

  loadInitialState = async () => {
    var user = await AsyncStorage.getItem('user');
    if (user !== null && typeof user !== 'undefined') {
      this.props.navigation.navigate('Home');
    }
  }
  
  render() {

    // if (!this.state.isLoading) {
      return (
        <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
          <Image style={styles.logo}
            source={require('../../images/logo.png')}
          />
          <View style={styles.loginForm}>
            <TextInput
              style={styles.textInput}
              autoCapitalize='none'
              value={this.state.username}
              onChangeText={(username) => this.setState({ username })}
              onSubmitEditing={() => this.refs.password.focus()}
              placeholder='Tên tài khoản'
              returnKeyType='go'
              ref='username'
            />

            <TextInput
              style={styles.textInput}
              autoCapitalize='none'
              secureTextEntry
              ref='password'
              value={this.state.password}
              onChangeText={(password) => this.setState({ password })}
              onSubmitEditing={this.login.bind(this)}
              placeholder='Mật khẩu'
            />

            <TouchableOpacity style={styles.btnLogin}
              ref='loginButton'
              onPress={this.login.bind(this)}
            >
              <Text style={styles.textLogin}>Đăng nhập</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnForgotPassword}
            >
              <Text style={styles.textForgotPassword}>Quên mật khẩu</Text>
            </TouchableOpacity>
          </View>
          <OrientationLoadingOverlay
            visible={this.state.isLoading}
            color="black"
            indicatorSize="large"
            messageFontSize={24}
            message="Đang tải dữ liệu ..."
          > 
          </OrientationLoadingOverlay>

        </KeyboardAvoidingView>
      );
    // } 
    // else {
    //   return (
    //     <View style={styles.container}>
    //       <ActivityIndicator style={styles.activityIndicator}
    //         animating={this.state.isLoading} />
    //     </View>
    //   );
    // }
  }

  login = async () => {
    try {
      if (typeof this.state.username === 'undefined' || this.state.username === '') {
        this.refs.username.focus();
      }
      else if (typeof this.state.password === 'undefined' || this.state.password === '') {
        this.refs.password.focus();
      } else {

        this.setState({
          isLoading: true,
        });

        var data = {
          'username': this.state.username,
          'password': this.state.password,
          'grant_type': 'password'
        };

        var formBody = [];

        for (var property in data) {
          var encodedKey = encodeURIComponent(property);
          var encodedValue = encodeURIComponent(data[property]);
          formBody.push(encodedKey + "=" + encodedValue);
        }

        formBody = formBody.join("&");

        const response = await fetch(urlApiLogin, {
          method: 'POST',
          headers: {
            Accept: 'application/x-www-form-urlencoded;charset=UTF-8',
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          },
          body: formBody,
        });
        const responseJson = await response.json();
        if (responseJson.access_token != null) {
          const res = await fetch(urlApiGetInfoUser(responseJson.Id));
          const resJson = await res.json();
          if (resJson != null) {
            this.setState({
              username: null,
              password: null,
              isLoading: false,
            });
            await AsyncStorage.setItem('user', JSON.stringify(responseJson));
            await AsyncStorage.setItem('companyId', resJson.MA_DVIQLY);
            await AsyncStorage.setItem('departmentId', resJson.MA_PBAN);
            await AsyncStorage.setItem('role', resJson.RoleName);

            this.props.navigation.navigate('Home');
          }
        } else {
          this.setState({
            isLoading: false,
          });
          // alert('Tên đăng nhập hoặc mật khẩu không chính xác');
          Toast.show({
            text: "Tên đăng nhập hoặc mật khẩu không chính xác !!!",
            duration: 2500,
            position: "bottom",
            type: "success",
            textStyle: { textAlign: "center" }
          });
        };
      }
    } catch (error) {
      this.setState({
        isLoading: false,
      });
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  logo: {
    width: 250,
    height: 150,
    justifyContent: 'center'
  },
  loginForm: {
    alignSelf: 'stretch',
    padding: 10
  },
  textInput: {
    padding: 5,
    marginBottom: 10,
    alignSelf: 'stretch',
    backgroundColor: '#E8E8E8'
  },
  btnLogin: {
    padding: 5,
    alignSelf: 'stretch',
    backgroundColor: '#50D050'
  },
  textLogin: {
    alignSelf: 'center',
    color: '#ffffff'
  },
  textForgotPassword: {
    alignSelf: 'center',
    color: '#ffffff'
  },
  btnForgotPassword: {
    padding: 5,
    marginTop: 20,
    alignSelf: 'stretch',
    backgroundColor: '#808080',
  },
  activityIndicator: {
    justifyContent: 'center',
  }
});

export default Login;