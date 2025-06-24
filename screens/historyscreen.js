import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HistoryScreen = () => {
  const [moods, setMoods] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMoods();
  }, []);

  const loadMoods = async () => {
    try {
      const savedMoods = await AsyncStorage.getItem('moods');
      if (savedMoods) {
        const parsedMoods = JSON.parse(savedMoods);
        // Sort by timestamp (newest first)
        const sortedMoods = parsedMoods.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setMoods(sortedMoods);
      }
    } catch (error) {
      console.error('Error loading moods:', error);
    }
  };

  const clearHistory = () => {
    Alert.alert(
      'ისტორიის გასუფთავება',
      'დარწმუნებული ხარ, რომ გსურს ყველა გრძნობის ისტორიის წაშლა?',
      [
        { text: 'გაუქმება', style: 'cancel' },
        {
          text: 'გასუფთავება',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('moods');
              setMoods([]);
            } catch (error) {
              console.error('Error clearing history:', error);
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMoods();
    setRefreshing(false);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const renderMoodItem = ({ item, index }) => (
    <View style={styles.moodItem}>
      <View style={styles.moodHeader}>
        <Text style={styles.emoji}>{item.emoji}</Text>
        <View style={styles.moodInfo}>
          <Text style={styles.moodText}>{item.mood}</Text>
          <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
        </View>
      </View>
      <Text style={styles.quote}>{item.quote}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>შენი გრძნობითი მოგზაურობა</Text>
        <Text style={styles.subtitle}>
          {moods.length} გრძნობა{moods.length !== 1 ? '' : ''} ჩაწერილია
        </Text>
      </View>

      {moods.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
          <Text style={styles.clearButtonText}>ისტორიის გასუფთავება</Text>
        </TouchableOpacity>
      )}

      {moods.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📱</Text>
          <Text style={styles.emptyText}>ჯერ არ არის ჩაწერილი გრძნობები</Text>
          <Text style={styles.emptySubtext}>
            დაიწყე გრძნობების ამოცნობა მთავარ გვერდზე!
          </Text>
        </View>
      ) : (
        <FlatList
          data={moods}
          renderItem={renderMoodItem}
          keyExtractor={(item, index) => `${item.timestamp}-${index}`}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  clearButton: {
    backgroundColor: '#e74c3c',
    marginHorizontal: 20,
    marginTop: 15,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    padding: 20,
  },
  moodItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  emoji: {
    fontSize: 30,
    marginRight: 15,
  },
  moodInfo: {
    flex: 1,
  },
  moodText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  timestamp: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  quote: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#34495e',
    lineHeight: 20,
    paddingLeft: 45,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default HistoryScreen;
