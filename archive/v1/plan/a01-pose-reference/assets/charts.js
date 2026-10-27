// assets/charts.js — A-01 Pose 参考图谱可视化（2 图）
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim() || '#2563EB';
  var accent2 = style.getPropertyValue('--accent2').trim() || '#8B5CF6';
  var ink = style.getPropertyValue('--ink').trim() || '#0F1A3A';
  var muted = style.getPropertyValue('--muted').trim() || '#5A6480';
  var rule = style.getPropertyValue('--rule').trim() || '#D7DDEB';
  var bg2 = style.getPropertyValue('--bg2').trim() || '#EEF2FB';
  var danger = style.getPropertyValue('--danger').trim() || '#DC2626';
  var warn = style.getPropertyValue('--warn').trim() || '#D97706';
  var ok = style.getPropertyValue('--ok').trim() || '#059669';

  // ============== Chart 1: Pose 类别数量 × 权重（Pie + Rose 的混合 Bar，展示 5 大类条目数+权重） ==============
  var c1 = document.getElementById('chart-pose-weight');
  if (c1) {
    var chart1 = echarts.init(c1, null, { renderer: 'svg' });
    var cats = ['A待机类', 'B射击类', 'C体术类', 'D受击类', 'E大招演出类'];
    var counts = [5, 6, 3, 4, 4];
    var weights = [20, 35, 10, 12, 23]; // 权重总和100，B射击+E大招=58%

    chart1.setOption({
      animation: false,
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, appendToBody: true },
      legend: { data: ['Pose 条目数', '玩法权重占比 (%)'], top: 0, textStyle: { color: muted, fontSize: 12 } },
      grid: { left: 80, right: 60, top: 40, bottom: 40 },
      xAxis: {
        type: 'category', data: cats,
        axisLabel: { color: ink, fontWeight: 600, fontSize: 12 },
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false },
      },
      yAxis: [
        {
          type: 'value', name: '条目数',
          axisLabel: { color: muted },
          splitLine: { lineStyle: { color: rule } },
          axisLine: { lineStyle: { color: rule } },
        },
        {
          type: 'value', name: '权重 (%)', max: 40,
          axisLabel: { formatter: '{value}%', color: muted },
          splitLine: { show: false },
          axisLine: { lineStyle: { color: rule } },
        },
      ],
      series: [
        {
          name: 'Pose 条目数', type: 'bar', barWidth: 28,
          itemStyle: {
            color: function(params) {
              return [accent2, accent, ok, warn, danger][params.dataIndex];
            },
            borderRadius: [6, 6, 0, 0],
          },
          label: { show: true, position: 'top', formatter: '{c} 条', color: ink, fontWeight: 700, fontSize: 12 },
          data: counts,
        },
        {
          name: '玩法权重占比 (%)', type: 'line', yAxisIndex: 1,
          smooth: true, symbol: 'circle', symbolSize: 10,
          lineStyle: { color: danger, width: 3 },
          itemStyle: { color: danger, borderColor: '#fff', borderWidth: 2 },
          label: { show: true, formatter: '{c}%', color: danger, fontWeight: 700, fontSize: 12, position: 'top' },
          data: weights,
        },
      ],
    });
    window.addEventListener('resize', function() { chart1.resize(); });
  }

  // ============== Chart 2: 22 Pose × 8 气质关键词 命中热力图 ==============
  var c2 = document.getElementById('chart-temperament-heatmap');
  if (c2) {
    var chart2 = echarts.init(c2, null, { renderer: 'svg' });
    var keys = ['收敛·表达抑制', '精合·同轴约束', '持稳·重心稳度', '断行·执行锁定', '端仪·姿态基线', '离立·间距规则', '旷视·远凝节律', '守姿·翼护角度'];
    var poses = [
      'I-01 默认待机','I-02 步枪预备','I-03 狙击预备','I-04 警戒待机','I-05 胜利待机',
      'F-01 1A 双连发','F-02 2A 齐射','F-03 4A 架设连射','F-04 普通狙击','F-05 满蓄力','F-06 大招射击',
      'M-01 3A 侧踢','M-02 闪避推开','M-03 倒地起身',
      'H-01 轻受击','H-02 重受击','H-03 眩晕','H-04 死亡',
      'U-01 大招启动','U-02 拉栓上膛','U-03 举枪瞄准','U-04 射击后坐',
    ];
    // 3 = 明确命中（强相关），2 = 间接命中，1 = 弱相关/沾边，0 = 不相关
    // 每行对应 keys 8 个词: [收敛·表达抑制, 精合·同轴约束, 持稳·重心稳度, 断行·执行锁定, 端仪·姿态基线, 离立·间距规则, 旷视·远凝节律, 守姿·翼护角度]
    var raw = [
      [3,1,2,1,3,3,3,1], // I-01
      [1,3,3,3,1,1,0,1], // I-02
      [3,3,3,2,1,1,0,0], // I-03
      [1,2,3,3,1,3,0,1], // I-04
      [1,1,2,1,2,3,3,3], // I-05
      [1,3,2,3,3,1,0,1], // F-01
      [1,2,3,3,1,1,0,3], // F-02
      [3,3,3,1,1,1,0,1], // F-03
      [2,3,3,3,1,0,0,0], // F-04
      [3,3,2,3,1,1,0,0], // F-05
      [3,2,1,3,3,1,1,3], // F-06
      [1,1,3,3,3,0,0,1], // M-01
      [3,0,2,1,3,3,0,0], // M-02
      [1,1,3,3,3,0,1,1], // M-03
      [3,1,3,3,0,0,0,1], // H-01
      [1,1,3,3,1,0,0,3], // H-02
      [3,1,2,0,1,0,3,0], // H-03
      [1,0,2,1,3,3,1,3], // H-04
      [3,3,1,3,1,0,0,1], // U-01
      [1,3,1,3,3,0,0,0], // U-02
      [3,3,2,3,1,0,0,0], // U-03
      [1,3,2,3,1,0,0,3], // U-04
    ];
    var data = [];
    for (var y = 0; y < poses.length; y++) {
      for (var x = 0; x < keys.length; x++) {
        data.push([x, y, raw[y][x]]);
      }
    }

    chart2.setOption({
      animation: false,
      tooltip: {
        position: 'top',
        appendToBody: true,
        formatter: function(p) {
          return poses[p.value[1]] + '<br/>' + keys[p.value[0]]
            + '<br/>命中强度: <b>' + [ '— 无','弱相关','间接','<span style="color:'+danger+'">强相关</span>' ][p.value[2]] + '</b>';
        },
      },
      grid: { left: 130, right: 40, top: 40, bottom: 50 },
      xAxis: {
        type: 'category', data: keys, splitArea: { show: false },
        axisLabel: { color: ink, fontWeight: 700, fontSize: 11, rotate: 0 },
        axisLine: { lineStyle: { color: rule } }, axisTick: { show: false },
      },
      yAxis: {
        type: 'category', data: poses, splitArea: { show: false },
        axisLabel: { color: ink, fontSize: 11, fontFamily: 'Mono, monospace' },
        axisLine: { lineStyle: { color: rule } }, axisTick: { show: false },
      },
      visualMap: {
        min: 0, max: 3, calculable: false, orient: 'horizontal',
        left: 'center', bottom: 10,
        itemWidth: 14, itemHeight: 240,
        textStyle: { color: muted, fontSize: 11 },
        inRange: { color: ['#F3F4F6', bg2, accent + '88', danger] },
        formatter: function(v) { return ['无','弱','间','强'][v]; },
        text: ['强相关', '无'],
      },
      series: [{
        name: '气质命中', type: 'heatmap', data: data,
        label: {
          show: true, fontSize: 10, color: '#fff', fontWeight: 700,
          formatter: function(p) { return ['·','○','△','◆'][p.value[2]]; },
        },
        itemStyle: { borderColor: '#fff', borderWidth: 2, borderRadius: 3 },
        emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(37,99,235,0.5)' } },
      }],
    });
    window.addEventListener('resize', function() { chart2.resize(); });
  }
})();
