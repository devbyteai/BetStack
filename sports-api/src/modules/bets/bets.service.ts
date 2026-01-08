import { db } from '../../config/database.js';
import { redis } from '../../config/redis.js';
import { BadRequestError, NotFoundError } from '../../shared/errors/AppError.js';
import { generateBookingCode } from '../../shared/utils/helpers.js';
import type {
  Bet,
  BetSelection,
  PlaceBetRequest,
  PlaceBetResponse,
  BetHistoryQuery,
  BetHistoryResponse,
  CashoutRequest,
  CashoutResponse,
  BookingCodeResponse,
  BetValidationResult,
  BettingRule,
} from './bets.types.js';

interface DbBet {
  id: string;
  user_id: string;
  bet_type: string;
  system_variant: string | null;
  stake: string;
  total_odds: string;
  potential_win: string;
  status: string;
  payout: string | null;
  source: string;
  booking_code: string | null;
  cashout_amount: string | null;
  auto_cashout_value: string | null;
  settled_at: Date | null;
  created_at: Date;
}

interface DbSelection {
  id: string;
  bet_id: string;
  game_id: string;
  market_id: string;
  event_id: string;
  sport_alias: string;
  team1_name: string;
  team2_name: string;
  market_name: string;
  event_name: string;
  odds_at_placement: string;
  outcome: string;
  is_live: boolean;
  created_at: Date;
}

interface DbEvent {
  id: string;
  market_id: string;
  name: string;
  price: string;
  is_suspended: boolean;
}

interface DbMarket {
  id: string;
  game_id: string;
  name: string;
  is_suspended: boolean;
}

interface DbGame {
  id: string;
  competition_id: number;
  team1_name: string;
  team2_name: string;
  is_live: boolean;
  is_blocked: boolean;
}

interface DbWallet {
  id: string;
  user_id: string;
  balance: string;
  bonus_balance: string;
}

export class BetsService {
  private mapDbBetToBet(dbBet: DbBet, selections?: BetSelection[]): Bet {
    return {
      id: dbBet.id,
      userId: dbBet.user_id,
      betType: dbBet.bet_type as Bet['betType'],
      systemVariant: dbBet.system_variant || undefined,
      stake: parseFloat(dbBet.stake),
      totalOdds: parseFloat(dbBet.total_odds),
      potentialWin: parseFloat(dbBet.potential_win),
      status: dbBet.status as Bet['status'],
      payout: dbBet.payout ? parseFloat(dbBet.payout) : undefined,
      source: dbBet.source as Bet['source'],
      bookingCode: dbBet.booking_code || undefined,
      cashoutAmount: dbBet.cashout_amount ? parseFloat(dbBet.cashout_amount) : undefined,
      autoCashoutValue: dbBet.auto_cashout_value ? parseFloat(dbBet.auto_cashout_value) : undefined,
      settledAt: dbBet.settled_at || undefined,
      createdAt: dbBet.created_at,
      selections,
    };
  }

  private mapDbSelectionToSelection(dbSelection: DbSelection): BetSelection {
    return {
      id: dbSelection.id,
      betId: dbSelection.bet_id,
      gameId: dbSelection.game_id,
      marketId: dbSelection.market_id,
      eventId: dbSelection.event_id,
      sportAlias: dbSelection.sport_alias,
      team1Name: dbSelection.team1_name,
      team2Name: dbSelection.team2_name,
      marketName: dbSelection.market_name,
      eventName: dbSelection.event_name,
      oddsAtPlacement: parseFloat(dbSelection.odds_at_placement),
      outcome: dbSelection.outcome as BetSelection['outcome'],
      isLive: dbSelection.is_live,
      createdAt: dbSelection.created_at,
    };
  }

  async validateBet(userId: string, request: PlaceBetRequest): Promise<BetValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Get betting rules
    const rules = await db<BettingRule>('betting_rules')
      .where('bet_type', request.betType)
      .where('is_active', true)
      .first();

    // Validate bet type - system and chain not yet implemented
    if (request.betType === 'system' || request.betType === 'chain') {
      errors.push(`${request.betType} bets are not yet available`);
      return {
        valid: false,
        errors,
        warnings,
        totalOdds: 1,
        potentialWin: 0,
        bonusPercent: 0,
      };
    }

