// assets/charts.js — A-02 骨骼命名规范 3 张图
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent  = style.getPropertyValue('--accent').trim();   // Indigo
  var accent2 = style.getPropertyValue('--accent2').trim();  // Cyan
  var ink     = style.getPropertyValue('--ink').trim();
  var muted   = style.getPropertyValue('--muted').trim();
  var rule    = style.getPropertyValue('--rule').trim();
  var bg2     = style.getPropertyValue('--bg2').trim();
  var ok      = style.getPropertyValue('--ok').trim();
  var warn    = style.getPropertyValue('--warn').trim();
  var danger  = style.getPropertyValue('--danger').trim();
  var violet  = style.getPropertyValue('--violet').trim();

  /* =========================================================
   * Chart 1 · 19 挂接点按参考骨骼分类分布（水平条形）
   * =======================================================*/
  var c1 = echarts.init(document.getElementById('chart-hk-distribution'), null, { renderer: 'svg' });
  c1.setOption({
    animation: false,
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, appendToBody: true },
    grid: { left: 110, right: 50, top: 20, bottom: 30 },
    xAxis: {
      type: 'value', minInterval: 1,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontSize: 12 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: [
        'RT_Root 场景根',
        'SK_Head 头',
        'SK_Chest/SK_Spine_02 躯',
        'SK_Hand_L 左手',
        'WP_Rifle_L 左步枪',
        'WP_Rifle_R 右步枪',
        'WP_Sniper_* 狙击枪',
      ],
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false },
      axisLabel: { color: ink, fontSize: 12, fontWeight: 600 },
    },
    series: [{
      type: 'bar',
      barWidth: 22,
      label: {
        show: true, position: 'right',
        fontWeight: 700, color: ink, fontSize: 13,
        formatter: function(p){ return p.value + ' 个'; },
      },
      itemStyle: {
        borderRadius: [0, 6, 6, 0],
        color: function(params) {
          var pal = [muted, violet, accent, warn, accent2, accent, danger];
          return pal[params.dataIndex % pal.length];
        },
      },
      data: [2, 1, 2, 1, 3, 4, 5],
    }],
  });
  window.addEventListener('resize', function() { c1.resize(); });

  /* =========================================================
   * Chart 2 · 89 命名实体分类构成（饼图·南丁格尔玫瑰）
   * =======================================================*/
  var c2 = echarts.init(document.getElementById('chart-bone-pie'), null, { renderer: 'svg' });
  c2.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}<br/>{c} 块 · 占比 <b>{d}%</b>' },
    legend: {
      bottom: 0, left: 'center',
      textStyle: { color: ink, fontSize: 12, fontWeight: 600 },
      itemWidth: 14, itemHeight: 14, itemGap: 16,
    },
    color: [accent, violet, warn, accent2, ok, muted, danger],
    series: [{
      name: '骨骼分类',
      type: 'pie',
      radius: ['32%', '68%'],
      center: ['50%', '42%'],
      roseType: 'area',
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff', borderWidth: 2,
      },
      label: {
        color: ink, fontSize: 11, fontWeight: 600,
        formatter: '{b}\n{c} 块',
        lineHeight: 16,
      },
      labelLine: { lineStyle: { color: rule, width: 1 } },
      data: [
        { value: 10, name: '核心与脊椎' },
        { value: 11, name: '头部链' },
        { value: 12, name: '左臂链' },
        { value: 12, name: '右臂链' },
        { value: 6,  name: '左腿链' },
        { value: 6,  name: '右腿链' },
        { value: 1,  name: '配饰次级' },
        { value: 10, name: '左步枪武器' },
        { value: 10, name: '右步枪武器' },
        { value: 11, name: '狙击枪武器' },
      ],
    }],
  });
  window.addEventListener('resize', function() { c2.resize(); });

  /* =========================================================
   * Chart 3 · 52 BS 通道启用状态分布（堆叠水平条）
   * =======================================================*/
  var c3 = echarts.init(document.getElementById('chart-bs-status'), null, { renderer: 'svg' });
  c3.setOption({
    animation: false,
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, appendToBody: true },
    legend: {
      top: 0, left: 'center',
      textStyle: { color: ink, fontSize: 12, fontWeight: 600 },
      itemWidth: 14, itemHeight: 14,
    },
    grid: { left: 70, right: 40, top: 40, bottom: 30 },
    xAxis: {
      type: 'value', minInterval: 1,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontSize: 12 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: ['合计 (52)', 'BS_Jaw 颌 (6)', 'BS_Brow 眉 (10)', 'BS_Mouth 口 (18)', 'BS_Eye 眼 (18)'],
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false },
      axisLabel: { color: ink, fontSize: 12, fontWeight: 600 },
    },
    color: [danger, warn, ok],
    series: [
      {
        name: '永久锁 0 (LOCK_0)', type: 'bar', stack: 't', barWidth: 24,
        label: { show: true, position: 'inside', fontWeight: 700, color: '#fff', fontSize: 12 },
        itemStyle: { borderRadius: [0,0,0,0] },
        data: [31, 3, 8, 13, 6],
      },
      {
        name: '条件启用 (≤阈值/特定帧)', type: 'bar', stack: 't',
        label: { show: true, position: 'inside', fontWeight: 700, color: '#fff', fontSize: 12 },
        itemStyle: { borderRadius: [0,0,0,0] },
        data: [13, 2, 2, 3, 6],
      },
      {
        name: '常规启用 (待机/常态)', type: 'bar', stack: 't',
        label: { show: true, position: 'insideRight', fontWeight: 700, color: '#fff', fontSize: 12 },
        itemStyle: { borderRadius: [0,6,6,0] },
        data: [8, 1, 0, 2, 6],
      },
    ],
  });
  window.addEventListener('resize', function() { c3.resize(); });
})();
