遗留问题
滚动选择时分时，如何将点击将选择项置顶

优化问题
同一页面多个组件使用时，点击其中一个隐藏另外一个已展开面板
现有方法:
 使用e.nativeEvent.stopImmediatePropagation();将组建内所有点击事件禁止冒泡到document
 在togglePanel函数(打开关闭面板)中利用class 获取全部打开面板，
 使用setAttribute更改class,使面板全部关闭
```
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
```
是否有其他方案

已优化
利用findDOMNode找到组件的DOM node,使用contains判断e.target是否是当前组件子元素,如果不是则关闭面板
```
import { findDOMNode } from 'react-dom';
  togglePanel() {
    this.props.config.data = this.getResult();
    this.setState({
      showPanel: !this.state.showPanel,
      status: this.format.includes('YYYY') ? 'date' : 'time',
    });
  }

  //点击选择面板之外的地方，关闭面板
  closePanel(e) {
    if (!findDOMNode(this.refs.dateTime).contains(e.target)) {
      this.props.config.data = this.getResult();
      this.setState({
        showPanel: false,
      });
    }
  }
  componentDidMount() {
    document.addEventListener('click', this.closePanel, false);
  }
 render() {
    return (<div className="dateTime" ref="dateTime">
    ...
    </div>
    )}
```


各种选择界面
![time.png](time.png)
![day.png](day.png)
![month.png](month.png)
![year.png](year.png)
![yearPeriod.png](yearPeriod.png)

使用对象：运维/开发人员用的 监控服务器
系统层基础数据监控
功能一：展示云平台上虚拟机的一些性能指标比如，cpu使用率，磁盘，I/O,网络使用情况
功能二：用来配置告警和展示告警，

业务层 只是指标不同，url能否访问,端口监控（能否正常启动)，
功能三：针对一定实际业务指标进行监控和展示
2000-》4/5000多台机，每台机100+指标，总指标上十万，每10秒采集一次，自动发现上报
招商局最大IT监控平台