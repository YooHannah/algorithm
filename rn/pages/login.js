import React from 'react';
import { View, Text, Button, Image,TextInput, StyleSheet } from 'react-native';

export default class container  extends React.Component {
    constructor(props) {
        super(props);   
        this.state = {
            username:'',
            login:''
        }
        this.login.bind(this)
    }
    login(){
        console.log(this.state)
        this.props.navigation.navigate('list')
    }
    render() {
        return (
          <View style={styles.container}>
            <TextInput style={{height: 40}}
                placeholder="用户名"
                onChangeText={(text) => this.setState({login:text})}/>
            <TextInput style={{height: 40}}
                placeholder="密码"
                onChangeText={(text) => this.setState({login:text})}/>
            <Button onPress={this.login}>登陆</Button>
          </View>
        )
    }
}
var styles = StyleSheet.create({
    container:{
        justifyContent:center,
        alignItem:center
    }
  });