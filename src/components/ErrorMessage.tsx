import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';

export function ErrorMessage({ message }: { message?: string | null }) {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dangerBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  text: {
    color: colors.danger,
    fontSize: 14,
  },
});
