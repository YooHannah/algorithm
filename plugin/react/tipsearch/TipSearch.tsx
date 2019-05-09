/*
 * @Author: YooHannah
 * @Date: 2018-06-04 09:45:54
 * @Last Modified by: YooHannah
 * @Last Modified time: 2018-06-04 15:58:45
 */
import React from 'react';
import appEvents from 'app/core/app_events';

export interface TipSearchProps {
  config: any;
  /*
   * 参数配置/功能说明
   * getOptionFunc：获取下拉选项的回调函数
   * buttonFunc：确定选项后的回调函数
   * placeholder：输入框文字提示，不配置使用默认'请输入'
   * buttonName：确定选项后按钮名称，不配置使用默认'搜索'
   * selectConfig:配置输入选择框前分类选择框 不配置不显示该功能 详见【告警】【告警配置】【策略】
   * type:区分默认输入选择框和特殊类型输入选择框
   * 默认输入选择框：输入关键字，查询得下拉选项，点击选项，选项带回输入框，将原来关键字覆盖
   * 特殊类型输入框：
   *     'btn' 输入关键字，查询得下拉选项，点击选项，选项以前置按钮形式返回，输入框清空 ，点击前置按钮可将本身删除，可进行初始化配置，详见【告警】【告警配置】【策略】编辑功能
   */
}
export default class TipSearch extends React.Component<TipSearchProps, any> {
  selected = {};
  list: JSX.Element;
  optsSelect = [];
  buttons = [];
  constructor(props) {
    super(props);
    this.state = {
      hasInput: false, //删除按钮显示隐藏
      showList: false, //列表显示隐藏
      inputValue: '', //输入框值
      selectedVal: this.props.config.selectConfig ? this.props.config.selectConfig.data[0].id : '', //分类选择框值
      buttons: this.props.config.type && this.props.config.type.name === 'btn' ? this.props.config.type.buttons : [], //特殊类型btn 按钮初始化
    };
    this.optsSelect = [];
    if (this.props.config.selectConfig) {
      let data = this.props.config.selectConfig.data;
      for (let i = 0; i < data.length; i++) {
        this.optsSelect.push(
          <option value={data[i].id} key={i}>
            {data[i].name}
          </option>
        );
      }
    }
    this.buttons = [];
    if (this.state.buttons.length > 0) {
      this.buttons = this.renderbuttons(this.props.config.type.buttons);
    }
    this.selectChange = this.selectChange.bind(this);
    this.changeKeyValue = this.changeKeyValue.bind(this);
    this.searchFunc = this.searchFunc.bind(this);
    this.deleFunc = this.deleFunc.bind(this);
    appEvents.on('changeInputFromOut', this.changeInputFromOut.bind(this));//父级页面不通过查询按钮引起查询
  }

