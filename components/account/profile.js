import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, AsyncStorage, Image, ActivityIndicator } from 'react-native';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { urlApiGetInfoCompany, urlApiGetInfoUser } from '../global';

class Profile extends Component {

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
        
    };

    loadInitialState = async () => {

        var companyId = await AsyncStorage.getItem('companyId');
        var userStr = await AsyncStorage.getItem('user');

        if(userStr === null || typeof userStr === 'undefined') {
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('companyId');
            await AsyncStorage.removeItem('departmentId');
            await AsyncStorage.removeItem('role');
            this.props.navigation.navigate('Login');
        }

        var user = JSON.parse(userStr);

        fetch(urlApiGetInfoCompany(companyId))
            .then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    this.setState({
                        company: null,
                        loading: false,
                    });
                }
            })
            .then((resJson) => {
                this.setState({
                    company: resJson,
                    loading: false,
                });
            })
            .catch((error) => { console.log(error); });

        fetch(urlApiGetInfoUser(user.Id))
            .then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    this.setState({
                        userView: null,
                        loading: false,
                    });
                }
            })
            .then((resJson) => {
                this.setState({
                    userView: resJson,
                    loading: false,
                });
            })
            .catch((error) => { console.log(error); });

        // fetch(urlApiGetInfoDepartment(departmentId))
        //     .then((res) => {
        //         if (res.ok) {
        //             return res.json();
        //         } else {
        //             this.setState({
        //                 department: null,
        //                 loading: false,
        //             });
        //         }
        //     })
        //     .then((resJson) => {
        //         this.setState({
        //             department: resJson,
        //             loading: false,
        //         });
        //     })
        //     .catch((error) => { console.log(error); });
    }

    render() {

        if (this.state.userView !== null && typeof this.state.userView !== 'undefined' &&
            this.state.company !== null && typeof this.state.company !== 'undefined'
        ) {
            return (
                <View style={styles.container}>
                    <View style={styles.body}>
                        <View style={styles.logoContainer}>
                            <Image style={styles.imageLogoAccount}
                                source={require('../../images/logo.png')}
                            />
                        </View>

                        <View style={styles.rowContainer}>
                            <FontAwesome name='user-circle-o' size={20} color='#333333' />
                            <Text style={styles.fullNameUser}>{this.state.userView.UserName}</Text>
                        </View>

                        <View style={styles.rowContainer}>
                            <FontAwesome name='user' size={20} color='#333333' />
                            <Text style={styles.fullNameUser}>{this.state.userView.FirstName} {this.state.userView.LastName}</Text>
                        </View>

                        <View style={styles.rowContainer}>
                            <FontAwesome name='envelope' size={20} color='#333333' />
                            <Text style={styles.emailUser}>{this.state.userView.Email}</Text>
                        </View>

                        <View style={styles.rowContainer}>
                            <FontAwesome name='location-arrow' size={20} color='#333333' />
                            <Text style={styles.emailUser}>{this.state.company.TEN_DVIQLY}</Text>
                        </View>

                        <TouchableOpacity style={styles.btnLogOut}
                            onPress={this.logOut.bind(this)}
                        >
                            <Text style={styles.textLogOut}>Đăng xuất</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        } else {
            return (
                <View style={styles.container}>
                    <ActivityIndicator style={styles.activityIndicator}
                        animating={this.state.loading} />
                </View>
            );
        }
    }

    logOut = async () => {
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('companyId');
        await AsyncStorage.removeItem('departmentId');
        this.props.navigation.navigate('Login');
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
    rowContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#d4d4d4',
        marginVertical: 2,
    },
    fullNameUser: {
        paddingLeft: 5,
    },
    emailUser: {
        paddingLeft: 5,
    },
    btnLogOut: {
        marginTop: 10,
        padding: 5,
        alignSelf: 'stretch',
        alignItems: 'center',
        backgroundColor: '#50D050',
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

export default Profile;