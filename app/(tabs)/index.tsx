import React, { useState, useMemo } from 'react';
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
} from 'react-native';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const { width } = Dimensions.get('window');
const isDesktop = width >= 768;

type Theme = 'light' | 'dark';

const TodoApp = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [draggingId, setDraggingId] = useState<string | null>(null);
   const [hoverStates, setHoverStates] = useState({
    all: false,
    acive: false,
    completed: false,
    itemsLeft:false,
    clearText:false
  });

  const handleHover = (element:string, isHovering:boolean) => {
    setHoverStates(prev => ({
      ...prev,
      [element]: isHovering
    }));
  };

  const todos = useQuery(api.todos.getTodos);
  const addTodo = useMutation(api.todos.addTodo);
  const toggleTodo = useMutation(api.todos.toggleTodo);
  const deleteTodo = useMutation(api.todos.deleteTodo);
  const clearCompleted = useMutation(api.todos.clearCompleted);
  const reorderTodos = useMutation(api.todos.reorderTodos);

  const colors = theme === 'light' 
    ? {
        background: '#fafafa',
        cardBg: '#ffffff',
        text: '#484b6a',
        textSecondary: '#9394a5',
        border: '#e4e5f1',
        inputText: '#484b6a',
        placeholder: '#9394a5',
        completedText: '#d2d3db',
        shadow: 'rgba(0,0,0,0.1)',
        filterActive: '#3a7bfd',
        headerGradient: ['#57ddff', '#c058f3'],
      }
    : {
        background: '#161722',
        cardBg: '#25273c',
        text: '#cacde8',
        textSecondary: '#777a92',
        border: '#393a4c',
        inputText: '#cacde8',
        placeholder: '#777a92',
        completedText: '#4d5066',
        shadow: 'rgba(0,0,0,0.3)',
        filterActive: '#3a7bfd',
        headerGradient: ['#161722', '#161722'],
      };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleAddTodo = async () => {
    if (newTodo.trim()) {
      await addTodo({ text: newTodo });
      setNewTodo('');
    }
  };

  const handleToggleTodo = async (id: Id<"todos">) => {
    await toggleTodo({ id });
  };

  const handleDeleteTodo = async (id: Id<"todos">) => {
    await deleteTodo({ id });
  };

  const handleClearCompleted = async () => {
    await clearCompleted();
  };

  const moveTodo = async (fromIndex: number, toIndex: number) => {
    if (!todos) return;
    
    const reorderedTodos = [...todos];
    const [movedTodo] = reorderedTodos.splice(fromIndex, 1);
    reorderedTodos.splice(toIndex, 0, movedTodo);
    
    const updates = reorderedTodos.map((todo, index) => ({
      id: todo._id,
      order: index,
    }));
    
    await reorderTodos({ updates });
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
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.filterActive} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading todos...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <ImageBackground 
            source={require('../../assets/images/header-img.png')}
            style={styles.headerBackground}
            resizeMode="cover"
          >
            <View style={[
              styles.gradientOverlay,
              theme === 'light' ? styles.lightGradient : styles.darkOverlay
            ]}>
              {theme === 'light' && (
                <>
                  <View style={[StyleSheet.absoluteFillObject, styles.gradientTop]} />
                  <View style={[StyleSheet.absoluteFillObject, styles.gradientBottom]} />
                </>
              )}
            </View>
            
            <View style={[styles.content, isDesktop && styles.contentDesktop]}>
              <View style={styles.header}>
                <Text style={styles.title}>T O D O</Text>
                <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
                  <Text style={styles.themeIcon}>
                    {theme === 'light' ? <Image source={require('../../assets/images/dark-icon.png')} /> : <Image source={require('../../assets/images/light-icon.png')} />}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </View>

        <View style={[styles.mainContent, isDesktop && styles.mainContentDesktop]}>
          
          <View style={[
            styles.inputContainer, 
            isDesktop && styles.inputContainerDesktop,
            { 
              backgroundColor: colors.cardBg,
              shadowColor: colors.shadow
            }
          ]}>
            <TouchableOpacity>
              <Image source={require('../../assets/images/uncheckeds.png')} />
            </TouchableOpacity>
            <TextInput
              style={[styles.input, { color: colors.inputText }]}
              placeholder="Create a new todo..."
              placeholderTextColor={colors.placeholder}
              value={newTodo}
              onChangeText={setNewTodo}
              onSubmitEditing={handleAddTodo}
              returnKeyType="done"
            />
          </View>

          <View style={[
            styles.todoContainer, 
            isDesktop && styles.todoContainerDesktop,
            { 
              backgroundColor: colors.cardBg,
              shadowColor: colors.shadow
            }
          ]}>
            
            <ScrollView 
              style={styles.todoScrollView}
              nestedScrollEnabled={true}
            >
              {filteredTodos.map((todo, index) => (
                <View
                  key={todo._id}
                  {...(filter === 'all' ? createPanResponder(todo._id, index).panHandlers : {})}
                  style={[
                    styles.todoItem, 
                    { 
                      borderBottomColor: colors.border,
                      opacity: draggingId === todo._id ? 0.5 : 1
                    }
                  ]}
                >
                  <TouchableOpacity 
                    onPress={() => handleToggleTodo(todo._id)}
                    style={styles.todoLeft}
                  >
                    <View >
                      {todo.completed ? <Image source={require('../../assets/images/checkmark.png')} /> : <Image source={require('../../assets/images/uncheckeds.png')} />}
                    </View>
                    <Text style={[
                      styles.todoText,
                      { color: todo.completed ? colors.completedText : colors.text },
                      todo.completed && styles.completedText
                    ]}>
                      {todo.text}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleDeleteTodo(todo._id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              <Text onPressIn={()=>handleHover('itemsLeft',true)}  onPressOut={() => handleHover('itemsLeft',false)} style={[styles.itemsLeft, hoverStates && styles.hoverText, { color: colors.textSecondary }]}>
                {activeTodosCount} items left
              </Text>
              
              {isDesktop && (
                <View style={styles.filterContainerDesktop}>
                  <TouchableOpacity onPress={() =>{setFilter('all'); handleHover('all',true) }}
                    onPressOut={()=>handleHover('all',false)}
                    
                    >
                    <Text style={[
                      styles.filterText, 
                      hoverStates && styles.hoverText,
                      { color: colors.textSecondary },
                      filter === 'all' && [styles.activeFilter, { color: colors.filterActive }]
                    ]}>
                      All
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {setFilter('active') }}
                    onPressIn={() => handleHover('active',true)}
                    onPressOut={() => handleHover('active',false)}
                    >
                    <Text style={[
                      styles.filterText,
                      hoverStates && styles.hoverText, 
                      { color: colors.textSecondary },
                      filter === 'active' && [styles.activeFilter, { color: colors.filterActive }]
                    ]}>
                      Active
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {setFilter('completed')}}
                    onPressIn={() =>  handleHover('completed', true)}
                    onPressOut={() => handleHover('completed',false)}
                    >
                    <Text style={[
                      styles.filterText,
                      hoverStates && styles.hoverText, 
                      { color: colors.textSecondary },
                      filter === 'completed' && [styles.activeFilter, { color: colors.filterActive }]
                    ]}>
                      Completed
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity onPress={handleClearCompleted}
                onPressIn={() => handleHover('clearText',true)}
                onPressOut={() => handleHover('clearText', false)}
                >
                <Text style={[styles.clearText, hoverStates && styles.hoverText, { color: colors.textSecondary }]}>
                  Clear Completed
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {!isDesktop && (
            <View style={[
              styles.filterContainerMobile,
              { 
                backgroundColor: colors.cardBg,
                shadowColor: colors.shadow
              }
            ]}>
              <TouchableOpacity onPress={() => setFilter('all')}>
                <Text style={[
                  styles.filterText, 
                  { color: colors.textSecondary },
                  filter === 'all' && [styles.activeFilter, { color: colors.filterActive }]
                ]}>
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFilter('active')}>
                <Text style={[
                  styles.filterText, 
                  { color: colors.textSecondary },
                  filter === 'active' && [styles.activeFilter, { color: colors.filterActive }]
                ]}>
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFilter('completed')}>
                <Text style={[
                  styles.filterText, 
                  { color: colors.textSecondary },
                  filter === 'completed' && [styles.activeFilter, { color: colors.filterActive }]
                ]}>
                  Completed
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[styles.hintText, { color: colors.textSecondary }]}>
            Drag and drop to reorder list
          </Text>
        </View>
      </ScrollView>
    </View>
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
    fontFamily:'SpaceMono'
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
  lightGradient: {},
  darkOverlay: {
    backgroundColor: 'rgba(22, 23, 34, 0.8)',
  },
  gradientTop: {
    backgroundColor: '#57ddff',
    opacity: 0.6,
  },
  gradientBottom: {
    backgroundColor: '#c058f3',
    opacity: 0.6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 70,
    maxWidth: 327,
    alignSelf: 'center'
  },
  contentDesktop: {
    paddingHorizontal: 120,
    paddingTop: 80,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 540,
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
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily:'SpaceMono',
    letterSpacing: 12,
    color: '#ffffff',
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
    width: '100%',
    maxWidth: 327,
    alignSelf: 'center'
  },
  inputContainerDesktop: {
    padding: 24,
    marginBottom: 28,
    width: '100%',
    maxWidth: 540,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    fontFamily:'SpaceMono',
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
    borderColor: '#c058f3',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  todoContainer: {
    borderRadius: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
    width: '100%',
    maxWidth: 327
  },
  todoContainerDesktop: {
    marginBottom: 24,
    width: '100%',
    maxWidth: 540,
  },
  todoScrollView: {
    maxHeight: 400,
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
  todoText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    fontFamily:'SpaceMono',
  },
  completedText: {
    textDecorationLine: 'line-through',
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
    fontFamily:'SpaceMono',
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
    width: '100%',
    maxWidth: 327,
    marginTop: 16,
  },
  filterText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily:'SpaceMono',
  },

  activeFilter: {
    fontWeight: 'bold',
    fontFamily:'SpaceMono',
  },
  clearText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily:'SpaceMono',
  },
  hoverText: {
   color: 'white'
  },
  hintText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
    fontFamily:'SpaceMono',
  },
});

export default TodoApp;