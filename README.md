# StockIQ Dashboard - AI-Powered Investment Management

A modern, AI-powered stock investment management dashboard built with React, TypeScript, and Tailwind CSS. Features real-time stock data, AI-driven price forecasts, sentiment analysis, and intelligent buy/sell recommendations.

![StockIQ Dashboard](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

### 📊 Portfolio Management
- Add and remove favorite stocks
- Real-time price tracking
- Portfolio overview with total value and performance metrics
- Beautiful, responsive card-based layout

### 🤖 AI-Powered Analysis
- **Price Forecasting**: Get AI predictions for 1 day, 1 week, and 1 month
- **Sentiment Analysis**: News-based evaluation of stocks
- **Buy/Sell/Hold Recommendations**: Intelligent suggestions based on market data
- **Confidence Scoring**: AI confidence levels for all predictions

### 📈 Market Intelligence
- Real-time stock prices and changes
- News sentiment analysis
- Market trend indicators
- Professional-grade visualizations

### 🎨 Modern UI/UX
- Dark theme optimized for financial data
- Smooth animations and transitions
- Responsive design for all devices
- Accessibility-first approach

## 🚀 Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui with custom variants
- **Icons**: Lucide React
- **State Management**: React Hooks
- **API Integration**: RESTful architecture ready

## 📦 Production APIs (Free Tier)

This application now uses production-ready APIs with free tiers:

### Current API Integration
- **Alpha Vantage** - Real-time stock data (5 requests/minute, 500/day free)
- **NewsAPI** - Stock news and sentiment (1,000 requests/month free)  
- **Hugging Face** - AI sentiment analysis (generous free tier)

### Features Now Live
✅ Real-time stock prices and changes  
✅ Actual news articles with AI sentiment analysis  
✅ Technical analysis-based price forecasting  
✅ News-driven buy/sell/hold recommendations  
✅ Production error handling with fallbacks

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Git

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd stockiq-dashboard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

```env
# Stock Data API (choose one)
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
VITE_FINNHUB_API_KEY=your_finnhub_key_here
VITE_IEX_CLOUD_API_KEY=your_iex_cloud_key_here

# News API
VITE_NEWS_API_KEY=your_newsapi_key_here

# AI API (choose one)
VITE_HUGGINGFACE_API_KEY=your_huggingface_key_here
VITE_TOGETHER_AI_API_KEY=your_together_ai_key_here
VITE_GROQ_API_KEY=your_groq_key_here

# Optional: Custom API endpoints
VITE_STOCK_API_BASE_URL=https://api.example.com
VITE_NEWS_API_BASE_URL=https://newsapi.org/v2
VITE_AI_API_BASE_URL=https://api.together.xyz
```

### 4. Obtaining API Keys

#### Alpha Vantage (Recommended for beginners)
1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add to `.env` as `VITE_ALPHA_VANTAGE_API_KEY`

#### Finnhub
1. Visit [Finnhub](https://finnhub.io/)
2. Create a free account
3. Generate API key from dashboard
4. Add to `.env` as `VITE_FINNHUB_API_KEY`

#### NewsAPI
1. Visit [NewsAPI](https://newsapi.org/)
2. Register for free account
3. Get API key from dashboard
4. Add to `.env` as `VITE_NEWS_API_KEY`

#### Hugging Face (For AI Analysis)
1. Visit [Hugging Face](https://huggingface.co/)
2. Create account and go to Settings > Access Tokens
3. Create a new token with read permissions
4. Add to `.env` as `VITE_HUGGINGFACE_API_KEY`

### 5. Development Server
```bash
npm run dev
```

Visit `http://localhost:8080` to view the application.

## 🌐 Deployment on Netlify

### Method 1: Git Integration (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Go to [Netlify](https://app.netlify.com/)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Select the repository

3. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

4. **Environment Variables**:
   - Go to Site Settings > Environment Variables
   - Add all the environment variables from your `.env` file:
     ```
     VITE_ALPHA_VANTAGE_API_KEY = your_actual_key
     VITE_NEWS_API_KEY = your_actual_key
     VITE_HUGGINGFACE_API_KEY = your_actual_key
     ```

5. **Deploy**:
   - Click "Deploy site"
   - Your app will be live at `https://your-site-name.netlify.app`

### Method 2: Manual Deploy

1. **Build the Project**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Go to [Netlify](https://app.netlify.com/)
   - Drag and drop the `dist` folder
   - Configure environment variables in site settings

### Environment Variables in Netlify

After deployment, configure these environment variables in Netlify:

1. Go to **Site Settings** > **Environment Variables**
2. Add each variable:

| Variable Name | Description | Example |
|---------------|-------------|---------|
| `VITE_ALPHA_VANTAGE_API_KEY` | Alpha Vantage API key | `ABC123XYZ` |
| `VITE_FINNHUB_API_KEY` | Finnhub API key | `DEF456UVW` |
| `VITE_NEWS_API_KEY` | NewsAPI key | `GHI789RST` |
| `VITE_HUGGINGFACE_API_KEY` | Hugging Face API key | `hf_abc123def456` |

## 🔧 Configuration

### Switching APIs

The application is designed to be flexible with API providers. To switch APIs:

1. **Update Environment Variables**: Change the API keys in your `.env` file
2. **Modify API Service**: Update `src/services/stockApi.ts` to use different endpoints
3. **Redeploy**: Push changes and redeploy

### Customizing the AI Model

To use different AI models for analysis:

1. **Hugging Face Models**: Update the model name in the API calls
2. **OpenAI Compatible**: Change the base URL and model parameters
3. **Custom Models**: Implement your own analysis logic

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── StockCard.tsx   # Individual stock display
│   ├── AddStockForm.tsx# Add new stocks
│   ├── ForecastCard.tsx# AI predictions
│   └── ...
├── services/           # API services
│   └── stockApi.ts     # Stock data integration
├── hooks/              # Custom React hooks
├── pages/              # Page components
└── lib/                # Utilities
```

## 🎨 Customization

### Design System

The app uses a comprehensive design system defined in:
- `src/index.css` - CSS custom properties
- `tailwind.config.ts` - Tailwind configuration

### Color Themes

Update colors in `src/index.css`:
```css
:root {
  --primary: 200 100% 50%;        /* Blue */
  --success: 142 76% 36%;         /* Green */
  --danger: 0 84.2% 60.2%;        /* Red */
  --warning: 48 96% 53%;          /* Yellow */
}
```

### Component Variants

Add new variants in component files:
```typescript
// In src/components/ui/button.tsx
variant: {
  // Add custom variants
  premium: "bg-gradient-to-r from-purple-500 to-pink-500",
}
```

## 🔒 Security Best Practices

1. **API Keys**: Never commit API keys to version control
2. **Environment Variables**: Use Netlify's environment variable system
3. **CORS**: Configure API CORS settings appropriately
4. **Rate Limiting**: Implement client-side rate limiting for APIs

## 🚨 Troubleshooting

### Common Issues

1. **API Rate Limits**:
   - Implement caching for API responses
   - Add retry logic with exponential backoff
   - Use multiple API providers for redundancy

2. **Build Errors**:
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Environment Variables Not Working**:
   - Ensure variables start with `VITE_`
   - Restart development server after adding variables
   - Check Netlify environment variable configuration

### API Response Formats

Different APIs return data in different formats. Update the `stockApi.ts` service to handle various response structures:

```typescript
// Alpha Vantage format
const alphaVantagePrice = data['Global Quote']['05. price'];

// Finnhub format  
const finnhubPrice = data.c; // Current price

// IEX Cloud format
const iexPrice = data.latestPrice;
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Alpha Vantage](https://www.alphavantage.co/) for stock data API
- [NewsAPI](https://newsapi.org/) for news data
- [Hugging Face](https://huggingface.co/) for AI models
- [shadcn/ui](https://ui.shadcn.com/) for component library
- [Lucide](https://lucide.dev/) for icons

## 📞 Support

If you encounter any issues:

1. Check the [troubleshooting section](#-troubleshooting)
2. Review API documentation for your chosen providers
3. Open an issue on GitHub with detailed error information

---

**Happy Trading! 📈🚀**

> **Disclaimer**: This application is for educational and informational purposes only. It does not constitute financial advice. Always do your own research and consult with financial professionals before making investment decisions.