    // Validate selection count
    const selectionCount = request.selections.length;

    if (request.betType === 'single' && selectionCount !== 1) {
      errors.push('Single bet must have exactly 1 selection');
    }

    if (request.betType === 'multiple' && selectionCount < 2) {
      errors.push('Multiple bet must have at least 2 selections');
    }

    if (rules) {
      if (selectionCount < rules.minSelections) {
        errors.push(`Minimum ${rules.minSelections} selections required`);
      }
      if (selectionCount > rules.maxSelections) {
        errors.push(`Maximum ${rules.maxSelections} selections allowed`);
      }
    }

    // Validate each selection
    const gameIds = new Set<string>();
    let totalOdds = 1;
    let validSelectionsForBonus = 0;

    for (const selection of request.selections) {
      // Check for duplicate games
      if (gameIds.has(selection.gameId)) {
        errors.push('Cannot have multiple selections from the same game');
        break;
      }
      gameIds.add(selection.gameId);

      // Verify event exists and get current odds
      const event = await db<DbEvent>('events')
        .where('id', selection.eventId)
        .first();

      if (!event) {
        errors.push(`Event ${selection.eventId} not found`);
        continue;
      }

      // Check if event is suspended
      if (event.is_suspended) {
        errors.push(`Selection "${event.name}" is suspended`);
        continue;
      }

      // Verify market exists and is not suspended
      const market = await db<DbMarket>('markets')
        .where('id', selection.marketId)
        .first();

      if (!market) {
        errors.push(`Market ${selection.marketId} not found`);
        continue;
      }

      if (market.is_suspended) {
        errors.push(`Market "${market.name}" is suspended`);
        continue;
      }

      // Verify game exists and is not blocked
      const game = await db<DbGame>('games')
        .where('id', selection.gameId)
        .first();

      if (!game) {
        errors.push(`Game ${selection.gameId} not found`);
        continue;
      }

      if (game.is_blocked) {
        errors.push(`Game "${game.team1_name} vs ${game.team2_name}" is blocked`);
        continue;
      }

      // Check odds changes
      const currentOdds = parseFloat(event.price);
      const requestedOdds = selection.odds;

      if (currentOdds !== requestedOdds) {
        if (request.acceptOddsChanges === 'none') {
          errors.push(`Odds changed for "${event.name}": ${requestedOdds} → ${currentOdds}`);
        } else if (request.acceptOddsChanges === 'higher' && currentOdds < requestedOdds) {
          errors.push(`Odds decreased for "${event.name}": ${requestedOdds} → ${currentOdds}`);
        } else {
          warnings.push(`Odds changed for "${event.name}": ${requestedOdds} → ${currentOdds}`);
        }
      }

      totalOdds *= currentOdds;

      // Count selections for bonus (must have odds >= minOdds)
      if (!rules || currentOdds >= rules.minOdds) {
        validSelectionsForBonus++;
      }
    }

    // Calculate potential win
    let potentialWin = request.stake * totalOdds;
    let bonusPercent = 0;

    // Apply accumulator bonus if applicable
    if (rules && request.betType === 'multiple' && validSelectionsForBonus >= 3) {
      bonusPercent = this.calculateAccumulatorBonus(validSelectionsForBonus);
      potentialWin *= (1 + bonusPercent / 100);
    }

    // Validate stake against wallet balance
    const wallet = await db<DbWallet>('wallets')
      .where('user_id', userId)
      .first();

    if (!wallet) {
      errors.push('Wallet not found');
    } else {
      const balance = request.source === 'bonus_balance'
        ? parseFloat(wallet.bonus_balance)
        : parseFloat(wallet.balance);

      if (request.stake > balance) {
        errors.push(`Insufficient balance. Available: ${balance.toFixed(2)}`);
      }
    }

    // Betting limits (should be from config/database in production)
    const BETTING_LIMITS = {
      MIN_STAKE: 0.10,
      MAX_STAKE: 10000,
      MAX_POTENTIAL_WIN: 100000,
      MAX_TOTAL_ODDS: 10000,
      MIN_ODDS: 1.01,
      MAX_SELECTIONS: 20,
    };

