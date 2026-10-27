// assets/charts.js — A-03 性能预算 3 张图
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent  = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink     = style.getPropertyValue('--ink').trim();
  var muted   = style.getPropertyValue('--muted').trim();
  var rule    = style.getPropertyValue('--rule').trim();
  var ok      = style.getPropertyValue('--ok').trim();
  var warn    = style.getPropertyValue('--warn').trim();
  var danger  = style.getPropertyValue('--danger').trim();
  var violet  = style.getPropertyValue('--violet').trim();

  /* =========================================================
   * Chart 1 · 5 档平台面数预算对比（堆叠柱）
   * =======================================================*/
  var c1 = echarts.init(document.getElementById('chart-tris-compare'), null, { renderer: 'svg' });
  c1.setOption({
    animation: false,
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, appendToBody: true,
      formatter: function(p) {
        var t = p[0].axisValue + '<br/>';
        var sum = 0;
        p.forEach(function(i){ t += i.marker + i.seriesName + '：<b>' + i.value + ' kTris</b><br/>'; sum += i.value; });
        t += '<hr style="border-color:'+rule+';margin:4px 0;">合计：<b>' + sum + ' kTris</b>';
        return t;
      }
    },
    legend: {
      top: 0, left: 'center',
      textStyle: { color: ink, fontSize: 12, fontWeight: 600 },
      itemWidth: 14, itemHeight: 14, itemGap: 18,
    },
    grid: { left: 60, right: 40, top: 50, bottom: 40 },
    xAxis: {
      type: 'category',
      data: ['P1 PC  (60FPS)', 'P2 CT  (60FPS)', 'P3 MF  (60FPS)', 'P4 MM  (45FPS)', 'P5 ME  (30FPS)'],
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false },
      axisLabel: { color: ink, fontSize: 12, fontWeight: 600 },
    },
    yAxis: {
      type: 'value', name: 'kTris', nameTextStyle: { color: muted, fontWeight: 600 },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontSize: 12 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
    },
    color: [accent, accent2, violet, warn],
    series: [
      { name: '头部+配饰', type: 'bar', stack: 't', barWidth: 42,
        label: { show: false },
        itemStyle: { borderRadius: [0,0,0,0] },
        data: [21, 21, 18, 10, 6] },
      { name: '躯干+四肢', type: 'bar', stack: 't',
        itemStyle: { borderRadius: [0,0,0,0] },
        data: [37, 37, 32, 22, 12] },
      { name: '武器（双步枪+狙击）', type: 'bar', stack: 't',
        itemStyle: { borderRadius: [0,0,0,0] },
        data: [30, 30, 26, 15, 8] },
      { name: 'Shadow Cast（红线）', type: 'bar', stack: 's',
        itemStyle: { borderRadius: [4,4,0,0], borderColor: danger, borderWidth: 1.5, borderType: 'dashed', opacity: 0.6 },
        data: [54.5, 54.5, 48, 26, 14] },
    ],
  });
  window.addEventListener('resize', function() { c1.resize(); });

  /* =========================================================
   * Chart 2 · 骨骼构成饼图（基线 122）
   * =======================================================*/
  var c2 = echarts.init(document.getElementById('chart-bone-pie'), null, { renderer: 'svg' });
  c2.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}<br/><b>{c} 块</b> · 占比 {d}%' },
    legend: {
      bottom: 0, left: 'center',
      textStyle: { color: ink, fontSize: 11, fontWeight: 600 },
      itemWidth: 12, itemHeight: 12, itemGap: 10,
    },
    color: [accent, accent2, violet, warn, ok, muted],
    series: [{
      name: '骨骼构成',
      type: 'pie',
      radius: ['36%', '68%'],
      center: ['50%', '40%'],
      roseType: 'radius',
      itemStyle: { borderRadius: 5, borderColor: '#fff', borderWidth: 2 },
      label: {
        color: ink, fontSize: 10.5, fontWeight: 600,
        formatter: function(p){ return p.value < 15 ? '' : (p.name + '\n' + p.value + ' 块'); },
        lineHeight: 15,
      },
      labelLine: { lineStyle: { color: rule, width: 1 } },
      data: [
        { value: 64, name: '主体骨 (含手指)' },
        { value: 34, name: '武器骨' },
        { value: 12, name: '物理挂件骨' },
        { value: 6,  name: '主体预留扩展' },
        { value: 3,  name: '武器预留扩展' },
        { value: 3,  name: '面部 Rig 预留' },
      ],
    }],
  });
  window.addEventListener('resize', function() { c2.resize(); });

  /* =========================================================
   * Chart 3 · 6 级降级保留能力雷达图
   * =======================================================*/
  var c3 = echarts.init(document.getElementById('chart-down-radar'), null, { renderer: 'svg' });
  c3.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    legend: {
      top: 0, left: 'center',
      textStyle: { color: ink, fontSize: 11, fontWeight: 600 },
      itemWidth: 12, itemHeight: 12, itemGap: 8,
    },
    radar: {
      indicator: [
        { name: '画质 (LOD)', max: 100 },
        { name: '电影感 (PP)',  max: 100 },
        { name: '气质核心',     max: 100 },
        { name: '动态细腻度',   max: 100 },
        { name: '特效粒子',     max: 100 },
      ],
      center: ['50%', '55%'],
      radius: '62%',
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: ink, fontSize: 11, fontWeight: 700, lineHeight: 14 },
      splitArea: { areaStyle: { color: ['rgba(67,56,202,0.03)','rgba(67,56,202,0.06)','rgba(67,56,202,0.09)','rgba(67,56,202,0.12)'] } },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLine:  { lineStyle: { color: rule } },
    },
    color: [ok, '#0EA5E9', accent, violet, warn, danger],
    series: [{
      type: 'radar',
      symbol: 'circle', symbolSize: 5,
      lineStyle: { width: 1.8 },
      data: [
        { value: [100,100,100,100,100], name: 'L0 全画质',   areaStyle: { opacity: 0.08 } },
        { value: [ 92, 85,100, 92, 85], name: 'L1 轻降级',   areaStyle: { opacity: 0.08 } },
        { value: [ 80, 70,100, 78, 75], name: 'L2 中降级',   areaStyle: { opacity: 0.08 } },
        { value: [ 68, 55,100, 62, 60], name: 'L3 重降级',   areaStyle: { opacity: 0.08 } },
        { value: [ 55, 35, 95, 40, 35], name: 'L4 超重降级', areaStyle: { opacity: 0.08 } },
        { value: [ 35, 15, 85, 20, 15], name: 'L5 极限求生', areaStyle: { opacity: 0.10 } },
      ],
    }],
  });
  window.addEventListener('resize', function() { c3.resize(); });
})();
