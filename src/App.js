import React, { useState, useEffect } from 'react';
import { Plus, Check, ChevronRight, ChevronDown, Trash2, Calendar, Settings, RotateCcw } from 'lucide-react';

const TodoApp = () => {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showReflection, setShowReflection] = useState(false);
    const [reflection, setReflection] = useState({
        satisfaction: 3,
        good: '',
        bad: ''
    });

    // 今日の日付を取得
    const today = new Date().toISOString().split('T')[0];
    const isToday = selectedDate === today;

    // LocalStorageからデータを読み込み
    useEffect(() => {
        const storedTodos = localStorage.getItem(`todos-${selectedDate}`);
        if (storedTodos) {
            setTodos(JSON.parse(storedTodos));
        } else {
            setTodos([]);
        }


        const storedReflection = localStorage.getItem(`reflection-${selectedDate}`);
        if (storedReflection) {
            setReflection(JSON.parse(storedReflection));
        } else {
            setReflection({ satisfaction: 3, good: '', bad: '' });
        }


    }, [selectedDate]);

    // データを保存
    const saveTodos = (newTodos) => {
        setTodos(newTodos);
        localStorage.setItem(`todos-${selectedDate}`, JSON.stringify(newTodos));
    };

    const saveReflection = (newReflection) => {
        setReflection(newReflection);
        localStorage.setItem(`reflection-${selectedDate}`, JSON.stringify(newReflection));
    };

    // ToDoを追加
    const addTodo = () => {
        if (newTodo.trim() === '') return;


        const todo = {
            id: Date.now(),
            text: newTodo,
            completed: false,
            level: 0,
            expanded: true,
            children: []
        };

        saveTodos([...todos, todo]);
        setNewTodo('');


    };

    // ToDoの完了状態を切り替え
    const toggleTodo = (id, todoList = todos) => {
        const updateTodos = (items) => {
            return items.map(todo => {
                if (todo.id === id) {
                    return { ...todo, completed: !todo.completed };
                }
                if (todo.children.length > 0) {
                    return { ...todo, children: updateTodos(todo.children) };
                }
                return todo;
            });
        };


        saveTodos(updateTodos(todoList));


    };

    // サブタスクを追加
    const addSubtask = (parentId, todoList = todos) => {
        const updateTodos = (items) => {
            return items.map(todo => {
                if (todo.id === parentId) {
                    const subtask = {
                        id: Date.now(),
                        text: '',
                        completed: false,
                        level: todo.level + 1,
                        expanded: true,
                        children: []
                    };
                    return {
                        ...todo,
                        children: [...todo.children, subtask],
                        expanded: true
                    };
                }
                if (todo.children.length > 0) {
                    return { ...todo, children: updateTodos(todo.children) };
                }
                return todo;
            });
        };


        saveTodos(updateTodos(todoList));


    };

    // ToDoを削除
    const deleteTodo = (id, todoList = todos) => {
        const updateTodos = (items) => {
            return items.filter(todo => todo.id !== id).map(todo => ({
                ...todo,
                children: updateTodos(todo.children)
            }));
        };


        saveTodos(updateTodos(todoList));


    };

    // ToDoのテキストを更新
    const updateTodoText = (id, text, todoList = todos) => {
        const updateTodos = (items) => {
            return items.map(todo => {
                if (todo.id === id) {
                    return { ...todo, text };
                }
                if (todo.children.length > 0) {
                    return { ...todo, children: updateTodos(todo.children) };
                }
                return todo;
            });
        };


        saveTodos(updateTodos(todoList));


    };

    // 展開/折りたたみを切り替え
    const toggleExpanded = (id, todoList = todos) => {
        const updateTodos = (items) => {
            return items.map(todo => {
                if (todo.id === id) {
                    return { ...todo, expanded: !todo.expanded };
                }
                if (todo.children.length > 0) {
                    return { ...todo, children: updateTodos(todo.children) };
                }
                return todo;
            });
        };


        saveTodos(updateTodos(todoList));


    };

    // 達成率を計算
    const calculateCompletionRate = () => {
        const flattenTodos = (items) => {
            let result = [];
            items.forEach(todo => {
                result.push(todo);
                if (todo.children.length > 0) {
                    result = result.concat(flattenTodos(todo.children));
                }
            });
            return result;
        };


        const allTodos = flattenTodos(todos);
        if (allTodos.length === 0) return 0;

        const completedCount = allTodos.filter(todo => todo.completed).length;
        return Math.round((completedCount / allTodos.length) * 100);


    };

    // ToDoアイテムをレンダリング
    const renderTodo = (todo) => {
        return (
            <div key={todo.id} className="mb-2">
                <div className="flex items-center bg-white rounded-lg p-3 shadow-sm border" style={{
                    marginLeft: `${todo.level *
                        20}px`
                }}>
                    <button onClick={() => toggleTodo(todo.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${todo.completed ?
                            'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-500'}`}
                    >
                        {todo.completed &&
                            <Check size={16} />}
                    </button>


                    {todo.children.length > 0 && (
                        <button onClick={() => toggleExpanded(todo.id)}
                            className="mr-2 text-gray-500 hover:text-gray-700"
                        >
                            {todo.expanded ?
                                <ChevronDown size={16} /> :
                                <ChevronRight size={16} />}
                        </button>
                    )}

                    <input type="text" value={todo.text} onChange={(e) => updateTodoText(todo.id, e.target.value)}
                        placeholder="タスクを入力..."
                        className={`flex-1 bg-transparent border-none outline-none ${todo.completed ? 'line-through text-gray-500' : ''
                            }`}
                    />

                    <button onClick={() => addSubtask(todo.id)}
                        className="ml-2 p-1 text-gray-400 hover:text-blue-500"
                        title="サブタスクを追加"
                    >
                        <Plus size={16} />
                    </button>

                    <button onClick={() => deleteTodo(todo.id)}
                        className="ml-2 p-1 text-gray-400 hover:text-red-500"
                        title="削除"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                {todo.expanded && todo.children.length > 0 && (
                    <div className="mt-1">
                        {todo.children.map(child => renderTodo(child))}
                    </div>
                )}
            </div>
        );


    };

    // 日付をフォーマット
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        };
        return date.toLocaleDateString('ja-JP', options);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ヘッダー */}
            <div className="bg-white shadow-sm p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                            className="text-lg font-semibold bg-transparent border-none outline-none"
                        />
                        {isToday && (
                            <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                今日
                            </span>
                        )}
                    </div>


                    <div className="flex items-center space-x-2">
                        <button onClick={() => setSelectedDate(today)}
                            className="p-2 text-gray-600 hover:text-blue-500"
                            title="今日に戻る"
                        >
                            <RotateCcw size={20} />
                        </button>
                        <button onClick={() => setShowReflection(!showReflection)}
                            className="p-2 text-gray-600 hover:text-blue-500"
                            title="振り返り"
                        >
                            <Calendar size={20} />
                        </button>
                    </div>
                </div>

                <p className="text-sm text-gray-600 mt-1">
                    {formatDate(selectedDate)}
                </p>
            </div>

            <div className="p-4">
                {/* ToDoリスト */}
                <div className="mb-6">
                    <div className="flex items-center mb-4">
                        <input type="text" value={newTodo} onChange={(e) => setNewTodo(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                            placeholder="新しいタスクを追加..."
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2
                focus:ring-blue-500"
                        />
                        <button onClick={addTodo}
                            className="ml-3 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="space-y-2">
                        {todos.map(todo => renderTodo(todo))}
                    </div>

                    {todos.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <p>まだタスクがありません</p>
                            <p className="text-sm">上のフィールドからタスクを追加してください</p>
                        </div>
                    )}
                </div>

                {/* 振り返りセクション */}
                {showReflection && (
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Calendar className="mr-2" size={20} />
                            今日の振り返り
                        </h3>

                        {todos.length > 0 && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">達成率</p>
                                <div className="flex items-center mt-1">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{
                                            width:
                                                `${calculateCompletionRate()}%`
                                        }}></div>
                                    </div>
                                    <span className="ml-2 text-sm font-semibold">
                                        {calculateCompletionRate()}%
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    満足度
                                </label>
                                <div className="flex space-x-2">
                                    {[1, 2, 3, 4, 5].map(rating => (
                                        <button key={rating} onClick={() => saveReflection({ ...reflection, satisfaction: rating })}
                                            className={`w-10 h-10 rounded-full border-2 ${reflection.satisfaction >= rating
                                                    ? 'bg-yellow-400 border-yellow-400'
                                                    : 'border-gray-300'
                                                }`}
                                        >
                                            ⭐
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    よかったこと
                                </label>
                                <textarea value={reflection.good} onChange={(e) => saveReflection({ ...reflection, good: e.target.value })}
                                    placeholder="今日よかったことを記録..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    改善点
                                </label>
                                <textarea
                                    value={reflection.bad}
                                    onChange={(e) => saveReflection({ ...reflection, bad: e.target.value })}
                                    placeholder="明日改善したいことを記録..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>


    );
};

export default TodoApp;