    // Minimum stake validation
    if (request.stake < BETTING_LIMITS.MIN_STAKE) {
      errors.push(`Minimum stake is ${BETTING_LIMITS.MIN_STAKE}`);
    }

    // Maximum stake validation
    if (request.stake > BETTING_LIMITS.MAX_STAKE) {
      errors.push(`Maximum stake is ${BETTING_LIMITS.MAX_STAKE}`);
    }

    // Maximum potential win validation
    if (potentialWin > BETTING_LIMITS.MAX_POTENTIAL_WIN) {
      errors.push(`Maximum potential win is ${BETTING_LIMITS.MAX_POTENTIAL_WIN}. Reduce your stake.`);
    }

    // Maximum total odds validation
    if (totalOdds > BETTING_LIMITS.MAX_TOTAL_ODDS) {
      errors.push(`Combined odds (${totalOdds.toFixed(2)}) exceed maximum allowed (${BETTING_LIMITS.MAX_TOTAL_ODDS})`);
    }

    // Maximum selections validation
    if (request.selections.length > BETTING_LIMITS.MAX_SELECTIONS) {
      errors.push(`Maximum ${BETTING_LIMITS.MAX_SELECTIONS} selections allowed`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      totalOdds,
      potentialWin,
      bonusPercent,
    };
  }

  private calculateAccumulatorBonus(selectionCount: number): number {
    // Standard accumulator bonus table
    const bonusTable: Record<number, number> = {
      3: 3,
      4: 5,
      5: 7,
      6: 10,
      7: 15,
      8: 20,
      9: 25,
      10: 30,
      11: 35,
      12: 40,
      13: 45,
      14: 50,
      15: 60,
      16: 70,
    };

    return bonusTable[selectionCount] || (selectionCount > 16 ? 70 : 0);
  }

  async placeBet(userId: string, request: PlaceBetRequest): Promise<PlaceBetResponse> {
    // Validate bet first
    const validation = await this.validateBet(userId, request);

    if (!validation.valid) {
      throw new BadRequestError( validation.errors.join('; '));
    }

    // Use transaction for atomicity
    const result = await db.transaction(async (trx) => {
      // Get current odds for all selections
      const selections = await Promise.all(
        request.selections.map(async (sel) => {
          const event = await trx<DbEvent>('events')
            .where('id', sel.eventId)
            .first();

          const market = await trx<DbMarket>('markets')
            .where('id', sel.marketId)
            .first();

          const game = await trx<DbGame>('games')
            .where('id', sel.gameId)
            .first();

          return {
            ...sel,
            currentOdds: parseFloat(event!.price),
            marketName: market!.name,
            eventName: event!.name,
            team1Name: game!.team1_name,
            team2Name: game!.team2_name,
            isLive: game!.is_live,
          };
        })
      );

      // Calculate final odds and potential win
      const totalOdds = selections.reduce((acc, sel) => acc * sel.currentOdds, 1);
      const potentialWin = request.stake * totalOdds * (1 + validation.bonusPercent / 100);

      // Generate booking code
      const bookingCode = generateBookingCode();

      // Lock wallet row and verify balance within transaction to prevent race conditions
      const balanceColumn = request.source === 'bonus_balance' ? 'bonus_balance' : 'balance';
      const walletForUpdate = await trx<DbWallet>('wallets')
        .where('user_id', userId)
        .forUpdate()
        .first();

      if (!walletForUpdate) {
        throw new BadRequestError('Wallet not found');
      }

      const availableBalance = parseFloat(walletForUpdate[balanceColumn as keyof DbWallet] as string);
      if (availableBalance < request.stake) {
        throw new BadRequestError(`Insufficient balance. Available: ${availableBalance.toFixed(2)}`);
      }

      // Deduct stake from wallet
      await trx('wallets')
        .where('user_id', userId)
        .decrement(balanceColumn, request.stake);

      // Create bet record
      const [bet] = await trx('bets')
        .insert({
          user_id: userId,
          bet_type: request.betType,
          system_variant: request.systemVariant || null,
          stake: request.stake.toString(),
          total_odds: totalOdds.toString(),
          potential_win: potentialWin.toString(),
          source: request.source || 'main_balance',
          booking_code: bookingCode,
          auto_cashout_value: request.autoCashoutValue?.toString() || null,
        })
        .returning('*') as DbBet[];

      // Create selection records
      const selectionRecords = selections.map((sel) => ({
        bet_id: bet.id,
        game_id: sel.gameId,
        market_id: sel.marketId,
        event_id: sel.eventId,
        sport_alias: '',
        team1_name: sel.team1Name,
        team2_name: sel.team2Name,
        market_name: sel.marketName,
        event_name: sel.eventName,
        odds_at_placement: sel.currentOdds.toString(),
        is_live: sel.isLive,
      }));

      const insertedSelections = await trx('bet_selections')
        .insert(selectionRecords)
        .returning('*') as DbSelection[];

      // Create transaction record
      const wallet = await trx<DbWallet>('wallets')
        .where('user_id', userId)
        .first();

      await trx('transactions').insert({
        user_id: userId,
        wallet_id: wallet!.id,
        type: 'bet',
        amount: -request.stake,
        balance_before: parseFloat(wallet!.balance) + request.stake,
        balance_after: parseFloat(wallet!.balance),
        status: 'completed',
        metadata: JSON.stringify({ betId: bet.id, bookingCode }),
      });

      return {
        bet: this.mapDbBetToBet(bet, insertedSelections.map(this.mapDbSelectionToSelection)),
        bookingCode,
      };
    });

    // Cache booking code in Redis for quick lookup
    await redis.setex(
      `booking:${result.bookingCode}`,
      86400 * 7, // 7 days
      JSON.stringify({ betId: result.bet.id, userId })
    );

    return result;
  }

