import React from 'react';
import { View, Text, Button, Image,TextInput, StyleSheet } from 'react-native';
import  Container from './component/Container'

export default class container  extends React.Component {
    constructor(props) {
        super(props);   
        this.state = {data:[],loaded:false}
        this.fetchData.bind(this)
        this.addFunc.bind(this)
        this.collectFunc.bind(this)
    }
    componentDidMount() {
        this.fetchData();
    }
    fetchData() {
        // fetch(REQUEST_URL)
        //   .then((response) => response.json())
        //   .then((responseData) => {
        //     this.setState({
        //       data: responseData,
        //     });
        //   });
        this.setState({
            loaded:true,
            data: [{
                name:'玫瑰1',price:'18',tip:'买一增一'
            },{
                name:'玫瑰2',price:'18',tip:'买一增一'
            },{
                name:'玫瑰3',price:'18',tip:'买一增一'
            },{
                name:'玫瑰4',price:'18',tip:'买一增一'
            },{
                name:'玫瑰5',price:'18',tip:'买一增一'
            },{
                name:'玫瑰6',price:'18',tip:'买一增一'
            },{
                name:'玫瑰7',price:'18',tip:'买一增一'
            },{
                name:'玫瑰8',price:'18',tip:'买一增一'
            }
        ],
        });
      }
      //添加购物车
      addShoppingCartFunc(){

      }
      //添加收藏
      collectFunc(){

      }
    render() {
        if (!this.state.loaded) {
            <View><Text>loading</Text></View>
        }
        return (
            <View style={styles.container}>
                {this.state.data.map{
                    item=>{
                        <Container data={item} collectFunc={this.collectFunc} addFunc={this.addShoppingCartFunc} style={styles.littleContainer}></Container>
                    }
                }}
                <View style={styles.bottom}>
                    <Text>总价：</Text>
                    <Text>购物车：</Text>
                </View>
            </View>
        );
    }
}
var styles = StyleSheet.create({
    container:{
        justifyContent:center,
        alignItem:center
    },
    littleContainer:{
        marginBottom:0.5
    },
    bottom:{
        position:'absolute',
        bottom:0

    }
  });