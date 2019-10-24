import React, { Component } from 'react';
import { Button, DatePicker, Collapse, Select, Icon } from 'antd';
import moment from 'moment';
import 'moment/locale/zh-cn';
import style from './style.scss';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import Store from './store';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface IProps {
  store: Store;
}

@observer
class ChooseList extends Component<IProps> {
  constructor(props) {
    super(props);
    moment.locale('zh-cn');
  }

  disabledDate = current => {
    return current > moment().endOf('day');
  };

  render() {
    const {
      reportMap,
      isDownLoading,
      downLoad,
      cancelDownload,
      changeAllTime,
      selectItems,
      selectChange
    } = this.props.store;

    // const filteredOptions = reportMap.filter(
    //   item => !selectItems.includes(item.key)
    // );
    const downDisabled =
      !reportMap.find(item => item.allTime != '') || !selectItems.length;

    return (
      <div className={style.main}>
        <div>
          <div className={style.safeContent}>
            <span className={style.contentTitle}>请选择报表日期</span>
            {reportMap.length ? (
              <RangePicker
                className={style.datePicker}
                placeholder={['开始', '结束']}
                disabledDate={this.disabledDate}
                value={
                  reportMap[0].allTime == ''
                    ? []
                    : [
                      moment(reportMap[0].allTime[0], 'YYYY/MM/DD'),
                      moment(reportMap[0].allTime[1], 'YYYY/MM/DD')
                    ]
                }
                onChange={changeAllTime}
                format='YYYY-MM-DD'
                disabled={isDownLoading}
              />
            ) : null}
          </div>
        </div>
        <div>
          <div className={style.safeContent}>
            <span className={style.contentTitle}>请选择报表名称</span>
            <Select
              dropdownClassName={style.dropSelect}
              className={style.select}
              dropdownMenuStyle={{ maxHeight: 260 }}
              maxTagCount={1}
              mode="multiple"
              placeholder="请选择报表"
              value={toJS(selectItems)}
              onChange={selectChange}
              optionLabelProp="label"
              disabled={isDownLoading}
            >
              {reportMap.map(item => (
                <Option
                  key={item.key}
                  value={item.name}
                  label={
                    <div>
                      {item.selectName}
                      {item.downLoading ? <Icon type="loading" /> : null}
                    </div>
                  }
                >
                  {item.name}
                </Option>
              ))}
            </Select>
          </div>
          {/* 语言选择 */}
          {/* <div className={style.language}>
            <span className={style.laybel}>选择语言：</span>
            <Select defaultValue="zh_CN" className={style.selectLanguage} onChange={this.handleChange}>
              <Option value="en_US">English</Option>
              <Option value="zh_CN">中文</Option>
              <Option value="de_DE">Deutsch</Option>
              <Option value="es_ES">Español</Option>
              <Option value="fr_FR">Français</Option>
              <Option value="it_IT">Italiano</Option>
              <Option value="ja_JP">日本語</Option>
              <Option value="ko_KR">한국어</Option>
            </Select>
          </div> */}
          <div className={style.footer}>
            {/* <Button onClick={cancelDownload}>取消下载</Button> */}
            {isDownLoading ? (
              <Button type="primary" loading={true}>
                提交数据请求中...
              </Button>
            ) : downDisabled ? (
              <Button className={style.disabled} disabled={true} type="primary">
                提交数据请求
              </Button>
            ) : (
              <Button
                className={style.submit}
                type="primary"
                onClick={downLoad}
              >
                提交数据请求
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default ChooseList;
