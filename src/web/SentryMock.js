import React from 'react';

export const init = (options) => {
  console.log('[SentryMock] init:', options);
};

export const captureException = (error, context) => {
  console.error('[SentryMock] captureException:', error, context);
};

export const captureMessage = (message, level) => {
  console.log('[SentryMock] captureMessage:', level, message);
};

export const setUser = (user) => {
  console.log('[SentryMock] setUser:', user);
};

export const setTag = (key, value) => {
  console.log('[SentryMock] setTag:', key, value);
};

export const setExtra = (key, value) => {
  console.log('[SentryMock] setExtra:', key, value);
};

export const addBreadcrumb = (breadcrumb) => {
  console.log('[SentryMock] addBreadcrumb:', breadcrumb);
};

export const withScope = (callback) => {
  const scope = {
    setTag: () => {},
    setExtra: () => {},
  };
  callback(scope);
};

export const startInactiveSpan = (options) => {
  return {
    finish: () => {},
    end: () => {},
  };
};

export const reactNavigationIntegration = () => ({
  registerNavigationContainer: () => {},
});

export const ErrorBoundary = ({ children, fallback }) => {
  return children;
};

export default {
  init,
  captureException,
  captureMessage,
  setUser,
  setTag,
  setExtra,
  addBreadcrumb,
  withScope,
  startInactiveSpan,
  reactNavigationIntegration,
  ErrorBoundary,
};
