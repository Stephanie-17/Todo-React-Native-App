# 📝 Todo App

A beautiful, modern todo application built with React Native (Expo Router) and Convex for real-time data synchronization. Features a sleek dark/light theme design with drag-and-drop reordering.



## ✨ Features

- ✅ **CRUD Operations** - Create, read, update, and delete todos
- 🎨 **Theme Toggle** - Switch between dark and light modes
- 📱 **Responsive Design** - Works seamlessly on mobile and desktop
- 🔄 **Real-time Sync** - Changes sync instantly across all devices via Convex
- 🎯 **Drag & Drop** - Reorder todos with intuitive drag-and-drop
- 🔍 **Smart Filters** - View All, Active, or Completed todos
- 💾 **Persistent Storage** - Your todos are saved permanently in Convex database
- 🎭 **Custom Fonts** - Beautiful typography with SpaceMono
- ⚡ **Smooth Animations** - Polished UI with smooth transitions
- 🗂️ **File-based Routing** - Powered by Expo Router


## 🚀 Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo Router](https://expo.github.io/router/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend**: [Convex](https://www.convex.dev/) - Real-time database & backend
- **Build Tool**: [EAS Build](https://docs.expo.dev/build/introduction/)
- **Fonts**: SpaceMono

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI**
- **Expo Go** app (for testing on mobile)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/Stephanie-17/Todo-React-Native-App.git
cd Todo-React-Native-App
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Convex

```bash
# Login to Convex (creates free account if needed)
npx convex dev
```

This will:
- Create a new Convex deployment
- Generate your deployment URL
- Start the Convex dev server
- Create the `convex/_generated` folder

### 4. Configure environment

Create a `.env.local` file in the root directory:

```env
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

Replace with the URL from step 3.

### 5. Start the development server

```bash
npx expo start
```

Then:
- Press **`a`** for Android
- Press **`i`** for iOS  
- Press **`w`** for Web
- Scan QR code with **Expo Go** app on your phone

## 📁 Project Structure

```
todo-app/
├── app/                      # Expo Router screens
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Tab navigation
│   │   └── index.tsx        # Main todo screen
│   └── _layout.tsx          # Root layout with providers
├── assets/
│   ├── fonts/               # Custom fonts (Josefin Sans)
│   └── images/              # Images and icons
├── convex/
│   ├── _generated/          # Auto-generated Convex files
│   ├── schema.ts            # Database schema
│   └── todos.ts             # CRUD functions & queries
├── .env.local               # Environment variables (create this)
├── eas.json                 # EAS Build configuration
├── app.json                 # Expo configuration
├── package.json             # Dependencies
└── README.md                # You are here!
```

## 🎯 Key Features Explained

### Real-time Sync with Convex

All todo operations sync in real-time across devices:

```typescript
// Query todos (auto-updates on changes)
const todos = useQuery(api.todos.getTodos);

// Add todo
const addTodo = useMutation(api.todos.addTodo);
await addTodo({ text: "New todo" });

// Toggle completion
const toggleTodo = useMutation(api.todos.toggleTodo);
await toggleTodo({ id: todoId });
```

### Drag & Drop Reordering

Long-press and drag todos to reorder them:

```typescript
const createPanResponder = (todoId: string, index: number) => {
  return PanResponder.create({
    onPanResponderMove: (_, gestureState) => {
      // Calculate new position and reorder
      moveTodo(fromIndex, toIndex);
    },
  });
};
```

### Theme System

Toggle between dark and light modes:

```typescript
const [theme, setTheme] = useState<'light' | 'dark'>('dark');

const colors = theme === 'light' 
  ? lightColors  // Light theme colors
  : darkColors;  // Dark theme colors
```

## 🔧 Convex Schema

### Database Structure

```typescript
// convex/schema.ts
export default defineSchema({
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
    order: v.number(),
    createdAt: v.number(),
  }).index("by_order", ["order"]),
});
```

### Available Functions

| Function | Type | Description |
|----------|------|-------------|
| `getTodos` | Query | Fetch all todos ordered by position |
| `addTodo` | Mutation | Create a new todo |
| `toggleTodo` | Mutation | Mark todo as complete/incomplete |
| `deleteTodo` | Mutation | Delete a specific todo |
| `reorderTodos` | Mutation | Update todo positions after drag-drop |
| `clearCompleted` | Mutation | Remove all completed todos |

## 📱 Building for Production

### Build Android APK

```bash
# Install EAS CLI (first time only)
npm install -g eas-cli

# Login to Expo
eas login

# Build APK for testing
eas build --platform android --profile preview

# Build for Play Store (AAB)
eas build --platform android --profile production
```

Download the APK from the link provided after build completes (~10-20 minutes).

### Build iOS IPA

```bash
eas build --platform ios --profile preview
```

**Note**: iOS builds require an Apple Developer account ($99/year).

## 🎨 Customization

### Change Colors

Edit the `colors` object in `app/(tabs)/index.tsx`:

```typescript
const colors = theme === 'light' 
  ? {
      background: '#fafafa',
      cardBg: '#ffffff',
      primary: '#3a7bfd',
      // ... more colors
    }
  : {
      background: '#161722',
      cardBg: '#25273c',
      primary: '#5e93f5',
      // ... more colors
    };
```

### Add Custom Fonts

1. Place font files in `assets/fonts/`
2. Update `app/_layout.tsx`:

```typescript
const [fontsLoaded] = useFonts({
  'YourFont-Regular': require('../assets/fonts/YourFont-Regular.ttf'),
});
```

3. Use in styles: `fontFamily: 'YourFont-Regular'`

## 🧪 Development

### Run Development Server

```bash
npx expo start
```

### Type Checking

```bash
npx tsc --noEmit
```

### Lint Code

```bash
npm run lint
```

## 🐛 Troubleshooting

### Convex Connection Issues

```bash
# Restart Convex dev server
npx convex dev

# Verify .env.local has correct URL
cat .env.local
```

### Fonts Not Loading

```bash
# Clear Expo cache
npx expo start --clear
```

### Build Errors

```bash
# Clear node modules and reinstall
rm -rf node_modules
npm install
npx expo start --clear
```

### EAS Build Fails

- Check that `EXPO_PUBLIC_CONVEX_URL` is in `eas.json`
- Verify `app.json` has correct `android.package` name
- Run `npx tsc --noEmit` to check for TypeScript errors

## 🚀 Deployment

### Deploy Convex to Production

```bash
npx convex deploy
```

Update `eas.json` with production Convex URL.

### Publish to Google Play Store

1. Build production bundle: `eas build --platform android --profile production`
2. Create Google Play Developer account ($25 one-time)
3. Upload AAB file to Play Console
4. Fill in store listing details
5. Submit for review

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 👨‍💻 Author

Emenike Stephanie
- GitHub: [@Stephanie-17](https://github.com/Stephanie-17)
- Email: emenikesteph@gmail.com


## 📚 Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Documentation](https://expo.github.io/router/docs/)
- [Convex Documentation](https://docs.convex.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🌟 Star This Repo!

If you found this project helpful, please give it a ⭐️ on GitHub!

---

**Made with ❤️ using React Native, Expo Router, and Convex**