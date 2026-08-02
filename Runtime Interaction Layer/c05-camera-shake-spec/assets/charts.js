/* C-05 Camera Shake Spec · ECharts Supplemental Charts
 * Renders: Section §2 · 12 Camera States FOV × Distance Scatter
 *   - X axis: FOV (degree)
 *   - Y axis: Camera Distance (cm)
 *   - Symbol size: Collision radius (scaled)
 *   - Color: 4 groups (Blue=常态移动 / Orange=瞄准 / Purple=大招 / Green=其他)
 * Uses CSS variables, animation=false, svg renderer, tooltip appendToBody=true
 */
(function () {
  'use strict';

  function cssv(name, fallback) {
    try {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v && v.length ? v : fallback;
    } catch (e) { return fallback; }
  }

  // ---------- 12 Camera States (source: §2 table) ----------
  // group: 1=蓝(常态/移动) 2=橙(瞄准) 3=紫(大招) 4=绿(其他)
  var STATES = [
    { no:1, name:'TPS常态',     fov:60, dist:200, h:60, r:12, g:1, node:'C-02 S01' },
    { no:2, name:'TPS跑步',     fov:65, dist:200, h:65, r:12, g:1, node:'C-02 S02' },
    { no:3, name:'TPS闪避',     fov:70, dist:190, h:55, r:10, g:1, node:'C-02 S03' },
    { no:4, name:'TPS侧踢',     fov:65, dist:195, h:58, r:11, g:1, node:'C-02 S04' },
    { no:5, name:'ADS开镜',     fov:35, dist: 80, h:15, r: 6, g:2, node:'C-02 S05' },
    { no:6, name:'满蓄狙击',    fov:18, dist: 50, h:10, r: 5, g:2, node:'C-02 S06' },
    { no:7, name:'大招前摇',    fov:55, dist:180, h:50, r:11, g:3, node:'C-02 S10' },
    { no:8, name:'大招爆发',    fov:50, dist:260, h:90, r:14, g:3, node:'C-02 S11' },
    { no:9, name:'大招收势',    fov:60, dist:210, h:60, r:12, g:3, node:'C-02 S12' },
    { no:10,name:'换弹',        fov:62, dist:200, h:60, r:12, g:4, node:'C-02 S07' },
    { no:11,name:'技能前摇',    fov:58, dist:190, h:58, r:11, g:4, node:'C-02 S08' },
    { no:12,name:'死亡倒地',    fov:70, dist:250, h:10, r:14, g:4, node:'C-02 S13' }
  ];
  var GROUP_META = {
    1:{ name:'常态/移动组 (S1-S4)',   color:'#3B82F6' },
    2:{ name:'瞄准组 (S5-S6)',        color:'#F59E0B' },
    3:{ name:'大招组 (S7-S9)',        color:'#8B5CF6' },
    4:{ name:'其他 (换弹/技能/死亡)', color:'#10B981' }
  };

  function renderAll() {
    // ---- §2 Scatter: FOV x Distance, size=collision radius, color by group ----
    var dom1 = document.getElementById('c05_chart_fov_dist');
    if (dom1 && window.echarts) {
      var chart1 = echarts.init(dom1, null, { renderer: 'svg' });
      var seriesByGroup = {};
      STATES.forEach(function (s) {
        if (!seriesByGroup[s.g]) seriesByGroup[s.g] = [];
        seriesByGroup[s.g].push({
          name: 'S' + String(s.no).padStart(2,'0') + ' ' + s.name,
          value: [s.fov, s.dist, s.r, s.h],
          _node: s.node,
          _h: s.h,
          _r: s.r
        });
      });
      var series = Object.keys(seriesByGroup).map(function (gk) {
        var meta = GROUP_META[gk];
        return {
          name: meta.name,
          type: 'scatter',
          symbolSize: function (val) { return 10 + val[2] * 2.2; },
          data: seriesByGroup[gk],
          itemStyle: {
            color: meta.color,
            borderColor: '#0F172A',
            borderWidth: 1.2,
            opacity: 0.86
          },
          label: {
            show: true,
            position: 'top',
            formatter: function (p) { return p.data.name.split(' ')[0]; },
            color: '#0F172A',
            fontSize: 11,
            fontWeight: 600
          },
          emphasis: { scale: 1.15 }
        };
      });

      chart1.setOption({
        animation: false,
        backgroundColor: 'transparent',
        title: {
          text: '图 §2-A  12 种镜头状态：FOV × 相机距离散点图',
          left: 'center',
          top: 6,
          textStyle: {
            color: cssv('--c-text', '#0F172A'),
            fontFamily: cssv('--font-sans', 'Noto Sans CJK SC, PingFang SC, Microsoft YaHei, sans-serif'),
            fontSize: 15,
            fontWeight: 700
          }
        },
        legend: {
          top: 36,
          left: 'center',
          textStyle: { color: cssv('--c-sub', '#374151'), fontSize: 12 },
          itemWidth: 12, itemHeight: 12
        },
        grid: { left: 56, right: 36, top: 80, bottom: 56 },
        tooltip: {
          trigger: 'item',
          appendToBody: true,
          className: 'c05-tt',
          backgroundColor: cssv('--c-bg-2', '#FFFFFF'),
          borderColor: cssv('--c-border', '#E5E7EB'),
          textStyle: { color: cssv('--c-text', '#0F172A'), fontSize: 12 },
          formatter: function (p) {
            var d = p.data;
            return '<div style="font-weight:700;margin-bottom:4px">' + d.name + '</div>' +
              'FOV：<b>' + d.value[0] + '°</b><br/>' +
              '相机距离：<b>' + d.value[1] + ' cm</b><br/>' +
              '相机高度：<b>' + d._h + ' cm</b><br/>' +
              '碰撞半径：<b>' + d._r + ' cm</b><br/>' +
              '来源节点：<b>' + d._node + '</b>';
          }
        },
        xAxis: {
          name: 'FOV (度)',
          nameLocation: 'middle',
          nameGap: 30,
          min: 10, max: 75,
          axisLine: { lineStyle: { color: cssv('--c-sub', '#374151') } },
          axisLabel: { color: cssv('--c-sub', '#374151'), fontSize: 11 },
          splitLine: { lineStyle: { color: cssv('--c-grid', '#EEF2F7'), type: 'dashed' } }
        },
        yAxis: {
          name: '相机距离 (cm)',
          nameLocation: 'middle',
          nameGap: 42,
          min: 30, max: 280,
          axisLine: { lineStyle: { color: cssv('--c-sub', '#374151') } },
          axisLabel: { color: cssv('--c-sub', '#374151'), fontSize: 11 },
          splitLine: { lineStyle: { color: cssv('--c-grid', '#EEF2F7'), type: 'dashed' } }
        },
        series: series
      });
      window.addEventListener('resize', function () { chart1.resize(); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAll);
  } else {
    renderAll();
  }
})();
