import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, AsyncStorage, ActivityIndicator } from 'react-native';
import { urlApiGetTasksHasImages } from '../global';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Moment from 'react-moment';

var dateFormat = require('dateformat');


class TaskHasImage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            companyId: null,
            dataSource: null,
            loading: true,
        };
    }

    _isMounted = false;

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
        var date = dateFormat(new Date(this.props.dateParam), 'dd-mm-yyyy');
        var userStr = await AsyncStorage.getItem('user');

        if(userStr === null || typeof userStr === 'undefined') {
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('companyId');
            await AsyncStorage.removeItem('departmentId');
            await AsyncStorage.removeItem('role');
            this.props.navigation.navigate('Login');
        }

        if(this._isMounted) {
            this.setState({
                companyId: companyId
            });
        }
        
        fetch(urlApiGetTasksHasImages(companyId, date))
            .then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    if(this._isMounted) {
                        this.setState({
                            dataSource: null,
                            loading: false,
                        });
                    }
                }
            })
            .then((resJson) => {
                //console.log(resJson);
                if(this._isMounted) {
                    this.setState({
                        dataSource: resJson,
                        loading: false,
                    });
                }
                
            })
            .catch((error) => { 
                if(this._isMounted) {
                    this.setState({
                        dataSource: null,
                        loading: false,
                    });
                }
            });
    }

    _renderTaskAction(item, date, today) {
        if (date <= today) {

            if (date < today) {
                return(
                    <View style={styles.taskButton}>
                        <TouchableOpacity style={styles.viewDetailButton}
                            onPress={this.taskDetail.bind(this, item.Id, item.TenTieuChuan, date)}
                        >
                            <Text style={styles.textViewDetailButton}>
                                <FontAwesome name='eye' size={15} color='#ffffff' />
                            </Text>
                        </TouchableOpacity>
                    </View>
                );
            } else {
                return(
                    <View style={styles.taskButton}>
                        <TouchableOpacity style={styles.uploadButton}
                            onPress={this.taskUpload.bind(this, item.Id, item.TenTieuChuan, date)}
                        >
                            <Text style={styles.textUploadButton}>
                                <FontAwesome name='cloud-upload' size={15} color='#ffffff' />
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.viewDetailButton}
                            onPress={this.taskDetail.bind(this, item.Id, item.TenTieuChuan, date)}
                        >
                            <Text style={styles.textViewDetailButton}>
                                <FontAwesome name='eye' size={15} color='#ffffff' />
                            </Text>
                        </TouchableOpacity>
                    </View>
                );
            }
        } else {
            return(
                <View style={styles.taskButton}>
                    
                </View>
            );
        }
    }

    render() {
        var currentDate = new Date(this.props.dateParam);
        var currentToday = new Date();
        var date = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        var today = new Date(currentToday.getFullYear(), currentToday.getMonth(), currentToday.getDate());

        if (this.state.dataSource !== null && typeof this.state.dataSource !== 'undefined') {
            return (
                <View style={styles.container}>
                    <ScrollView style={styles.taskList}>
                        {
                            this.state.dataSource.map((item, index) => (
                                <View style={styles.taskItem} key={item.Id}>
                                    <Text style={styles.taskIcon}>{index + 1}</Text>
                                    <View style={styles.taskDetail}>
                                        <TouchableOpacity>
                                            <Text style={styles.taskTitle}>{item.TenTieuChuan}</Text>
                                        </TouchableOpacity>
                                        <View style={styles.taskDateContainer}>
                                            <FontAwesome style={styles.taskDateIcon} name='clock-o' size={13} color='#c4c4c4' />
                                            <Moment element={Text} style={styles.taskDate} format="hh:mm A">{item.GioBDThucHien}</Moment>
                                        </View>
                                    </View>
                                    {this._renderTaskAction(item, date, today)}
                                </View>
                            ))
                        }
                    </ScrollView>
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

    taskUpload(taskId, taskName, taskDate) {
        this.props.navigation.navigate('Upload', {
            taskId: taskId,
            taskName: taskName,
            taskDate: taskDate
          });
    }

    taskDetail(taskId, taskName, taskDate) {
        this.props.navigation.navigate('Detail', {
            taskId: taskId,
            taskName: taskName,
            taskDate: taskDate
          });
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 20,
        paddingBottom: 5,
        backgroundColor: '#ffffff',
    },
    taskList: {
        padding: 5,
        alignSelf: 'stretch',
        borderTopWidth: 1,
        borderTopColor: '#d4d4d4',
    },
    taskItem: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#c4c4c4',
        paddingVertical: 5,
    },
    taskIcon: {
        flex: 0.15,
        textAlignVertical: 'top',
        textAlign: 'center',
        fontSize: 25,
    },
    taskDetail: {
        flex: 0.85,
    },
    taskTitle: {
        fontSize: 14,
        textAlign: 'justify',
        paddingRight: 5
    },
    taskDateContainer: {
        flexDirection: 'row',
    },
    taskDateIcon: {
        paddingTop: 2,
    },
    taskDate: {
        color: '#c4c4c4',
        fontSize: 12,
        paddingLeft: 3,
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
    },
    taskButton: {
        marginTop: 2,
        textAlignVertical: 'top'
    },
    uploadButton: {
        padding: 10,
        marginHorizontal: 2,
        backgroundColor: '#50D050',
    },
    viewDetailButton: {
        padding: 10,
        marginTop: 5,
        marginHorizontal: 2,
        backgroundColor: '#ff5500',
    }
});

export default TaskHasImage;






