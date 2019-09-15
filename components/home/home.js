import React, { Component } from 'react';
import { StyleSheet, Text, View, PushNotificationIOS, AsyncStorage } from 'react-native';
import Tabbar from 'react-native-tabbar-bottom';

import TaskTab from './taskTab';
import FeedBack from '../feedback/feedback';
import Profile from '../account/profile';
import Notifications from '../notification/notify';
import NotificationsAdmin from '../notification/notifyadmin';
import About from '../about/about';
import TaskAdmin from '../taskadmin/taskadmin';

import { urlApiPostUserDevice } from '../global';
import DeviceInfo from 'react-native-device-info';
// import PushNotification from 'react-native-push-notification';
import OneSignal from 'react-native-onesignal'; // Import package from node modules

class Home extends Component {

    static navigationOptions = { header: null };

    constructor(props) {
        super(props);
        this.state = {
            user: null,
            page: "Home",
            token: null,
            role: null
        };
        AsyncStorage.getItem('user').then((value) => {
            this.setState({
                user: value,
            });
        }).done();
        const parent = this;

        OneSignal.init("1cbeef32-02cf-44b0-aead-fc2c76613157");
        
        OneSignal.addEventListener('received', this.onReceived);
        OneSignal.addEventListener('opened', this.onOpened);
        OneSignal.addEventListener('ids', this.onIds);
        gnal.configure(); 	// triggers the ids event

        // PushNotification.configure({
        //     // (optional) Called when Token is generated (iOS and Android)
        //     onRegister: function (token) {
        //         //console.log('TOKEN:', token);
        //         if (parent.state.user !== null && typeof parent.state.user !== 'undefined') {
        //             var user = JSON.parse(parent.state.user);
        //             fetch(urlApiPostUserDevice, {
        //                 method: 'POST',
        //                 headers: {
        //                     Accept: 'application/json',
        //                     'Content-Type': 'application/json',
        //                 },
        //                 body: JSON.stringify({
        //                     UserId: user.Id,
        //                     DEVICE_TOKEN: token.token,
        //                     OS: token.os,
        //                     Version: DeviceInfo.getSystemVersion(),
        //                     Serial: DeviceInfo.getSerialNumber(),
        //                     Uuid: DeviceInfo.getUniqueID(),
        //                     TenTB: DeviceInfo.getSystemName(),
        //                     NhaSX: DeviceInfo.getManufacturer(),
        //                 }),
        //             })
        //                 .catch((error) => {
        //                     console.log(error);
        //                 });
        //         }
        //     },

        //     // (required) Called when a remote or local notification is opened or received
        //     onNotification: function (notification) {
        //         //console.log( 'NOTIFICATION:', notification );
        //         parent.addNotificationItem(notification).done();
        //         notification.finish(PushNotificationIOS.FetchResult.NoData);
        //     },

        //     // ANDROID ONLY: GCM or FCM Sender ID (product_number) (optional - not required for local notifications, but is need to receive remote push notifications)
        //     senderID: "47876302140",

        //     // IOS ONLY (optional): default: all - Permissions to register.
        //     permissions: {
        //         alert: true,
        //         badge: true,
        //         sound: true
        //     },

        //     // Should the initial notification be popped automatically
        //     // default: true
        //     popInitialNotification: true,

        //     /**
        //       * (optional) default: true
        //       * - Specified if permissions (ios) and token (android and ios) will requested or not,
        //       * - if not, you must call PushNotificationsHandler.requestPermissions() later
        //       */
        //     requestPermissions: true,
        // });

    }
    
    componentWillUnmount() {
        OneSignal.removeEventListener('received', this.onReceived);
        OneSignal.removeEventListener('opened', this.onOpened);
        OneSignal.removeEventListener('ids', this.onIds);
    }

    onReceived(notification) {
        console.log("Notification received: ", notification);
    }

    onOpened(openResult) {
        console.log('Message: ', openResult.notification.payload.body);
        console.log('Data: ', openResult.notification.payload.additionalData);
        console.log('isActive: ', openResult.notification.isAppInFocus);
        console.log('openResult: ', openResult);
    }

    onIds(device) {
        console.log('Device info: ', device);
    } 

