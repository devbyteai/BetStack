import React, { useState, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { useRelatedGames } from '../hooks';
import { RelatedGamesModal } from './RelatedGamesModal';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

interface ChangeGameBtnProps {
  gameId: string;
  competitionId?: number;
  isLive?: boolean;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'GameDetails'>;

export const ChangeGameBtn: React.FC<ChangeGameBtnProps> = ({
  gameId,
  competitionId,
  isLive = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  const { relatedGames, isLoading, isEmpty } = useRelatedGames({
    gameId,
    competitionId,
    isLive,
    limit: 10,
  });

  const handleSelectGame = useCallback((selectedGameId: string) => {
    // Replace current screen with new game
    navigation.replace('GameDetails', { gameId: selectedGameId });
  }, [navigation]);

  const openModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  // Don't render if no related games and not loading
  const gamesCount = relatedGames.length;
  if (!isLoading && gamesCount === 0) {
    return null;
  }

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        onPress={openModal}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>
          Other Games{gamesCount > 0 ? ` (${gamesCount})` : ''}
        </Text>
      </TouchableOpacity>

      <RelatedGamesModal
        visible={modalVisible}
        onClose={closeModal}
        onSelectGame={handleSelectGame}
        games={relatedGames}
        isLoading={isLoading}
        isEmpty={isEmpty}
        currentGameId={gameId}
      />
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.backgroundCard,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
