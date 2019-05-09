/*
 * @Author: YooHannah
 * @Date: 2018-07-27 09:39:26
 * @Last Modified by: YooHannah
 * @Last Modified time: 2018-08-20 14:57:46
 */
import React from 'react';
import $ from 'jquery';
import appEvents from 'app/core/app_events';
export interface CustomTableProps {
  config: any;
  /**
   * 参数配置说明：
   * {
   *  thead: [
        { name: '选择', val: '', type: 'checkbox', select: true }, //勾选栏配置，select：true 用于thead th判断 设置宽度
        { name: '主机名', val: 'Exthostname', type: 'haslink' }, //带链接普通文字展示，在data每项数据中配置linkUrl属性
        { name: 'IP', val: 'Ip', type: 'nolink',width: '40%'}, //普通文字展示 width用于设置宽度，不设置平均分配
        { name: '日期', val: 'time', type: 'nolink',isSort: this.sortFunc },//按日期排序，{isSort：回调函数}不排序不设置
        { name: '操作',val: '',type: 'handle',
          btns: [{ name: '主机组', btnF: this.handelHostGroup }]   //操作栏按钮配置{name:按钮名，btnF:触发函数}
        },
      ],
      select: true,                                                       //ture显示勾选栏 false不显示
      updateF: this.getData,                                              //获取数据函数
      batchHandleConfig: [{ name: '删除', btnF: this.deleteAllItem }],    //批量操作按钮配置{name:按钮名，btnF:触发函数}
      data: [],                                                           //数据
      pageConfig: {                                                       //分页配置,不分页不配置
        totalPages: 1,//总页数
        perPage: 20,//每页条目数
        currentPage: 1,//当前第几页
      },
    };
   */
}
export default class CustomTable extends React.Component<CustomTableProps, any> {
  checkedItems: any; //勾选项集合
  start: any; //分页按钮开始页数截取位置
  end: any; //分页按钮结束页数截取位置
  selectedVal: any; //每页数据量
  config: null;
  constructor(props) {
    super(props);
    this.selectedVal = 20; //用于重置分页按钮,不能使用setstat
    this.state = {
      selectedVal: this.selectedVal,
      jumpNumber: '',
    };
    this.checkedItems = [];
    this.start = 0;
    this.end = 9;
    this.props.config.thead.map(item => {
      if (item.isSort) {
        //如果设置了排序,进行初始化,向上向下按钮都显示
        item = Object.assign(item, { up: true, down: true });
      }
    });
    this.selectChange = this.selectChange.bind(this); //更改每页条数
    this.jumpFunc = this.jumpFunc.bind(this); //页面跳转
    this.handleChange = this.handleChange.bind(this); //单行勾选
    this.handleAllChange = this.handleAllChange.bind(this); //全选按钮勾选
    appEvents.on('customtable-refreshPagination', this.refreshPagination.bind(this)); //分页按钮重置
    appEvents.on('customtable-refreshCheckbox', this.refreshCheckbox.bind(this)); //勾选清空
  }
  //渲染列表函数
  renderlist(config) {
    if (!config || config.data.length < 1) {
      return null;
    }
    let datas = config.data;
    let attrs = [];
    config.thead.map(item => {
      attrs.push(item);
    });
    if (!config.select && attrs[0].type === 'checkbox') {
      //配置了勾选，但是select为false时不显示
      attrs.shift();
    }
    let len = attrs.length;
    let listResult = [];
    for (let i = 0; i < datas.length; i++) {
      let data = datas[i];
      let tds = [];
      for (let j = 0; j < len; j++) {
        let attr = attrs[j];
        let Td;
        if (attr.type === 'handle') {
          //操作栏
          Td = (
            <td className="handle" key={j} style={attr.width ? { width: attr.width } : {}}>
              {attr.btns.map((btn, i) => (
                <a
                  onClick={e => {
                    btn.btnF(data);
                  }}
                  key={i}
                >
                  {btn.name}
                </a>
              ))}
            </td>
          );
        } else if (attr.type === 'checkbox') {
          //勾选按钮
          Td = (
            <td className="link-td selectwidth" key={j}>
              <label className="labelShow">
                <input type="checkbox" name="single" value={data.Id} onChange={this.handleChange} />
                <span />
              </label>
            </td>
          );
        } else {
          Td = (
            //一般文字显示,是否有跳转
            <td className="link-td" key={j} style={attr.width ? { width: attr.width } : {}}>
              {attr.type === 'haslink' ? <a href={data.linkUrl}>{data[attr.val]}</a> : <a>{data[attr.val]}</a>}
            </td>
          );
        }
        tds.push(Td);
      }
      listResult.push(<tr key={i}>{tds}</tr>);
    }
    //批量操作按钮，可配置多个
    let batchHandleConfig = this.props.config.batchHandleConfig;
    let batchButtons = [];
    if (batchHandleConfig) {
      for (let j = 0; j < batchHandleConfig.length; j++) {
        batchButtons.push(
          <a
            className="btn btn-cancel smallbtn"
            key={j}
            onClick={e => {
              this.batchHandle(batchHandleConfig[j].btnF);
            }}
          >
            {batchHandleConfig[j].name}
          </a>
        );
      }
    }
    //分页按钮，如果配置了分页
    let pageConfig = this.props.config.pageConfig;
    let pages = [];
    let currentPages = [];
    let pageButtons = null;
    if (pageConfig) {
      for (var i = 1; i < pageConfig.totalPages + 1; i++) {
        pages.push({ page: i, current: i === pageConfig.currentPage });
      }
      currentPages = pages.slice(this.start, this.end);
      pageButtons = (
        <ol>
          <button
            className={pageConfig.currentPage === 1 ? 'hideDom' : 'btn btn-mid btn-cancel'}
            onClick={this.navigateToPage.bind(this, pageConfig.currentPage - 1, -1)}
          >
            {' '}
            &lt;
          </button>
          {currentPages.map((page, i) => (
            <li key={i}>
              <button
                className={page.current ? 'btn btn-mid btn-confirm' : 'btn btn-mid btn-cancel'}
                onClick={this.navigateToPage.bind(this, page.page, 0)}
              >
                {page.page}
              </button>
            </li>
          ))}
          <button
            className={pageConfig.currentPage === pages.length ? 'hideDom' : 'btn btn-mid btn-cancel nextpage'}
            onClick={this.navigateToPage.bind(this, pageConfig.currentPage + 1, 1)}
          >
            {' '}
            &gt;
          </button>
          <select className="perpageselect" value={this.selectedVal} onChange={this.selectChange}>
            <option value="10">10条/页</option>
            <option value="20">20条/页</option>
            <option value="30">30条/页</option>
            <option value="40">40条/页</option>
          </select>
          <label className={pages.length > 9 ? 'jumpstyle' : 'hideDom'}>
            跳转至<input
              type="text"
              className="max-width-4 jumpinput"
              placeholder="请输入"
              value={this.state.jumpNumber}
              onChange={this.jumpFunc}
              onKeyUp={this.jumpFunc}
            />页
          </label>
          <span className={pages.length > 9 ? '' : 'hideDom'}>共{pageConfig.totalPages}页</span>
        </ol>
      );
    }
    return (
      <div className="admin-list-table">
        <table>
          <thead>
            <tr>
              {attrs.map((attr, i) => (
                <th
                  key={i}
                  className={attr.select ? 'selectwidth' : ''}
                  style={attr.width ? { width: attr.width } : {}}
                >
                  {attr.name}
                  <div className={attr.isSort ? 'thBtn' : 'hideDom'}>
                    <i
                      className={attr.up ? 'fa fa-caret-up' : 'fa fa-caret-up hideDom'}
                      onClick={e => {
                        this.handleSort(attr, 0);
                      }}
                    />
                    <i
                      className={attr.down ? 'fa fa-caret-down' : 'fa fa-caret-down hideDom'}
                      onClick={e => {
                        this.handleSort(attr, 1);
                      }}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{listResult}</tbody>
        </table>
        <div className={config.select ? 'marginTop' : 'hideDom'}>
          <label className="labelShow allchecked">
            <input type="checkbox" id="all" value="-1" onChange={this.handleAllChange} />
            <span />全选
          </label>
          {batchButtons}
        </div>
        <div className={config.pageConfig ? 'admin-list-paging' : 'hideDom'}>{pageButtons}</div>
      </div>
    );
  }
  //批量操作按钮
  batchHandle(func) {
    let list = this.checkedItems.slice();
    this.checkedItems = [];
    func(list);
  }
  //排序按钮
  handleSort(item, state) {
    if (!state) {
      //点击向上按钮
      item.up = false;
      item.down = true;
    }
    if (state) {
      //点击向下按钮
      item.up = true;
      item.down = false;
    }
    item.isSort({ state: state, basename: item.val }).then(res => {
      this.forceUpdate();
    });
  }
  //单行勾选
  handleChange(event) {
    let item = Number(event.target.value);
    let index = this.checkedItems.indexOf(item);
    index === -1 ? this.checkedItems.push(item) : this.checkedItems.splice(index, 1);
    let flag = true;
    if (event.target.checked) {
      for (let j = 0; j < this.props.config.data.length; j++) {
        let id = this.props.config.data[j].Id;
        if (this.checkedItems.indexOf(id) === -1) {
          flag = false;
        }
      }
      if (flag) {
        $('#all')[0].checked = true;
      }
    } else {
      $('#all')[0].checked = false;
    }
  }
  //全选勾选
  handleAllChange(e) {
    let all = $('#all');
    let singles = $("input[name='single']");
    if (all[0].checked) {
      for (let i = 0; i < singles.length; i++) {
        singles[i].checked = true;
      }
      for (let j = 0; j < this.props.config.data.length; j++) {
        let id = this.props.config.data[j].Id;
        if (this.checkedItems.indexOf(id) === -1) {
          this.checkedItems.push(id);
        }
      }
    } else {
      for (let i = 0; i < singles.length; i++) {
        singles[i].checked = false;
      }
      for (let j = 0; j < this.props.config.data.length; j++) {
        let id = this.props.config.data[j].Id;
        let position = this.checkedItems.indexOf(id);
        if (position !== -1) {
          this.checkedItems.splice(position, 1);
        }
      }
    }
  }
  //分页按钮
  navigateToPage(page, status) {
    if (status === 1 && this.end === page - 1) {
      this.start++;
      this.end++;
    }
    if (status === -1 && this.start === page) {
      this.start--;
      this.end--;
    }
    this.props.config.updateF(page);
  }
  //更改每页条数
  selectChange(e) {
    let value = Number(e.target.value);
    this.selectedVal = value;
    this.setState({
      selectedVal: value,
      jumpNumber: '',
    });
    this.start = 0;
    this.end = 9;
    this.props.config.pageConfig.perPage = value;
    this.props.config.pageConfig.currentPage = 1;
    this.props.config.updateF(1);
  }
  //页面跳转
  jumpFunc(e) {
    let value = Number(e.target.value);
    this.setState({
      jumpNumber: e.target.value,
    });
    if (e.keyCode === 13 && value <= this.props.config.pageConfig.totalPages && value >= 1) {
      if(value === this.props.config.pageConfig.totalPages){
        this.start = value - 9;
      }else{
        this.start = value - 5;
      }
      if (this.start < 0) {
        this.start = 0;
      }
      this.end = this.start + 9;
      this.props.config.updateF(value);
    }
  }
  //分页切换时，勾选项匹配
  componentDidUpdate() {
    if (!this.props.config.select || !$('#all').length) {
      return;
    }
    let all = $('#all');
    let singles = $("input[name='single']");
    let count = 0;
    for (let i = 0; i < singles.length; i++) {
      singles[i].checked = false;
      for (let j = 0; j < this.checkedItems.length; j++) {
        if (this.checkedItems[j] === Number(singles[i].value)) {
          singles[i].checked = true;
          count++;
        }
      }
    }
    if (count === singles.length) {
      all[0].checked = true;
    } else {
      all[0].checked = false;
    }
  }
  //分页按钮重置
  refreshPagination(perPage) {
    this.start = 0;
    this.end = 9;
    this.selectedVal = perPage ? perPage : 20;
    if ($('.jumpinput')[0]) {
      $('.jumpinput')[0].value = '';
    }
  }
  //勾选清空
  refreshCheckbox() {
    this.checkedItems = [];
    let all = $('#all');
    let singles = $("input[name='single']");
    if (singles.length < 1) {
      return;
    }
    all[0].checked = false;
    for (let i = 0; i < singles.length; i++) {
      singles[i].checked = false;
    }
  }
  componentWillUnmount() {
    appEvents.removeAllListeners('customtable-refreshPagination');
    appEvents.removeAllListeners('customtable-refreshCheckbox');
  }
  render() {
    return (
      <div className="customtable">
        {this.props.config.data && this.props.config.data.length > 0 ? (
          this.renderlist(this.props.config)
        ) : (
          <em className="muted">尚无数据</em>
        )}
      </div>
    );
  }
}
