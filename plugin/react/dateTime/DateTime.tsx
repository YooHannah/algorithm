/*
 * @Author: YooHannah
 * @Date: 2018-06-04 09:45:54
 * @Last Modified by: YooHannah
 * @Last Modified time: 2018-06-04 15:58:45
 */
import React from 'react';

export interface DateTimeProps {
  config: any;
  /**
   * 参数配置说明：
   * data:最终选择数据，为空时，默认初始化为此时此刻
   * confirmFunc:确认按钮回调函数
   * format:日期格式，目前仅支持:'YYYY-MM-DD HH:MM:SS','YYYY-MM-DD HH:MM','HH:MM','HH:MM:SS'
   * 功能按钮说明：
   * 日期面板：单个尖括号可前后移动一个月，双尖括号可前后移动一年，点击标题年份跳转年份选择面板，点击标题月份跳转月份选择面板，点击具体日期纯选择不跳转
   * 月份面板：双尖括号可前后移动一年，点击标题年份跳转年份选择面板，点击具体月份跳转日期选择面板
   * 年份面板：双尖括号可前后移动十年，点击标题年份范围跳转年份范围选择面板，点击具体年份跳转月份份选择面板
   * 年份范围面板：双尖括号可前后移动100年，点击具体年份范围跳转年份选择面板
   */
}
export default class DateTime extends React.Component<DateTimeProps, any> {
  weekTab: any;
  format: any;
  constructor(props) {
    super(props);
    this.format = this.props.config.format.toUpperCase();
    this.state = this.initConfig();
    this.weekTab = (
      <div key="-1">
        <div className="daySize">
          <span className="otherRange">日</span>
        </div>
        <div className="daySize">
          <span className="otherRange">一</span>
        </div>
        <div className="daySize">
          <span className="otherRange">二</span>
        </div>
        <div className="daySize">
          <span className="otherRange">三</span>
        </div>
        <div className="daySize">
          <span className="otherRange">四</span>
        </div>
        <div className="daySize">
          <span className="otherRange">五</span>
        </div>
        <div className="daySize">
          <span className="otherRange">六</span>
        </div>
      </div>
    );
    this.props.config.data = this.getResult();
    this.togglePanel = this.togglePanel.bind(this);
    this.changeContent = this.changeContent.bind(this);
    this.getDateList = this.getDateList.bind(this);
    this.getYearPeriod = this.getYearPeriod.bind(this);
    this.getOptions = this.getOptions.bind(this);
    this.confirmPanel = this.confirmPanel.bind(this);
    this.changePanel = this.changePanel.bind(this);
    this.getResult = this.getResult.bind(this);
    this.closePanel = this.closePanel.bind(this);
  }
  //初始化state
  initConfig() {
    let obj = null;
    let data = this.props.config.data;
    let year = new Date().getFullYear();
    let month = new Date().getMonth() + 1;
    let day = new Date().getDate();
    let hour = String(new Date().getHours());
    let minute = String(new Date().getMinutes());
    let second = String(new Date().getSeconds());
    hour = Number(hour) < 10 ? '0' + hour : hour;
    minute = Number(minute) < 10 ? '0' + minute : minute;
    second = Number(second) < 10 ? '0' + second : second;
    if (data) {
      //如果有传值
      obj = {
        showPanel: false,
        status: this.format.includes('YYYY') ? 'date' : 'time',
        currentYear: this.format.includes('YYYY') ? Number(data.slice(0, 4)) : year,
        currentMonth: this.format.includes('MM') ? Number(data.slice(5, 7)) : month,
        currentDay: this.format.includes('DD') ? Number(data.slice(8, 10)) : day,
        currentHour: this.format.includes('YYYY') ? data.slice(11, 13) : data.slice(0, 2),
        currentMinute: this.format.includes('YYYY') ? data.slice(14, 16) : data.slice(3, 5),
        currentSecond: this.format.includes('YYYY') ? data.slice(18, 20) : data.slice(6, 8),
      };
    } else {
      //如果没传值,默认此时此刻
      obj = {
        showPanel: false,
        status: this.format.includes('YYYY') ? 'date' : 'time',
        currentYear: year,
        currentMonth: month,
        currentDay: day,
        currentHour: hour,
        currentMinute: minute,
        currentSecond: second,
      };
    }
    return obj;
  }
  //组装列表
  renderList(type, cols, groups, callback, pickedVal) {
    let list = [];
    let classPre = '';
    if (type === 'day') {
      list.push(this.weekTab);
      classPre = 'daySize mousehover';
    }
    if (type === 'month') {
      classPre = 'monthSize mousehover';
    }
    if (type === 'year') {
      classPre = 'yearSize mousehover';
    }
    if (type === 'yearPeriod') {
      classPre = 'yearPeriodSize mousehover';
    }
    for (let index = 0; index < groups.length; index += cols) {
      let tempList = [];
      for (let i = 0; i < cols; i++) {
        let count = index + i;
        let group = groups[count];
        let classStr = '';
        if (type !== 'month') {
          if (group.current === 'current' && group.id === pickedVal) {
            classStr = 'picked';
          }
          if (group.current !== 'current') {
            classStr = 'otherRange';
          }
        }
        if (type === 'month' && group.id === pickedVal) {
          classStr = 'picked';
        }
        tempList.push(
          <div className={classPre} key={count} onClick={callback.bind(this, group)}>
            <span className={classStr}>{group.name}</span>
          </div>
        );
      }
      list.push(<div key={index}>{tempList}</div>);
    }
    return <div className="selector">{list}</div>;
  }
  //构建日期选择面板
  getDateList() {
    let currentMonthDays = new Date(this.state.currentYear, this.state.currentMonth, 0).getDate();
    let firstDayWeek = new Date(this.state.currentYear + '/' + this.state.currentMonth + '/1').getDay();
    let lastDayWeek = new Date(
      this.state.currentYear + '/' + this.state.currentMonth + '/' + currentMonthDays
    ).getDay();
    let preMonthDays = 0;
    if (this.state.currentMonth === 1) {
      preMonthDays = new Date(this.state.currentYear - 1, 12, 0).getDate();
    } else {
      preMonthDays = new Date(this.state.currentYear, this.state.currentMonth - 1, 0).getDate();
    }
    let nextMonthDays = 6 - lastDayWeek;
    let days = [];
    //本月天数
    for (let i = 0; i < currentMonthDays; i++) {
      days.push({
        name: i + 1,
        id: i + 1,
        current: 'current',
      });
    }
    //下个月补足
    for (let m = 0; m < nextMonthDays; m++) {
      days.push({
        name: m + 1,
        id: m + 1,
        current: 'next',
      });
    }
    //上个月补足
    for (let j = preMonthDays; j > preMonthDays - firstDayWeek; j--) {
      days.unshift({
        name: j,
        id: j,
        current: 'last',
      });
    }
    return this.renderList('day', 7, days, this.dayClick, this.state.currentDay);
  }
  //获取月份面板
  getMonthList() {
    let groups = [];
    for (let i = 1; i < 13; i++) {
      groups.push({
        name: i + '月',
        id: i,
      });
    }
    return this.renderList('month', 3, groups, this.monthClick, this.state.currentMonth);
  }
  //获取年份面板
  getYearList() {
    let { startYear, endYear } = this.getYearPeriod();
    let groups = [];
    for (let i = startYear; i <= endYear; i++) {
      groups.push({
        name: i,
        id: i,
        current: 'current',
      });
    }
    groups.push({
      name: endYear + 1,
      id: endYear + 1,
      current: 'next', //下一个10年
    });
    groups.unshift({
      name: startYear - 1,
      id: startYear - 1,
      current: 'last', //上一个10年
    });
    return this.renderList('year', 3, groups, this.yearClick, this.state.currentYear);
  }
  //获取年份范围选择面板
  getYearPeriodList() {
    let { startYear, endYear } = this.getYearPeriod();
    let groups = [];
    for (let i = startYear; i <= endYear; i += 10) {
      groups.push({
        name: i + '-' + (i + 9),
        id: i,
        current: 'current',
      });
    }
    groups.push({
      name: endYear + 10 + '-' + (endYear + 20),
      id: endYear + 10,
      current: 'next', //下一个100年
    });
    groups.unshift({
      name: startYear - 10 + '-' + (startYear - 1),
      id: startYear - 10,
      current: 'last', //上一个100年
    });
    return this.renderList('yearPeriod', 3, groups, this.yearPeriodClick, startYear);
  }
  //获取时间选择面板
  getTimeList() {
    let hours = [];
    for (let i = 0; i < 24; i++) {
      let str = i < 10 ? '0' + i : i;
      hours.push(
        <div
          key={i}
          onClick={this.timeClick.bind(this, 'hours', str)}
          className={this.state.currentHour === str ? 'point active' : 'point'}
        >
          {str}
        </div>
      );
    }
    let minutes = [];
    let seconds = [];
    for (let i = 0; i < 60; i++) {
      let str = i < 10 ? '0' + i : i;
      minutes.push(
        <div
          key={i}
          onClick={this.timeClick.bind(this, 'minutes', str)}
          className={this.state.currentMinute === str ? 'point active' : 'point'}
        >
          {str}
        </div>
      );
      seconds.push(
        <div
          key={i}
          onClick={this.timeClick.bind(this, 'seconds', str)}
          className={this.state.currentSecond === str ? 'point active' : 'point'}
        >
          {str}
        </div>
      );
    }
    return (
      <div className="timeSelector">
        <div className="layout">{hours}</div>
        <div className="layout">{minutes}</div>
        <div className={this.format.includes('SS') ? 'layout' : 'hideDom'}>{seconds}</div>
      </div>
    );
  }
  //点击某一天
  dayClick(day, e) {
    e.nativeEvent.stopImmediatePropagation();
    if (day.current === 'current') {
      this.setState({
        currentDay: day.id,
      });
    }
    if (day.current === 'last') {
      if (this.state.currentMonth === 1) {
        this.setState({
          currentDay: day.id,
          currentMonth: 12,
          currentYear: this.state.currentYear - 1,
        });
      } else {
        this.setState({
          currentDay: day.id,
          currentMonth: this.state.currentMonth - 1,
        });
      }
    }
    if (day.current === 'next') {
      if (this.state.currentMonth === 12) {
        this.setState({
          currentDay: day.id,
          currentMonth: 1,
          currentYear: this.state.currentYear + 1,
        });
      } else {
        this.setState({
          currentDay: day.id,
          currentMonth: this.state.currentMonth + 1,
        });
      }
    }
  }
  //月份点击
  monthClick(month, e) {
    e.nativeEvent.stopImmediatePropagation();
    this.setState({
      currentMonth: month.id,
      status: 'date',
    });
  }
  //点击年份
  yearClick(year, e) {
    e.nativeEvent.stopImmediatePropagation();
    if (year.current === 'current') {
      this.setState({
        currentYear: year.id,
        status: 'month',
      });
    }
    if (year.current === 'last') {
      this.setState({
        currentYear: year.id,
        status: 'year',
      });
    }
    if (year.current === 'next') {
      this.setState({
        currentYear: year.id,
        status: 'year',
      });
    }
  }
  //年份范围选择
  yearPeriodClick(decade, e) {
    e.nativeEvent.stopImmediatePropagation();
    this.setState({
      currentYear: decade.id,
      status: 'year',
    });
  }
  //时分秒点击选择
  timeClick(type, val, e) {
    e.nativeEvent.stopImmediatePropagation();
    if (type === 'hours') {
      this.setState({
        currentHour: val,
      });
    }
    if (type === 'minutes') {
      this.setState({
        currentMinute: val,
      });
    }
    if (type === 'seconds') {
      this.setState({
        currentSecond: val,
      });
    }
  }
  //计算年份范围
  getYearPeriod() {
    let prefix, startYear, endYear;
    if (this.state.status === 'yearPeriod') {
      prefix = parseInt(String(this.state.currentYear / 100));
      startYear = Number(prefix + '00');
      endYear = Number(prefix + '99');
    } else {
      prefix = parseInt(String(this.state.currentYear / 10));
      startYear = Number(prefix + '0');
      endYear = Number(prefix + '9');
    }
    return {
      yearPeriod: startYear + '-' + endYear,
      startYear: startYear,
      endYear: endYear,
    };
  }
  //前后移动月份
  monthMove(val, e) {
    e.nativeEvent.stopImmediatePropagation();
    if (val) {
      //移到下个月
      if (this.state.currentMonth === 12) {
        this.setState({
          currentMonth: 1,
          currentYear: this.state.currentYear + 1,
        });
      } else {
        this.setState({
          currentMonth: this.state.currentMonth + 1,
        });
      }
    } else {
      //移到上个月
      if (this.state.currentMonth === 1) {
        this.setState({
          currentMonth: 12,
          currentYear: this.state.currentYear - 1,
        });
      } else {
        this.setState({
          currentMonth: this.state.currentMonth - 1,
        });
      }
    }
  }
  //前后移动年份
  yearMove(val, e) {
    e.nativeEvent.stopImmediatePropagation();
    if (this.state.status === 'date' || this.state.status === 'month') {
      if (val) {
        this.setState({
          currentYear: this.state.currentYear + 1,
        });
      } else {
        this.setState({
          currentYear: this.state.currentYear - 1,
        });
      }
    }
    if (this.state.status === 'year') {
      if (val) {
        this.setState({
          currentYear: this.state.currentYear + 10,
        });
      } else {
        this.setState({
          currentYear: this.state.currentYear - 10,
        });
      }
    }
    if (this.state.status === 'yearPeriod') {
      if (val) {
        this.setState({
          currentYear: this.state.currentYear + 100,
        });
      } else {
        this.setState({
          currentYear: this.state.currentYear - 100,
        });
      }
    }
  }
  //打开/关闭面板
  togglePanel(e) {
    e.nativeEvent.stopImmediatePropagation();
    let doms = document.getElementsByClassName('panelOption');
    for (let i = 0; i < doms.length; i++) {
      doms[i].setAttribute('class', 'hideDom');
    }
    this.props.config.data = this.getResult();
    this.setState({
      showPanel: !this.state.showPanel,
      status: this.format.includes('YYYY') ? 'date' : 'time',
    });
  }
  //时间选择面板与年月日面板切换
  changeContent(e) {
    e.nativeEvent.stopImmediatePropagation();
    if (this.state.status === 'time') {
      this.setState({
        status: 'date',
      });
    } else {
      this.setState({
        status: 'time',
      });
    }
  }
  //点击标题 切换选择面板
  changePanel(val, e) {
    e.nativeEvent.stopImmediatePropagation();
    this.setState({
      status: val,
    });
  }
  //根据状态获取相应选择面板
  getOptions() {
    if (this.state.status === 'date') {
      return this.getDateList();
    } else if (this.state.status === 'time') {
      return this.getTimeList();
    } else if (this.state.status === 'month') {
      return this.getMonthList();
    } else if (this.state.status === 'year') {
      return this.getYearList();
    } else {
      return this.getYearPeriodList();
    }
  }
  //根据日期时间格式组装最终结果
  getResult() {
    let str = this.state.currentYear + '-' + this.state.currentMonth + '-' + this.state.currentDay;
    if (this.format === 'YYYY-MM-DD HH:MM:SS') {
      str = str + ' ' + this.state.currentHour + ':' + this.state.currentMinute + ':' + this.state.currentSecond;
    } else if (this.format === 'YYYY-MM-DD HH:MM') {
      str = str + ' ' + this.state.currentHour + ':' + this.state.currentMinute;
    } else if (this.format === 'HH:MM') {
      str = this.state.currentHour + ':' + this.state.currentMinute;
    } else if (this.format === 'HH:MM:SS') {
      str = this.state.currentHour + ':' + this.state.currentMinute + ':' + this.state.currentSecond;
    }
    return str;
  }
  //确定按钮，引发回调
  confirmPanel(e) {
    e.nativeEvent.stopImmediatePropagation();
    let picked = this.getResult();
    this.setState({
      showPanel: false,
    });
    this.props.config.data = picked;
    if (this.props.config.confirmFunc) {
      this.props.config.confirmFunc(picked);
    }
  }
  //点击选择面板之外的地方，关闭面板
  closePanel(e) {
    this.props.config.data = this.getResult();
    this.setState({
      showPanel: false,
    });
  }
  componentDidMount() {
    document.addEventListener('click', this.closePanel, false);
  }
  componentWillUnmount() {
    document.removeEventListener('click', this.closePanel, false);
  }
  render() {
    return (
      <div className="dateTime" ref="dateTime">
        <div className="dateBtn" onClick={this.togglePanel}>
          <span className="titleS">{this.getResult()}</span>
          <i className="fa fa-calendar iconS" />
        </div>
        <div className={this.state.showPanel ? 'panelOption' : 'hideDom'}>
          <div className="header">
            <a
              className={this.state.status === 'time' ? 'hideDomShow' : 'movebtn leftbtn1'}
              onClick={this.yearMove.bind(this, false)}
            >
              <i className="fa fa-chevron-left" />
              <i className="fa fa-chevron-left" />
            </a>
            <a
              onClick={this.monthMove.bind(this, false)}
              className={this.state.status === 'date' ? 'movebtn leftbtn2' : 'hideDomShow'}
            >
              <i className="fa fa-chevron-left" />
            </a>
            <span className={this.state.status === 'date' ? 'movebtn' : 'hideDom'}>
              <a onClick={this.changePanel.bind(this, 'year')} className="hoverColor">
                {this.state.currentYear}年
              </a>
              <a onClick={this.changePanel.bind(this, 'month')} className="hoverColor">
                {this.state.currentMonth}月
              </a>
            </span>
            <span className={this.state.status === 'month' ? 'movebtn' : 'hideDom'}>
              <a onClick={this.changePanel.bind(this, 'year')} className="hoverColor">
                {this.state.currentYear}年
              </a>
            </span>
            <span className={this.state.status === 'year' ? 'movebtn' : 'hideDom'}>
              <a onClick={this.changePanel.bind(this, 'yearPeriod')} className="hoverColor">
                {this.getYearPeriod().yearPeriod}
              </a>
            </span>
            <span className={this.state.status === 'yearPeriod' ? 'movebtn1' : 'hideDom'}>
              <span>{this.getYearPeriod().yearPeriod}</span>
            </span>
            <span className={this.state.status === 'time' ? 'movebtn1' : 'hideDom'}>
              <span>{this.getResult()}</span>
            </span>
            <a
              onClick={this.monthMove.bind(this, true)}
              className={this.state.status === 'date' ? 'movebtn rightbtn2' : 'hideDomShow'}
            >
              <i className="fa fa-chevron-right" />
            </a>
            <a
              onClick={this.yearMove.bind(this, true)}
              className={this.state.status === 'time' ? 'hideDomShow' : 'movebtn rightbtn1'}
            >
              <i className="fa fa-chevron-right" />
              <i className="fa fa-chevron-right" />
            </a>
          </div>
          <div className="content">{this.getOptions()}</div>
          <div className={this.state.status === 'time' || this.state.status === 'date' ? 'footer' : 'hideDom'}>
            <div
              onClick={this.changeContent}
              className={this.props.config.format.length > 11 ? 'btn switchbtn' : 'hideDom'}
            >
              {this.state.status === 'time' ? '选择日期' : '选择时间'}
            </div>
            <div onClick={this.confirmPanel} className="btn confirmbtb">
              确定
            </div>
          </div>
        </div>
      </div>
    );
  }
}
