import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const [currentMood, setCurrentMood] = useState({ emoji: '😊', mood: 'მზად', quote: 'შეეხე ან აქანათე გრძნობების ამოსაცნობად!' });
  const [lastTap, setLastTap] = useState(0);
  const [quotes, setQuotes] = useState([]);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const MOODS = {
    angry: { emoji: '😠', mood: 'გაბრაზებული', category: 'anger' },
    curious: { emoji: '🤔', mood: 'ცნობისმოყვარე', category: 'curiosity' },
    happy: { emoji: '😄', mood: 'ბედნიერი', category: 'happiness' },
    sad: { emoji: '😢', mood: 'მწუხარე', category: 'sadness' },
    excited: { emoji: '🤩', mood: 'ამაღელებული', category: 'excitement' }
  };

  useEffect(() => {
    loadQuotes();
    startAccelerometer();
    return () => {
      Accelerometer.removeAllListeners();
    };
  }, []);

  const loadQuotes = async () => {
    try {
      const response = await fetch('http://[5.178.149.238]:8080/mood_quotes_100_with_authors.json');
      const data = await response.json();
      setQuotes(data);
    } catch (error) {
      console.log('Error loading quotes:', error);
      setQuotes([
        { quote: "სიყვარული არის ღმერთი და ღმერთი არის სიყვარული.", author: "ილია ჭავჭავაძე", category: "happiness" },
        { quote: "ცხოვრება ბრძოლაა და ბრძოლა ცხოვრებაა.", author: "აკაკი წერეთელი", category: "anger" },
        { quote: "ღმერთმა რომ დაწყალოს, სულიც და ხორციც ისევ ერთი უნდა ვიყოთ.", author: "ილია ჭავჭავაძე", category: "sadness" },
        { quote: "მეცნიერება არის ნორ, რომელიც ბუნების საიდუმლოებას ხსნის.", author: "ნიკო ნიკოლაძე", category: "curiosity" },
        { quote: "სამშობლოს გულსა დაშორებულს, სხვა არაფერს არ სჯერა.", author: "ვაჟა-ფშაველა", category: "excitement" },
        { quote: "ბედნიერება ადამიანის ძველი მტერია.", author: "გალაკტიონ ტაბიძე", category: "happiness" },
        { quote: "ვფიქრობ, ვითომ ვარ, ამისთვის ვარსებობ.", author: "რევაზ მიშველაძე", category: "curiosity" },
        { quote: "გული რომ გინდეს, სხვა არაფერი არ გინდება.", author: "კონსტანტინე გამსახურდია", category: "happiness" },
        { quote: "სიკვდილს არავინ არ ეშინია, ცხოვრებას ეშინია ყველას.", author: "ოთარ ჭილაძე", category: "sadness" },
        { quote: "კაცი ისაა, როგორც ემსახურება სხვისთვის.", author: "იაკობ გოგებაშვილი", category: "excitement" }
      ]);
    }
  };

  const startAccelerometer = () => {
    Accelerometer.setUpdateInterval(100);
    Accelerometer.addListener(({ x, y, z }) => {
      const totalForce = Math.sqrt(x * x + y * y + z * z);
      
      if (totalForce > 2) {
        detectMood('angry');
        return;
      }
      
      if (Math.abs(x) > 0.3) {
        if (x > 0.3) {
          detectMood('happy');
        } else {
          detectMood('curious'); 
        }
      } else if (y > 0.3) {
        detectMood('sad'); 
      }
    });
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      detectMood('excited');
    }
    setLastTap(now);
  };

  const detectMood = (moodKey) => {
    const mood = MOODS[moodKey];
    const moodQuotes = quotes.filter(q => q.category === mood.category);
    const randomQuote = moodQuotes[Math.floor(Math.random() * moodQuotes.length)];
    
    const newMood = {
      ...mood,
      quote: randomQuote ? `"${randomQuote.quote}" - ${randomQuote.author}` : "დარჩი პოზიტიური და განაგრძე ცხოვრება!"
    };

    setCurrentMood(newMood);
    animateMoodChange();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    saveMood(newMood);
  };

  const animateMoodChange = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const saveMood = async (mood) => {
    try {
      const moodEntry = {
        ...mood,
        timestamp: new Date().toISOString(),
      };
      
      const existingMoods = await AsyncStorage.getItem('moods');
      const moods = existingMoods ? JSON.parse(existingMoods) : [];
      moods.push(moodEntry);
      
      await AsyncStorage.setItem('moods', JSON.stringify(moods));
    } catch (error) {
      console.error('Error saving mood:', error);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handleDoubleTap}
      activeOpacity={0.9}
    >
      <StatusBar barStyle="light-content" backgroundColor="#4a90e2" />
      
      <View style={styles.header}>
        <Text style={styles.title}>როგორ გრძნობ თავს?</Text>
        <Text style={styles.subtitle}>შეანერწყვე, აქანათე ან ორჯერ შეეხე გრძნობების ამოსაცნობად</Text>
      </View>

      <Animated.View 
        style={[
          styles.moodContainer,
          {
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          }
        ]}
      >
        <Text style={styles.emoji}>{currentMood.emoji}</Text>
        <Text style={styles.mood}>{currentMood.mood}</Text>
      </Animated.View>

      <View style={styles.quoteContainer}>
        <Text style={styles.quote}>{currentMood.quote}</Text>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          🤳 შერწყმა: გაბრაზებული • ↖️ მარცხნივ: ცნობისმოყვარე • ↗️ მარჯვნივ: ბედნიერი • ⬆️ წინ: მწუხარე • 👆👆 ორჯერ შეხება: ამაღელებული
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  moodContainer: {
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 15,
  },
  mood: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  quoteContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#34495e',
    textAlign: 'center',
    lineHeight: 24,
  },
  instructions: {
    backgroundColor: '#e8f4f8',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
  },
  instructionText: {
    fontSize: 12,
    color: '#2c3e50',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default HomeScreen;
