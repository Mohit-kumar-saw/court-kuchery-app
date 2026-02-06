# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

---

## Troubleshooting (important for production)

This project uses **Expo Router** (file-based routing) + React state. Two common issues you may hit during development are:

### 1) `Maximum update depth exceeded` (infinite re-render loop)

**What it means**

React detected a loop where a component keeps calling `setState` (directly or indirectly) and never stops.

**What caused it here**

Our splash screen (`app/(splash)/welcome.tsx`) had an **auto-advance timer** (Loading → Slide 2). On web, scroll/momentum events can be flaky, and our effect could re-trigger in a way that repeatedly scheduled state updates.

**How we fixed it**

We made the auto-advance run **only once** using a `ref` flag:

```ts
const hasAutoAdvancedRef = useRef(false);

useEffect(() => {
  if (hasAutoAdvancedRef.current) return;
  const id = setTimeout(() => {
    setCurrentIndex((prev) => {
      if (prev !== 0) return prev;
      hasAutoAdvancedRef.current = true;
      scrollRef.current?.scrollTo({ x: SCREEN_WIDTH, animated: true });
      return 1;
    });
  }, 2500);
  return () => clearTimeout(id);
}, []);
```

**What is `hasAutoAdvancedRef`?**

- `useRef(...)` stores a value that **does not trigger re-renders** when it changes.
- We use it as a simple “did we already auto-advance?” flag.
- This prevents calling `setCurrentIndex` repeatedly when we only want a single auto-advance.

**If this happens again, use this approach**

- **Step 1:** Find the component that is updating state in a loop (look at the top of the error stack).
- **Step 2:** Search for:
  - `setState(...)` inside `useEffect` / `useLayoutEffect`
  - effects that depend on state they update (e.g. `useEffect(..., [state])` + `setState(...)`)
- **Step 3:** Add a guard:
  - Compare previous vs next (only set when different)
  - Or use a `useRef` boolean to ensure a one-time action
- **Step 4:** Clear timers / subscriptions in cleanup (`return () => ...`)

### 2) Expo Router group paths vs URL paths (web)

**Symptom**

- You navigate to a route and the app seems to “bounce” or get stuck.
- Sometimes this also shows up as repeated redirects (which can lead to update depth errors).

**Cause**

In Expo Router, folders in parentheses are **route groups**:

- `app/(auth)/login.tsx` is reachable at **`/login`**
- `app/(splash)/welcome.tsx` is reachable at **`/welcome`**

The `(auth)` / `(splash)` part is **not in the URL**.

**Fix**

Use URL-safe paths in `constants/routes.ts` for web:

- `ROUTES.AUTH.LOGIN = '/login'`
- `ROUTES.SPLASH.WELCOME = '/welcome'`

### 3) When your UI doesn’t reflect code changes

If you edit a screen (like changing “Lawyers” → “Lawyerssss”) but the UI doesn’t change:

- Stop the dev server and restart with cache clear:

```bash
npx expo start -c
```

- Hard reload the browser: `Ctrl+Shift+R`

