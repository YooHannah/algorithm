import React from 'react';
import { View, Text, Button, Image, StyleSheet } from 'react-native';

export default class Container  extends React.Component {
    constructor(props) {
        super(props);   
        this.state = {item:this.props.data}
      }
    render() {
        return (
            <View style={styles.container}>
            <Image source={{ uri: this.props.data.img }} style={styles.thumbnail} />
            <View style={styles.rightContainer}>
              <View style={styles.littleContainer}>
                <Text style={styles.title}>{this.props.data.name}</Text>
                <Text style={styles.year}>{this.props.data.price}</Text>
              </View>
              <View style={styles.littleContainer}>
                <Text style={styles.title}>{this.props.data.tip}</Text>
              </View>
              <View style={styles.littleContainer}>
                <Button onPress={this.props.collectFunc(this.props.data)}>收藏</Button>
                <Button onPress={this.props.addFunc(this.props.data)}>添加购物车</Button>
              </View>
            </View>
          </View>
        )
    }
}
var styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    thumbnail: {
      width: 53,
      height: 81
    },
    rightContainer: {
        flex: 1,
    },
    littleContainer:{
        flexDirection: 'row',
        justifyContent:'space-around'
    }
  });
