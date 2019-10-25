import HomePage from './HomePage/index';

export const PATHS = {
  HomePage: '/home'
};

export const Router = [
  {
    key: '1',
    icon: 'home',
    name: 'HomePage',
    isExact: true,
    path: PATHS.HomePage,
    component: HomePage
  }
];
