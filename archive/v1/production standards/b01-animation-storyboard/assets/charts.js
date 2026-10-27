// assets/charts.js — B-01 动画分镜 3 张图
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent  = style.getPropertyValue('--accent').trim();   // Violet
  var accent2 = style.getPropertyValue('--accent2').trim();  // Sky
  var ink     = style.getPropertyValue('--ink').trim();
  var muted   = style.getPropertyValue('--muted').trim();
  var rule    = style.getPropertyValue('--rule').trim();
  var ok      = style.getPropertyValue('--ok').trim();
  var warn    = style.getPropertyValue('--warn').trim();
  var danger  = style.getPropertyValue('--danger').trim();
  var violet  = style.getPropertyValue('--violet').trim();

  /* =========================================================
   * Chart 1 · 31 动作 Key Pose 数量分布（堆叠条形）
   * =======================================================*/
  var c1 = echarts.init(document.getElementById('chart-kp-distribution'), null, { renderer: 'svg' });
  c1.setOption({
    animation: false,
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, appendToBody: true,
      formatter: function(p) {
        var t = p[0].axisValue + '<br/>';
        var sum = 0;
        p.forEach(function(i){ t += i.marker + i.seriesName + '：<b>' + i.value + ' 个</b><br/>'; sum += i.value; });
        t += '<hr style="border-color:'+rule+';margin:4px 0;">合计 <b>' + sum + '</b> 个 Key Pose';
        return t;
      }
    },
    legend: {
      top: 0, left: 'center',
      textStyle: { color: ink, fontSize: 12, fontWeight: 600 },
      itemWidth: 14, itemHeight: 14, itemGap: 18,
    },
    grid: { left: 150, right: 50, top: 40, bottom: 40 },
    xAxis: {
      type: 'value', name: 'KP 数', nameTextStyle: { color: muted, fontWeight: 600 },
      minInterval: 1,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontSize: 12 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: [
        '大招 U（252F 合计）', 'H-02 狙击换弹', 'D-04 死亡', 'H-01 双步枪换弹',
        'I-01 待机', 'M-01 行走', 'M-04 瞄准走', 'F-05 狙击开火',
        'F-06 满蓄狙击', 'F-08 狙击蓄力', 'F-04 形态切换', 'K-01 翻越',
        'D-03 倒地+起身', 'M-02 冲刺', 'M-05 闪避',
        'F-01 双步枪点射', 'F-07 过热', 'F-10 切回',
        'H-03 战术换弹', 'D-02 击退', 'G-01 拾取',
        'F-09 过热恢复', 'M-03 蹲下', 'D-01 受击',
        'F-02 连射', 'F-03 末发',
      ],
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false },
      axisLabel: { color: ink, fontSize: 11, fontWeight: 600 },
    },
    color: [accent, accent2, warn, ok, violet, muted],
    series: [
      { name: '基础 Pose 类',     type: 'bar', stack: 't', barWidth: 18,
        itemStyle: { borderRadius: [0,0,0,0] },
        data: [8, 5, 5, 5, 4, 6, 4, 5, 4, 4, 4, 5, 5, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2] },
      { name: '发力/命中 Pose 类', type: 'bar', stack: 't',
        itemStyle: { borderRadius: [0,0,0,0] },
        data: [6, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { name: '武器操作 Pose 类', type: 'bar', stack: 't',
        itemStyle: { borderRadius: [0,0,0,0] },
        data: [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { name: '回正/稳定 Pose 类', type: 'bar', stack: 't',
        itemStyle: { borderRadius: [0,6,6,0] },
        data: [2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    ],
  });
  window.addEventListener('resize', function() { c1.resize(); });

  /* =========================================================
   * Chart 2 · 节奏密度热力（6 类动作 × 4 节奏占比）
   * =======================================================*/
  var c2 = echarts.init(document.getElementById('chart-rhythm-heatmap'), null, { renderer: 'svg' });
  var cats = ['待机/移动', '开火点射', '换弹', '受击/死亡', '互动', '大招'];
  var rhy  = ['慢', '中', '快', '停'];
  // 每行 = [yIdx, xIdx, value%]
  var heat = [
    [0,0,65],[0,1,25],[0,2, 5],[0,3, 5], // 待机移动 慢为主
    [1,0,10],[1,1,20],[1,2,60],[1,3,10], // 开火 快为主
    [2,0,30],[2,1,50],[2,2,15],[2,3, 5], // 换弹 中为主
    [3,0,15],[3,1,20],[3,2,55],[3,3,10], // 受击 快为主
    [4,0,35],[4,1,45],[4,2,15],[4,3, 5], // 互动 中为主
    [5,0,45],[5,1,25],[5,2,18],[5,3,12], // 大招 慢+快混合
  ];
  c2.setOption({
    animation: false,
    tooltip: { appendToBody: true,
      formatter: function(p){ return p.name + '<br/>' + cats[p.value[0]] + ' × ' + rhy[p.value[1]] + '：<b>' + p.value[2] + '%</b>'; }
    },
    grid: { left: 80, right: 30, top: 30, bottom: 50 },
    xAxis: {
      type: 'category', data: rhy,
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false },
      axisLabel: { color: ink, fontSize: 12, fontWeight: 700 },
    },
    yAxis: {
      type: 'category', data: cats,
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false },
      axisLabel: { color: ink, fontSize: 12, fontWeight: 700 },
    },
    visualMap: {
      min: 5, max: 70,
      calculable: true, orient: 'horizontal',
      left: 'center', bottom: 5,
      textStyle: { color: muted, fontSize: 11, fontWeight: 600 },
      inRange: { color: ['#F5F3FF','#DDD6FE','#A78BFA',accent,violet,'#581C87'] },
    },
    series: [{
      name: '节奏占比', type: 'heatmap',
      data: heat,
      label: {
        show: true, color: '#fff',
        fontWeight: 800, fontSize: 12,
        formatter: function(p){ return p.value[2] + '%'; },
      },
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' } },
    }],
  });
  window.addEventListener('resize', function() { c2.resize(); });

  /* =========================================================
   * Chart 3 · 31 动作帧数直方图 + 红线
   * =======================================================*/
  var c3 = echarts.init(document.getElementById('chart-frame-histogram'), null, { renderer: 'svg' });
  var actions = [
    ['I-01',120],['M-01',48],['M-02',36],['M-03',24],['M-04',48],['M-05',30],
    ['F-01',14],['F-02',12],['F-03',20],['F-04',36],['F-05',48],['F-06',60],
    ['F-07',36],['F-08',120],['F-09',30],['F-10',30],
    ['H-01',90],['H-02',120],['H-03',60],
    ['D-01',18],['D-02',30],['D-03',48],['D-04',90],
    ['G-01',36],['K-01',48],
    ['U-All',252],
  ];
  c3.setOption({
    animation: false,
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, appendToBody: true,
      formatter: function(p) {
        var d = p[0];
        var isUlti = d.name === 'U-All';
        var line = isUlti ? 300 : 180;
        var diff = line - d.value;
        return d.name + '<br/>帧数：<b>' + d.value + 'F</b><br/>'
          + '红线：' + line + 'F（' + (isUlti ? '大招' : '非大招') + '）<br/>'
          + '余量：<b>' + diff + 'F</b>（' + Math.round(diff/line*100) + '%）';
      }
    },
    grid: { left: 50, right: 40, top: 30, bottom: 90 },
    xAxis: {
      type: 'category',
      data: actions.map(function(a){ return a[0]; }),
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false },
      axisLabel: {
        color: ink, fontSize: 10.5, fontWeight: 700,
        rotate: 55,
        interval: 0,
        formatter: function(v){
          return v === 'U-All' ? '{red|' + v + '}' : v;
        },
        rich: { red: { color: danger, fontWeight: 800 } },
      },
    },
    yAxis: {
      type: 'value', name: 'F（帧数）',
      nameTextStyle: { color: muted, fontWeight: 600 },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontSize: 12 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
    },
    series: [
      {
        name: '动作帧数', type: 'bar', barWidth: 18,
        itemStyle: {
          borderRadius: [4,4,0,0],
          color: function(params) {
            var name = params.name;
            if (name === 'U-All') return violet;
            if (name.startsWith('F')) return danger;
            if (name.startsWith('H')) return warn;
            if (name.startsWith('D')) return '#991B1B';
            if (name.startsWith('M')) return ok;
            if (name === 'I-01') return accent2;
            return accent;
          },
        },
        label: {
          show: true, position: 'top',
          color: ink, fontSize: 10, fontWeight: 700,
          formatter: function(p){ return p.value + 'F'; },
        },
        data: actions.map(function(a){ return a[1]; }),
        markLine: {
          silent: false,
          symbol: ['none','none'],
          lineStyle: { type: 'dashed', width: 2 },
          label: { fontWeight: 800, fontSize: 11, position: 'end' },
          data: [
            { yAxis: 180, name: '非大招红线 180F', lineStyle: { color: danger },
              label: { formatter: '非大招 RL 180F', color: danger } },
            { yAxis: 300, name: '大招红线 300F', lineStyle: { color: violet },
              label: { formatter: '大招 RL 300F', color: violet } },
          ],
        },
      },
    ],
  });
  window.addEventListener('resize', function() { c3.resize(); });
})();
