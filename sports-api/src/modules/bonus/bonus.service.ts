import { db } from '../../config/database.js';
import { NotFoundError, BadRequestError } from '../../shared/errors/AppError.js';
import type {
  Bonus,
  BonusType,
  UserBonus,
  FreeBet,
  BonusListQuery,
  BonusListResponse,
  UserBonusListResponse,
  FreeBetListResponse,
} from './bonus.types.js';

interface DbBonus {
  id: string;
  name: string;
  description: string | null;
  type: BonusType;
  amount: string | null;
  percentage: string | null;
  min_deposit: string | null;
  min_odds: string | null;
  wagering_requirement: string;
  expires_days: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface DbUserBonus {
  id: string;
  user_id: string;
  bonus_id: string;
  amount: string;
  wagered_amount: string;
  required_wagering: string;
  status: 'active' | 'completed' | 'expired' | 'cancelled';
  expires_at: Date | null;
  created_at: Date;
}

interface DbFreeBet {
  id: string;
  user_id: string;
  amount: string;
  min_odds: string;
  expires_at: Date | null;
  is_used: boolean;
  used_bet_id: string | null;
  created_at: Date;
}

export class BonusService {
  private mapDbBonusToBonus(dbBonus: DbBonus): Bonus {
    return {
      id: dbBonus.id,
      name: dbBonus.name,
      description: dbBonus.description,
      type: dbBonus.type,
      amount: dbBonus.amount ? parseFloat(dbBonus.amount) : null,
      percentage: dbBonus.percentage ? parseFloat(dbBonus.percentage) : null,
      minDeposit: dbBonus.min_deposit ? parseFloat(dbBonus.min_deposit) : null,
      minOdds: dbBonus.min_odds ? parseFloat(dbBonus.min_odds) : null,
      wageringRequirement: parseFloat(dbBonus.wagering_requirement),
      expiresDays: dbBonus.expires_days,
      isActive: dbBonus.is_active,
      createdAt: dbBonus.created_at,
    };
  }

  private mapDbUserBonusToUserBonus(dbUserBonus: DbUserBonus, bonus?: Bonus): UserBonus {
    return {
      id: dbUserBonus.id,
      userId: dbUserBonus.user_id,
      bonusId: dbUserBonus.bonus_id,
      amount: parseFloat(dbUserBonus.amount),
      wageredAmount: parseFloat(dbUserBonus.wagered_amount),
      requiredWagering: parseFloat(dbUserBonus.required_wagering),
      status: dbUserBonus.status,
      expiresAt: dbUserBonus.expires_at,
      createdAt: dbUserBonus.created_at,
      bonus,
    };
  }

  private mapDbFreeBetToFreeBet(dbFreeBet: DbFreeBet): FreeBet {
    return {
      id: dbFreeBet.id,
      userId: dbFreeBet.user_id,
      amount: parseFloat(dbFreeBet.amount),
      minOdds: parseFloat(dbFreeBet.min_odds),
      expiresAt: dbFreeBet.expires_at,
      isUsed: dbFreeBet.is_used,
      usedBetId: dbFreeBet.used_bet_id,
      createdAt: dbFreeBet.created_at,
    };
  }

  async getAvailableBonuses(query: BonusListQuery): Promise<BonusListResponse> {
    const { type, limit = 20, offset = 0 } = query;

    let baseQuery = db<DbBonus>('bonuses').where('is_active', true);

    if (type) {
      baseQuery = baseQuery.where('type', type);
    }

    const countResult = await baseQuery.clone().count('id as count').first() as { count: string } | undefined;
    const total = parseInt(countResult?.count || '0', 10);

    const bonuses = await baseQuery
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      bonuses: bonuses.map((b) => this.mapDbBonusToBonus(b)),
      total,
      limit,
      offset,
    };
  }

  async getBonusById(bonusId: string): Promise<Bonus> {
    const bonus = await db<DbBonus>('bonuses')
      .where('id', bonusId)
      .first();

    if (!bonus) {
      throw new NotFoundError('Bonus not found');
    }

    return this.mapDbBonusToBonus(bonus);
  }