  async getBet(betId: string, userId?: string): Promise<Bet> {
    const query = db<DbBet>('bets').where('id', betId);

    if (userId) {
      query.where('user_id', userId);
    }

    const bet = await query.first();

    if (!bet) {
      throw new NotFoundError( 'Bet not found');
    }

    const selections = await db<DbSelection>('bet_selections')
      .where('bet_id', betId);

    return this.mapDbBetToBet(bet, selections.map(this.mapDbSelectionToSelection));
  }

  async getBetHistory(userId: string, query: BetHistoryQuery): Promise<BetHistoryResponse> {
    const baseQuery = db<DbBet>('bets').where('user_id', userId);

    if (query.status) {
      baseQuery.where('status', query.status);
    }

    if (query.betType) {
      baseQuery.where('bet_type', query.betType);
    }

    if (query.startDate) {
      baseQuery.where('created_at', '>=', query.startDate);
    }

    if (query.endDate) {
      baseQuery.where('created_at', '<=', query.endDate);
    }

    const countResult = await baseQuery.clone().count('id as count').first() as { count: string } | undefined;
    const total = parseInt(countResult?.count || '0', 10);

    const bets = await baseQuery
      .orderBy('created_at', 'desc')
      .limit(query.limit || 20)
      .offset(query.offset || 0);

    // Get selections for all bets
    const betIds = bets.map((b) => b.id);
    const selections = await db<DbSelection>('bet_selections')
      .whereIn('bet_id', betIds);

    const selectionsByBetId = selections.reduce((acc, sel) => {
      if (!acc[sel.bet_id]) acc[sel.bet_id] = [];
      acc[sel.bet_id].push(this.mapDbSelectionToSelection(sel));
      return acc;
    }, {} as Record<string, BetSelection[]>);

    return {
      bets: bets.map((bet) => this.mapDbBetToBet(bet, selectionsByBetId[bet.id] || [])),
      total,
      limit: query.limit || 20,
      offset: query.offset || 0,
    };
  }

  async getBetByBookingCode(code: string): Promise<Bet> {
    // Check Redis cache first
    const cached = await redis.get(`booking:${code}`);

    if (cached) {
      const { betId } = JSON.parse(cached);
      return this.getBet(betId);
    }

    // Fall back to database
    const bet = await db<DbBet>('bets')
      .where('booking_code', code)
      .first();

    if (!bet) {
      throw new NotFoundError( 'Bet not found for booking code');
    }

    const selections = await db<DbSelection>('bet_selections')
      .where('bet_id', bet.id);

    return this.mapDbBetToBet(bet, selections.map(this.mapDbSelectionToSelection));
  }

