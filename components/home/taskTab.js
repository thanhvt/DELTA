import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, AsyncStorage } from 'react-native';

import DateTimePicker from 'react-native-modal-datetime-picker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import { urlApiGetInfoCompany } from '../global';

import Moment from 'react-moment';
const addSubtractDate = require("add-subtract-date");

import TotalTask from '../task/total';
import TaskHasImage from '../task/hasImage';
import TaskNoImage from '../task/noImage';

var { width, height } = Dimensions.get('window');

class TaskTab extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isDateTimePickerVisible: false,
            index: 0,
            routes: [
                // { key: 'totalTask', title: 'Tất cả' },
                { key: 'taskNoImage', title: 'Chưa ảnh' },
                { key: 'taskHasImage', title: 'Có ảnh' },
            ],
            companyId: null,
            companyObject: null,
            currentDate: new Date(),
        };
    }

    _isMounted = false;

    _showDateTimePicker = () => { 
        if(this._isMounted) {
            this.setState({ isDateTimePickerVisible: true });
        }
    }

    _hideDateTimePicker = () => { 
        if(this._isMounted) {
            this.setState({ isDateTimePickerVisible: false });
        }
    }

    _handleDatePicked = (date) => {

        if(this._isMounted) {
            this.setState({
                currentDate: date,
            });
        }
        // console.log('A date has been picked: ', date);
        this._hideDateTimePicker();
    };

    componentDidMount() {

        this._isMounted = true;

        this.loadInitialState()
            .done();
    };

    componentWillUnmount() {
        this._isMounted = false;
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

        if (companyId !== null && typeof companyId !== 'undefined') {

            fetch(urlApiGetInfoCompany(companyId))
                .then((res) => res.json())
                .then((resJson) => {
                    if (this._isMounted) {
                        this.setState({
                            companyObject: resJson,
                            companyId: companyId
                        });
                    }
                });
        }
    }

    prevDate() {
        var date = addSubtractDate.subtract(this.state.currentDate, 1, 'day');
        if (this._isMounted) {
            this.setState({
                currentDate: date
            });
        }
    }

    nextDate() {
        var date = addSubtractDate.add(this.state.currentDate, 1, 'day');
        if (this._isMounted) {
            this.setState({
                currentDate: date
            });
        }
    }

    render() {

        // const totalTask = () => (
        //     <TotalTask navigation={this.props.navigation} dateParam={this.state.currentDate} />
        // );
        const taskHasImage = () => (
            <TaskHasImage navigation={this.props.navigation} dateParam={this.state.currentDate} />
        );

        const taskNoImage = () => (
            <TaskNoImage navigation={this.props.navigation} dateParam={this.state.currentDate} />
        );

        if (this.state.companyObject !== null && typeof this.state.companyObject !== 'undefined') {
            return (
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.companyName}>{this.state.companyObject.TEN_DVIQLY}</Text>
                        <Text style={styles.companyAddress}>{this.state.companyObject.DIA_CHI}</Text>
                    </View>
                    <View style={styles.body}>
                        <View style={styles.dateNavigation}>
                            <TouchableOpacity onPress={this.prevDate.bind(this)}>
                                <FontAwesome
                                    style={styles.prevButton}
                                    name='chevron-circle-left'
                                    size={20}
                                    color='#4b97f4' />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={this._showDateTimePicker}>
                                <Moment element={Text} style={styles.taskDate} format="DD/MM/YYYY">{this.state.currentDate}</Moment>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={this.nextDate.bind(this)}>
                                <FontAwesome
                                    style={styles.nextButton}
                                    name='chevron-circle-right'
                                    size={20}
                                    color='#4b97f4' />
                            </TouchableOpacity>

                            <DateTimePicker
                                isVisible={this.state.isDateTimePickerVisible}
                                onConfirm={this._handleDatePicked}
                                onCancel={this._hideDateTimePicker}
                            />
                        </View>
                        <TabView
                            style={styles.tabViewTask}
                            navigationState={this.state}
                            renderScene={SceneMap({
                                // totalTask: totalTask,
                                taskNoImage: taskNoImage,
                                taskHasImage: taskHasImage,
                            })}
                            renderTabBar={props =>
                                <TabBar
                                    {...props}
                                    style={styles.tabBar}
                                    labelStyle={styles.labelTabBar}
                                    indicatorStyle={styles.indicatorTabBar}
                                    tabStyle={styles.tabItem}
                                />
                            }
                            onIndexChange={index => this.setState({ index })}
                            initialLayout={{ width: width, height: height }}
                        />

                    </View>
                </View>
            );
        } else {
            return (
                <View style={styles.container}>
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flex: 0.8,
        marginTop: 5,
        padding: 5,
        justifyContent: 'center',
        alignSelf: 'stretch',
        alignItems: 'center',

    },
    companyName: {
        fontSize: 20,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    companyAddress: {
        marginTop: 5,
        textAlign: 'center',
    },
    body: {
        paddingHorizontal: 10,
        paddingBottom: 15,
        height: height - 135,
        borderTopWidth: 1,
        borderTopColor: '#d4d4d4',
        alignSelf: 'stretch',
    },
    dateNavigation: {
        marginTop: 10,
        justifyContent: 'center',
        flexDirection: 'row',
    },
    prevButton: {
        marginRight: 5
    },
    nextButton: {
        marginLeft: 5
    },
    taskDescription: {
        marginVertical: 10,
        alignSelf: 'stretch',
        flexDirection: 'row',

    },
    tabBar: {
        marginTop: 10,
        backgroundColor: '#666666',
    },
    tabItem: {
        paddingVertical: 2,
    },
    labelTabBar: {
        fontSize: 12,
        color: '#ffffff',
        fontWeight: 'bold',
    },
    indicatorTabBar: {
        backgroundColor: '#ff5500',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: width
    }
});

export default TaskTab;