  async getUserBonuses(userId: string): Promise<UserBonusListResponse> {
    const userBonuses = await db('user_bonuses as ub')
      .leftJoin('bonuses as b', 'ub.bonus_id', 'b.id')
      .where('ub.user_id', userId)
      .orderBy('ub.created_at', 'desc')
      .select('ub.*', 'b.name as bonus_name', 'b.type as bonus_type');

    const bonuses: UserBonus[] = userBonuses.map((ub) => ({
      id: ub.id,
      userId: ub.user_id,
      bonusId: ub.bonus_id,
      amount: parseFloat(ub.amount),
      wageredAmount: parseFloat(ub.wagered_amount),
      requiredWagering: parseFloat(ub.required_wagering),
      status: ub.status,
      expiresAt: ub.expires_at,
      createdAt: ub.created_at,
      bonus: {
        id: ub.bonus_id,
        name: ub.bonus_name,
        description: null,
        type: ub.bonus_type,
        amount: null,
        percentage: null,
        minDeposit: null,
        minOdds: null,
        wageringRequirement: 0,
        expiresDays: 0,
        isActive: true,
        createdAt: ub.created_at,
      },
    }));

    return {
      bonuses,
      total: bonuses.length,
    };
  }

  async getActiveUserBonuses(userId: string): Promise<UserBonus[]> {
    const userBonuses = await db('user_bonuses as ub')
      .leftJoin('bonuses as b', 'ub.bonus_id', 'b.id')
      .where('ub.user_id', userId)
      .where('ub.status', 'active')
      .where(function () {
        this.whereNull('ub.expires_at').orWhere('ub.expires_at', '>', new Date());
      })
      .orderBy('ub.created_at', 'desc')
      .select('ub.*', 'b.name as bonus_name', 'b.type as bonus_type');

    return userBonuses.map((ub) => ({
      id: ub.id,
      userId: ub.user_id,
      bonusId: ub.bonus_id,
      amount: parseFloat(ub.amount),
      wageredAmount: parseFloat(ub.wagered_amount),
      requiredWagering: parseFloat(ub.required_wagering),
      status: ub.status,
      expiresAt: ub.expires_at,
      createdAt: ub.created_at,
      bonus: {
        id: ub.bonus_id,
        name: ub.bonus_name,
        description: null,
        type: ub.bonus_type,
        amount: null,
        percentage: null,
        minDeposit: null,
        minOdds: null,
        wageringRequirement: 0,
        expiresDays: 0,
        isActive: true,
        createdAt: ub.created_at,
      },
    }));
  }