    componentDidMount() {
        this.loadInitialState()
            .done();
    };

    // componentWillUnmount() {
    //     this.setState({
    //     });
    // };

    loadInitialState = async () => {
        var userStr = await AsyncStorage.getItem('user');
        var rolestr = await AsyncStorage.getItem('role');

        if (userStr === null || typeof userStr === 'undefined') {
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('companyId');
            await AsyncStorage.removeItem('departmentId');
            await AsyncStorage.removeItem('role');
            this.props.navigation.navigate('Login');
        }

        this.setState({
            page: "Home",
            role:rolestr
        });
    }

    addNotificationItem = async (notify) => {
        let notification = await AsyncStorage.getItem('notification');

        if (notification !== null && typeof notification !== 'undefined') {
            let notificationJson = JSON.parse(notification);
            notificationJson.push(notify);
            this.setState({
                notification: notificationJson
            });
            await AsyncStorage.setItem('notification', JSON.stringify(notificationJson));
        } else {
            let notificationJson = [];
            notificationJson.push(notify);
            this.setState({
                notification: notificationJson
            });
            await AsyncStorage.setItem('notification', JSON.stringify(notificationJson));
        }
    }

    render() {
        
        if (this.state.role == 'user') {
            return (
                <View style={styles.container}>

                    {this.state.page === "Home" && <TaskTab navigation={this.props.navigation} />}
                    {this.state.page === "Notifications" && <Notifications navigation={this.props.navigation} />}
                    {this.state.page === "Profile" && <Profile navigation={this.props.navigation} />}
                    {this.state.page === "FeedBack" && <FeedBack navigation={this.props.navigation} />}
                    {this.state.page === "More" && <About navigation={this.props.navigation} />}

                    <Tabbar
                        tabbarBgColor='#ffffff'
                        tabbarBorderTopColor='#a09f9f'
                        selectedIconColor="#4c99f7"
                        selectedLabelColor="#4c99f7"
                        iconColor="#5a5b5b"
                        labelColor="#5a5b5b"
                        stateFunc={(tab) => {
                            this.setState({ page: tab.page })
                            //this.props.navigation.setParams({tabTitle: tab.title})
                        }}
                        activePage={this.state.page}
                        tabs={[
                            {
                                page: "Home",
                                icon: "home",
                                iconText: "Trang chủ"
                            },
                            {
                                page: "FeedBack",
                                icon: "ios-send",
                                iconText: "Phản hồi"
                            },
                            {
                                page: "Profile",
                                icon: "person",
                                iconText: "Tài khoản"
                            },
                            {
                                page: "Notifications",
                                icon: "notifications",
                                iconText: "Thông báo"
                            },

                            {
                                page: "More",
                                icon: "ios-more",
                                iconText: "Thêm"
                            },
                        ]}
                    />
                </View>
            );
        }
        else {
            return (
                <View style={styles.container}>

                    {this.state.page === "Home" && <TaskAdmin navigation={this.props.navigation} />}
                    {this.state.page === "Notifications" && <NotificationsAdmin navigation={this.props.navigation} />}
                    {this.state.page === "Profile" && <Profile navigation={this.props.navigation} />}
                    {this.state.page === "More" && <About navigation={this.props.navigation} />}

                    <Tabbar
                        tabbarBgColor='#ffffff'
                        tabbarBorderTopColor='#a09f9f'
                        selectedIconColor="#4c99f7"
                        selectedLabelColor="#4c99f7"
                        iconColor="#5a5b5b"
                        labelColor="#5a5b5b"
                        stateFunc={(tab) => {
                            this.setState({ page: tab.page })
                            //this.props.navigation.setParams({tabTitle: tab.title})
                        }}
                        activePage={this.state.page}
                        tabs={[
                            {
                                page: "Home",
                                icon: "home",
                                iconText: "Trang chủ"
                            },
                            {
                                page: "Profile",
                                icon: "person",
                                iconText: "Tài khoản"
                            },
                            {
                                page: "Notifications",
                                icon: "notifications",
                                iconText: "Thông báo"
                            },

                            {
                                page: "More",
                                icon: "ios-more",
                                iconText: "Thêm"
                            },
                        ]}
                    />
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    }
});

export default Home;