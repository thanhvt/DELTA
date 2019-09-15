import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, AsyncStorage, Image, ActivityIndicator, Linking } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { version } from '../../package.json';
import { urlApiGetTasksHasImages } from '../global.js';

class About extends Component {

    constructor(props) {
        super(props);
        this.state = {
            department: null,
            userView: null,
            company: null,
            loading: true,
        };
    }

    componentDidMount() {
        this.loadInitialState()
            .done();
    };

    componentWillUnmount() {
        this.setState({
            department: null,
            company: null,
            userView: null,
            loading: true,
        });
    };

    loadInitialState = async () => {
        var userStr = await AsyncStorage.getItem('user');

        if(userStr === null || typeof userStr === 'undefined') {
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('companyId');
            await AsyncStorage.removeItem('departmentId');
            await AsyncStorage.removeItem('role');
            this.props.navigation.navigate('Login');
        }
    }

    render() {

        const email = 'mailto:support@example.com';
        const facebook = 'https://www.facebook.com/vnittech/';
        const youtube = 'https://www.youtube.com/watch?v=LeZB-iEpVuo';

        return (
            <View style={styles.container}>
                <View style={styles.body}>
                    <View style={styles.logoContainer}>
                        <Image style={styles.imageLogoAccount}
                            source={require('../../images/logo.png')}
                        />
                    </View>

                    <View style={styles.rowContainer}>
                        <Text style={styles.fullNameUser}>YODY</Text>
                    </View>

                    <View style={styles.rowContainer}>
                        <Text style={styles.fullNameUser}>Phiên bản {version}</Text>
                    </View>

                    <View style={styles.connectUs}>
                        <Text>Kết nối với chúng tôi</Text>
                    </View>

                    <TouchableOpacity style={styles.rowContainerWithIcon}
                        // onPress={this._goToURL.bind(this, email)}
                    >
                        <MaterialIcons name='email' size={20} />
                        <Text style={styles.emailUser}>Gửi email</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.rowContainerWithIcon}
                        onPress={this._goToURL.bind(this, facebook)}
                    >
                        <FontAwesome name='facebook-official' size={20} color='#4267b2' />
                        <Text style={styles.emailUser}>Facebook</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.rowContainerWithIcon}
                        onPress={this._goToURL.bind(this, youtube)}
                    >
                        <FontAwesome name='youtube-play' size={20} color='#ff0000' />
                        <Text style={styles.emailUser}>Youtube</Text>
                    </TouchableOpacity>

                </View>
            </View>
        );
    }

    _goToURL(url) {
        Linking.openURL(url);
      }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#ffffff',
    },
    body: {
        padding: 10,
        flex: 1,
        alignSelf: 'stretch',
    },
    connectUs: {
        padding: 5,
        margin: 5,
    },
    rowContainer: {
        padding: 10,
        borderBottomColor: '#e2e2e2',
        borderBottomWidth: 1,
    },
    rowContainerWithIcon: {
        flexDirection: 'row',
        padding: 10,
        borderBottomColor: '#e2e2e2',
        borderBottomWidth: 1,
    },
    fullNameUser: {
        textAlign: 'center'
    },
    emailUser: {
        paddingLeft: 5,
    },
    textLogOut: {
        color: '#ffffff'
    },
    logoContainer: {
        alignSelf: 'stretch',
    },
    imageLogoAccount: {
        width: 250,
        height: 150,
        alignSelf: 'center',
    }
});

export default About;