  async claimBonus(userId: string, bonusId: string): Promise<UserBonus> {
    // Use transaction with row locking to prevent race conditions (double claims)
    return await db.transaction(async (trx) => {
      // Lock the bonus row to prevent concurrent reads during claim
      const bonus = await trx<DbBonus>('bonuses')
        .where('id', bonusId)
        .where('is_active', true)
        .forShare() // Share lock since we only read bonus
        .first();

      if (!bonus) {
        throw new NotFoundError('Bonus not found or not available');
      }

      // Check if user already claimed this bonus (with lock to prevent race condition)
      const existingClaim = await trx('user_bonuses')
        .where('user_id', userId)
        .where('bonus_id', bonusId)
        .whereIn('status', ['active', 'completed'])
        .forUpdate() // Exclusive lock to prevent concurrent claims
        .first();

      if (existingClaim) {
        throw new BadRequestError('You have already claimed this bonus');
      }

      // Calculate bonus amount
      let bonusAmount = 0;
      if (bonus.amount) {
        bonusAmount = parseFloat(bonus.amount);
      } else if (bonus.percentage) {
        // For deposit bonuses, would need to know deposit amount
        // For now, just use a fixed amount for percentage bonuses
        bonusAmount = 0;
      }

      if (bonusAmount <= 0 && bonus.type !== 'free_bet') {
        throw new BadRequestError('Invalid bonus amount');
      }

      // Calculate wagering requirement
      const wageringReq = parseFloat(bonus.wagering_requirement);
      const requiredWagering = bonusAmount * wageringReq;

      // Calculate expiry
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + bonus.expires_days);

      // Create user bonus within transaction
      const [userBonus] = await trx('user_bonuses')
        .insert({
          user_id: userId,
          bonus_id: bonusId,
          amount: bonusAmount.toString(),
          wagered_amount: '0',
          required_wagering: requiredWagering.toString(),
          status: 'active',
          expires_at: expiresAt,
        })
        .returning('*') as DbUserBonus[];

      // If it's a free bet bonus, also create a free bet entry
      if (bonus.type === 'free_bet' && bonus.amount) {
        await trx('free_bets').insert({
          user_id: userId,
          amount: bonus.amount,
          min_odds: bonus.min_odds || '1.5',
          expires_at: expiresAt,
        });
      }

      // Add bonus to wallet bonus_balance within transaction
      if (bonusAmount > 0) {
        await trx('wallets')
          .where('user_id', userId)
          .increment('bonus_balance', bonusAmount);
      }

      return this.mapDbUserBonusToUserBonus(userBonus, this.mapDbBonusToBonus(bonus));
    });
  }

  async getFreeBets(userId: string): Promise<FreeBetListResponse> {
    const freeBets = await db<DbFreeBet>('free_bets')
      .where('user_id', userId)
      .where('is_used', false)
      .where(function () {
        this.whereNull('expires_at').orWhere('expires_at', '>', new Date());
      })
      .orderBy('created_at', 'desc');

    return {
      freeBets: freeBets.map((fb) => this.mapDbFreeBetToFreeBet(fb)),
      total: freeBets.length,
    };
  }

  async useFreeBet(freeBetId: string, betId: string): Promise<void> {
    const freeBet = await db<DbFreeBet>('free_bets')
      .where('id', freeBetId)
      .where('is_used', false)
      .first();

    if (!freeBet) {
      throw new NotFoundError('Free bet not found or already used');
    }

    await db('free_bets')
      .where('id', freeBetId)
      .update({
        is_used: true,
        used_bet_id: betId,
      });
  }

  async withdrawBonus(userId: string, userBonusId: string): Promise<{ amount: number; newBalance: number }> {
    return await db.transaction(async (trx) => {
      // Get the user bonus with lock
      const userBonus = await trx<DbUserBonus>('user_bonuses')
        .where('id', userBonusId)
        .where('user_id', userId)
        .forUpdate()
        .first();

      if (!userBonus) {
        throw new NotFoundError('Bonus not found');
      }

      if (userBonus.status !== 'completed') {
        throw new BadRequestError('Bonus is not completed. Complete wagering requirements first.');
      }

      const bonusAmount = parseFloat(userBonus.amount);

      if (bonusAmount <= 0) {
        throw new BadRequestError('No bonus amount to withdraw');
      }

      // Get wallet with lock
      const wallet = await trx('wallets')
        .where('user_id', userId)
        .forUpdate()
        .first();

      if (!wallet) {
        throw new NotFoundError('Wallet not found');
      }

      const currentBonusBalance = parseFloat(wallet.bonus_balance);

      // Check if bonus is still in bonus_balance
      if (currentBonusBalance < bonusAmount) {
        throw new BadRequestError('Bonus has already been withdrawn or converted');
      }

      // Transfer from bonus_balance to main balance
      await trx('wallets')
        .where('user_id', userId)
        .decrement('bonus_balance', bonusAmount)
        .increment('balance', bonusAmount);

      // Mark bonus as withdrawn (use 'cancelled' or update status)
      await trx('user_bonuses')
        .where('id', userBonusId)
        .update({ status: 'completed' }); // Keep as completed since it was already completed

      // Create transaction record
      const newBalance = parseFloat(wallet.balance) + bonusAmount;
      await trx('transactions').insert({
        user_id: userId,
        wallet_id: wallet.id,
        type: 'bonus_withdrawal',
        amount: bonusAmount.toString(),
        balance_before: wallet.balance,
        balance_after: newBalance.toString(),
        status: 'completed',
        metadata: JSON.stringify({ userBonusId }),
      });

      return {
        amount: bonusAmount,
        newBalance,
      };
    });
  }

  async addWageredAmount(userId: string, amount: number): Promise<void> {
    // Update all active user bonuses with the wagered amount
    const activeBonuses = await db<DbUserBonus>('user_bonuses')
      .where('user_id', userId)
      .where('status', 'active');

    for (const bonus of activeBonuses) {
      const newWageredAmount = parseFloat(bonus.wagered_amount) + amount;
      const requiredWagering = parseFloat(bonus.required_wagering);

      if (newWageredAmount >= requiredWagering) {
        // Bonus wagering complete - convert bonus to real balance
        await db('user_bonuses')
          .where('id', bonus.id)
          .update({
            wagered_amount: requiredWagering.toString(),
            status: 'completed',
          });

        // Move bonus balance to real balance
        const bonusAmount = parseFloat(bonus.amount);
        await db('wallets')
          .where('user_id', userId)
          .decrement('bonus_balance', bonusAmount)
          .increment('balance', bonusAmount);
      } else {
        await db('user_bonuses')
          .where('id', bonus.id)
          .update({
            wagered_amount: newWageredAmount.toString(),
          });
      }
    }
  }
}

export const bonusService = new BonusService();