  async requestCashout(betId: string, userId: string, request: CashoutRequest): Promise<CashoutResponse> {
    const bet = await this.getBet(betId, userId);

    if (bet.status !== 'pending') {
      throw new BadRequestError( 'Cannot cashout a settled bet');
    }

    // Calculate cashout value (simplified - in production would use live odds)
    const cashoutValue = this.calculateCashoutValue(bet);

    if (cashoutValue <= 0) {
      throw new BadRequestError( 'Cashout not available for this bet');
    }

    const cashoutAmount = request.type === 'partial' && request.amount
      ? Math.min(request.amount, cashoutValue)
      : cashoutValue;

    // Process cashout in transaction
    const result = await db.transaction(async (trx) => {
      // Update bet status
      if (request.type === 'full') {
        await trx('bets')
          .where('id', betId)
          .update({
            status: 'cashout',
            cashout_amount: cashoutAmount,
            settled_at: new Date(),
          });
      } else {
        // Partial cashout - reduce stake proportionally
        const ratio = cashoutAmount / cashoutValue;
        const newStake = bet.stake * (1 - ratio);
        const newPotentialWin = bet.potentialWin * (1 - ratio);

        await trx('bets')
          .where('id', betId)
          .update({
            stake: newStake,
            potential_win: newPotentialWin,
            cashout_amount: (bet.cashoutAmount || 0) + cashoutAmount,
          });
      }

      // Credit wallet
      const wallet = await trx<DbWallet>('wallets')
        .where('user_id', userId)
        .first();

      await trx('wallets')
        .where('user_id', userId)
        .increment('balance', cashoutAmount);

      const newBalance = parseFloat(wallet!.balance) + cashoutAmount;

      // Create transaction record
      await trx('transactions').insert({
        user_id: userId,
        wallet_id: wallet!.id,
        type: 'cashout',
        amount: cashoutAmount,
        balance_before: parseFloat(wallet!.balance),
        balance_after: newBalance,
        status: 'completed',
        metadata: JSON.stringify({ betId, type: request.type }),
      });

      return {
        success: true,
        amount: cashoutAmount,
        newBalance,
      };
    });

    return result;
  }

  private calculateCashoutValue(bet: Bet): number {
    if (!bet.selections || bet.selections.length === 0) {
      return 0;
    }

    // Simplified cashout calculation
    // In production, this would use current live odds for each selection
    const wonSelections = bet.selections.filter((s) => s.outcome === 'won').length;
    const pendingSelections = bet.selections.filter((s) => s.outcome === 'pending').length;
    const totalSelections = bet.selections.length;

    if (pendingSelections === 0) {
      return 0; // All settled, no cashout
    }

    // Calculate based on progress through selections
    const progressRatio = wonSelections / totalSelections;
    const riskFactor = 0.85; // House edge on cashout

    return bet.stake * (1 + (bet.totalOdds - 1) * progressRatio) * riskFactor;
  }

  async createBooking(selections: PlaceBetRequest['selections']): Promise<BookingCodeResponse> {
    const bookingCode = generateBookingCode();

    // Calculate total odds
    let totalOdds = 1;
    for (const sel of selections) {
      totalOdds *= sel.odds;
    }

    // Store in Redis with 24h expiry
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await redis.setex(
      `booking:temp:${bookingCode}`,
      86400,
      JSON.stringify({ selections, totalOdds, expiresAt: expiresAt.toISOString() })
    );

    return {
      bookingCode,
      selections,
      totalOdds,
      expiresAt,
    };
  }

  async getBooking(code: string): Promise<BookingCodeResponse> {
    const cached = await redis.get(`booking:temp:${code}`);

    if (!cached) {
      throw new NotFoundError( 'Booking code not found or expired');
    }

    return JSON.parse(cached);
  }

  async getCashoutValue(betId: string, userId: string): Promise<number> {
    const bet = await this.getBet(betId, userId);

    if (bet.status !== 'pending') {
      return 0;
    }

    return this.calculateCashoutValue(bet);
  }
}

export const betsService = new BetsService();
