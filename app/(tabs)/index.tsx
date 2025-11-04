import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  StatusBar,
  Dimensions,
  ImageBackground,
  PanResponder,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';

const TodoApp = () => {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [theme, setTheme] = useState<Theme>('dark');
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredTodoId, setHoveredTodoId] = useState<string | null>(null);
  const [hoveredCircleId, setHoveredCircleId] = useState<string | null>(null);


  const animatedValue = useRef(new Animated.Value(0)).current;

  const isDesktop = screenWidth >= 768;


  useEffect(() => {
    loadTheme();
  }, []);

  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    
    return () => subscription?.remove();
  }, []);

  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: theme === 'dark' ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [theme]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setTheme(savedTheme as Theme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const todos = useQuery(api.todos.getTodos);
  const addTodo = useMutation(api.todos.addTodo);
  const toggleTodo = useMutation(api.todos.toggleTodo);
  const deleteTodo = useMutation(api.todos.deleteTodo);
  const clearCompleted = useMutation(api.todos.clearCompleted);
  const reorderTodos = useMutation(api.todos.reorderTodos);

  
  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#161722', '#fafafa']
  });

  const cardBgColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#25273c', '#ffffff']
  });

  const textColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#C8CBE7', '#494C6B']
  });

  const textSecondaryColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#777a92', '#9394a5']
  });

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#393a4c', '#e4e5f1']
  });

  const completedTextColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#4d5066', '#d2d3db']
  });

  const colors = theme === 'light' 
    ? {
        background: '#fafafa',
        cardBg: '#ffffff',
        text: '#494C6B',
        textSecondary: '#9394a5',
        border: '#e4e5f1',
        inputText: '#494C6B',
        placeholder: '#9394a5',
        completedText: '#d2d3db',
        shadow: 'rgba(0,0,0,0.5)',
        filterActive: '#3a7bfd',
      }
    : {
        background: '#161722',
        cardBg: '#25273c',
        text: '#C8CBE7',
        textSecondary: '#777a92',
        border: '#393a4c',
        inputText: '#C8CBE7',
        placeholder: '#777a92',
        completedText: '#4d5066',
        shadow: 'rgba(0,0,0,0.7)',
        filterActive: '#3a7bfd',
      };

  const toggleTheme = async () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
      Alert.alert('Error', 'Failed to save theme preference');
    }
  };

  const handleAddTodo = async () => {
    if (!newTodo.trim()) {
      Alert.alert('Error', 'Please enter a todo item');
      return;
    }

    try {
      setIsLoading(true);
      await addTodo({ text: newTodo.trim() });
      setNewTodo('');
    } catch (error) {
      console.error('Failed to add todo:', error);
      Alert.alert('Error', 'Failed to add todo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTodo = async (id: Id<"todos">) => {
    try {
      await toggleTodo({ id });
    } catch (error) {
      console.error('Failed to toggle todo:', error);
      Alert.alert('Error', 'Failed to update todo. Please try again.');
    }
  };

  const handleDeleteTodo = async (id: Id<"todos">) => {
    try {
      await deleteTodo({ id });
    } catch (error) {
      console.error('Failed to delete todo:', error);
      Alert.alert('Error', 'Failed to delete todo. Please try again.');
    }
  };

  const handleClearCompleted = async () => {
    const completedCount = todos?.filter(t => t.completed).length || 0;
    
    if (completedCount === 0) {
      Alert.alert('Info', 'No completed todos to clear');
      return;
    }

    try {
      await clearCompleted();
    } catch (error) {
      console.error('Failed to clear completed:', error);
      Alert.alert('Error', 'Failed to clear completed todos. Please try again.');
    }
  };

  const moveTodo = async (fromIndex: number, toIndex: number) => {
    if (!todos) return;
    
    try {
      const reorderedTodos = [...todos];
      const [movedTodo] = reorderedTodos.splice(fromIndex, 1);
      reorderedTodos.splice(toIndex, 0, movedTodo);
      
      const updates = reorderedTodos.map((todo, index) => ({
        id: todo._id,
        order: index,
      }));
      
      await reorderTodos({ updates });
    } catch (error) {
      console.error('Failed to reorder todos:', error);
      Alert.alert('Error', 'Failed to reorder todos. Please try again.');
    }
  };

  const filteredTodos = useMemo(() => {
    if (!todos) return [];
    
    if (filter === 'active') return todos.filter(t => !t.completed);
    if (filter === 'completed') return todos.filter(t => t.completed);
    return todos;
  }, [todos, filter]);

  const activeTodosCount = useMemo(() => {
    if (!todos) return 0;
    return todos.filter(t => !t.completed).length;
  }, [todos]);

  const createPanResponder = (todoId: string, index: number) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setDraggingId(todoId);
      },
      onPanResponderMove: (_, gestureState) => {
        const moveY = gestureState.dy;
        const itemHeight = 65;
        const steps = Math.round(moveY / itemHeight);
        
        if (Math.abs(steps) > 0 && todos) {
          const newIndex = index + steps;
          if (newIndex >= 0 && newIndex < todos.length) {
            moveTodo(index, newIndex);
          }
        }
      },
      onPanResponderRelease: () => {
        setDraggingId(null);
      },
    });
  };

  if (todos === undefined) {
    return (
      <Animated.View style={[styles.container, styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color={colors.filterActive} />
        <Animated.Text style={[styles.loadingText, { color: textColor }]}>Loading todos...</Animated.Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessibilityLabel="Todo list scroll view"
      >
        <View style={styles.headerSection}>
          <ImageBackground 
            source={require('../../assets/images/header-img.png')}
            style={styles.headerBackground}
            resizeMode="cover"
            accessibilityLabel="Header background image"
          >
            <View style={styles.gradientOverlay}>
              <View style={[StyleSheet.absoluteFillObject, styles.gradientStart]} />
              <View style={[StyleSheet.absoluteFillObject, styles.gradientEnd]} />
            </View>
            
            <View style={[styles.content, isDesktop && styles.contentDesktop, { width: isDesktop ? 540 : 327 }]}>
              <View style={styles.header}>
                <Text style={styles.title} accessibilityRole="header">T O D O</Text>
                <TouchableOpacity 
                  onPress={toggleTheme} 
                  style={styles.themeButton}
                  accessibilityLabel={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                  accessibilityRole="button"
                >
                  <Text style={styles.themeIcon}>
                    {theme === 'light' ? <Image source={require('../../assets/images/dark-icon.png')} /> : <Image source={require('../../assets/images/light-icon.png')} /> }
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </View>

        <View style={[styles.mainContent, isDesktop && styles.mainContentDesktop]}>
          
          <Animated.View style={[
            styles.inputContainer, 
            isDesktop && styles.inputContainerDesktop,
            { 
              backgroundColor: cardBgColor,
              shadowColor: colors.shadow,
              width: isDesktop ? 540 : 327
            }
          ]}>
            <Animated.View style={[styles.checkCircleEmpty, { borderColor }]} />
            <TextInput
              style={[styles.input, { color: colors.inputText }]}
              placeholder="Create a new todo..."
              placeholderTextColor={colors.placeholder}
              value={newTodo}
              onChangeText={setNewTodo}
              onSubmitEditing={handleAddTodo}
              returnKeyType="done"
              accessibilityLabel="New todo input"
              accessibilityHint="Enter your todo and press done to add"
            />
            {isLoading && <ActivityIndicator size="small" color={colors.filterActive} />}
          </Animated.View>

          <Animated.View style={[
            styles.todoContainer, 
            isDesktop && styles.todoContainerDesktop,
            { 
              backgroundColor: cardBgColor,
              shadowColor: colors.shadow,
              width: isDesktop ? 540 : 327
            }
          ]}>
            
            {filteredTodos.length === 0 ? (
              <View style={styles.emptyState}>
                <Animated.Text style={[styles.emptyText, { color: textColor }]}>
                  {filter === 'all' ? 'No todos yet!' : 
                   filter === 'active' ? 'No active todos' : 
                   'No completed todos'}
                </Animated.Text>
                <Animated.Text style={[styles.emptySubtext, { color: textSecondaryColor }]}>
                  {filter === 'all' ? 'Create one to get started' : 
                   filter === 'active' ? 'All todos are completed!' : 
                   'Complete some todos to see them here'}
                </Animated.Text>
              </View>
            ) : (
              <ScrollView 
                style={styles.todoScrollView}
                nestedScrollEnabled={true}
                accessibilityLabel="Todo items list"
              >
                {filteredTodos.map((todo, index) => (
                  <Animated.View
                    key={todo._id}
                    {...(filter === 'all' ? createPanResponder(todo._id, index).panHandlers : {})}
                    style={[
                      styles.todoItem, 
                      { 
                        borderColor,
                        opacity: draggingId === todo._id ? 0.5 : 1
                      }
                    ]}
                    accessibilityLabel={`Todo: ${todo.text}, ${todo.completed ? 'completed' : 'active'}`}
                  >
                    <View style={styles.todoLeft}>
                      <TouchableOpacity
                        onPress={() => handleToggleTodo(todo._id)}
                        onPressIn={() => setHoveredCircleId(todo._id)}
                        onPressOut={() => {
                          setTimeout(() => setHoveredCircleId(null), 100);
                        }}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: todo.completed }}
                        accessibilityLabel={`${todo.completed ? 'Mark as incomplete' : 'Mark as complete'}: ${todo.text}`}
                      >
                        {todo.completed ? (
                          <Image source={require('../../assets/images/checkmark.png')} />
                        ) : hoveredCircleId === todo._id ? (
                          <Image source={require('../../assets/images/hover-circle.png')} />
                        ) : (
                          <Image source={require('../../assets/images/uncheckeds.png')} />
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.todoTextContainer}
                        onPress={() => {
                          setHoveredTodoId(todo._id);
                          setTimeout(() => setHoveredTodoId(null), 3000);
                        }}
                        onPressIn={() => setHoveredTodoId(todo._id)}
                      >
                        <Animated.Text style={[
                          styles.todoText,
                          { color: todo.completed ? completedTextColor : textColor },
                          todo.completed && styles.completedText
                        ]}>
                          {todo.text}
                        </Animated.Text>
                      </TouchableOpacity>
                    </View>
                    {hoveredTodoId === todo._id && (
                      <TouchableOpacity 
                        onPress={() => {
                          handleDeleteTodo(todo._id);
                          setHoveredTodoId(null);
                        }}
                        style={styles.deleteButton}
                        accessibilityRole="button"
                        accessibilityLabel={`Delete todo: ${todo.text}`}
                      >
                        <Text style={styles.deleteIcon}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </Animated.View>
                ))}
              </ScrollView>
            )}

            <Animated.View style={[styles.footer, { borderColor }]}>
              <Animated.Text 
                style={[styles.itemsLeft, { color: textSecondaryColor }]}
                accessibilityLabel={`${activeTodosCount} items left`}
              >
                {activeTodosCount} items left
              </Animated.Text>
              
              {isDesktop && (
                <View style={styles.filterContainerDesktop}>
                  <TouchableOpacity 
                    onPress={() => setFilter('all')}
                    accessibilityRole="button"
                    accessibilityLabel="Show all todos"
                    accessibilityState={{ selected: filter === 'all' }}
                  >
                    <Animated.Text style={[
                      styles.filterText, 
                      { color: textSecondaryColor },
                      filter === 'all' && [styles.activeFilter, { color: colors.filterActive }]
                    ]}>
                      All
                    </Animated.Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setFilter('active')}
                    accessibilityRole="button"
                    accessibilityLabel="Show active todos"
                    accessibilityState={{ selected: filter === 'active' }}
                  >
                    <Animated.Text style={[
                      styles.filterText, 
                      { color: textSecondaryColor },
                      filter === 'active' && [styles.activeFilter, { color: colors.filterActive }]
                    ]}>
                      Active
                    </Animated.Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setFilter('completed')}
                    accessibilityRole="button"
                    accessibilityLabel="Show completed todos"
                    accessibilityState={{ selected: filter === 'completed' }}
                  >
                    <Animated.Text style={[
                      styles.filterText, 
                      { color: textSecondaryColor },
                      filter === 'completed' && [styles.activeFilter, { color: colors.filterActive }]
                    ]}>
                      Completed
                    </Animated.Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity 
                onPress={handleClearCompleted}
                accessibilityRole="button"
                accessibilityLabel="Clear completed todos"
              >
                <Animated.Text style={[styles.clearText, { color: textSecondaryColor }]}>
                  Clear Completed
                </Animated.Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          {!isDesktop && (
            <Animated.View style={[
              styles.filterContainerMobile,
              { 
                backgroundColor: cardBgColor,
                shadowColor: colors.shadow,
                width: isDesktop ? 540 : 327
              }
            ]}>
              <TouchableOpacity 
                onPress={() => setFilter('all')}
                accessibilityRole="button"
                accessibilityLabel="Show all todos"
                accessibilityState={{ selected: filter === 'all' }}
              >
                <Animated.Text style={[
                  styles.filterText, 
                  { color: textSecondaryColor },
                  filter === 'all' && [styles.activeFilter, { color: colors.filterActive }]
                ]}>
                  All
                </Animated.Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setFilter('active')}
                accessibilityRole="button"
                accessibilityLabel="Show active todos"
                accessibilityState={{ selected: filter === 'active' }}
              >
                <Animated.Text style={[
                  styles.filterText, 
                  { color: textSecondaryColor },
                  filter === 'active' && [styles.activeFilter, { color: colors.filterActive }]
                ]}>
                  Active
                </Animated.Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setFilter('completed')}
                accessibilityRole="button"
                accessibilityLabel="Show completed todos"
                accessibilityState={{ selected: filter === 'completed' }}
              >
                <Animated.Text style={[
                  styles.filterText, 
                  { color: textSecondaryColor },
                  filter === 'completed' && [styles.activeFilter, { color: colors.filterActive }]
                ]}>
                  Completed
                </Animated.Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          <Animated.Text style={[styles.hintText, { color: textSecondaryColor }]}>
            Drag and drop to reorder list
          </Animated.Text>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'SpaceMono'
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  headerSection: {
    height: 300,
  },
  headerBackground: {
    flex: 1,
    width: '100%',
    height: 300
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientStart: {
    backgroundColor: '#5596FF',
    opacity: 0.7,
  },
  gradientEnd: {
    backgroundColor: '#AC2DEB',
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 70,
    alignSelf: 'center',
    justifyContent: 'space-between'
  },
  contentDesktop: {
    paddingHorizontal: 0,
    paddingTop: 80,
    alignSelf: 'center',
    justifyContent: 'space-between',
  },
  mainContent: {
    paddingHorizontal: 24,
    marginTop: -120,
    flexDirection: 'column',
    alignItems: 'center',
  },
  mainContentDesktop: {
    paddingHorizontal: 0,
    marginTop: -140,
    width: '100%',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 12,
    color: '#ffffff',
    fontFamily: 'SpaceMono'
  },
  themeButton: {
    padding: 8,
  },
  themeIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 5,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignSelf: 'center'
  },
  inputContainerDesktop: {
    padding: 24,
    marginBottom: 28,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    fontFamily: 'SpaceMono'
  },
  checkCircleEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCircle: {
    backgroundColor: '#5E93F5',
    borderColor: '#5E93F5',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  todoContainer: {
    borderRadius: 5,
    shadowOffset: { width: 10, height: 7 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
    marginBottom: 16,
  },
  todoContainerDesktop: {
    marginBottom: 24,
  },
  todoScrollView: {
    maxHeight: 400,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'SpaceMono'
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'SpaceMono'
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  todoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  todoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  todoText: {
    fontSize: 16,
    fontFamily: 'SpaceMono'
  },
  completedText: {
    textDecorationLine: 'line-through',
    fontFamily: 'SpaceMono'
  },
  deleteButton: {
    padding: 5,
    marginLeft: 10,
  },
  deleteIcon: {
    fontSize: 18,
    color: '#494c6b',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
  },
  itemsLeft: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'SpaceMono'
  },
  filterContainerDesktop: {
    flexDirection: 'row',
    gap: 16,
    position: 'absolute',
    left: '43%',
    alignSelf: 'center',
    transform: [{ translateX: -60 }],
  },
  filterContainerMobile: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 16,
  },
  filterText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono'
  },
  activeFilter: {
    fontWeight: 'bold',
    fontFamily: 'SpaceMono'
  },
  clearText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'SpaceMono'
  },
  hintText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
    fontFamily: 'SpaceMono'
  },
});

export default TodoApp;