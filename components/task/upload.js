import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ActivityIndicator, Dimensions, AsyncStorage, KeyboardAvoidingView, ScrollView } from 'react-native';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RNFetchBlob from 'rn-fetch-blob';
import RNFU from 'react-native-file-utils';
import Geolocation from 'react-native-geolocation-service';
import Permissions from 'react-native-permissions'

import pickCamera from './pickCamera';
import pickLibrary from './pickLibrary';
import { urlApiPostImageTask, urlApiDetailTask, urlApiPostCommentTask } from '../global';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

var { width, height } = Dimensions.get('window');
var RNFS = require('react-native-fs');
var dateFormat = require('dateformat');

class Upload extends Component {

    static navigationOptions = ({ navigation }) => ({
        title: `${navigation.state.params.taskName}`,
    });

    constructor(props) {
        super(props);
        this.state = {
            imageSource: null,
            taskView: null,
            loading: true,
            locationPermission: null,
            longitude: null,
            latitude: null,
            picture: null,
            fileName: null,
            fileType: null,
            comment: null,
            companyId: null,
            departmentId: null,
            isCamera: null,
            user: null,
            loadingSend: false,
        };
    }

    componentDidMount() {
        this.loadInitialState()
            .done();
    };

    componentWillUnmount() {
        this.setState({
            taskView: null,
            loading: true,
        });
    };

    componentWillMount() {
        this.requestLocationPermission();
    }

    requestLocationPermission = () => {
        Permissions.request('location').then(response => {
            this.setState({ locationPermission: response })
        });
    }