  //第一个下拉框change
  selectChange(e) {
    let value = e.target.value;
    this.setState({
      inputValue: '',
      selectedVal: value,
      hasInput: false,
      showList: false,
    });
  }
  //输入值发生变化回调函数
  changeKeyValue(e) {
    let keyword = e.target.value;
    this.selected = {};
    if (!keyword) {
      this.list = null;
      this.setState({
        hasInput: false,
        showList: false,
        inputValue: keyword,
      });
      return;
    } else {
      this.setState({
        hasInput: true,
        showList: true,
        inputValue: keyword,
      });
    }
    let params = { keyword: keyword, option: '' };
    if (this.props.config.selectConfig) {
      params.option = this.state.selectedVal;
    }
    this.props.config.getOptionFunc(params).then(options => {
      this.list = this.renderlist(options);
      this.forceUpdate();
    });
  }
  //点击删除按钮
  deleFunc() {
    this.list = null;
    this.setState({
      inputValue: '',
      hasInput: false,
      showList: false,
    });
  }
  //渲染列表函数
  renderlist(tips) {
    if (!tips || tips.length < 1) {
      return (
        <ul>
          <li> 尚无相关匹配项 </li>
        </ul>
      );
    }
    const listResult = [];
    for (let i = 0; i < tips.length; i++) {
      const tip = tips[i];
      listResult.push(
        <li
          key={i}
          onClick={e => {
            this.liClick(tip);
          }}
        >
          {tip.Name}
        </li>
      );
    }
    return <ul>{listResult}</ul>;
  }
  //列表项点击事件
  liClick(tip) {
    if (!this.props.config.type) {
      this.setState({
        inputValue: tip.Name,
        showList: false,
      });
      this.selected = tip;
    }
    if (this.props.config.type && this.props.config.type.name === 'btn') {
      //按钮情况
      let buttons = this.state.buttons.slice();
      buttons.push(tip);
      this.buttons = this.renderbuttons(buttons);
      this.props.config.type.buttons = buttons;
      this.setState({
        buttons: buttons,
        inputValue: '',
        showList: false,
      });
    }
  }
  changeInputFromOut(item) {
    this.setState({
      inputValue: item.Name,
      showList: false,
    });
    this.selected = item;
    this.searchFunc();
  }
  //渲染已选按钮
  renderbuttons(buttons) {
    let doms = [];
    for (let j = 0; j < buttons.length; j++) {
      doms.push(
        <a
          className="inputB"
          key={j}
          onClick={e => {
            this.buttonsClick(j);
          }}
        >
          {'X ' + buttons[j].Name}
        </a>
      );
    }
    return doms;
  }
  //按钮点击删除
  buttonsClick(index) {
    let buttons = this.state.buttons.slice();
    buttons.splice(index, 1);
    this.props.config.type.buttons = buttons;
    this.buttons = this.renderbuttons(buttons);
    this.setState({
      buttons: buttons,
    });
  }
  // search 按钮触发事件 调用父组件回调函数
  searchFunc() {
    var option = {
      searchSelect: this.selected,//实际选项
      firstSelect: this.state.selectedVal,//分类选择的选项
    };
    if (this.props.config.type) {
      option = this.state.buttons.slice();
    }
    this.props.config.buttonFunc(option);
  }
  render() {
    return (
      <div className="tipsearch signup">
        <div className="parentcss">
          <div className="forminline">
            <div className={this.props.config.selectConfig ? 'selectwrapper min-width-4' : 'hideDom'}>
              <select className="forminput" value={this.state.selectedVal} onChange={this.selectChange}>
                {this.optsSelect}
              </select>
            </div>
            <div className={this.props.config.type ? 'hideDom' : 'layout'}>
              <input
                type="text"
                data-share-panel-url
                className="forminput"
                value={this.state.inputValue}
                onChange={e => this.changeKeyValue(e)}
                placeholder={this.props.config.placeholder ? this.props.config.placeholder : '请输入'}
              />
              <div className="cancelStyle1">
                <div className={this.state.hasInput ? 'cancelStyle2' : 'hideDom'} onClick={this.deleFunc}>
                  X
                </div>
              </div>
              <div className={this.state.showList ? 'forminline paddingleft' : 'hideDom'}>
                <div className="layout backgroundcolor">{this.list}</div>
              </div>
            </div>
            <div
              className={
                this.props.config.type && this.props.config.type.name === 'btn' ? 'layout typeborder' : 'hideDom'
              }
            >
              <div className="allInputBtn">{this.buttons}</div>
              <div className="layout">
                <input
                  type="text"
                  data-share-panel-url
                  className="forminput inputT"
                  value={this.state.inputValue}
                  onChange={e => this.changeKeyValue(e)}
                  placeholder={this.props.config.placeholder ? this.props.config.placeholder : '请输入'}
                />
                <div className="cancelStyle1">
                  <div className={this.state.hasInput ? 'cancelStyle2' : 'hideDom'} onClick={this.deleFunc}>
                    X
                  </div>
                </div>

                <div className={this.state.showList ? 'forminline paddingleft' : 'hideDom'}>
                  <div className="layout backgroundcolor">{this.list}</div>
                </div>
              </div>
            </div>
            <div className={this.props.config.confirmbtnHide ? 'hideDom' : 'layout-no'}>
              <button className="btnconfirm" onClick={this.searchFunc}>
                {this.props.config.buttonName ? this.props.config.buttonName : '搜索'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
