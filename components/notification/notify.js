import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, AsyncStorage, ActivityIndicator, ScrollView,FlatList } from 'react-native';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { urlApiTaskMessage } from '../global';
import { List, ListItem } from 'react-native-elements';

var Dimensions = require('Dimensions');
var { width, height } = Dimensions.get('window');

class Notifications extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
      data: [],
      page: 0,
      refreshing: false
    };
    }

    _isMounted = false;

    componentDidMount() {
        this._isMounted = true;
        this.makeRemoteRequest();
    };

    componentWillUnmount() {
        this._isMounted = false;
      };

      async makeRemoteRequest() {
        const { page } = this.state;

        var companyId = await AsyncStorage.getItem('companyId');
        var userStr = await AsyncStorage.getItem('user');
        const url = urlApiTaskMessage(companyId, page, page + 15);

        if (this._isMounted) {
            this.setState({ loading: true });
          }

        if(userStr === null || typeof userStr === 'undefined') {
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('companyId');
            await AsyncStorage.removeItem('departmentId');
            await AsyncStorage.removeItem('role');
            this.props.navigation.navigate('Login');
        }

        fetch(url)
        .then(res => res.json())
        .then(res => {
          if (this._isMounted) {
            this.setState({
              data: page === 0 ? res : [...this.state.data, ...res],
              loading: false,
              refreshing: false
            });
          }
        })
        .catch(error => {
          if (this._isMounted) {
            this.setState({ error, loading: false });
  
            
  
          }
        });
    }

   handleRefresh = () => {
    if (this._isMounted) {
      this.setState(
        {
          page: 0,
          refreshing: true
        },
        () => {
          this.makeRemoteRequest();
        }
      );
    }
  };

  handleLoadMore = () => {
    if (this._isMounted) {
      this.setState(
        {
          page: this.state.page + 15
        },
        () => {
          this.makeRemoteRequest();
        }
      );
    }
  };

  renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "86%",
          backgroundColor: "#CED0CE",
          marginLeft: "14%"
        }}
      />
    );
  };

  renderFooter = () => {
    if (!this.state.loading) return null;

    return (
      <View
        style={{
          paddingVertical: 20,
          borderTopWidth: 1,
          borderColor: "#CED0CE"
        }}
      >
        <ActivityIndicator animating size="large" />
      </View>
    );
  };

  Detail(taskId, taskName, ngay, thang, nam, companyId) {

    var date = new Date(nam, thang-1, ngay);
    this.props.navigation.navigate('DetailAdmin', {
      taskId: taskId,
      taskName: taskName,
      taskDate: date,
      companyId: companyId
    });
  }

    render() {
        if (this.state.data !== null && typeof this.state.data !== 'undefined' && this.state.data.length > 0) {
            return (
                <View style={styles.container}>
                    <View style={styles.header}>
                        <MaterialIcons name='notifications' size={20} />
                        <Text style={styles.titleHeader}>Thông báo</Text>
                    </View>
               
              <FlatList
                data={this.state.data}
                renderItem={({ item }) => (
                  <ListItem
                    roundAvatar
                    //title={item._from}
                    titleContainerStyle={{ marginBottom: 15 }}
                    subtitle={item.subject}
                    //avatar={'https://via.placeholder.com/70x70.jpg'}
                    rightTitle={item.timestamp}
                    rightTitleStyle={{ color: '#397789',fontSize:12,fontWeight: 'normal' }}
                    containerStyle={{ borderBottomWidth: 0 }}
                    rightTitleContainerStyle={{ position: 'absolute', right: 15 }}
                    subtitleStyle={{ fontWeight: 'normal' }}
                    onPress={this.Detail.bind(this, item.taskId, item.taskName, item.ngay, item.thang, item.nam, item.companyId)}
                    title={
                      <View style={styles.subtitleView}>
                        <View>
                          <Text style={styles.ratingText}>{item._from}</Text>
                        </View>

                      </View>
                    }
                  />
                )}
                keyExtractor={item => item.id}
                ItemSeparatorComponent={this.renderSeparator}
                ListFooterComponent={this.renderFooter}
                onRefresh={this.handleRefresh}
                refreshing={this.state.refreshing}
                onEndReached={this.handleLoadMore}
                onEndReachedThreshold={15}
              />
       
             
           
                </View>
            );
        } else {

            if(!this.state.loading) {
                return(
                    <View style={styles.container}>
                        <View style={styles.body}>
                            <View style={styles.rowContainer}>
                                <Text style={styles.textNotification}>Chưa có thông báo nào</Text>
                            </View>
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
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 60,
        paddingBottom: 5,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        marginHorizontal: 10,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#d4d4d4',
    },
    titleHeader: {
        paddingLeft: 10,
    },
    body: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        alignSelf: 'stretch',
    },
    rowContainer: {
        padding: 10,
        backgroundColor: '#d4d4d4',
        marginVertical: 2,
    },
    textCreatedDate: {
        fontSize: 11,
        color: '#888888',
        paddingLeft: 5,
    },
    textNotification: {
        paddingLeft: 5,
    },
    removeItemNotification: {
        position: 'absolute',
        top: 5,
        right: 5,
    },
    subtitleView: {
      marginLeft: 10,
    },
  
    ratingText: {
      color: 'black'
    }
});

export default Notifications;