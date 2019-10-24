const reportMap = [
  // 结算一览
  {
    key: '0',
    name: 'Statenebt View（结算一览）',
    selectName: '结算一览',
    checked: false,
    downLoading: false,
    enable: true,
    selectTime: true,
    time: '',
    allTime: '',
    // url: 'https://{{host}}/payments/reports/statement/details'
    url: `https://{{host}}/gp/payments-account/past-settlements.html?pageSize=10&startDate={{start}}&endDate={{end}}&Search=`

  },
  // 交易一览
  {
    key: '1',
    name: 'Transaction View（交易一览）',
    selectName: '交易一览',
    checked: false,
    downLoading: false,
    enable: true,
    selectTime: true,
    time: '',
    allTime: '',
    // 订单付款选项
    url: 'https://{{host}}/gp/payments-account/view-transactions.html?searchLanguage=zh_CN&view=filter&eventType=&subview=dateRange&startDate={{start}}&endDate={{end}}&Update=&pageSize=Ten&mostRecentLast=0'
  },
  // 所有结算
  {
    key: '2',
    name: 'All Statements（所有结算）',
    selectName: '所有结算',
    checked: false,
    downLoading: false,
    enable: true,
    selectTime: true,
    time: '',
    allTime: '',
    // end: moment().format('YY-MM-DD') start: moment().subtract(90,'days').format('YY-MM-DD') 90天前至今天
    url: `https://{{host}}/gp/payments-account/past-settlements.html?pageSize=10&startDate={{start}}&endDate={{end}}&Search=`
  },
  // 日期范围报告
  {
    key: '3',
    name: 'Date Range Reports（日期范围报告）',
    selectName: '日期范围报告',
    checked: false,
    downLoading: false,
    enable: true,
    selectTime: true,
    time: '',
    allTime: '',
    reportType: [
      {
        name: '汇总',
        state: true
      },
      {
        name: '交易',
        state: true
      }
    ],
    url: 'https://{{host}}/payments/reports/custom/request'
  },
  {
    key: '4',
    name: '亚马逊库存',
    selectName: '亚马逊库存',
    checked: false,
    downLoading: false,
    enable: true,
    selectTime: false,
    time: '',
    allTime: '',
    url: 'https://{{host}}/gp/ssof/reports/search.html#recordType=AFNInventoryReport'
  },
  {
    key: '5',
    name: '亚马逊每日库存历史记录',
    selectName: '亚马逊每日库存',
    checked: false,
    downLoading: false,
    enable: true,
    selectTime: true,
    time: '',
    allTime: '',
    url: 'https://{{host}}/gp/ssof/reports/search.html#recordType=INVENTORY_SNAPSHOT'
  },
  {
    key: '6',
    name: '亚马逊每月库存历史记录',
    selectName: '亚马逊每月库存',
    checked: false,
    downLoading: false,
    enable: true,
    selectTime: true,
    time: '',
    allTime: '',
    url: 'https://{{host}}/gp/ssof/reports/search.html#recordType=INVENTORY_MONTHLY_SNAPSHOT'
  },
  {
    key: '7',
    name: '亚马逊货龄',
    selectName: '亚马逊货龄',
    checked: false,
    downLoading: false,
    enable: true,
    selectTime: false,
    time: '',
    allTime: '',
    url: 'https://{{host}}/gp/ssof/reports/search.html#recordType=INVENTORY_AGE'
  }
];

export default reportMap;
