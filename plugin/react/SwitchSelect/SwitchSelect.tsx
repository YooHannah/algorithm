/*
 * @Author: YooHannah
 * @Date: 2018-08-02 09:21:25
 * @Last Modified by: YooHannah
 * @Last Modified time: 2018-08-20 16:04:00
 */
/*
 * @Author: YooHannah
 * @Date: 2018-07-27 09:39:26
 * @Last Modified by: YooHannah
 * @Last Modified time: 2018-07-27 16:23:37
 */
import React from 'react';
import appEvents from 'app/core/app_events';
export interface SwitchSelectProps {
  config: any;
}
export default class SwitchSelect extends React.Component<SwitchSelectProps, any> {
  leftList: any;
  rightList: any;
  leftData: any;
  rightData: any;
  constructor(props) {
    super(props);
    this.state = {
      value: [],
      leftKeyword: '',
      rightKeyword: '',
    };
    this.leftData = 0;
    this.rightData = 0;
    this.handleChange = this.handleChange.bind(this);
    this.confirmSave = this.confirmSave.bind(this);
    this.dismiss = this.dismiss.bind(this);
    this.renderlist(this.props.config);
  }
  //渲染列表函数
  renderlist(config) {
    const length = config.data.length;
    if (!config || length < 1) {
      return null;
    }
    let datas = config.data;
    this.leftList = [];
    this.rightList = [];
    datas.map((data, i) => {
      data.show = true;
      let item = (
        <label key={data.Id} className="labelShow">
          <input type="checkbox" name={data.Name ? data.Name : ''} value={data.Id} onChange={this.handleChange} />
          <span />
          <span className="itemover"> {data.Name}</span>
        </label>
      );
      if (data.Select) {
        this.rightList.push(item);
      } else {
        this.leftList.push(item);
      }
    });
  }
  //勾选动作
  handleChange(event) {
    let item = Number(event.target.value);
    let items = this.state.value.slice();
    let index = items.indexOf(item);
    index === -1 ? items.push(item) : items.splice(index, 1);
    this.selectedCount(items);
    this.setState({ value: items });
  }
  //修改勾选计数
  selectedCount(items) {
    this.leftData = 0;
    this.rightData = 0;
    let datas = this.props.config.data;
    for (let i = 0; i < items.length; i++) {
      for (let j = 0; j < datas.length; j++) {
        if (items[i] === Number(datas[j].Id) && datas[j].Select) {
          this.rightData++;
        }
        if (items[i] === Number(datas[j].Id) && !datas[j].Select) {
          this.leftData++;
        }
      }
    }
  }
  //绑定/移除按钮
  transfer(msg) {
    let items = this.state.value.slice();
    let datas = this.props.config.data;
    let temp = items.slice();
    for (let i = 0; i < items.length; i++) {
      for (let j = 0; j < datas.length; j++) {
        if (items[i] === Number(datas[j].Id) && msg === 'toright' && !datas[j].Select) {
          datas[j].Select = true;
          temp.splice(temp.indexOf(items[i]), 1);
        }
        if (items[i] === Number(datas[j].Id) && msg === 'toleft' && datas[j].Select) {
          datas[j].Select = false;
          temp.splice(temp.indexOf(items[i]), 1);
        }
      }
    }
    this.selectedCount(temp);
    this.renderlist(this.props.config);
    this.setState({
      value: temp,
      leftKeyword: '',
      rightKeyword: '',
    });
  }
  //关闭模态框
  dismiss() {
    appEvents.emit('hide-modal');
  }
  //确认保存
  confirmSave() {
    let datas = this.props.config.data;
    let selected = [];
    datas.map(data => {
      if (data.Select) {
        selected.push(data);
      }
    });
    this.props.config.saveFunc(selected);
  }
  //搜索框
  search(list, msg, e) {
    let keywords = e.target.value;
    let len = list.length;
    for (let i = 0; i < len; i++) {
      let name = list[i].props.children[0].props.name;
      let key = list[i].key;
      if (name.indexOf(keywords) === -1) {
        list[i] = (
          <label key={key} className="labelHide">
            <input type="checkbox" name={name} value={key} onChange={this.handleChange} />
            <span />
            <span className="itemover"> {name}</span>
          </label>
        );
      } else {
        list[i] = (
          <label key={key} className="labelShow">
            <input type="checkbox" name={name} value={key} onChange={this.handleChange} />
            <span />
            <span className="itemover"> {name}</span>
          </label>
        );
      }
    }
    if (msg === 'left') {
      this.setState({
        leftKeyword: keywords,
      });
    } else {
      this.setState({
        rightKeyword: keywords,
      });
    }
    // this.forceUpdate();
  }

  render() {
    return (
      <div className="switchSelect modal-body">
        <div className="modal-header">
          <h2 className="modal-header-title">
            <span className="p-l-1">{this.props.config.title}</span>
          </h2>

          <a className="modal-header-close" onClick={this.dismiss}>
            <i className="fa fa-remove" />
          </a>
        </div>
        <div className="modal-content">
          <div className="blockStyle">
            <div className="subtitel">
              <span className={this.leftData > 0 ? '' : 'labelHide'}>已选:{this.leftData}</span>
              <span className="sub">{this.props.config.leftSubTitle}</span>
            </div>
            <div className="search">
              <input
                onChange={this.search.bind(this, this.leftList, 'left')}
                value={this.state.leftKeyword}
                placeholder="请输入搜索内容"
              />
            </div>
            <div className="list">{this.leftList}</div>
          </div>
          <div className="middleblock">
            <button onClick={this.transfer.bind(this, 'toright')}>{this.props.config.toRightBtn + ' >'}</button>
            <button onClick={this.transfer.bind(this, 'toleft')}>{'< ' + this.props.config.toLeftBtn}</button>
          </div>
          <div className="blockStyle">
            <div className="subtitel">
              <span className={this.rightData > 0 ? '' : 'labelHide'}>已选:{this.rightData}</span>
              <span className="sub">{this.props.config.rightSubTitle}</span>
            </div>
            <div className="search">
              <input
                onChange={this.search.bind(this, this.rightList, 'right')}
                value={this.state.rightKeyword}
                placeholder="请输入搜索内容"
              />
            </div>
            <div className="list">{this.rightList}</div>
          </div>
        </div>
        <div className="modal-footer gf-form-button-row">
          <button type="button" className="btn btn-cancel" onClick={this.dismiss}>
            取消
          </button>
          <button type="button" className="btn btn-confirm" onClick={this.confirmSave}>
            确定
          </button>
        </div>
      </div>
    );
  }
}
