import React, { Component } from 'react';
import { observer } from 'mobx-react';
import Store from './store';
import ListStore from './ChooseList/store';
import { Spin } from 'antd';
import ChooseList from './ChooseList';
import style from './style.scss';

@observer
class Report extends Component {
  store: Store;
  listStore: ListStore;
  constructor(props) {
    super(props);
    this.store = new Store();
    this.listStore = new ListStore();
  }

  openFolder = () => {
    chrome.downloads.showDefaultFolder();
  };

  render() {
    const { isDownLoading, downError, downErrorMsg, runStatus, reportLoading } = this.listStore;
    return (
      <Spin spinning={reportLoading} tip="加载中...">
        <div className={style.box}>
          <div className={style.title}>
            <img src={require('./img/icon_24.png')} />
            <span>ShopReport</span>
          </div>
          <div className={style.tips}>请先登录亚马逊卖家后台，再执行插件</div>

          <ChooseList store={this.listStore} />

          <div className={style.footer}>
            <div className={style.progressTitle}>
              <img src={require('./img/progress.png')} />
              <span>进度提醒</span>
            </div>
            <div>
              {isDownLoading ? (
                <div className={style.progress}>
                  <img src={require('./img/loading.gif')} />
                  <span>loading...</span>
                </div>
              ) : !runStatus.alreadyComplete ? (
                !downError ? (
                  <div className={style.noTask}>
                    <span>暂无任务</span>
                  </div>
                ) : (
                  <div className={style.noTask}>
                    <span className={style.error}>
                      {downErrorMsg}
                    </span>
                  </div>
                )
              ) : (
                <div className={style.progress}>
                  <img
                    className={style.success}
                    src={require('./img/success.png')}
                  />
                  <span>上传完毕，部分选择日期无数据，请核实</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Spin>
    );
  }
}

export default Report;
