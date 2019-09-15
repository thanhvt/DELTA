import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, AsyncStorage, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { urlApiPostFeedBack } from '../global';

class FeedBack extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            title: '',
            message: '',
        };
    }

    componentDidMount() {
        this.loadInitialState()
            .done();
    }

    loadInitialState = async () => {

        var userStr = await AsyncStorage.getItem('user');

        if(userStr === null || typeof userStr === 'undefined') {
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('companyId');
            await AsyncStorage.removeItem('departmentId');
            await AsyncStorage.removeItem('role');
            this.props.navigation.navigate('Login');
        }

        this.setState({
            isLoading: false,
        });
    }

    sendFeedBack = async () => {

        var companyId = await AsyncStorage.getItem('companyId');
        var userStr = await AsyncStorage.getItem('user');
        const { title, message } = this.state;

        if (userStr === null || typeof userStr === 'undefined') {
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('companyId');
            await AsyncStorage.removeItem('departmentId');
            this.props.navigation.navigate('Login');
        }

        var user = JSON.parse(userStr);

        if (title === '') {
            alert('Nhập tiêu đề phản hồi');
            return false;
        }

        if (message === '') {
            alert('Nhập nội dung phản hồi');
            return false;
        }

        this.setState({
            isLoading: true,
        });
        
        fetch(urlApiPostFeedBack, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Title: title,
                Message: message,
                UserId: user.Id
            }),
        })
            .then((response) => {
                if (response.ok) {
                    this.setState({
                        isLoading: false,
                        title: '',
                        message: '',
                    });
                    this.refs.titleFeedBack.clear();
                    this.refs.contentFeedBack.clear();
                    alert('Gửi phản hồi thành công');
                } else {
                    this.setState({
                        isLoading: false,
                    });
                    alert('Gửi phản hồi không thành công');
                }
            })
            .catch((error) => {
                this.setState({
                    isLoading: false,
                });
                console.log(error);
                alert('Không gửi được phản hồi');
            });
    }

    render() {

        if (!this.state.isLoading) {
            return (
                <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
                    <View style={styles.body}>
                        <View style={styles.infoFeedback}>
                            {/* <View style={styles.sendToUser}>
                                <Text style={styles.labelSendToUser}>Đến:</Text>
                                <TextInput style={styles.textSendToUser}
                                placeholder='abc@gmail.com'
                                />
                            </View>
    
                            <View style={styles.sendToUserCc}>
                                <Text style={styles.labelSendToUserCc}>Cc/Bcc:</Text>
                                <TextInput style={styles.textSendToUserCc}
                                placeholder='xyz@gmail.com'
                                />
                            </View> */}

                            <View style={styles.subjectFeedBack}>
                                <Text style={styles.labelSubjectFeedBack}>Tiêu đề:</Text>
                                <TextInput style={styles.textSubjectFeedBack}
                                    ref='titleFeedBack'
                                    placeholder='Nhập tiêu đề phản hồi'
                                    onChangeText={(title) => this.setState({ title })}
                                />
                            </View>
                        </View>

                        <View style={styles.contentFeedBack}>
                            <TextInput style={styles.textContentFeedBack}
                                ref='contentFeedBack'
                                multiline={true}
                                placeholder='Nội dung phản hồi'
                                onChangeText={(message) => this.setState({ message })}
                            />
                        </View>

                        <TouchableOpacity style={styles.btnSendFeedBack}
                            onPress={this.sendFeedBack.bind(this)}
                        >
                            <Text style={styles.textSendFeedBack}>Gửi</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            );
        } else {
            return (
                <View style={styles.containerLoading}>
                    <ActivityIndicator style={styles.activityIndicator}
                        animating={this.state.isLoading} />
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
    containerLoading: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    body: {
        alignSelf: 'stretch',
    },
    infoFeedback: {
        alignSelf: 'stretch',
        padding: 10,
        backgroundColor: '#f4f4f4',
    },
    sendToUser: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 2,
    },
    sendToUserCc: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 2,
    },
    subjectFeedBack: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 2,
    },
    labelSendToUser: {
        flex: 0.2,
        textAlignVertical: 'center',
        alignSelf: 'center'
    },
    labelSendToUserCc: {
        flex: 0.2,
        textAlignVertical: 'center',
        alignSelf: 'center'
    },
    labelSubjectFeedBack: {
        flex: 0.2,
        textAlignVertical: 'center',
        alignSelf: 'center'
    },
    textSendToUser: {
        flex: 0.8,
        paddingVertical: 2,
        paddingHorizontal: 7,
        backgroundColor: '#ffffff',
        alignSelf: 'stretch'
    },
    textSendToUserCc: {
        flex: 0.8,
        paddingVertical: 2,
        paddingHorizontal: 7,
        backgroundColor: '#ffffff',
        alignSelf: 'stretch'
    },
    textSubjectFeedBack: {
        flex: 0.8,
        paddingVertical: 2,
        paddingHorizontal: 7,
        backgroundColor: '#ffffff',
        alignSelf: 'stretch'
    },
    contentFeedBack: {
        padding: 5,
    },
    textContentFeedBack: {
        height: 150,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: '#d4d4d4'
    },
    btnSendFeedBack: {
        padding: 5,
        margin: 5,
        alignSelf: 'stretch',
        alignItems: 'center',
        backgroundColor: '#50D050',
    },
    textSendFeedBack: {
        color: '#ffffff'
    },
    activityIndicator: {
        justifyContent: 'center',
    }
});

export default FeedBack;