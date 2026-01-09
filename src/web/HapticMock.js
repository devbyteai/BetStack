const HapticFeedback = {
  trigger: (type, options) => {
    console.log('[HapticMock] trigger:', type);
  },
};

export const HapticFeedbackTypes = {
  selection: 'selection',
  impactLight: 'impactLight',
  impactMedium: 'impactMedium',
  impactHeavy: 'impactHeavy',
  rigid: 'rigid',
  soft: 'soft',
  notificationSuccess: 'notificationSuccess',
  notificationWarning: 'notificationWarning',
  notificationError: 'notificationError',
};

export default HapticFeedback;
