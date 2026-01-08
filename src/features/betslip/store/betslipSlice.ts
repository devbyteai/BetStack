import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { BetslipState, BetSelection, BetType, OddsAcceptance, BalanceSource } from '../types';

// Betting limits - should match backend
const MAX_SELECTIONS = 20;

const initialState: BetslipState = {
  selections: [],
  betType: 'single',
  stakes: {},
  totalStake: 0,
  oddsAcceptance: 'none',
  source: 'main_balance',
  isOpen: false,
  isPlacing: false,
  error: null,
  // Quick Bet state
  quickBetEnabled: false,
  quickBetStake: 10,
  quickBetSelection: null,
  isQuickBetDialogOpen: false,
  // Auto-Cashout state
  autoCashoutEnabled: false,
  autoCashoutValue: null,
};

const betslipSlice = createSlice({
  name: 'betslip',
  initialState,
  reducers: {
    // Add a selection to the betslip
    addSelection: (state, action: PayloadAction<BetSelection>) => {
      const exists = state.selections.find(
        (s) => s.eventId === action.payload.eventId
      );

      if (exists) {
        // Already exists - remove it (toggle behavior)
        state.selections = state.selections.filter(
          (s) => s.eventId !== action.payload.eventId
        );
        delete state.stakes[action.payload.eventId];
      } else {
        // Check max selections limit
        if (state.selections.length >= MAX_SELECTIONS) {
          state.error = `Maximum ${MAX_SELECTIONS} selections allowed`;
          return;
        }

        // Check for conflicting selection from same game
        const conflicting = state.selections.find(
          (s) => s.gameId === action.payload.gameId && s.marketId === action.payload.marketId
        );

        if (conflicting) {
          // Replace conflicting selection
          state.selections = state.selections.filter(
            (s) => !(s.gameId === action.payload.gameId && s.marketId === action.payload.marketId)
          );
          delete state.stakes[conflicting.eventId];
        }

        state.selections.push(action.payload);
        state.stakes[action.payload.eventId] = 0;
      }

      // Auto-set bet type based on selection count
      if (state.selections.length === 1) {
        state.betType = 'single';
      } else if (state.selections.length > 1 && state.betType === 'single') {
        state.betType = 'multiple';
      }

      state.error = null;
    },

    // Remove a selection
    removeSelection: (state, action: PayloadAction<string>) => {
      state.selections = state.selections.filter((s) => s.eventId !== action.payload);
      delete state.stakes[action.payload];

      if (state.selections.length === 1) {
        state.betType = 'single';
      }

      state.error = null;
    },

    // Clear all selections
    clearSelections: (state) => {
      state.selections = [];
      state.stakes = {};
      state.totalStake = 0;
      state.betType = 'single';
      state.systemVariant = undefined;
      state.error = null;
    },

    // Update odds for a selection (real-time update)
    updateSelectionOdds: (
      state,
      action: PayloadAction<{ eventId: string; odds: number; isSuspended?: boolean }>
    ) => {
      const selection = state.selections.find((s) => s.eventId === action.payload.eventId);
      if (selection) {
        selection.odds = action.payload.odds;
        if (action.payload.isSuspended !== undefined) {
          selection.isSuspended = action.payload.isSuspended;
        }
      }
    },

    // Batch update odds
    updateOddsBatch: (
      state,
      action: PayloadAction<{ eventId: string; odds: number; isSuspended?: boolean }[]>
    ) => {
      for (const update of action.payload) {
        const selection = state.selections.find((s) => s.eventId === update.eventId);
        if (selection) {
          selection.odds = update.odds;
          if (update.isSuspended !== undefined) {
            selection.isSuspended = update.isSuspended;
          }
        }
      }
    },

    // Set stake for a single selection
    setSelectionStake: (
      state,
      action: PayloadAction<{ eventId: string; stake: number }>
    ) => {
      state.stakes[action.payload.eventId] = action.payload.stake;
    },

    // Set total stake (for multiples)
    setTotalStake: (state, action: PayloadAction<number>) => {
      state.totalStake = action.payload;
    },

    // Set bet type
    setBetType: (state, action: PayloadAction<BetType>) => {
      state.betType = action.payload;

      // Reset system variant if not system bet
      if (action.payload !== 'system') {
        state.systemVariant = undefined;
      }
    },

    // Set system variant (e.g., "2/3", "3/4")
    setSystemVariant: (state, action: PayloadAction<string>) => {
      state.systemVariant = action.payload;
    },

    // Set odds acceptance mode
    setOddsAcceptance: (state, action: PayloadAction<OddsAcceptance>) => {
      state.oddsAcceptance = action.payload;
    },

    // Set balance source
    setSource: (state, action: PayloadAction<BalanceSource>) => {
      state.source = action.payload;
    },

    // Set free bet
    setFreeBet: (state, action: PayloadAction<string | undefined>) => {
      state.freeBetId = action.payload;
    },

    // Toggle betslip drawer
    toggleBetslip: (state) => {
      state.isOpen = !state.isOpen;
    },

    // Open betslip
    openBetslip: (state) => {
      state.isOpen = true;
    },

    // Close betslip
    closeBetslip: (state) => {
      state.isOpen = false;
    },

    // Set placing state
    setIsPlacing: (state, action: PayloadAction<boolean>) => {
      state.isPlacing = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Set booking code
    setBookingCode: (state, action: PayloadAction<string>) => {
      state.lastBookingCode = action.payload;
    },

    // Load selections from booking code
    loadFromBookingCode: (state, action: PayloadAction<BetSelection[]>) => {
      state.selections = action.payload;
      state.stakes = {};
      for (const sel of action.payload) {
        state.stakes[sel.eventId] = 0;
      }
      state.betType = action.payload.length === 1 ? 'single' : 'multiple';
      state.error = null;
    },

    // Quick Bet actions
    toggleQuickBetMode: (state) => {
      state.quickBetEnabled = !state.quickBetEnabled;
    },

    setQuickBetEnabled: (state, action: PayloadAction<boolean>) => {
      state.quickBetEnabled = action.payload;
    },

    setQuickBetStake: (state, action: PayloadAction<number>) => {
      state.quickBetStake = action.payload;
    },

    openQuickBetDialog: (state, action: PayloadAction<BetSelection>) => {
      state.quickBetSelection = action.payload;
      state.isQuickBetDialogOpen = true;
      state.error = null;
    },

    closeQuickBetDialog: (state) => {
      state.quickBetSelection = null;
      state.isQuickBetDialogOpen = false;
    },

    clearQuickBetSelection: (state) => {
      state.quickBetSelection = null;
    },

    // Auto-Cashout actions
    toggleAutoCashout: (state) => {
      state.autoCashoutEnabled = !state.autoCashoutEnabled;
      if (!state.autoCashoutEnabled) {
        state.autoCashoutValue = null;
      }
    },

    setAutoCashoutEnabled: (state, action: PayloadAction<boolean>) => {
      state.autoCashoutEnabled = action.payload;
      if (!action.payload) {
        state.autoCashoutValue = null;
      }
    },

    setAutoCashoutValue: (state, action: PayloadAction<number | null>) => {
      state.autoCashoutValue = action.payload;
    },

    clearAutoCashout: (state) => {
      state.autoCashoutEnabled = false;
      state.autoCashoutValue = null;
    },
  },
});

export const {
  addSelection,
  removeSelection,
  clearSelections,
  updateSelectionOdds,
  updateOddsBatch,
  setSelectionStake,
  setTotalStake,
  setBetType,
  setSystemVariant,
  setOddsAcceptance,
  setSource,
  setFreeBet,
  toggleBetslip,
  openBetslip,
  closeBetslip,
  setIsPlacing,
  setError,
  setBookingCode,
  loadFromBookingCode,
  // Quick Bet actions
  toggleQuickBetMode,
  setQuickBetEnabled,
  setQuickBetStake,
  openQuickBetDialog,
  closeQuickBetDialog,
  clearQuickBetSelection,
  // Auto-Cashout actions
  toggleAutoCashout,
  setAutoCashoutEnabled,
  setAutoCashoutValue,
  clearAutoCashout,
} = betslipSlice.actions;

export const betslipReducer = betslipSlice.reducer;

// Selectors
export const selectSelections = (state: { betslip: BetslipState }) => state.betslip.selections;
export const selectBetType = (state: { betslip: BetslipState }) => state.betslip.betType;
export const selectTotalStake = (state: { betslip: BetslipState }) => state.betslip.totalStake;
export const selectStakes = (state: { betslip: BetslipState }) => state.betslip.stakes;
export const selectIsOpen = (state: { betslip: BetslipState }) => state.betslip.isOpen;
export const selectIsPlacing = (state: { betslip: BetslipState }) => state.betslip.isPlacing;
export const selectError = (state: { betslip: BetslipState }) => state.betslip.error;
export const selectOddsAcceptance = (state: { betslip: BetslipState }) => state.betslip.oddsAcceptance;

// Computed selectors
export const selectTotalOdds = (state: { betslip: BetslipState }) => {
  const { selections, betType } = state.betslip;

  if (selections.length === 0) return 1;

  if (betType === 'single') {
    return selections[0]?.odds || 1;
  }

  return selections.reduce((acc, sel) => acc * sel.odds, 1);
};

export const selectPotentialWin = (state: { betslip: BetslipState }) => {
  const { selections, betType, stakes, totalStake } = state.betslip;

  if (selections.length === 0) return 0;

  if (betType === 'single') {
    return selections.reduce((acc, sel) => {
      const stake = stakes[sel.eventId] || 0;
      return acc + stake * sel.odds;
    }, 0);
  }

  const totalOdds = selections.reduce((acc, sel) => acc * sel.odds, 1);
  return totalStake * totalOdds;
};

export const selectHasSuspendedSelections = (state: { betslip: BetslipState }) => {
  return state.betslip.selections.some((s) => s.isSuspended);
};

export const selectSelectionCount = (state: { betslip: BetslipState }) => {
  return state.betslip.selections.length;
};

export const selectIsSelectionInBetslip = (eventId: string) => (state: { betslip: BetslipState }) => {
  return state.betslip.selections.some((s) => s.eventId === eventId);
};

// Quick Bet selectors
export const selectQuickBetEnabled = (state: { betslip: BetslipState }) => state.betslip.quickBetEnabled;
export const selectQuickBetStake = (state: { betslip: BetslipState }) => state.betslip.quickBetStake;
export const selectQuickBetSelection = (state: { betslip: BetslipState }) => state.betslip.quickBetSelection;
export const selectIsQuickBetDialogOpen = (state: { betslip: BetslipState }) => state.betslip.isQuickBetDialogOpen;

// Auto-Cashout selectors
export const selectAutoCashoutEnabled = (state: { betslip: BetslipState }) => state.betslip.autoCashoutEnabled;
export const selectAutoCashoutValue = (state: { betslip: BetslipState }) => state.betslip.autoCashoutValue;
