import React from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MediaCacheProvider } from 'rn-media-cache';
import ImageScreen from './Image';
import VideoScreen from './Video';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

export default function App() {
  return (
    <NavigationContainer>
      <MediaCacheProvider maxProcess={8}>
        <QueryClientProvider client={queryClient}>
          <Tab.Navigator>
            <Tab.Screen name="Image" component={ImageScreen} />
            <Tab.Screen name="Video" component={VideoScreen} />
          </Tab.Navigator>
        </QueryClientProvider>
      </MediaCacheProvider>
    </NavigationContainer>
  );
}
