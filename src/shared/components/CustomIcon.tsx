import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  type?: 'ionicon' | 'material';
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = '#fff',
  type = 'ionicon',
}) => {
  if (type === 'material') {
    return <MaterialCommunityIcons name={name} size={size} color={color} />;
  }
  return <Ionicons name={name} size={size} color={color} />;
};

export default Icon;
