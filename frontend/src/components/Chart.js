import React from 'react';

function Chart({ 
  data = [], 
  type = 'line', 
  width = '100%', 
  height = 300, 
  title = '', 
  xLabel = '', 
  yLabel = '',
  colors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b'],
  showGrid = true,
  showPoints = true,
  showTooltip = true
}) {
  
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center bg-gray-50 rounded-lg" style={{ height: `${height}px` }}>
        <span className="text-gray-500">No data available</span>
      </div>
    );
  }

  // Calculate dimensions - make responsive
  const margin = { top: 20, right: 30, bottom: 60, left: 80 };
  const containerWidth = typeof width === 'string' ? 500 : width; // Default fallback
  const chartWidth = containerWidth - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Get data ranges
  const xValues = data.map(d => d.x || d.label || d.name);
  const yValues = data.map(d => d.y || d.value || 0);
  const maxY = Math.max(...yValues);
  const minY = Math.min(...yValues, 0);
  const yRange = maxY - minY || 1;

  // Scale functions
  const xScale = (index) => {
    if (type === 'bar') {
      // For bar charts, distribute bars evenly across the width
      const barSpacing = chartWidth / data.length;
      return (index * barSpacing) + (barSpacing / 2); // Center each bar in its slot
    } else {
      // For line/area charts, use the original scaling
      return (index / Math.max(data.length - 1, 1)) * chartWidth;
    }
  };
  const yScale = (value) => chartHeight - ((value - minY) / yRange) * chartHeight;

  // Generate path for line chart
  const generatePath = () => {
    if (data.length === 0) return '';
    
    const points = data.map((d, i) => {
      const x = xScale(i);
      const y = yScale(d.y || d.value || 0);
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  // Generate area path
  const generateAreaPath = () => {
    if (data.length === 0) return '';
    
    const linePath = generatePath();
    const lastPoint = data.length - 1;
    const areaPath = `${linePath} L ${xScale(lastPoint)},${chartHeight} L 0,${chartHeight} Z`;
    
    return areaPath;
  };

  // Y-axis ticks
  const yTicks = [];
  const tickCount = 5;
  for (let i = 0; i <= tickCount; i++) {
    const value = minY + (yRange * i / tickCount);
    yTicks.push({
      value: Math.round(value * 100) / 100,
      y: yScale(value)
    });
  }

  return (
    <div className="w-full h-full flex flex-col">
      {title && (
        <h3 className="text-lg font-bold mb-4 text-gray-800">{title}</h3>
      )}
      
      <div className="flex-1 relative bg-white rounded-lg border border-gray-200 p-4 overflow-hidden">
        <div className="w-full h-full relative">
          <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 ${containerWidth} ${height}`}
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0"
          >
            {/* Grid lines */}
            {showGrid && (
              <g className="grid">
                {yTicks.map((tick, i) => (
                  <line
                    key={i}
                    x1={margin.left}
                    y1={margin.top + tick.y}
                    x2={margin.left + chartWidth}
                    y2={margin.top + tick.y}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                ))}
                {data.map((_, i) => {
                  const gridX = type === 'bar' ? 
                    (i * (chartWidth / data.length)) + (chartWidth / data.length / 2) : // Center of bar slot
                    xScale(i); // Original position for line/area charts
                  
                  return (
                    <line
                      key={i}
                      x1={margin.left + gridX}
                      y1={margin.top}
                      x2={margin.left + gridX}
                      y2={margin.top + chartHeight}
                      stroke="#f8fafc"
                      strokeWidth="1"
                    />
                  );
                })}
              </g>
            )}

            {/* Chart content */}
            <g transform={`translate(${margin.left}, ${margin.top})`}>
              {type === 'line' && (
                <>
                  {/* Area fill */}
                  <path
                    d={generateAreaPath()}
                    fill={`${colors[0]}20`}
                    stroke="none"
                  />
                  
                  {/* Line */}
                  <path
                    d={generatePath()}
                    fill="none"
                    stroke={colors[0]}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Data points */}
                  {showPoints && data.map((d, i) => (
                    <circle
                      key={i}
                      cx={xScale(i)}
                      cy={yScale(d.y || d.value || 0)}
                      r="4"
                      fill={colors[0]}
                      stroke="white"
                      strokeWidth="2"
                      className="hover:r-6 transition-all cursor-pointer"
                    >
                      {showTooltip && (
                        <title>
                          {`${xValues[i]}: ${d.y || d.value || 0}${d.revenue ? `\nRevenue: ₹${d.revenue}` : ''}${d.orders ? `\nOrders: ${d.orders}` : ''}${d.fullName ? `\nDish: ${d.fullName}` : ''}`}
                        </title>
                      )}
                    </circle>
                  ))}
                </>
              )}

              {type === 'bar' && (
                <>
                  {data.map((d, i) => {
                    const barSpacing = chartWidth / data.length;
                    const barWidth = Math.max(barSpacing * 0.7, 20); // 70% of available space, minimum 20px
                    const barHeight = Math.abs(yScale(d.y || d.value || 0) - yScale(0));
                    const barX = (i * barSpacing) + (barSpacing - barWidth) / 2; // Center bar in its slot
                    const barY = Math.min(yScale(d.y || d.value || 0), yScale(0));
                    
                    return (
                      <rect
                        key={i}
                        x={barX}
                        y={barY}
                        width={barWidth}
                        height={barHeight}
                        fill={colors[i % colors.length]}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      >
                        {showTooltip && (
                          <title>
                            {`${xValues[i]}: ${d.y || d.value || 0}${d.revenue ? `\nRevenue: ₹${d.revenue}` : ''}${d.orders ? `\nOrders: ${d.orders}` : ''}${d.fullName ? `\nDish: ${d.fullName}` : ''}${d.profit ? `\nProfit: ₹${d.profit}` : ''}`}
                          </title>
                        )}
                      </rect>
                    );
                  })}
                </>
              )}

              {type === 'area' && (
                <>
                  <path
                    d={generateAreaPath()}
                    fill={colors[0]}
                    fillOpacity="0.6"
                    stroke={colors[0]}
                    strokeWidth="2"
                  />
                  
                  {showPoints && data.map((d, i) => (
                    <circle
                      key={i}
                      cx={xScale(i)}
                      cy={yScale(d.y || d.value || 0)}
                      r="3"
                      fill={colors[0]}
                      stroke="white"
                      strokeWidth="1"
                    >
                      {showTooltip && (
                        <title>
                          {`${xValues[i]}: ${d.y || d.value || 0}${d.revenue ? `\nRevenue: ₹${d.revenue}` : ''}${d.orders ? `\nOrders: ${d.orders}` : ''}${d.fullName ? `\nDish: ${d.fullName}` : ''}`}
                        </title>
                      )}
                    </circle>
                  ))}
                </>
              )}
            </g>

            {/* Y-axis */}
            <g className="y-axis">
              <line
                x1={margin.left}
                y1={margin.top}
                x2={margin.left}
                y2={margin.top + chartHeight}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              {yTicks.map((tick, i) => (
                <g key={i}>
                  <line
                    x1={margin.left - 5}
                    y1={margin.top + tick.y}
                    x2={margin.left}
                    y2={margin.top + tick.y}
                    stroke="#64748b"
                    strokeWidth="1"
                  />
                  <text
                    x={margin.left - 10}
                    y={margin.top + tick.y + 4}
                    textAnchor="end"
                    className="text-xs fill-gray-600"
                    fontSize="11"
                  >
                    {tick.value}
                  </text>
                </g>
              ))}
            </g>

            {/* X-axis */}
            <g className="x-axis">
              <line
                x1={margin.left}
                y1={margin.top + chartHeight}
                x2={margin.left + chartWidth}
                y2={margin.top + chartHeight}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              {data.map((d, i) => {
                const tickX = type === 'bar' ? 
                  (i * (chartWidth / data.length)) + (chartWidth / data.length / 2) : // Center of bar slot
                  xScale(i); // Original position for line/area charts
                
                return (
                  <g key={i}>
                    <line
                      x1={margin.left + tickX}
                      y1={margin.top + chartHeight}
                      x2={margin.left + tickX}
                      y2={margin.top + chartHeight + 5}
                      stroke="#64748b"
                      strokeWidth="1"
                    />
                    <text
                      x={margin.left + tickX}
                      y={margin.top + chartHeight + 20}
                      textAnchor="middle"
                      className="text-xs fill-gray-600"
                      fontSize="11"
                    >
                      {xValues[i]}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Labels */}
            {yLabel && (
              <text
                x={15}
                y={height / 2}
                textAnchor="middle"
                transform={`rotate(-90, 15, ${height / 2})`}
                className="text-sm fill-gray-700 font-medium"
                fontSize="12"
              >
                {yLabel}
              </text>
            )}
            
            {xLabel && (
              <text
                x={containerWidth / 2}
                y={height - 5}
                textAnchor="middle"
                className="text-sm fill-gray-700 font-medium"
                fontSize="12"
              >
                {xLabel}
              </text>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}

export default Chart;