    loadInitialState = async () => {

        var companyId = await AsyncStorage.getItem('companyId');
        var departmentId = await AsyncStorage.getItem('departmentId');
        var userStr = await AsyncStorage.getItem('user');

        if(userStr === null || typeof userStr === 'undefined') {
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('companyId');
            await AsyncStorage.removeItem('departmentId');
            await AsyncStorage.removeItem('role');
            this.props.navigation.navigate('Login');
        }

        var user = JSON.parse(userStr);

        this.setState({
            companyId: companyId,
            departmentId: departmentId,
            user: user
        });

        Permissions.check('location').then(response => {
            // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
            if (response === 'authorized') {
                Geolocation.getCurrentPosition(
                    (position) => {
                        //console.log(position);
                        this.setState({
                            longitude: position.coords.longitude,
                            latitude: position.coords.latitude,
                        });

                    },
                    (error) => {
                        // See error code charts below.
                        console.log(error.code, error.message);
                    },
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
                );
            }
        })



        const taskId = this.props.navigation.getParam('taskId', 0);

        fetch(urlApiDetailTask(taskId))
            .then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    this.setState({
                        taskView: null,
                        loading: false,
                    });
                }
            })
            .then((resJson) => {
                this.setState({
                    taskView: resJson,
                    loading: false,
                });
            })
            .catch((error) => { console.log(error); });
    }

    render() {
        //console.log(this.state.taskView);
        if (this.state.taskView !== null && typeof this.state.taskView !== 'undefined') {
            let img = this.state.imageSource == null ? null :
                <View style={styles.imageDetail}>
                    <Image source={{ uri: this.state.imageSource }} style={styles.imageItem} />
                    <FontAwesome style={styles.iconDelete} name='times-circle' size={25} onPress={this.removeImage.bind(this)} />
                </View>;

            let overlay = this.state.loadingSend == true ?
                <View style={styles.overlayLoadingContainer}>
                    <ActivityIndicator style={styles.overlayLoading}
                        animating={this.state.loadingSend} />
                </View>
                : null;

            return (
                <View style={styles.container}>
                    <KeyboardAwareScrollView style={styles.content} behavior="padding" enabled>
                        <ScrollView style={styles.body}>
                            <View style={styles.libraryImage}>
                                <TouchableOpacity style={styles.accessCamera}
                                    onPress={this.showCamera.bind(this)}
                                >
                                    <FontAwesome name="camera" size={70} color='#ff5500' />
                                    <Text style={styles.iconTextAccessCamera}>Camera</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.accessLibraryImage}
                                    onPress={this.showLibrary.bind(this)}
                                >
                                    <MaterialIcons name="photo-library" size={70} color='#ff5500' />
                                    <Text style={styles.iconTextAccessCamera}>Thư viện ảnh</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.imageList}>
                                {img}
                            </View>

                            <TouchableOpacity style={styles.btnSendFeedBack} onPress={this.sendImage.bind(this)}>
                                <FontAwesome style={styles.iconSendFeedBack} name='cloud-upload' size={15} />
                                <Text style={styles.textSendFeedBack}>Gửi</Text>
                            </TouchableOpacity>

                            <View style={styles.commentContainer}>
                                <TextInput
                                    style={styles.textInputComment}
                                    placeholder='Comment'
                                    ref='comment'
                                    onChangeText={(comment) => this.setState({ comment })}
                                />
                                <TouchableOpacity style={styles.btnSendComment}
                                    onPress={this.sendComment.bind(this)}
                                >
                                    <FontAwesome name='send' size={15} color='#ffffff' />
                                </TouchableOpacity>
                            </View>
                        </ScrollView>

                    </KeyboardAwareScrollView>
                    {overlay}
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

    showCamera() {
        pickCamera(response => this.setState({ imageSource: response.uri, picture: response.data, fileName: response.fileName, fileType: response.type, isCamera: true, }));
    }

    showLibrary() {
        pickLibrary(response => this.setState({ imageSource: response.uri, picture: response.data, fileName: response.fileName, fileType: response.type, isCamera: false, }));
    }

    removeImage() {
        if (this.state.imageSource !== null && typeof this.state.imageSource !== 'undefined') {
            this.setState({
                imageSource: null,
                picture: null,
                fileName: null,
                fileType: null,
            });
        }
    }

    sendImage() {

        if (this.state.imageSource === null || typeof this.state.imageSource === 'undefined') {
            alert('Chọn file ảnh cần tải lên');
            return;
        }

        this.setState({
            loadingSend: true,
        });

        const taskId = this.props.navigation.getParam('taskId', 0);
        var taskDate = dateFormat(new Date(this.props.navigation.getParam('taskDate', new Date())), 'dd-mm-yyyy');

        if (this.state.isCamera) {
            RNFetchBlob.fetch('POST', urlApiPostImageTask, {
                Authorization: "Bearer access-token",
                otherHeader: "foo",
                'Content-Type': 'multipart/form-data',
            }, [
                    // custom content type
                    { name: 'image', filename: 'YODY.png', data: this.state.picture },
                    {
                        name: 'task', data: JSON.stringify({
                            taskId: taskId,
                            userId: this.state.user.Id,
                            longitude: this.state.longitude,
                            latitude: this.state.latitude,
                            ctime: new Date(),
                            companyId: this.state.companyId,
                            departmentId: this.state.departmentId,
                            taskDate: taskDate
                        })
                    }
                ]).then((res) => {
                    var responseJson = res.json();
                    if (responseJson.success) {

                        this.setState({
                            imageSource: null,
                            picture: null,
                            fileName: null,
                            fileType: null,
                            loadingSend: false,
                        });

                        alert('Đã gửi ảnh thành công!');
                        this.props.navigation.navigate("Home");
                    } else {
                        this.setState({
                            loadingSend: false,
                        });
                        alert('Gửi ảnh thất bại! ' + typeof responseJson.mess !== undefined ? responseJson.mess : responseJson.Message);
                    }
                }).catch((error) => {
                    console.log(error);
                });
        } else {
            RNFU.getPathFromURI(this.state.imageSource).then(filePath => {
                RNFS.stat(filePath).then((stat) => {
                    RNFetchBlob.fetch('POST', urlApiPostImageTask, {
                        Authorization: "Bearer access-token",
                        otherHeader: "foo",
                        'Content-Type': 'multipart/form-data',
                    }, [
                            // custom content type
                            { name: 'image', filename: this.state.fileName, data: this.state.picture },
                            {
                                name: 'task', data: JSON.stringify({
                                    taskId: taskId,
                                    userId: this.state.user.Id,
                                    longitude: this.state.longitude,
                                    latitude: this.state.latitude,
                                    ctime: stat.ctime,
                                    companyId: this.state.companyId,
                                    departmentId: this.state.departmentId,
                                    taskDate: taskDate
                                })
                            }
                        ]).then((res) => {
                            var responseJson = res.json();
                            if (responseJson.success) {

                                this.setState({
                                    imageSource: null,
                                    picture: null,
                                    fileName: null,
                                    fileType: null,
                                    loadingSend: false,
                                });

                                alert('Đã gửi ảnh thành công!');
                                this.props.navigation.goBack(null);
                            } else {
                                this.setState({
                                    loadingSend: false,
                                });

                                alert('Gửi ảnh thất bại! ' + typeof responseJson.mess !== undefined ? responseJson.mess : responseJson.Message);
                            }
                        }).catch((error) => {
                            console.log(error);
                        });
                });
            }
            );
        }
    }

    sendComment = async () => {

        if (this.state.comment === null || this.state.comment === '') {
            this.refs.comment.focus();
        } else {
            this.setState({
                loadingSend: true,
            });
            const taskId = this.props.navigation.getParam('taskId', 0);
            const user = JSON.parse(await AsyncStorage.getItem('user'));
            var taskDate = dateFormat(new Date(this.props.navigation.getParam('taskDate', new Date())), 'dd-mm-yyyy');

            fetch(urlApiPostCommentTask(taskId, this.state.companyId, user.Id, this.state.comment, taskDate))
                .then((res) => {
                    console.log(res);
                    if (res.ok) {
                        this.setState({
                            comment: null,
                            loadingSend: false,
                        });
                        this.refs.comment.clear();
                        alert("Gửi bình luận thành công");
                    } else {
                        this.setState({
                            loadingSend: false,
                        });
                        alert("Gửi bình luận thất bại");
                    }
                })
                .catch((error) => { console.log(error); });
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        flex: 1,
    },
    header: {
        marginTop: 5,
        padding: 5,
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center'
    },
    body: {
        flex: 1,
        paddingHorizontal: 10,
        paddingBottom: 15,
        alignSelf: 'stretch',
    },
    textInput: {
        height: 150,
        borderWidth: 1,
        borderColor: '#c1c0bf',
        textAlignVertical: 'top'
    },
    imageList: {
        marginVertical: 5,
        paddingVertical: 5,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'center',
    },
    imageDetail: {
        marginRight: 1,
        marginBottom: 1,
        marginVertical: 5,
    },
    imageItem: {
        width: width - 30,
        height: 200,
        shadowRadius: 5,
        borderWidth: 1,
        borderRadius: 2,
        borderColor: '#ddd',
    },
    btnSendFeedBack: {
        marginTop: 10,
        backgroundColor: '#50D050',
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    textSendFeedBack: {
        color: '#ffffff',
        textAlign: 'center'
    },
    iconSendFeedBack: {
        paddingTop: 2,
        color: '#ffffff',
        marginRight: 5,
    },
    iconDelete: {
        position: 'absolute',
        zIndex: 10,
        top: 0,
        right: 2,
        color: '#ff5500'
    },
    libraryImage: {
        padding: 5,
        marginVertical: 10,
        // flexDirection: 'row',
        backgroundColor: '#f4f4f4',
        borderTopWidth: 1,
        borderTopColor: '#d4d4d4'
    },
    accessCamera: {
        alignItems: 'center',
        alignSelf: 'stretch',
    },
    accessLibraryImage: {
        flex: 0.5,
        alignItems: 'center',
        alignSelf: 'stretch',
    },
    commentContainer: {
        flexDirection: 'row',
        marginTop: 5,
        paddingTop: 5,
        borderTopWidth: 1,
        borderTopColor: '#d4d4d4',
        justifyContent: 'space-between'
    },
    textInputComment: {
        flex: 0.75,
        paddingVertical: 2,
        paddingHorizontal: 5,
        alignItems: 'center',
        alignSelf: 'stretch',
        borderBottomColor: '#d4d4d4',
        borderBottomWidth: 1,
    },
    btnSendComment: {
        flex: 0.2,
        backgroundColor: '#50D050',
        alignItems: 'center',
        alignSelf: 'stretch',
        justifyContent: 'center',
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
    },
    overlayLoadingContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 11,
        backgroundColor: 'rgba(0,0,0,0.7)'
    },
    overlayLoading: {
    }
});

export default Upload;