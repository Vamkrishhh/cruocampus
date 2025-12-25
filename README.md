# 🏢 Room Genius - Campus Resource Utilization Optimizer

## 🌐 Live Preview
**[View Live Application](https://cruocampus.lovable.app/)**

## 📋 Project Description

Room Genius (CRUO - Campus Resource Utilization Optimizer) is an AI-powered campus room booking platform designed to maximize campus space utilization. It provides real-time availability, AI-powered scheduling suggestions, QR-based check-in, and seamless room management.

### ✨ Key Features

- **Smart Room Booking**: Easily book campus rooms with real-time availability
- **AI-Powered Suggestions**: Get intelligent recommendations for room navigation and optimal booking times
- **QR Code Check-in**: Generate and scan QR codes for quick room access verification
- **Real-time Dashboard**: View all bookings with clickable room details
- **MyBookings Management**: Track your bookings, generate QR codes, and manage check-out
- **Email Notifications**: Get automated booking confirmations and reminders
- **Google Sign-In**: Secure authentication for campus users
- **Supabase Integration**: Real-time database for seamless data synchronization

## 📊 Project Statistics

- **50+** Campus Rooms
- **1000+** Active Users
- **5000+** Bookings Made
- **98%** Check-in Rate

## 🛠️ Technology Stack

### Frontend
- **React** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Navigation

### Backend & Services
- **Supabase** - Real-time database & authentication
- **Node.js** - Runtime environment
- **PostCSS** - CSS processing

### Development Tools
- **ESLint** - Code quality
- **TypeScript ESLint** - Type checking
- **Vite Config** - Build optimization

## 📦 Project Structure

```
├── src/
│   ├── pages/
│   │   ├── AISuggest.tsx        # AI-powered room suggestions
│   │   ├── CheckIn.tsx           # QR code check-in
│   │   ├── Dashboard.tsx         # Bookings overview
│   │   ├── MyBookings.tsx        # User bookings management
│   │   └── RoomDetail.tsx        # Room information
│   ├── components/
│   ├── styles/
│   └── App.tsx
├── public/                       # Static assets
├── supabase/                     # Database configuration
└── Configuration files
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vamkrishhh/cruocampus.git
   cd cruocampus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Update .env.local with your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   ```
   http://localhost:5173
   ```

## 📚 How to Develop

### Using Lovable (Recommended)
Visit the [Lovable Project](https://lovable.dev/projects/dc452be6-9760-4639-a267-d43ab298b372) and start prompting to make changes. Changes are automatically committed to this repository.

### Using Your Preferred IDE

1. Clone this repository
2. Install dependencies: `npm install`
3. Make your changes
4. Push your changes to GitHub: `git push`
5. Changes will automatically sync with Lovable

## 📝 Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Vamkrishhh** - GitHub: [@Vamkrishhh](https://github.com/Vamkrishhh)

## 📞 Support

For support, email support@cruocampus.app or open an issue on GitHub.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev) - No-code AI development platform
- Deployed on [Lovable Cloud](https://lovable.dev)
- Database powered by [Supabase](https://supabase.com)
- Styling with [Tailwind CSS](https://tailwindcss.com)

---

**Made with ❤️ for Campus Communities**
