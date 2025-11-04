# 📝 Todo App

A beautiful, modern todo application built with React Native (Expo) and Convex for real-time data synchronization.

![Todo App](./assets/screenshot.png)

## ✨ Features

- ✅ Create, read, update, and delete todos
- 🎨 Dark and Light theme support
- 📱 Responsive design (Mobile & Desktop)
- 🔄 Real-time sync across devices (Convex)
- 🎯 Drag and drop to reorder todos
- 🔍 Filter todos (All, Active, Completed)
- 💾 Persistent storage with Convex database
- 🎭 Custom fonts (Josefin Sans)
- ⚡ Fast and smooth animations

## 🚀 Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Database**: Convex (Real-time backend)
- **State Management**: Convex Queries & Mutations
- **Styling**: React Native StyleSheet
- **Fonts**: Josefin Sans from Google Fonts

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development) or Xcode (for iOS development)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/todo-app.git
cd todo-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Convex

```bash
npx convex dev
```

This will:
- Create a Convex deployment
- Generate your deployment URL
- Start the Convex dev server

### 4. Configure environment variables

Create a `.env.local` file in the root directory:

```env
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

Replace `your-deployment.convex.cloud` with your actual Convex URL from step 3.

### 5. Add fonts (Optional)

Download Josefin Sans from [Google Fonts](https://fonts.google.com/specimen/Josefin+Sans) and place the font files in:

```
assets/fonts/
├── Josefin-Sans-Regular.ttf
├── Josefin-Sans-Bold.ttf
└── Josefin-Sans-Light.ttf
```

### 6. Run the app

```bash
npx expo start
```

Then:
- Press `a` for Android
- Press `i` for iOS
- Press `w` for Web
- Scan QR code with Expo Go app

## 📁 Project Structure

```
todo-app/
├── assets/
│   ├── fonts/           # Custom fonts
│   └── images/          # Images and icons
├── convex/
│   ├── schema.ts        # Database schema
│   └── todos.ts         # CRUD functions
├── hooks/
│   ├── useFonts.ts      # Font loading hook
│   └── ThemeContext.tsx # Theme management
├── screens/
│   └── TodoApp.tsx      # Main app screen
├── App.tsx              # Entry point
├── app.json             # Expo configuration
├── package.json         # Dependencies
└── README.md            # This file
```

## 🎨 Customization

### Change Theme Colors

Edit the `colors` object in `TodoApp.tsx`:

```typescript
const colors = theme === 'light' 
  ? {
      background: '#fafafa',
      cardBg: '#ffffff',
      // ... other colors
    }
  : {
      background: '#161722',
      cardBg: '#25273c',
      // ... other colors
    };
```

### Modify Fonts

Update font families in your StyleSheet:

```typescript
fontFamily: 'YourCustomFont-Regular'
```

## 📱 Building for Production

### Android (APK)

```bash
# Build for Android
eas build --platform android --profile preview

# Or for development build
npx expo run:android
```

### iOS (IPA)

```bash
# Build for iOS
eas build --platform ios --profile preview

# Or for development build
npx expo run:ios
```

See the [Build APK Guide](#) section below for detailed instructions.

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 🐛 Troubleshooting

### Fonts not loading
```bash
npx expo start --clear
```

### Convex connection issues
- Check your `.env.local` file
- Ensure Convex dev server is running: `npx convex dev`
- Verify your deployment URL is correct

### Build errors
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start --clear
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👨‍💻 Author
email: emenikesteph'gmail.com
Project Link: [https://github.com/yourusername/todo-app](https://github.com/yourusername/todo-app)



---

Made with ❤️ using React Native and Convex