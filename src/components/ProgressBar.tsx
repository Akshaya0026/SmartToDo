import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ProgressBarProps {
    progress: number; // 0 to 1
    label: string;
}

export function ProgressBar({ progress, label }: ProgressBarProps) {
    const { isDark } = useTheme();
    const animatedWidth = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(animatedWidth, {
            toValue: progress,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    const bg = isDark ? '#374151' : '#E5E7EB';
    const fill = '#3B82F6';
    const text = isDark ? '#F9FAFB' : '#111827';

    const widthPercent = animatedWidth.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.label, { color: text }]}>{label}</Text>
                <Text style={[styles.percentage, { color: fill }]}>
                    {Math.round(progress * 100)}%
                </Text>
            </View>
            <View style={[styles.track, { backgroundColor: bg }]}>
                <Animated.View style={[styles.fill, { backgroundColor: fill, width: widthPercent }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
    },
    percentage: {
        fontSize: 14,
        fontWeight: '700',
    },
    track: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 4,
    },
});
