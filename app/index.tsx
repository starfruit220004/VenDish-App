import { Redirect } from 'expo-router';

export default function Index() {
  // This immediately redirects the app from "/" to your App.tsx inside (tabs)
  return <Redirect href="/(tabs)/App" />;
}