import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { DrawerScreenProps } from '@react-navigation/drawer';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyOtp: { mobileNumber: string; purpose: 'register' | 'reset_password' | 'verify' };
  ResetPassword: { mobileNumber: string; code: string };
};

// Home Stack
export type HomeStackParamList = {
  HomeScreen: undefined;
  GameDetails: { gameId: string };
  SearchResults: { query: string };
};

// Live Stack
export type LiveStackParamList = {
  LiveScreen: undefined;
  GameDetails: { gameId: string };
};

// Prematch Stack
export type PrematchStackParamList = {
  PrematchScreen: undefined;
  RegionGames: { sportId: number; regionId: number };
  CompetitionGames: { competitionId: number };
  GameDetails: { gameId: string };
};

// Casino Stack
export type CasinoStackParamList = {
  CasinoScreen: undefined;
  GameLaunch: { gameId: string; gameName: string };
  Roulette: undefined;
  VirtualSports: undefined;
};

// Profile Stack
export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Settings: undefined;
};

// Main Tabs
export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Live: NavigatorScreenParams<LiveStackParamList>;
  Prematch: NavigatorScreenParams<PrematchStackParamList>;
  Casino: NavigatorScreenParams<CasinoStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Drawer
export type DrawerParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  BetHistory: undefined;
  Results: undefined;
  Wallet: undefined;
  Deposit: undefined;
  Withdraw: undefined;
  Transactions: undefined;
  BalanceHistory: undefined;
  Bonuses: undefined;
  Favorites: undefined;
  Messages: undefined;
  News: undefined;
  NewsDetail: { newsId: string };
  Jobs: undefined;
  Franchise: undefined;
  Help: undefined;
};

// Main Stack (screens accessible from anywhere in main)
export type MainStackParamList = {
  Drawer: NavigatorScreenParams<DrawerParamList>;
  GameView: { gameId: string };
  Betslip: undefined;
};

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
  Betslip: undefined;
  GameDetails: { gameId: string };
  Search: undefined;
  JobDetail: { jobId: string; jobTitle: string };
};

// Screen Props Types
export type AuthStackScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<AuthStackParamList, T>;
export type HomeStackScreenProps<T extends keyof HomeStackParamList> = NativeStackScreenProps<HomeStackParamList, T>;
export type LiveStackScreenProps<T extends keyof LiveStackParamList> = NativeStackScreenProps<LiveStackParamList, T>;
export type PrematchStackScreenProps<T extends keyof PrematchStackParamList> = NativeStackScreenProps<PrematchStackParamList, T>;
export type CasinoStackScreenProps<T extends keyof CasinoStackParamList> = NativeStackScreenProps<CasinoStackParamList, T>;
export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> = NativeStackScreenProps<ProfileStackParamList, T>;
export type MainTabScreenProps<T extends keyof MainTabParamList> = BottomTabScreenProps<MainTabParamList, T>;
export type DrawerScreenPropsType<T extends keyof DrawerParamList> = DrawerScreenProps<DrawerParamList, T>;
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

// Declare global types for useNavigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
