const axios = require('axios');

class WeatherService {
  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  async getWeatherByCity(city) {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: city,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return this.formatWeatherData(response.data);
    } catch (error) {
      console.error('Weather API error:', error.message);
      return this.getMockWeatherData(city);
    }
  }

  formatWeatherData(data) {
    return {
      location: data.name,
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      icon: data.weather[0].icon,
      recommendations: this.getGardeningRecommendations(data)
    };
  }

  getGardeningRecommendations(weatherData) {
    const recommendations = [];
    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const condition = weatherData.weather[0].main.toLowerCase();

    // Temperature based recommendations
    if (temp > 30) {
      recommendations.push({
        type: 'warning',
        message: 'High temperature: Water plants early morning or late evening'
      });
    } else if (temp < 15) {
      recommendations.push({
        type: 'info',
        message: 'Low temperature: Protect sensitive plants from cold'
      });
    }

    // Humidity based recommendations
    if (humidity > 80) {
      recommendations.push({
        type: 'warning',
        message: 'High humidity: Watch for fungal diseases'
      });
    } else if (humidity < 40) {
      recommendations.push({
        type: 'info',
        message: 'Low humidity: Increase watering frequency'
      });
    }

    // Weather condition based recommendations
    if (condition.includes('rain')) {
      recommendations.push({
        type: 'info',
        message: 'Rain expected: Skip watering today'
      });
    } else if (condition.includes('sun')) {
      recommendations.push({
        type: 'info',
        message: 'Sunny day: Perfect for outdoor gardening'
      });
    } else if (condition.includes('wind')) {
      recommendations.push({
        type: 'warning',
        message: 'Windy conditions: Secure potted plants'
      });
    }

    // General daily recommendations
    recommendations.push({
      type: 'general',
      message: 'Check soil moisture before watering'
    });

    return recommendations;
  }

  getMockWeatherData(city) {
    // Fallback mock data if API fails
    return {
      location: city,
      temperature: 25,
      condition: 'Clear',
      humidity: 65,
      windSpeed: 3,
      icon: '01d',
      recommendations: [
        {
          type: 'general',
          message: 'Check soil moisture before watering'
        },
        {
          type: 'general',
          message: 'Remove any dead leaves regularly'
        }
      ]
    };
  }
}

module.exports = new WeatherService();