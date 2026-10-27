// B-02 3 张统计图
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent  = style.getPropertyValue('--accent').trim();  // red
  var accent2 = style.getPropertyValue('--accent2').trim(); // sky blue
  var ok      = style.getPropertyValue('--ok').trim();
  var warn    = style.getPropertyValue('--warn').trim();
  var ink     = style.getPropertyValue('--ink').trim();
  var muted   = style.getPropertyValue('--muted').trim();
  var bg2     = style.getPropertyValue('--bg2').trim();
  var violet  = style.getPropertyValue('--violet').trim();

  var fontFamily = "'Noto Sans CJK SC', -apple-system, 'Segoe UI', sans-serif";
  var mono = "'JetBrains Mono', 'Consolas', monospace";

  var commonGrid = { left: 60, right: 24, top: 50, bottom: 60, containLabel: true };
  var commonLegend = { textStyle: { color: muted, fontFamily: fontFamily, fontSize: 12 }, top: 10, itemWidth: 14, itemHeight: 10 };

  // ============== 图 1：70 CheckList 通过率堆叠柱 ==============
  var c1 = echarts.init(document.getElementById('chart-pass-rate'), null, { renderer: 'svg' });
  c1.setOption({
    backgroundColor: 'transparent',
    textStyle: { fontFamily: fontFamily, color: ink },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: Object.assign({}, commonLegend, {
      data: ['✅ PASS 100%', '🟡 TUNE 微调', '🔵 REDO 重做', '❌ VETO 否决']
    }),
    grid: commonGrid,
    xAxis: {
      type: 'category',
      data: ['§02 否决 15条', '§03 武器 12条', '§04 发力 7条', '§05 瞄准 6条', '§06 表情 20条', '§07 错图 10条'],
      axisLine: { lineStyle: { color: '#BDB7A8' } },
      axisLabel: { color: ink, fontSize: 12, interval: 0, rotate: 10 }
    },
    yAxis: {
      type: 'value', max: 100,
      axisLabel: { formatter: '{value}%', color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: bg2 } }
    },
    series: [
      { name: '❌ VETO 否决', type: 'bar', stack: 'r', barWidth: 34,
        itemStyle: { color: '#FEE2E2' }, emphasis: { focus: 'series' },
        data: [0, 0, 0, 0, 0, 0], label: { show: false } },
      { name: '🔵 REDO 重做', type: 'bar', stack: 'r', barWidth: 34,
        itemStyle: { color: '#BAE6FD' },
        data: [5, 8, 6, 5, 12, 4], label: { show: false } },
      { name: '🟡 TUNE 微调', type: 'bar', stack: 'r', barWidth: 34,
        itemStyle: { color: '#FDE68A' },
        data: [10, 15, 12, 10, 18, 10], label: { show: false } },
      { name: '✅ PASS 100%', type: 'bar', stack: 'r', barWidth: 34,
        itemStyle: { color: ok },
        data: [85, 77, 82, 85, 70, 86],
        label: { show: true, position: 'top', color: ink, fontSize: 12, fontWeight: 800,
                 formatter: function(p){ return (p.data) + '%'; } }
      }
    ]
  });

  // ============== 图 2：10 例典型错误 × 三审 热力 ==============
  var c2 = echarts.init(document.getElementById('chart-error-heatmap'), null, { renderer: 'svg' });
  var errNames = ['#01双枪X','#02挺胸S','#03腮分离','#04耸肩','#05落地晃','#06脚穿地','#07插不准','#08枪肩分','#09手乱调','#10喘气'];
  var phases   = ['B01 Blocking','B02 Spline','B03 Polish'];
  // 数值 = 每阶段 100 次审片平均命中次数（越高越常见）
  var heatData = [
    // [phaseIdx, errIdx, value]
    [0,1,18],[0,5,22],[0,3,15],[0,0,12],[0,4,10], // B01 最多的挺胸 / 脚穿地 / 耸肩
    [1,2,16],[1,7,14],[1,3,8],[1,5,6],[1,0,5],    // B02 腮分离 / 枪肩分
    [2,2,20],[2,7,18],[2,9,12],[2,8,10],[2,4,8]   // B03 腮分离 / 枪肩分 / 喘气 / 手乱调
  ].concat([
    // 补 0 的（全部显式列出）
    [0,2,5],[0,6,4],[0,7,3],[0,8,6],[0,9,2],
    [1,1,4],[1,4,7],[1,6,10],[1,8,9],[1,9,6],
    [2,0,3],[2,1,3],[2,3,5],[2,5,4],[2,6,7]
  ]);
  c2.setOption({
    backgroundColor: 'transparent',
    textStyle: { fontFamily: fontFamily, color: ink },
    tooltip: {
      formatter: function(p){
        return phases[p.data[0]] + '<br/>' + errNames[p.data[1]] + '<br/>命中：<b>' + p.data[2] + ' 次 / 100审</b>';
      }
    },
    grid: { left: 90, right: 20, top: 30, bottom: 50 },
    xAxis: {
      type: 'category', data: phases, splitArea: { show: true },
      axisLabel: { color: ink, fontSize: 12 }
    },
    yAxis: {
      type: 'category', data: errNames, splitArea: { show: true },
      axisLabel: { color: ink, fontSize: 11, fontWeight: 700 }
    },
    visualMap: {
      min: 0, max: 22, calculable: true, orient: 'horizontal',
      left: 'center', bottom: 5, itemWidth: 12, itemHeight: 120,
      textStyle: { color: muted, fontSize: 10 },
      inRange: { color: ['#ECFDF5','#A7F3D0','#FDE68A','#FCA5A5','#DC2626'] }
    },
    series: [{
      name: '错误命中次数',
      type: 'heatmap', data: heatData,
      label: { show: true, color: ink, fontSize: 11, fontWeight: 800 },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' } }
    }]
  });

  // ============== 图 3：B01→B02→B03 三审漏斗桑基 ==============
  var c3 = echarts.init(document.getElementById('chart-review-sankey'), null, { renderer: 'svg' });
  c3.setOption({
    backgroundColor: 'transparent',
    textStyle: { fontFamily: fontFamily, color: ink },
    tooltip: { trigger: 'item', triggerOn: 'mousemove' },
    series: [{
      type: 'sankey', layout: 'none', emphasis: { focus: 'adjacency' },
      nodeWidth: 18, nodeGap: 12,
      left: 20, right: 110, top: 20, bottom: 20,
      data: [
        { name: '提交 B01', itemStyle: { color: '#94A3B8' } },
        { name: 'B01 PASS',  itemStyle: { color: ok } },
        { name: 'B01 TUNE',  itemStyle: { color: warn } },
        { name: 'B01 VETO',  itemStyle: { color: accent } },
        { name: '提交 B02', itemStyle: { color: '#94A3B8' } },
        { name: 'B02 PASS',  itemStyle: { color: ok } },
        { name: 'B02 TUNE',  itemStyle: { color: warn } },
        { name: '提交 B03', itemStyle: { color: '#94A3B8' } },
        { name: 'B03 PASS ✅', itemStyle: { color: ok } },
        { name: 'B03 TUNE',  itemStyle: { color: warn } },
        { name: '升级三方会', itemStyle: { color: violet } }
      ],
      links: [
        // 100 份提交 B01
        { source: '提交 B01', target: 'B01 PASS', value: 60 },
        { source: '提交 B01', target: 'B01 TUNE', value: 30 },
        { source: '提交 B01', target: 'B01 VETO', value: 10 },
        { source: 'B01 TUNE', target: 'B01 PASS', value: 24 }, // 30 里 80% 修完通过
        { source: 'B01 TUNE', target: 'B01 VETO', value: 6 },  // 20% 还是不行
        { source: 'B01 VETO', target: '升级三方会', value: 4 },
        { source: 'B01 VETO', target: '提交 B02', value: 12 }, // 10+6-4=12 重做后通过
        // B01 PASS 60+24=84 → 提交 B02 84 (round 60)
        { source: 'B01 PASS', target: '提交 B02', value: 84 },
        { source: '提交 B02', target: 'B02 PASS', value: 60 },
        { source: '提交 B02', target: 'B02 TUNE', value: 24 },
        { source: 'B02 TUNE', target: 'B02 PASS', value: 18 },
        { source: 'B02 TUNE', target: '升级三方会', value: 6 },
        // B02 PASS 60+18=78 → 提交 B03 78
        { source: 'B02 PASS', target: '提交 B03', value: 78 },
        { source: '提交 B03', target: 'B03 PASS ✅', value: 65 },
        { source: '提交 B03', target: 'B03 TUNE', value: 13 },
        { source: 'B03 TUNE', target: 'B03 PASS ✅', value: 8 },
        { source: 'B03 TUNE', target: '升级三方会', value: 5 }
      ],
      lineStyle: { color: 'gradient', curveness: 0.5, opacity: 0.5 },
      label: { color: ink, fontSize: 11, fontWeight: 700, fontFamily: fontFamily }
    }]
  });

  // Resize
  var all = [c1, c2, c3];
  window.addEventListener('resize', function(){ all.forEach(function(c){ c.resize(); }); });
})();
