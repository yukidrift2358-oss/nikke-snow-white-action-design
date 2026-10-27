/* DEF · 15 类问题 × 30 参数 关联度热力图渲染脚本 */
(function () {
  var dom = document.getElementById('def_issue_param_map');
  if (!dom || typeof echarts === 'undefined') return;

  // 读 CSS 变量，失败则回退默认色
  function cssVar(name, fallback) {
    try {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fallback;
    } catch (e) { return fallback; }
  }
  var cBg2   = cssVar('--bg2',   '#EEF2FF');
  var cAcc2  = cssVar('--accent2','#A5B4FC');
  var cAcc   = cssVar('--accent', '#6366F1');
  var cDeep  = cssVar('--deep-accent', '#4338CA');

  // 15 类问题（行）
  var issues = [
    'Q01 快速点射漏发',
    'Q02 闪避后摇连不上普攻',
    'Q03 大招爆发帧感觉空',
    'Q04 换弹取消误触',
    'Q05 开镜 FOV 跳变突兀',
    'Q06 命中反馈太弱/太强',
    'Q07 普攻 5 段断连',
    'Q08 满蓄击发震屏失衡',
    'Q09 3A 体术衔接僵硬',
    'Q10 同帧双按键优先级错乱',
    'Q11 死亡倒地动作异常',
    'Q12 远程→近战距离切换卡顿',
    'Q13 技能 Cancel 窗口过大/过小',
    'Q14 输入丢弃率异常偏高',
    'Q15 Startup/Recovery 帧体感不对'
  ];

  // 30 参数编号（列） P01~P30
  var params = [];
  for (var i = 1; i <= 30; i++) {
    params.push('P' + (i < 10 ? '0' + i : i));
  }

  // 15 x 30 关联度矩阵 (0=无 1=低 2=中 3=高)
  // 行：Q01-Q15，列：P01-P30
  // P01~P07 = 输入缓冲；P08~P19 = Cancel 窗口 12 链路；P20~P27 = Startup/Recovery 8 段；P28 = HitStop 综合；P29 = FOV；P30 = 震屏综合
  var dataMatrix = [
    // Q01 快速点射漏发 -> 重点：输入缓冲 P01-P07 + 普攻 Cancel P08-P11
    [3,3,3,2,2,1,1, 3,3,2,2,1,1,0,0,0,0,0,0, 1,1,0,0,0,0,0,0,0, 1,0],
    // Q02 闪避后摇连不上普攻 -> 闪避 Cancel P14 + 普攻链路 + Startup/Recovery
    [1,1,2,2,1,0,0, 2,2,2,2,2,2,3,3,2,1,1,1, 3,3,2,1,1,1,1,1,1, 1,1],
    // Q03 大招爆发帧感觉空 -> 大招 Cancel P18/P19 + HitStop + 震屏 + FOV
    [0,0,0,1,1,1,2, 1,1,1,1,1,1,2,2,2,2,3,3, 2,2,2,2,2,2,2,2,3, 3,3],
    // Q04 换弹取消误触 -> 换弹 Cancel P15/P16 + 输入缓冲
    [2,2,2,2,2,1,0, 2,2,2,3,3,3,2,2,3,3,1,1, 1,1,1,1,1,1,1,1,2, 1,1],
    // Q05 开镜 FOV 跳变突兀 -> FOV P29 + 开镜 Cancel
    [0,0,0,0,0,0,0, 0,0,0,1,1,1,0,0,0,0,1,1, 1,1,1,2,2,2,2,2,1, 3,2],
    // Q06 命中反馈太弱/太强 -> HitStop P28 + 震屏 P30 + FOV P29
    [0,0,0,0,1,1,1, 1,1,1,1,1,1,1,1,1,1,2,2, 1,1,1,1,1,1,1,1,3, 2,3],
    // Q07 普攻 5 段断连 -> 输入缓冲 + 普攻 Cancel 链路 P08-P12
    [3,2,2,2,2,1,1, 3,3,3,3,3,2,1,1,1,1,1,1, 2,2,1,1,1,1,1,1,1, 1,1],
    // Q08 满蓄击发震屏失衡 -> 震屏 P30 + 满蓄 Cancel P17 + HitStop
    [0,0,0,0,0,1,1, 0,0,0,1,1,1,0,0,0,3,2,2, 1,1,1,1,2,2,2,2,2, 2,3],
    // Q09 3A 体术衔接僵硬 -> Cancel P12-P13 + Startup/Recovery
    [1,1,1,1,1,1,0, 1,1,2,2,3,3,2,2,1,1,1,1, 3,3,3,2,2,2,2,2,1, 1,1],
    // Q10 同帧双按键优先级错乱 -> 输入缓冲 + Cancel 综合
    [2,2,2,2,2,2,1, 2,2,2,2,2,2,2,2,2,2,2,2, 1,1,1,1,1,1,1,1,1, 1,1],
    // Q11 死亡倒地动作异常 -> FSM 相关 + Cancel Late
    [0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1,1,1,2,2, 2,2,2,2,3,3,3,3,2, 1,1],
    // Q12 远程→近战切换卡顿 -> Startup/Recovery 段 + Cancel
    [0,0,1,1,1,0,0, 1,1,1,1,2,2,2,2,1,1,1,1, 3,3,3,3,3,3,2,2,1, 1,1],
    // Q13 技能 Cancel 窗口过大/过小 -> 技能 Cancel P14-P19 综合
    [0,0,0,1,1,1,1, 2,2,2,2,2,2,3,3,3,3,3,3, 2,2,2,1,1,1,1,1,2, 1,1],
    // Q14 输入丢弃率异常偏高 -> 输入缓冲 P01-P07 核心
    [3,3,3,3,3,2,2, 2,2,1,1,1,1,1,1,1,1,1,1, 1,1,0,0,0,0,0,0,0, 0,0],
    // Q15 Startup/Recovery 帧体感不对 -> P20~P27 8 段核心
    [1,1,1,1,1,1,1, 2,2,2,2,2,2,2,2,2,2,2,2, 3,3,3,3,3,3,3,3,2, 1,2]
  ];

  // 扁平化为 [x, y, value]
  var seriesData = [];
  for (var y = 0; y < issues.length; y++) {
    for (var x = 0; x < params.length; x++) {
      seriesData.push([x, y, dataMatrix[y][x]]);
    }
  }

  var option = {
    renderer: 'svg',
    animation: false,
    tooltip: {
      show: true,
      appendToBody: true,
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: cAcc,
      borderWidth: 1,
      textStyle: { color: '#1F2937', fontSize: 12 },
      formatter: function (p) {
        if (!p || !p.data) return '';
        var x = p.data[0], y = p.data[1], v = p.data[2];
        var level = ['无关联', '低关联', '中关联', '高关联'][v] || '-';
        return '<b>' + issues[y] + '</b><br/>参数：' + params[x] +
               '<br/>关联度：<b style="color:' + [cBg2,cAcc2,cAcc,cDeep][v] + '">' + v + ' / ' + level + '</b>';
      }
    },
    grid: { left: 150, right: 40, top: 50, bottom: 80 },
    xAxis: {
      type: 'category',
      data: params,
      splitArea: { show: true },
      axisLabel: { color: '#374151', fontSize: 10, rotate: 0 },
      axisLine: { lineStyle: { color: '#9CA3AF' } }
    },
    yAxis: {
      type: 'category',
      data: issues,
      splitArea: { show: true },
      axisLabel: { color: '#374151', fontSize: 11 },
      axisLine: { lineStyle: { color: '#9CA3AF' } }
    },
    visualMap: {
      min: 0,
      max: 3,
      calculable: false,
      orient: 'horizontal',
      left: 'center',
      bottom: 10,
      itemWidth: 14,
      itemHeight: 280,
      text: ['高(3)', '无(0)'],
      textStyle: { color: '#374151', fontSize: 11 },
      inRange: {
        color: [cBg2, cAcc2, cAcc, cDeep]
      },
      formatter: function (v) { return Math.round(v); }
    },
    series: [{
      name: '问题-参数关联度',
      type: 'heatmap',
      data: seriesData,
      label: {
        show: true,
        fontSize: 10,
        fontWeight: 600,
        color: '#111827',
        formatter: function (p) { return p.data[2]; }
      },
      itemStyle: {
        borderWidth: 1,
        borderColor: '#FFFFFF'
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(99,102,241,0.45)'
        }
      }
    }]
  };

  var chart = echarts.init(dom, null, { renderer: 'svg' });
  chart.setOption(option);

  // resize 监听
  function onResize() { chart.resize(); }
  if (window.addEventListener) window.addEventListener('resize', onResize);
  else if (window.attachEvent) window.attachEvent('onresize', onResize);
})();
