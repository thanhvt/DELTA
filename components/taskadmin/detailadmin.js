import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, ActivityIndicator, AsyncStorage, Modal, TextInput } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import Permissions from 'react-native-permissions'
import ImageViewer from 'react-native-image-zoom-viewer';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { urlApiDetailTask, urlApiDetailImageTask, urlApiDetailCommentTask, urlServerImage, urlApiPostCommentTaskAdmin } from '../global';

var dateFormat = require('dateformat');

class DetailAdmin extends Component {

    static navigationOptions = ({ navigation }) => ({
        title: `${navigation.state.params.taskName}`,
    });

    constructor(props) {
        super(props);
        this.state = {
            imageSource: null,
            taskView: null,
            taskImageView: null,
            taskCommentView: null,
            loading: true,
            locationPermission: null,
            longitude: null,
            latitude: null,
            picture: null,
            fileName: null,
            fileType: null,
            comment: null,
            isModalOpened: false,
            currentImageIndex: 0,
            commentsend: null,
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
            taskImageView: null,
            taskCommentView: null,
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
        var taskId = this.props.navigation.getParam('taskId', 0);
        var taskDate = dateFormat(new Date(this.props.navigation.getParam('taskDate', new Date())), 'dd-mm-yyyy');
        var companyId = this.props.navigation.getParam('companyId', 0);
        var userStr = await AsyncStorage.getItem('user');

        if (userStr === null || typeof userStr === 'undefined') {
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('companyId');
            await AsyncStorage.removeItem('departmentId');
            await AsyncStorage.removeItem('role');
            this.props.navigation.navigate('Login');
        }

        Permissions.check('location').then(response => {
            // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
            this.setState({ locationPermission: response });

            if (response == 'authorized') {
                Geolocation.getCurrentPosition(
                    (position) => {
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
        });

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
                });
            })
            .catch((error) => { console.log(error); });

        fetch(urlApiDetailImageTask(taskId, companyId, taskDate))
            .then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    this.setState({
                        taskImageView: null,
                        loading: false,
                    });
                }
            })
            .then((resJson) => {
                this.setState({
                    taskImageView: resJson,
                    loading: false,
                });
            })
            .catch((error) => { console.log(error); });

        fetch(urlApiDetailCommentTask(taskId, companyId, taskDate))
            .then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    this.setState({
                        taskCommentView: null,
                        loading: false,
                    });
                }
            })
            .then((resJson) => {
                this.setState({
                    taskCommentView: resJson,
                });
            })
            .catch((error) => { console.log(error); });
    }

    sendComment = async () => {

        if (this.state.commentsend === null || this.state.commentsend === '') {
            this.refs.commentsend.focus();
        } else {
            this.setState({
                loadingSend: true,
            });

            const user = JSON.parse(await AsyncStorage.getItem('user'));
            var taskId = this.props.navigation.getParam('taskId', 0);
            var taskDate = dateFormat(new Date(this.props.navigation.getParam('taskDate', new Date())), 'dd-mm-yyyy');
            var companyId = this.props.navigation.getParam('companyId', 0);

            fetch(urlApiPostCommentTaskAdmin(taskId, companyId, user.Id, this.state.commentsend, taskDate))
                .then((res) => {
                    console.log(res);
                    if (res.ok) {
                        this.setState({
                            commentsend: null,
                            loadingSend: false,
                        });
                        this.refs.commentsend.clear();
                        //alert("Gửi bình luận thành công");
                        this.loadInitialState().done();
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

    render() {

        let img = null;
        let comment = null;
        let imgUrl = [];

        if (this.state.taskImageView !== null && typeof this.state.taskImageView !== 'undefined') {
            img = this.state.taskImageView.map((item, index) => {
                return (
                    <View style={styles.imageDetail} key={index}>
                        <TouchableOpacity onPress={this.openModal.bind(this, index)}>
                            <Image source={{ uri: urlServerImage(item.Url) }} style={styles.imageItem} />
                        </TouchableOpacity>
                    </View>
                );
            });

            imgUrl = this.state.taskImageView.map((item) => {
                return ({
                    url: urlServerImage(item.Url),
                });
            });
        }
        if (this.state.taskCommentView !== null && typeof this.state.taskCommentView !== 'undefined') {
            comment = this.state.taskCommentView.map((item) => {
                return (
                    <View style={styles.commentDetail} key={item.Id}>
                        <Text style={styles.userNameComment}>{item.Username}: </Text>
                        <Text style={styles.contentComment}>{item.CommentContent}</Text>
                    </View>
                );
            });
        }
        if (this.state.taskView !== null && typeof this.state.taskView !== 'undefined') {
            let overlay = this.state.loadingSend == true ?
                <View style={styles.overlayLoadingContainer}>
                    <ActivityIndicator style={styles.overlayLoading}
                        animating={this.state.loadingSend} />
                </View>
                : null;
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

                    <ScrollView>
                        <View style={styles.body}>
                            <View style={styles.headerImage}>
                                <Text style={styles.textHeaderImage}>Hình ảnh</Text>
                            </View>
                            <View style={styles.imageList}>
                                {img}
                            </View>
                            <View style={styles.commentContainer}>
                                <View style={styles.headerComment}>
                                    <Text style={styles.textHeaderComment}>Bình luận</Text>
                                </View>
                                <View style={styles.commentList}>
                                    {comment}
                                </View>

                            </View>
                            <View style={styles.commentContainerSend}>
                                <TextInput
                                    style={styles.textInputCommentSend}
                                    placeholder='Comment'
                                    ref='commentsend'
                                    onChangeText={(cm) => this.setState({ commentsend: cm })}
                                />
                                <TouchableOpacity style={styles.btnSendCommentSend}
                                    onPress={this.sendComment.bind(this)}
                                >
                                    <FontAwesome name='send' size={15} color='#ffffff' />
                                </TouchableOpacity>
                            </View>
                        </View>
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

    openModal(index) {
        this.setState({ isModalOpened: true, currentImageIndex: index })
    }

    closeModal() {
        this.setState({
            isModalOpened: false,
        });
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        marginTop: 5,
        padding: 5,
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center'
    },
    body: {
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
        marginHorizontal: '0.15%',
        marginVertical: 5,
        width: '33%',
    },
    imageItem: {
        width: '100%',
        height: 100,
        shadowRadius: 5,
        borderWidth: 1,
        borderRadius: 2,
        borderColor: '#ddd',
    },
    btnSendFeedBack: {
        marginTop: 10,
        backgroundColor: '#C71585',
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
        zIndex: 100,
        top: 100,
        right: 2,
        color: '#ff5500'
    },
    libraryImage: {
        padding: 5,
        marginVertical: 10,
        flexDirection: 'row',
        backgroundColor: '#f4f4f4',
        borderTopWidth: 1,
        borderTopColor: '#d4d4d4'
    },
    accessCamera: {
        flex: 0.5,
        alignItems: 'center',
        alignSelf: 'stretch',
    },
    accessLibraryImage: {
        flex: 0.5,
        alignItems: 'center',
        alignSelf: 'stretch',
    },
    commentContainer: {
        marginTop: 5,
        padding: 5,
        justifyContent: 'space-between'
    },
    headerComment: {
        marginVertical: 5,
    },
    textHeaderComment: {
        fontSize: 17,
        fontWeight: 'bold',
    },
    headerImage: {
        marginVertical: 5,
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#d4d4d4',
    },
    textHeaderImage: {
        fontSize: 17,
        fontWeight: 'bold',
    },
    commentList: {
        borderTopWidth: 1,
        borderTopColor: '#d4d4d4',
    },
    commentDetail: {
        flexDirection: 'row',
        alignSelf: 'stretch',
        paddingVertical: 5,
        flexWrap: 'wrap'
    },
    userNameComment: {
        fontWeight: 'bold',
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
        backgroundColor: '#C71585',
        alignItems: 'center',
        alignSelf: 'stretch',
        justifyContent: 'center',
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
    },
    iconCloseModalImages: {
        position: 'absolute',
        right: 5,
        top: 5,
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
    },
    commentContainerSend: {
        flexDirection: 'row',
        marginTop: 5,
        paddingTop: 5,
        borderTopWidth: 1,
        borderTopColor: '#d4d4d4',
        justifyContent: 'space-between'
    },
    textInputCommentSend: {
        flex: 0.75,
        paddingVertical: 2,
        paddingHorizontal: 5,
        alignItems: 'center',
        alignSelf: 'stretch',
        borderBottomColor: '#d4d4d4',
        borderBottomWidth: 1,
    },
    btnSendCommentSend: {
        flex: 0.2,
        backgroundColor: '#50D050',
        alignItems: 'center',
        alignSelf: 'stretch',
        justifyContent: 'center',
    }
});

export default DetailAdmin;