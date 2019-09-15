import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, AsyncStorage, ActivityIndicator, Image, Modal } from 'react-native';

import DateTimePicker from 'react-native-modal-datetime-picker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { urlApiGetCompanyManager, urlServerImage, urlApiPostDuyetTask, urlApiPostKhongDuyetTask } from '../global';
import RNPickerSelect from 'react-native-picker-select';
import Moment from 'react-moment';
const addSubtractDate = require("add-subtract-date");
import { urlApiGetTasksAdmin } from '../global';
import ImageViewer from 'react-native-image-zoom-viewer';
import Dialog from "react-native-dialog";

var dateFormat = require('dateformat');
var { width, height } = Dimensions.get('window');

class taskadmin extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isDateTimePickerVisible: false,
            companyId: null,
            companyObject: [],
            currentDate: new Date(),
            dataSource: null,
            loading: true,
            isModalOpened: false,
            role: null,
            dialogDuyetVisible: false,
            dialogKhongDuyetVisible: false,
            taskname: null,
            lydo: null,
            taskId: null,
            taskDate: null,
            loadingSend: false,
        };
    }

    handleCancelDuyet = () => {
        this.setState({ dialogDuyetVisible: false });
    };

    handleDeleteDuyet = async () => {

        const user = JSON.parse(await AsyncStorage.getItem('user'));
        var taskDate = dateFormat(new Date(this.state.currentDate), 'dd-mm-yyyy');
        var role = await AsyncStorage.getItem('role');

        this.setState({
            loadingSend: true,
        });

        fetch(urlApiPostDuyetTask(this.state.taskId, user.Id, this.state.companyId, role, taskDate))
            .then((res) => {
                console.log(res);
                if (res.ok) {
                    this.setState({
                        loadingSend: false,
                    });
                    this.loadInitialState().done();

                } else {
                    this.setState({
                        loadingSend: false,
                    });
                    alert("Duyệt công việc không thành công !");
                }
            })
            .catch((error) => { console.log(error); });

        this.setState({ dialogDuyetVisible: false });
    };

    handleCancelKhongDuyet = () => {
        this.setState({ dialogKhongDuyetVisible: false });
    };

    handleDeleteKhongDuyet = async () => {

        const user = JSON.parse(await AsyncStorage.getItem('user'));
        var taskDate = dateFormat(new Date(this.state.currentDate), 'dd-mm-yyyy');
        var role = await AsyncStorage.getItem('role');

        this.setState({
            loadingSend: true,
        });

        fetch(urlApiPostKhongDuyetTask(this.state.taskId, user.Id, this.state.companyId, role, taskDate, this.state.lydo))
            .then((res) => {
                console.log(res);
                if (res.ok) {
                    this.setState({
                        loadingSend: false,
                    });
                    this.loadInitialState().done();

                } else {
                    this.setState({
                        loadingSend: false,
                    });
                    alert("Không duyệt công việc không thành công !");
                }
            })
            .catch((error) => { console.log(error); });

        this.setState({ dialogKhongDuyetVisible: false });
    };

    _isMounted = false;

    _showDateTimePicker = () => {
        if (this._isMounted) {
            this.setState({ isDateTimePickerVisible: true });
        }
    }

    _hideDateTimePicker = () => {
        if (this._isMounted) {
            this.setState({ isDateTimePickerVisible: false });
        }
    }

    _handleDatePicked = (date) => {

        if (this._isMounted) {
            this.setState({
                currentDate: date,
            });
        }
        // console.log('A date has been picked: ', date);
        this._hideDateTimePicker();
        this.loadInitialState()
            .done();
    };

    componentDidMount() {

        this._isMounted = true;

        this.loadInitialState()
            .done();
        this.loadCompanyManager()
            .done();
    };

    componentWillUnmount() {
        this._isMounted = false;
    };

    loadCompanyManager = async () => {

        var userStr = await AsyncStorage.getItem('user');
        var user = JSON.parse(userStr);
        if (userStr === null || typeof userStr === 'undefined') {
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('companyId');
            await AsyncStorage.removeItem('departmentId');
            await AsyncStorage.removeItem('role');
            this.props.navigation.navigate('Login');
        }

        fetch(urlApiGetCompanyManager(user.Id))
            .then((res) => res.json())
            .then((resJson) => {
                if (this._isMounted) {
                    this.setState({
                        companyObject: resJson
                    });
                }
            });

    }

    loadInitialState = async () => {

        var date = dateFormat(new Date(this.state.currentDate), 'dd-mm-yyyy');
        var userStr = await AsyncStorage.getItem('user');
        var role = await AsyncStorage.getItem('role');
        this.setState({
            role: role
        });

        if (userStr === null || typeof userStr === 'undefined') {
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('companyId');
            await AsyncStorage.removeItem('departmentId');
            await AsyncStorage.removeItem('role');
            this.props.navigation.navigate('Login');
        }

        fetch(urlApiGetTasksAdmin(this.state.companyId, date))
            .then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    if (this._isMounted) {
                        this.setState({
                            dataSource: null,
                            loading: false,
                        });
                    }
                }
            })
            .then((resJson) => {
                //console.log(resJson);
                if (this._isMounted) {
                    this.setState({
                        dataSource: resJson,
                        loading: false,
                    });
                }

            })
            .catch((error) => {
                if (this._isMounted) {
                    this.setState({
                        dataSource: null,
                        loading: false,
                    });
                }
            });
    }

    prevDate() {
        var date = addSubtractDate.subtract(this.state.currentDate, 1, 'day');
        if (this._isMounted) {
            this.setState({
                currentDate: date
            });
            this.loadInitialState()
                .done();
        }
    }

    nextDate() {
        var date = addSubtractDate.add(this.state.currentDate, 1, 'day');
        if (this._isMounted) {
            this.setState({
                currentDate: date
            });
            this.loadInitialState()
                .done();
        }
    }

    openModal(index) {
        this.setState({ isModalOpened: true, currentImageIndex: index })
    }

    closeModal() {
        this.setState({
            isModalOpened: false,
        });
    }

    taskDetail(taskId, taskName, taskDate) {
        this.props.navigation.navigate('DetailAdmin', {
            taskId: taskId,
            taskName: taskName,
            taskDate: taskDate,
            companyId: this.state.companyId
        });
    }

    taskDuyet(taskId, taskName, taskDate) {
        this.setState({
            taskId: taskId,
            taskname: taskName,
            taskDate: taskDate
        });
        this.setState({ dialogDuyetVisible: true });
    }
    taskKhongDuyet(taskId, taskName, taskDate) {
        this.setState({
            taskId: taskId,
            taskname: taskName,
            taskDate: taskDate
        });
        this.setState({ dialogKhongDuyetVisible: true });
    }

    handleLyDo = (lydo) => {
        this.setState({
            lydo: lydo
        });
    }

    _renderTaskAction(item) {
        var currentDate = new Date(this.state.currentDate);
        var date = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        if (this.state.role == "manager" && (item.CuaHangTruongCheck == null || typeof item.CuaHangTruongCheck == 'undefined')) {
            return (
                <View style={styles.taskButton}>

                    <TouchableOpacity style={styles.viewDetailButton}
                        onPress={this.taskDetail.bind(this, item.Id, item.TenTieuChuan, date)}
                    >
                        <Text>
                            <FontAwesome name='eye' size={13} color='#ffffff' />
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.DuyetButton}
                        onPress={this.taskDuyet.bind(this, item.Id, item.TenTieuChuan, date)}
                    >
                        <Text>
                            <FontAwesome name='check-square-o' size={13} color='#ffffff' />
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.KhongDuyetButton}
                        onPress={this.taskKhongDuyet.bind(this, item.Id, item.TenTieuChuan, date)}
                    >
                        <Text>
                            <FontAwesome name='share-square-o' size={13} color='#ffffff' />
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }
        else if (this.state.role == "manager" &&
            (item.CuaHangTruongCheck !== '' && item.CuaHangTruongCheck !== null && typeof item.CuaHangTruongCheck !== 'undefined') && item.CuaHangTruongCheck == true) {
            return (
                <View style={styles.taskButton}>

                    <TouchableOpacity style={styles.viewDetailButton}
                        onPress={this.taskDetail.bind(this, item.Id, item.TenTieuChuan, date)}
                    >
                        <Text>
                            <FontAwesome name='eye' size={13} color='#ffffff' />
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.KhongDuyetButton}
                        onPress={this.taskKhongDuyet.bind(this, item.Id, item.TenTieuChuan, date)}
                    >
                        <Text>
                            <FontAwesome name='share-square-o' size={13} color='#ffffff' />
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }
        else if (this.state.role == "manager" &&
            (item.CuaHangTruongCheck !== '' && item.CuaHangTruongCheck !== null && typeof item.CuaHangTruongCheck !== 'undefined') && item.CuaHangTruongCheck == false) {
            return (
                <View style={styles.taskButton}>

                    <TouchableOpacity style={styles.viewDetailButton}
                        onPress={this.taskDetail.bind(this, item.Id, item.TenTieuChuan, date)}
                    >
                        <Text>
                            <FontAwesome name='eye' size={13} color='#ffffff' />
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.DuyetButton}
                        onPress={this.taskDuyet.bind(this, item.Id, item.TenTieuChuan, date)}
                    >
                        <Text>
                            <FontAwesome name='check-square-o' size={13} color='#ffffff' />
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }
        else if (this.state.role == "admin" && (item.QuanLyCheck == null || typeof item.QuanLyCheck == 'undefined')) {
            return (
                <View style={styles.taskButton}>

                    <TouchableOpacity style={styles.viewDetailButton}
                        onPress={this.taskDetail.bind(this, item.Id, item.TenTieuChuan, date)}
                    >
                        <Text>
                            <FontAwesome name='eye' size={13} color='#ffffff' />
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.DuyetButton}
                        onPress={this.taskDuyet.bind(this, item.Id, item.TenTieuChuan, date)}
                    >
                        <Text>
                            <FontAwesome name='check-square-o' size={13} color='#ffffff' />
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.KhongDuyetButton}
                        onPress={this.taskKhongDuyet.bind(this, item.Id, item.TenTieuChuan, date)}
                    >
                        <Text>
                            <FontAwesome name='share-square-o' size={13} color='#ffffff' />
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }
        else if (this.state.role == "admin" &&
            (item.CuaHangTruongCheck !== '' && item.QuanLyCheck !== null && typeof item.QuanLyCheck !== 'undefined') && item.QuanLyCheck == true) {
            return (
                <View style={styles.taskButton}>

                    <TouchableOpacity style={styles.viewDetailButton}
                        onPress={this.taskDetail.bind(this, item.Id, item.TenTieuChuan, date)}
                    >
                        <Text>
                            <FontAwesome name='eye' size={13} color='#ffffff' />
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.KhongDuyetButton}
                        onPress={this.taskKhongDuyet.bind(this, item.Id, item.TenTieuChuan, date)}
                    >
                        <Text>
                            <FontAwesome name='share-square-o' size={13} color='#ffffff' />
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }
        else if (this.state.role == "admin" &&
            (item.CuaHangTruongCheck !== '' && item.QuanLyCheck !== null && typeof item.QuanLyCheck !== 'undefined') && item.QuanLyCheck == false) {
            return (
                <View style={styles.taskButton}>

                    <TouchableOpacity style={styles.viewDetailButton}
                        onPress={this.taskDetail.bind(this, item.Id, item.TenTieuChuan, date)}
                    >
                        <Text>
                            <FontAwesome name='eye' size={13} color='#ffffff' />
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.DuyetButton}
                        onPress={this.taskDuyet.bind(this, item.Id, item.TenTieuChuan, date)}
                    >
                        <Text>
                            <FontAwesome name='check-square-o' size={13} color='#ffffff' />
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }
    }

    _renderTask() {

        if (this.state.dataSource !== null && typeof this.state.dataSource !== 'undefined') {
            return (
                <View style={styles.taskContainer}>
                    <ScrollView style={styles.taskList}>
                        {
                            this.state.dataSource.map((item, index) => (
                                <View style={styles.taskItem} key={item.Id}>
                                    <View style={styles.imageDetail} key={index}>
                                        <TouchableOpacity onPress={this.openModal.bind(this, index)}>
                                            <Image source={{ uri: urlServerImage(item.Url) }} style={styles.imageItem} />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.taskDetail}>
                                        <TouchableOpacity>
                                            <Text style={styles.taskTitle}>{index + 1}.{item.TenTieuChuan}</Text>
                                        </TouchableOpacity>
                                        <View style={styles.taskDateContainer}>
                                            <FontAwesome style={styles.taskDateIcon} name='clock-o' size={13} color='#c4c4c4' />
                                            <Moment element={Text} style={styles.taskDate} format="hh:mm A">{item.GioBDThucHien}</Moment>
                                        </View>
                                        <Text style={styles.taskNhom}>Nhóm: {item.TenLoaiTieuChuan}</Text>
                                    </View>
                                    {this._renderTaskAction(item)}
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


    render() {
        let imgUrl = [];
        if (this.state.dataSource !== null && typeof this.state.dataSource !== 'undefined') {
            imgUrl = this.state.dataSource.map((item) => {
                return ({
                    url: urlServerImage(item.Url),
                });
            });
        }

        if (this.state.companyObject !== null && typeof this.state.companyObject !== 'undefined') {
            return (
                <View style={styles.container}>
                    <Modal animationType={'slide'}
                        visible={this.state.isModalOpened}
                        onRequestClose={() => { }} >
                        <ImageViewer imageUrls={imgUrl} index={this.state.currentImageIndex} />
                        <TouchableOpacity style={styles.iconCloseModalImages}
                            onPress={this.closeModal.bind(this)}
                        >
                            <FontAwesome name='times-circle-o' color='#ff5500' size={30} />
                        </TouchableOpacity>
                    </Modal>

                    <Dialog.Container visible={this.state.dialogDuyetVisible}>
                        <Dialog.Title>Duyệt công việc</Dialog.Title>
                        <Dialog.Description>
                            Bạn có chắc chắn muốn duyệt công việc [{this.state.taskname}]?
                        </Dialog.Description>
                        <Dialog.Button label="Hủy bỏ" onPress={this.handleCancelDuyet} />
                        <Dialog.Button label="Đồng ý" onPress={this.handleDeleteDuyet} />
                    </Dialog.Container>

                    <Dialog.Container visible={this.state.dialogKhongDuyetVisible}>
                        <Dialog.Title>Không duyệt công việc</Dialog.Title>
                        <Dialog.Input style={styles.DialogInput} autoFocus={true} label="Lý do" onChangeText={(value) => this.handleLyDo(value)}></Dialog.Input>
                        <Dialog.Button label="Hủy bỏ" onPress={this.handleCancelKhongDuyet} />
                        <Dialog.Button label="Đồng ý" onPress={this.handleDeleteKhongDuyet} />
                    </Dialog.Container>

                    <View style={styles.header}>
                        <RNPickerSelect
                            placeholder={{
                                label: 'Chọn cửa hàng quản lý...',
                                value: null,
                            }}
                            items={this.state.companyObject}
                            onValueChange={(value) => {
                                this.setState({
                                    companyId: value,
                                });
                                this.loadInitialState()
                                    .done();
                            }}
                            value={this.state.companyId}
                            style={pickerSelectStyles.inputIOS}
                        />
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

                        {this._renderTask()}

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
        flex: 0.7,
        marginTop: 5,
        padding: 5,
        justifyContent: 'center',
        alignSelf: 'stretch',
        alignItems: 'center',
        backgroundColor: '#ededed'

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
        height: height - 80,
        borderTopWidth: 1,
        borderTopColor: '#d4d4d4',
        alignSelf: 'stretch',
    },
    dateNavigation: {
        marginTop: 10,
        marginBottom: 10,
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
    footer: {
        position: 'absolute',
        bottom: 0,
        width: width
    },
    taskContainer: {
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
    taskNhom: {
        fontSize: 12,
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
    DuyetButton: {
        padding: 8,
        marginTop: 5,
        marginHorizontal: 2,
        backgroundColor: '#50D050',
    },
    KhongDuyetButton: {
        padding: 8,
        marginTop: 5,
        marginHorizontal: 2,
        backgroundColor: '#ff5500',
    },
    viewDetailButton: {
        padding: 8,
        marginTop: 5,
        marginHorizontal: 2,
        backgroundColor: '#00b1e1',
    },
    imageDetail: {
        marginHorizontal: '0.15%',
        marginVertical: 5,
        width: '33%',
        marginRight: 5
    },
    imageItem: {
        width: '100%',
        height: 100,
        shadowRadius: 5,
        borderWidth: 1,
        borderRadius: 2,
        borderColor: '#ddd',
    },
    iconCloseModalImages: {
        position: 'absolute',
        right: 5,
        top: 5,
    },
    DialogInput: {
        borderWidth: 1,
        borderRadius: 2,
        borderColor: '#ddd',
        marginTop: 5
    }
});
const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingTop: 13,
        paddingHorizontal: 10,
        paddingBottom: 12,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        backgroundColor: 'white',
        color: 'black',
    },
});
export default taskadmin;