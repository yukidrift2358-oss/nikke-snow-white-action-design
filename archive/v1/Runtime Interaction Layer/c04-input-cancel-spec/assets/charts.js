/* C-04 Input Cancel Spec · ECharts Supplemental Charts
 * Renders: Section §4 Cancel Window Heatmap (x=link, y=frame range, value=1 if cancelable else 0)
 * Uses CSS variables, no animation, SVG renderer, tooltip appendToBody=true
 * Inject after DOMContentLoaded / echarts loaded
 */
(function () {
  'use strict';

  function cssv(name, fallback) {
    try {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v && v.length ? v : fallback;
    } catch (e) { return fallback; }
  }

  // --- 12-link × frame segment heatmap data --------------------------------
  // Rows (Y): 12 link IDs  L01..L12
  // Cols (X): frame segments every 5F from 0F to 80F  (covers longest link L11=80F total)
  // value: 1 = input within this segment falls inside [Early, Late] for the link
  //        0 = outside
  var LINKS = [
    { id: 'L01', name: '普攻1→普攻2',      E:10, L:18 },
    { id: 'L02', name: '普攻2→普攻3',      E: 9, L:17 },
    { id: 'L03', name: '普攻3→普攻4',      E:11, L:20 },
    { id: 'L04', name: '普攻4→普攻5',      E:13, L:23 },
    { id: 'L05', name: '普攻5→3A侧踢',     E:15, L:26 },
    { id: 'L06', name: '普攻5→满蓄狙击',   E:18, L:30 },
    { id: 'L07', name: '闪避→普攻1',       E:14, L:22 },
    { id: 'L08', name: '主动技能→普攻1',   E:17, L:28 },
    { id: 'L09', name: '换弹→普攻1',       E:28, L:40 },
    { id: 'L10', name: '开镜→射击',        E:11, L:16 },
    { id: 'L11', name: '大招→收势待机',    E:50, L:78 },
    { id: 'L12', name: '3A→待机',          E:14, L:22 },
  ];
  var SEG = 5;              // segment width in frames
  var FMAX = 80;
  var COLS = [];
  for (var f = 0; f < FMAX; f += SEG) COLS.push(f + '-' + (f + SEG - 1) + 'F');

  var data = [];  // [colIdx, rowIdx, value]
  for (var r = 0; r < LINKS.length; r++) {
    var Lk = LINKS[r];
    for (var c = 0; c < COLS.length; c++) {
      var segStart = c * SEG;
      var segEnd   = segStart + SEG - 1;
      // overlap between [segStart, segEnd] and [E, L] ?
      var ov = Math.min(segEnd, Lk.L) - Math.max(segStart, Lk.E) + 1;
      var val = ov > 0 ? 1 : 0;
      data.push([c, r, val, Lk.E, Lk.L, segStart, segEnd]);
    }
  }

  function renderHeatmap(domId) {
    var dom = document.getElementById(domId);
    if (!dom || typeof echarts === 'undefined') return;

    var ink   = cssv('--ink',   '#0F172A');
    var ink2  = cssv('--ink2',  '#334155');
    var ink3  = cssv('--ink3',  '#64748B');
    var ink4  = cssv('--ink4',  '#94A3B8');
    var line  = cssv('--line',  '#E2E8F0');
    var white = cssv('--white', '#FFFFFF');
    var cyan  = cssv('--cyan',  '#0891B2');
    var red   = cssv('--red',   '#991B1B');
    var green = cssv('--green', '#0F766E');

    var chart = echarts.init(dom, null, { renderer: 'svg' });

    var option = {
      animation: false,
      backgroundColor: white,
      tooltip: {
        appendToBody: true,
        trigger: 'item',
        backgroundColor: 'rgba(15,23,42,0.94)',
        borderColor: cyan,
        borderWidth: 1,
        textStyle: { color: '#F1F5F9', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 },
        extraCssText: 'box-shadow:0 6px 20px rgba(15,23,42,0.25);border-radius:6px;',
        formatter: function (p) {
          var d = p.data;
          if (!d || d.length < 7) return '';
          var Lk = LINKS[d[1]];
          return '<b style="color:#22D3EE;font-size:12px;">' + Lk.id + ' ' + Lk.name + '</b><br/>'
               + '段区间: <span style="font-family:JetBrains Mono">' + d[5] + '–' + d[6] + 'F</span><br/>'
               + 'Cancel 窗: <span style="color:#FCA5A5;font-family:JetBrains Mono">[' + Lk.E + ', ' + Lk.L + '] F</span><br/>'
               + '可 Cancel: <b style="color:' + (d[2] ? '#86EFAC' : '#FCA5A5') + '">' + (d[2] ? 'YES (1)' : 'NO  (0)') + '</b>';
        }
      },
      grid: { left: 140, right: 40, top: 60, bottom: 70 },
      xAxis: {
        type: 'category',
        data: COLS,
        splitArea: { show: false },
        axisLine: { lineStyle: { color: ink4 } },
        axisTick: { lineStyle: { color: ink4 } },
        axisLabel: {
          color: ink3, fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
          interval: 1, rotate: 45,
        },
        name: '帧区间（每 ' + SEG + 'F 一格）',
        nameLocation: 'middle',
        nameGap: 52,
        nameTextStyle: { color: ink2, fontSize: 11, fontWeight: 600 },
      },
      yAxis: {
        type: 'category',
        data: LINKS.map(function (L) { return L.id + ' ' + L.name; }),
        splitArea: { show: true, areaStyle: { color: ['#FFFFFF', '#F8FAFC'] } },
        axisLine: { lineStyle: { color: ink4 } },
        axisTick: { show: false },
        axisLabel: { color: ink2, fontSize: 11, fontFamily: '"Noto Sans CJK SC",sans-serif', fontWeight: 600 },
        name: '12 条连招链路',
        nameLocation: 'middle',
        nameGap: 110,
        nameTextStyle: { color: ink2, fontSize: 11, fontWeight: 700 },
      },
      visualMap: {
        show: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 6,
        min: 0, max: 1,
        calculable: false,
        itemWidth: 14, itemHeight: 240,
        text: ['可 Cancel (1)', '不可 (0)'],
        textStyle: { color: ink3, fontSize: 11, fontFamily: 'JetBrains Mono,monospace' },
        inRange: {
          color: ['#F1F5F9', cyan]
        },
        formatter: function (v) { return v === 0 ? '0 (不可)' : '1 (可 Cancel)'; },
      },
      series: [{
        name: 'Cancel 窗口热力',
        type: 'heatmap',
        data: data,
        label: {
          show: true,
          color: ink,
          fontSize: 10,
          fontFamily: 'JetBrains Mono, monospace',
          formatter: function (p) { return p.data[2] ? '●' : ''; },
        },
        itemStyle: {
          borderColor: white,
          borderWidth: 2,
          borderRadius: 2,
        },
        emphasis: {
          itemStyle: {
            borderColor: red,
            borderWidth: 2,
            shadowBlur: 10,
            shadowColor: 'rgba(153,27,27,0.35)',
          }
        },
      }],
      title: [
        {
          text: '§4 · 12 条链路 × 帧区间 Cancel 热力图',
          left: 140, top: 10,
          textStyle: { color: ink, fontSize: 14, fontWeight: 700,
                       fontFamily: '"Noto Sans CJK SC",sans-serif' },
        },
        {
          text: '每格 = ' + SEG + 'F 帧段 · 蓝 = 落在 [Early, Late] 窗口内 · 白 = 不可 Cancel',
          left: 140, top: 32,
          textStyle: { color: ink3, fontSize: 11, fontWeight: 400,
                       fontFamily: '"Noto Sans CJK SC",sans-serif' },
        },
      ],
    };

    chart.setOption(option);
    window.addEventListener('resize', function () { chart.resize(); });
    return chart;
  }

  // --- Auto-mount ---------------------------------------------------------
  function mount() {
    // Priority: dedicated heatmap DOM first; fallback to the first .chart class box
    var id = 'c04_cancel_heatmap';
    var el = document.getElementById(id);
    if (!el) {
      var alt = document.querySelector('#c04_heatmap, .c04-chart-heatmap, .chart-heatmap');
      if (alt) { alt.id = id; el = alt; }
    }
    if (el) {
      if (typeof echarts !== 'undefined') {
        renderHeatmap(id);
      } else if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { renderHeatmap(id); });
      } else {
        setTimeout(function () { renderHeatmap(id); }, 80);
      }
    }
    // expose for manual call
    window.C04Charts = { renderHeatmap: renderHeatmap };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
