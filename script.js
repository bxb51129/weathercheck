const API_KEY = "c8c67b9387b94a0c872175739251304"; // WeatherAPI.com API密钥

// 从本地存储加载历史记录
let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];

// 中文城市名到拼音的映射
const cityNameMap = {
  '北京': 'Beijing',
  '上海': 'Shanghai',
  '广州': 'Guangzhou',
  '深圳': 'Shenzhen',
  '杭州': 'Hangzhou',
  '南京': 'Nanjing',
  '成都': 'Chengdu',
  '重庆': 'Chongqing',
  '武汉': 'Wuhan',
  '西安': "Xi'an",
  '天津': 'Tianjin',
  '苏州': 'Suzhou',
  '厦门': 'Xiamen',
  '长沙': 'Changsha',
  '青岛': 'Qingdao'
};

// 更新历史记录显示
function updateHistoryDisplay() {
  const historyList = document.getElementById('historyList');
  historyList.innerHTML = '';
  
  history.forEach((item, index) => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
      <div class="history-content">
        <div class="history-city">${item.city}</div>
        <div class="history-weather">
          <span>${item.weather}</span>
          <span class="history-temp">${item.temp}°C</span>
          <span class="history-feels">体感: ${item.feelsLike}°C</span>
        </div>
        <div class="history-time">${new Date(item.timestamp).toLocaleString()}</div>
      </div>
      <div class="history-buttons">
        <button class="refresh-btn" data-index="${index}">🔄</button>
        <button class="delete-btn" data-index="${index}">删除</button>
      </div>
    `;
    
    // 添加城市点击事件
    historyItem.querySelector('.history-content').onclick = () => {
      document.getElementById('cityInput').value = item.city;
      getWeather();
    };
    
    // 添加刷新按钮点击事件
    const refreshBtn = historyItem.querySelector('.refresh-btn');
    refreshBtn.onclick = (e) => {
      e.stopPropagation(); // 阻止事件冒泡
      document.getElementById('cityInput').value = item.city;
      getWeather();
    };
    
    // 添加删除按钮点击事件
    const deleteBtn = historyItem.querySelector('.delete-btn');
    deleteBtn.onclick = (e) => {
      e.stopPropagation(); // 阻止事件冒泡
      deleteHistoryItem(index);
    };
    
    historyList.appendChild(historyItem);
  });
}

// 删除历史记录项
function deleteHistoryItem(index) {
  history.splice(index, 1);
  localStorage.setItem('weatherHistory', JSON.stringify(history));
  updateHistoryDisplay();
}

// 添加历史记录
function addToHistory(city, weatherData) {
  // 检查是否已存在相同的城市
  const existingIndex = history.findIndex(item => item.city.toLowerCase() === city.toLowerCase());
  if (existingIndex !== -1) {
    // 如果存在，更新数据
    history[existingIndex] = {
      city: city,
      timestamp: new Date().getTime(),
      weather: weatherData.current.condition.text,
      temp: weatherData.current.temp_c,
      feelsLike: weatherData.current.feelslike_c
    };
  } else {
    // 如果不存在，添加新记录
    history.push({
      city: city,
      timestamp: new Date().getTime(),
      weather: weatherData.current.condition.text,
      temp: weatherData.current.temp_c,
      feelsLike: weatherData.current.feelslike_c
    });
  }
  
  // 按时间戳排序（最新的在前面）
  history.sort((a, b) => b.timestamp - a.timestamp);
  
  // 限制历史记录数量为10条
  if (history.length > 10) {
    history = history.slice(0, 10);
  }
  
  localStorage.setItem('weatherHistory', JSON.stringify(history));
  updateHistoryDisplay();
}

function validateCityInput(city) {
  // 移除首尾空格
  city = city.trim();
  
  // 检查是否为空
  if (!city) {
    return {
      isValid: false,
      message: "⚠️ 请输入城市名"
    };
  }
  
  // 检查是否只包含字母、中文和空格
  if (!/^[a-zA-Z\u4e00-\u9fa5\s]+$/.test(city)) {
    return {
      isValid: false,
      message: "⚠️ 城市名只能包含字母、中文和空格"
    };
  }
  
  return {
    isValid: true,
    message: ""
  };
}

function getWeather() {
  const city = document.getElementById("cityInput").value;
  const resultDiv = document.getElementById("result");

  // 验证输入
  const validation = validateCityInput(city);
  if (!validation.isValid) {
    resultDiv.innerText = validation.message;
    return;
  }

  resultDiv.innerText = "正在查询中...";

  // 检查是否是中文城市名，如果是则转换为拼音
  const queryCity = cityNameMap[city] || city;
  
  // 对城市名进行URL编码
  const encodedCity = encodeURIComponent(queryCity);
  const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodedCity}&lang=zh`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
        });
      }
      return response.json();
    })
    .then(data => {
      const weather = data.current.condition.text;
      const temp = data.current.temp_c;
      const feelsLike = data.current.feelslike_c;
      const name = data.location.name;

      resultDiv.innerHTML = `
        <div class="weather-info">
          <p>📍 城市：${name}</p>
          <p>🌡️ 温度：${temp}°C</p>
          <p>☁️ 天气：${weather}</p>
          <p>🤗 体感：${feelsLike}°C</p>
        </div>
      `;
      
      // 查询成功后添加到历史记录，传入完整的天气数据
      addToHistory(city, data);
    })
    .catch(error => {
      console.error('Error details:', error);
      let errorMessage = "";
      
      if (error.message.includes("401")) {
        errorMessage = "❌ API密钥无效，请检查API密钥配置";
      } else if (error.message.includes("404") || error.message.includes("No matching location found")) {
        errorMessage = `
          <div class="error-message">
            <p>🌍 找不到该城市</p>
            <p class="error-tip">请检查：</p>
            <ul>
              <li>城市名称是否正确</li>
              <li>是否使用了正确的语言（支持中文和英文）</li>
              <li>是否输入了完整的城市名</li>
            </ul>
            <p class="error-tip">支持的城市：</p>
            <ul>
              <li>北京、上海、广州、深圳</li>
              <li>杭州、南京、成都、重庆</li>
              <li>武汉、西安、天津、苏州</li>
              <li>厦门、长沙、青岛</li>
            </ul>
          </div>
        `;
      } else {
        errorMessage = `
          <div class="error-message">
            <p>❌ 查询失败</p>
            <p class="error-tip">请稍后再试</p>
          </div>
        `;
      }
      
      resultDiv.innerHTML = errorMessage;
    });
}

// 添加输入框的实时验证
document.getElementById('cityInput').addEventListener('input', function(e) {
  const validation = validateCityInput(e.target.value);
  const resultDiv = document.getElementById("result");
  
  if (!validation.isValid) {
    resultDiv.innerText = validation.message;
  } else {
    resultDiv.innerText = "";
  }
});

// 页面加载时显示历史记录
document.addEventListener('DOMContentLoaded', updateHistoryDisplay);
