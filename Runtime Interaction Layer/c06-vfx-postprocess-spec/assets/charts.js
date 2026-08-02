/* C-06 charts.js · 后处理四件套 4 阶段分组柱状图
   渲染目标: #echart_pp_phase · SVG renderer · animation:false
*/
(function(){
  const PHASES = ['正常态 P1','满蓄态 P2','击发瞬间 2F P3','击发后 10F 恢复 P4'];
  const COLORS = ['#1D4ED8','#B45309','#DC2626','#059669'];

  // ---- Subchart 1: Bloom (4 params × 4 phases) ----
  const bloomX = ['强度 Intensity','阈值 Threshold','半径 Radius(px)','软阈值 SoftKnee'];
  const bloom = [
    [0.35, 0.85, 1.60, 0.35],   // 强度
    [0.85, 0.45, 0.10, 0.85],   // 阈值
    [6.0, 14.0, 28.0, 6.0],     // 半径
    [0.40, 0.70, 0.95, 0.40]    // 软阈值
  ];

  // ---- Subchart 2: ColorGrading ----
  const cgX = ['色温 Temp(K/100)','色调 Tint(×10)','对比度 Contr(%)','饱和度 Sat(%)'];
  const cg = [
    [62, 74, 95, 62],           // 色温 /100
    [0.0, 1.5, 4.0, 0.0],       // 色调 ×10
    [0, 12, 30, 0],             // 对比度
    [0, 20, 45, 0]              // 饱和度
  ];

  // ---- Subchart 3: Vignette ----
  const vigX = ['强度 Intensity','平滑度 Smooth','圆角 Roundness','中心-Y偏移(px)'];
  const vig = [
    [0.25, 0.42, 0.68, 0.25],   // 强度
    [0.60, 0.45, 0.20, 0.60],   // 平滑度
    [0.75, 0.55, 0.30, 0.75],   // 圆角
    [0, 8, 18, 0]               // Y偏移(绝对值)
  ];

  // ---- Subchart 4: ChromaticAberration ----
  const caX = ['强度 Intensity(×10)','轴向 Axial(°)','快速模式 Fast(ON=1)'];
  const ca = [
    [0.8, 3.5, 8.5, 0.8],       // 强度 ×10
    [0, 2.5, 6.0, 0],           // 轴向
    [0, 1, 1, 0]                // FastMode
  ];

  function mkSeries(data, colors){
    return PHASES.map(function(name,i){
      return {
        name: name,
        type: 'bar',
        data: data.map(function(row){ return row[i]; }),
        itemStyle: { color: colors[i], borderRadius: [3,3,0,0], borderColor: 'rgba(15,23,42,0.18)', borderWidth: 1 },
        barGap: '20%',
        barCategoryGap: '35%',
        label: { show: true, position: 'top', fontSize: 9, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: colors[i] }
      };
    });
  }

  function mkOption(title, subtitle, xData, data, palette, gridIdx, xIdx, yIdx, legendShow){
    return {
      title: {
        text: title, subtext: subtitle,
        left: 'center', top: 4,
        textStyle: { fontSize: 13, fontWeight: 700, color: '#0F172A' },
        subtextStyle: { fontSize: 10, color: '#64748B', fontFamily: 'JetBrains Mono, monospace' }
      },
      grid: gridIdx,
      xAxis: {
        type: 'category', data: xData, gridIndex: typeof xIdx==='number'?xIdx:0,
        axisLabel: { fontSize: 10, color: '#334155', interval: 0, rotate: 0, fontFamily: 'JetBrains Mono, monospace' },
        axisLine: { lineStyle: { color: '#CBD5E1' } }, axisTick: { show: false }
      },
      yAxis: {
        type: 'value', gridIndex: typeof yIdx==='number'?yIdx:0,
        axisLabel: { fontSize: 9, color: '#64748B', fontFamily: 'JetBrains Mono, monospace' },
        splitLine: { lineStyle: { color: '#EEF2F7' } }, axisLine: { show: false }
      },
      legend: legendShow ? {
        data: PHASES, top: 30, left: 'center',
        itemWidth: 12, itemHeight: 10,
        textStyle: { fontSize: 10.5, color: '#334155' },
        icon: 'roundRect'
      } : undefined,
      series: mkSeries(data, palette)
    };
  }

  function renderAll(){
    const dom = document.getElementById('echart_pp_phase');
    if(!dom){ return; }
    const chart = echarts.init(dom, null, { renderer: 'svg' });

    // 2 x 2 grid layout
    const grids = [
      { left: '4%',  right: '52%', top: 90,  bottom: '56%' },  // 0: Bloom TL
      { left: '54%', right: '4%',  top: 90,  bottom: '56%' },  // 1: CG TR
      { left: '4%',  right: '52%', top: '52%', bottom: 30 },   // 2: Vig BL
      { left: '54%', right: '4%',  top: '52%', bottom: 30 }    // 3: CA BR
    ];

    const bloomPal = ['#1D4ED8','#B45309','#DC2626','#059669'];
    const cgPal    = ['#1D4ED8','#B45309','#DC2626','#059669'];
    const vigPal   = ['#1D4ED8','#B45309','#DC2626','#059669'];
    const caPal    = ['#1D4ED8','#B45309','#DC2626','#059669'];

    const oBloom = mkOption('① Bloom','4 参数 / 4 阶段 · 击发瞬间达到峰值',bloomX,bloom,bloomPal,grids[0],0,0,false);
    const oCG    = mkOption('② ColorGrading','4 参数 / 4 阶段 · 暖色调 + 高饱和',cgX,cg,cgPal,grids[1],1,1,false);
    const oVig   = mkOption('③ Vignette','4 参数 / 4 阶段 · 暗角集中中心偏下',vigX,vig,vigPal,grids[2],2,2,false);
    const oCA    = mkOption('④ Chromatic Aberration','3 参数 / 4 阶段 · 色散轴向分离',caX,ca,caPal,grids[3],3,3,true);

    // Axis indices for 4 xAxes / yAxes
    const xAxes=[0,1,2,3], yAxes=[0,1,2,3];

    const option = {
      animation: false,
      backgroundColor: '#FFFFFF',
      title: [{
        text: '§5 后处理四件套 · 4 阶段分组柱状图',
        subtext: 'Post-Processing 4-Phase Grouped Bar Chart · 系列 = 4 阶段（正常/满蓄/击发2F/恢复10F）',
        left: 'center', top: 0,
        textStyle: { fontSize: 15, fontWeight: 700, color: '#0F172A' },
        subtextStyle: { fontSize: 11, color: '#64748B' }
      }],
      legend: {
        data: PHASES.map(function(n,i){ return { name:n, itemStyle:{color: COLORS[i]} }; }),
        top: 32, left: 'center',
        itemWidth: 14, itemHeight: 10,
        textStyle: { fontSize: 11, color: '#334155' },
        icon: 'roundRect'
      },
      tooltip: {
        trigger: 'item',
        appendToBody: true,
        confine: false,
        backgroundColor: 'rgba(15,23,42,0.95)',
        borderColor: 'rgba(8,145,178,0.5)',
        borderWidth: 1,
        textStyle: { color: '#F1F5F9', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' },
        formatter: function(p){
          return '<b style="color:#22D3EE">'+p.seriesName+'</b><br/>'
                +'<span style="color:#94A3B8">参数：</span>'+p.name+'<br/>'
                +'<span style="color:#FBBF24">数值：</span><b>'+p.value+'</b>';
        }
      },
      grid: grids,
      xAxis: [
        Object.assign({}, oBloom.xAxis, {gridIndex:0}),
        Object.assign({}, oCG.xAxis,    {gridIndex:1}),
        Object.assign({}, oVig.xAxis,   {gridIndex:2}),
        Object.assign({}, oCA.xAxis,    {gridIndex:3})
      ],
      yAxis: [
        Object.assign({}, oBloom.yAxis, {gridIndex:0}),
        Object.assign({}, oCG.yAxis,    {gridIndex:1}),
        Object.assign({}, oVig.yAxis,   {gridIndex:2}),
        Object.assign({}, oCA.yAxis,    {gridIndex:3})
      ],
      series: [].concat(
        oBloom.series.map(function(s){ return Object.assign({}, s, {xAxisIndex:0, yAxisIndex:0}); }),
        oCG.series.map(function(s){    return Object.assign({}, s, {xAxisIndex:1, yAxisIndex:1}); }),
        oVig.series.map(function(s){   return Object.assign({}, s, {xAxisIndex:2, yAxisIndex:2}); }),
        oCA.series.map(function(s){    return Object.assign({}, s, {xAxisIndex:3, yAxisIndex:3}); })
      )
    };

    // Add sub-titles for each quadrant
    option.title.push(
      { text: 'Bloom', left: '25%', top: 72, textStyle: { fontSize: 12, fontWeight: 700, color: '#B45309', backgroundColor: '#FEF3C7', padding: [3,8], borderRadius: 4 } },
      { text: 'ColorGrading', left: '75%', top: 72, textStyle: { fontSize: 12, fontWeight: 700, color: '#9D174D', backgroundColor: '#FCE7F3', padding: [3,8], borderRadius: 4 } },
      { text: 'Vignette', left: '25%', top: '49%', textStyle: { fontSize: 12, fontWeight: 700, color: '#3730A3', backgroundColor: '#E0E7FF', padding: [3,8], borderRadius: 4 } },
      { text: 'Chromatic', left: '75%', top: '49%', textStyle: { fontSize: 12, fontWeight: 700, color: '#0F766E', backgroundColor: '#CCFBF1', padding: [3,8], borderRadius: 4 } }
    );

    chart.setOption(option);
    window.addEventListener('resize', function(){ chart.resize(); });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', renderAll);
  } else {
    renderAll();
  }
})();
